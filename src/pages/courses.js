// ===== KREA HUB — MY COURSES PAGE =====
// Displays Canvas-fetched courses as selectable cards.
// Students can select courses they want to tutor or get help in.
// Selecting a course auto-creates a group chat room.

import { icons } from '../icons.js';
import {
    fetchCanvasCourses,
    initiateCanvasAuth,
    setSelectedCourses,
    getSelectedCourseIds,
    canvasCourses,
    createChatRoom,
} from '../canvasService.js';

// Color palette for course cards (cycling)
const COURSE_COLORS = [
    { bg: 'linear-gradient(135deg, #818cf8, #6366f1)', accent: '#818cf8' },
    { bg: 'linear-gradient(135deg, #60a5fa, #3b82f6)', accent: '#60a5fa' },
    { bg: 'linear-gradient(135deg, #6ee7b7, #10b981)', accent: '#6ee7b7' },
    { bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', accent: '#fbbf24' },
    { bg: 'linear-gradient(135deg, #f472b6, #ec4899)', accent: '#f472b6' },
    { bg: 'linear-gradient(135deg, #a78bfa, #7c3aed)', accent: '#a78bfa' },
    { bg: 'linear-gradient(135deg, #fb923c, #ea580c)', accent: '#fb923c' },
    { bg: 'linear-gradient(135deg, #22d3ee, #0891b2)', accent: '#22d3ee' },
];

export function renderCourses() {
    return `
    <div class="page-header">
      <div>
        <h1 class="page-title">${icons.book || ''} My Courses</h1>
        <p class="page-subtitle">
          Your enrolled courses from Canvas LMS — select the ones you want to tutor or get help in.
        </p>
      </div>
    </div>

    <!-- Canvas Auth Prompt (hidden by default) -->
    <div id="canvasAuthPrompt" class="canvas-auth-card" style="display:none">
      <div class="canvas-auth-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </div>
      <h3>Connect Canvas LMS</h3>
      <p>Link your Canvas account to automatically load your enrolled courses.</p>
      <button class="btn btn-primary" id="linkCanvasBtn">
        ${icons.externalLink || ''} Link Canvas Account
      </button>
      <p class="canvas-auth-note">
        Read-only access — we only fetch your course list. No data is modified.
      </p>
    </div>

    <!-- Loading State -->
    <div id="coursesLoading" class="courses-loading" style="display:none">
      <div class="loading-spinner"></div>
      <p>Fetching your courses from Canvas...</p>
    </div>

    <!-- Error State -->
    <div id="coursesError" class="courses-error" style="display:none">
      <p id="coursesErrorText"></p>
      <button class="btn btn-ghost" id="retryCoursesBtn">Try Again</button>
    </div>

    <!-- Course Selection Grid -->
    <div id="coursesList" class="courses-grid" style="display:none"></div>

    <!-- Selected Courses Summary -->
    <div id="coursesActions" class="courses-actions" style="display:none">
      <div class="courses-selected-summary">
        <span id="selectedCount">0</span> course(s) selected
      </div>
      <button class="btn btn-primary" id="saveCoursesBtn">
        ${icons.check || '✓'} Save Selection
      </button>
    </div>
  `;
}

export function initCourses() {
    const authPrompt = document.getElementById('canvasAuthPrompt');
    const loading = document.getElementById('coursesLoading');
    const errorEl = document.getElementById('coursesError');
    const coursesList = document.getElementById('coursesList');
    const actionsBar = document.getElementById('coursesActions');

    let currentSelected = new Set(getSelectedCourseIds());

    // Check if Canvas was just linked (redirect from callback)
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const justLinked = urlParams.get('canvas_linked') === 'true';
    const canvasError = urlParams.get('canvas_error');

    if (canvasError) {
        showError(`Canvas linking failed: ${canvasError}. Please try again.`);
        return;
    }

    // Start fetching courses
    loadCourses();

    // ---- Event: Link Canvas ----
    document.getElementById('linkCanvasBtn')?.addEventListener('click', () => {
        initiateCanvasAuth();
    });

    // ---- Event: Retry ----
    document.getElementById('retryCoursesBtn')?.addEventListener('click', () => {
        loadCourses();
    });

    // ---- Event: Save Selection ----
    document.getElementById('saveCoursesBtn')?.addEventListener('click', async () => {
        const ids = Array.from(currentSelected);
        setSelectedCourses(ids);

        // Auto-create chat rooms for selected courses
        for (const id of ids) {
            const course = canvasCourses.find(c => c.id === id);
            if (course) {
                try {
                    await createChatRoom(course.id, course.name, course.code);
                } catch (err) {
                    console.warn('Chat room creation skipped:', err);
                }
            }
        }

        showToast('Courses saved! Chat rooms created for your selection.');
    });

    // ---- Load Courses ----
    async function loadCourses() {
        authPrompt.style.display = 'none';
        errorEl.style.display = 'none';
        coursesList.style.display = 'none';
        actionsBar.style.display = 'none';
        loading.style.display = 'flex';

        const result = await fetchCanvasCourses();

        loading.style.display = 'none';

        if (result.needsAuth) {
            authPrompt.style.display = 'flex';
            return;
        }

        if (result.error) {
            showError(result.error);
            return;
        }

        if (result.courses.length === 0) {
            showError('No active courses found. Make sure you are enrolled in courses on Canvas.');
            return;
        }

        renderCourseCards(result.courses);
    }

    // ---- Render Course Cards ----
    function renderCourseCards(courses) {
        coursesList.innerHTML = courses.map((course, i) => {
            const color = COURSE_COLORS[i % COURSE_COLORS.length];
            const isSelected = currentSelected.has(course.id);

            return `
        <div class="course-card ${isSelected ? 'selected' : ''}"
             data-course-id="${course.id}"
             style="--card-accent: ${color.accent}">
          <div class="course-card-header" style="background: ${color.bg}">
            <span class="course-code">${course.code}</span>
            <span class="course-enrollment">${course.enrolledAs}</span>
          </div>
          <div class="course-card-body">
            <h3 class="course-name">${course.name}</h3>
            ${course.term ? `<p class="course-term">${course.term}</p>` : ''}
          </div>
          <div class="course-card-footer">
            <button class="course-select-btn ${isSelected ? 'active' : ''}"
                    data-course-id="${course.id}">
              ${isSelected ? '✓ Selected' : '+ Select'}
            </button>
          </div>
        </div>
      `;
        }).join('');

        coursesList.style.display = 'grid';
        actionsBar.style.display = 'flex';
        updateSelectedCount();

        // Bind card click handlers
        coursesList.querySelectorAll('.course-card').forEach(card => {
            card.addEventListener('click', () => {
                const courseId = parseInt(card.dataset.courseId, 10) || card.dataset.courseId;
                toggleCourse(courseId, card);
            });
        });
    }

    // ---- Toggle Course Selection ----
    function toggleCourse(courseId, cardEl) {
        if (currentSelected.has(courseId)) {
            currentSelected.delete(courseId);
            cardEl.classList.remove('selected');
            cardEl.querySelector('.course-select-btn').classList.remove('active');
            cardEl.querySelector('.course-select-btn').textContent = '+ Select';
        } else {
            currentSelected.add(courseId);
            cardEl.classList.add('selected');
            cardEl.querySelector('.course-select-btn').classList.add('active');
            cardEl.querySelector('.course-select-btn').textContent = '✓ Selected';
        }
        updateSelectedCount();
    }

    function updateSelectedCount() {
        document.getElementById('selectedCount').textContent = currentSelected.size;
    }

    function showError(msg) {
        errorEl.style.display = 'flex';
        document.getElementById('coursesErrorText').textContent = msg;
    }

    function showToast(message) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }
}
