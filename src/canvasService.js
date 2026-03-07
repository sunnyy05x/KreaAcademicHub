// ===== CANVAS INTEGRATION — CLIENT-SIDE SERVICE =====
// Handles all Canvas-related frontend state and API calls.
// Tokens and secrets never touch this file — all proxied through /api/canvas/*.

// ---- State ----
export let canvasCourses = [];       // Raw courses from Canvas
export let selectedCourses = [];     // User's active selection
export let canvasLinked = false;     // Whether Canvas OAuth is complete

// ---- Cookie helper (set user email for API auth) ----

export function setUserEmailCookie(email) {
    document.cookie = `krea_user_email=${encodeURIComponent(email)}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
}

export function clearUserEmailCookie() {
    document.cookie = 'krea_user_email=; path=/; max-age=0';
}

// ---- Canvas Auth ----

export function initiateCanvasAuth() {
    // Redirect to our serverless OAuth initiation endpoint
    window.location.href = '/api/canvas/auth';
}

// ---- Fetch Courses from Canvas (via proxy) ----

export async function fetchCanvasCourses(enrollmentType = 'student') {
    try {
        const res = await fetch(`/api/canvas/courses?enrollment_type=${enrollmentType}`, {
            credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok) {
            if (data.needsAuth) {
                canvasLinked = false;
                return { needsAuth: true, courses: [] };
            }
            throw new Error(data.error || 'Failed to fetch courses');
        }

        canvasCourses = data.courses;
        canvasLinked = true;
        return { needsAuth: false, courses: data.courses };

    } catch (err) {
        console.error('fetchCanvasCourses error:', err);
        return { needsAuth: false, courses: [], error: err.message };
    }
}

// ---- Course Selection Persistence ----

export function setSelectedCourses(courseIds) {
    selectedCourses = canvasCourses.filter(c => courseIds.includes(c.id));
    localStorage.setItem('kreaHub_selectedCourses', JSON.stringify(courseIds));
}

export function getSelectedCourseIds() {
    const stored = localStorage.getItem('kreaHub_selectedCourses');
    return stored ? JSON.parse(stored) : [];
}

export function loadSelectedCourses() {
    const ids = getSelectedCourseIds();
    selectedCourses = canvasCourses.filter(c => ids.includes(c.id));
    return selectedCourses;
}

// ---- Chat Room API ----

export async function createChatRoom(courseId, courseName, courseCode) {
    const res = await fetch('/api/chat/rooms', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, courseName, courseCode }),
    });
    return res.json();
}

export async function getUserChatRooms() {
    const res = await fetch('/api/chat/rooms', { credentials: 'include' });
    return res.json();
}

// ---- Slot Booking API ----

export async function getSlots(courseId, professorId) {
    const res = await fetch(`/api/slots?courseId=${courseId}&professorId=${professorId}`, {
        credentials: 'include',
    });
    return res.json();
}

export async function bookSlot(courseId, professorId, slotId, studentName) {
    const res = await fetch('/api/slots', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, professorId, slotId, studentName }),
    });
    return res.json();
}

export async function cancelSlot(courseId, professorId, slotId) {
    const res = await fetch('/api/slots', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, professorId, slotId }),
    });
    return res.json();
}
