// ===== KREA HUB — HELP DESK PAGE =====

import { icons } from '../icons.js';
import { questions, courses } from '../data.js';
import { renderThread, renderBadge, showToast, showModal } from '../components.js';

export function renderHelpDesk() {
    const courseCounts = {};
    questions.forEach(q => { courseCounts[q.course] = (courseCounts[q.course] || 0) + 1; });

    return `
    <div class="animate-in">
      <div class="page-header">
        <h1>${icons.messageCircle} The <span class="gradient-text">Help Desk</span></h1>
        <p>Course-specific doubt solving. Ask anonymously, get peer + faculty answers.</p>
      </div>

      <div class="content-grid">
        <!-- Left: Feed -->
        <div>
          <!-- Compose -->
          <div class="card" style="margin-bottom:var(--space-lg)">
            <div style="display:flex;gap:var(--space-md);align-items:flex-start">
              <div class="user-avatar" style="width:36px;height:36px;background:var(--grad-primary);font-size:0.8rem;flex-shrink:0">AP</div>
              <div style="flex:1">
                <input type="text" class="input" placeholder="Ask a question..." id="questionTitle" style="margin-bottom:var(--space-sm)" />
                <textarea class="textarea" placeholder="Describe your doubt in detail..." id="questionBody" rows="2"></textarea>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-top:var(--space-sm);flex-wrap:wrap;gap:var(--space-sm)">
                  <div style="display:flex;align-items:center;gap:var(--space-md)">
                    <select class="select" style="width:auto;padding:6px 12px;font-size:0.82rem" id="questionCourse">
                      ${courses.map(c => `<option value="${c.code}">${c.code}</option>`).join('')}
                    </select>
                    <label style="display:flex;align-items:center;gap:6px;font-size:0.82rem;cursor:pointer;color:var(--text-secondary)">
                      <input type="checkbox" id="anonToggle" style="accent-color:var(--accent-purple)" />
                      ${icons.eyeOff} Post Anonymously
                    </label>
                  </div>
                  <button class="btn btn-primary btn-sm" id="postQuestionBtn">${icons.send} Post Question</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Filter -->
          <div class="filter-bar">
            <div class="tabs" id="filterTabs">
              <div class="tab active" data-filter="all">All</div>
              <div class="tab" data-filter="open">Open</div>
              <div class="tab" data-filter="resolved">Resolved</div>
            </div>
          </div>

          <!-- Questions Feed -->
          <div id="questionsFeed">
            ${questions.map(q => renderThread(q)).join('')}
          </div>
        </div>

        <!-- Right: Course Boards -->
        <div>
          <div class="card" style="position:sticky;top:var(--space-lg)">
            <div class="card-title" style="margin-bottom:var(--space-md)">${icons.book} Course Boards</div>
            <div class="board-list">
              <div class="board-item active" data-course="all">
                <span>All Courses</span>
                <span class="board-count">${questions.length}</span>
              </div>
              ${courses.map(c => `
                <div class="board-item" data-course="${c.code}">
                  <span style="display:flex;align-items:center;gap:var(--space-sm)">
                    <span style="width:8px;height:8px;border-radius:50%;background:${c.color}"></span>
                    ${c.code}
                  </span>
                  <span class="board-count">${courseCounts[c.code] || 0}</span>
                </div>
              `).join('')}
            </div>

            <div style="margin-top:var(--space-lg);padding-top:var(--space-md);border-top:1px solid var(--border-subtle)">
              <div class="card-title" style="margin-bottom:var(--space-md)">🏆 Top Contributors</div>
              <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
                ${[
            { name: 'Ravi Sundaram', answers: 28, initials: 'RS' },
            { name: 'Aisha Khan', answers: 22, initials: 'AK' },
            { name: 'Priya Menon', answers: 15, initials: 'PM' },
        ].map((c, i) => `
                  <div style="display:flex;align-items:center;gap:var(--space-sm)">
                    <span style="font-size:0.82rem;color:var(--text-muted);width:20px">#${i + 1}</span>
                    <div class="user-avatar" style="width:28px;height:28px;font-size:0.65rem;background:var(--grad-primary)">${c.initials}</div>
                    <div style="flex:1;font-size:0.85rem;font-weight:500">${c.name}</div>
                    <span class="badge badge-teal">${c.answers} answers</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initHelpDesk() {
    // Course board filtering
    document.querySelectorAll('.board-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.board-item').forEach(b => b.classList.remove('active'));
            item.classList.add('active');
            const course = item.dataset.course;
            document.querySelectorAll('.thread').forEach(thread => {
                if (course === 'all') {
                    thread.style.display = '';
                } else {
                    const q = questions.find(q => `thread-${q.id}` === thread.id);
                    thread.style.display = (q && q.course === course) ? '' : 'none';
                }
            });
        });
    });

    // Filter tabs
    document.querySelectorAll('#filterTabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#filterTabs .tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const filter = tab.dataset.filter;
            document.querySelectorAll('.thread').forEach(thread => {
                const isResolved = thread.classList.contains('resolved');
                if (filter === 'all') thread.style.display = '';
                else if (filter === 'resolved') thread.style.display = isResolved ? '' : 'none';
                else thread.style.display = isResolved ? 'none' : '';
            });
        });
    });

    // Post question
    const postBtn = document.getElementById('postQuestionBtn');
    if (postBtn) {
        postBtn.addEventListener('click', () => {
            const title = document.getElementById('questionTitle');
            const body = document.getElementById('questionBody');
            if (!title.value.trim()) {
                showToast('Please enter a question title', 'error');
                return;
            }
            showToast('Question posted successfully!', 'success');
            title.value = '';
            body.value = '';
        });
    }
}
