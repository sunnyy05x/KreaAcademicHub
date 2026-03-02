// ===== KREA HUB — DASHBOARD PAGE =====

import { icons } from '../icons.js';
import { upcomingAppointments, questions, courses } from '../data.js';
import { renderStatCard, renderApptItem, showToast } from '../components.js';

export function renderDashboard() {
    const unresolvedQuestions = questions.filter(q => !q.resolved);

    return `
    <div class="animate-in">
      <!-- Header -->
      <div class="page-header">
        <h1>Good afternoon, <span class="gradient-text">Arjun</span> 👋</h1>
        <p>Here's what's happening across your academic hub today.</p>
      </div>

      <!-- Search -->
      <div class="search-bar" style="margin-bottom:var(--space-xl)">
        <span class="search-icon">${icons.search}</span>
        <input type="text" class="input" placeholder="Need help with something? Search courses, tutors, topics..." id="dashSearch" />
      </div>

      <!-- Stats -->
      <div class="stat-grid">
        ${renderStatCard('3', 'Upcoming Appointments', '+1 this week', icons.calendar, 'purple')}
        ${renderStatCard('2', 'Open Questions', '', icons.messageCircle, 'pink')}
        ${renderStatCard('4.8', 'Avg Tutor Rating', '★', icons.star, 'amber')}
        ${renderStatCard('12', 'Hours Tutored', '+3 this month', icons.trendingUp, 'teal')}
      </div>

      <!-- Two Column -->
      <div class="content-grid">
        <!-- Left: Appointments + Questions -->
        <div>
          <!-- Upcoming Appointments -->
          <div class="card" style="margin-bottom:var(--space-lg)">
            <div class="card-header">
              <div class="card-title">${icons.calendar} Upcoming Appointments</div>
              <a href="#scheduler" class="btn btn-ghost btn-sm">View All ${icons.arrowRight}</a>
            </div>
            <div class="appt-list">
              ${upcomingAppointments.map(a => renderApptItem(a)).join('')}
            </div>
          </div>

          <!-- Unresolved Questions -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${icons.messageCircle} Your Unresolved Questions</div>
              <a href="#helpdesk" class="btn btn-ghost btn-sm">Go to Help Desk ${icons.arrowRight}</a>
            </div>
            ${unresolvedQuestions.length > 0 ? unresolvedQuestions.slice(0, 3).map(q => `
              <div class="appt-item" style="margin-bottom:var(--space-sm)">
                <div style="flex:1">
                  <div class="appt-title">${q.title}</div>
                  <div class="appt-subtitle">${q.course} · ${q.timestamp} · ${q.answers} answers</div>
                </div>
                <span class="badge badge-${q.resolved ? 'teal' : 'amber'}">${q.resolved ? 'Resolved' : 'Open'}</span>
              </div>
            `).join('') : `<div class="empty-state"><div class="empty-state-icon">🎉</div><h3>All caught up!</h3><p>No unresolved questions.</p></div>`}
          </div>
        </div>

        <!-- Right: Quick Actions + Reminders -->
        <div>
          <!-- Quick Actions -->
          <div class="card" style="margin-bottom:var(--space-lg)">
            <div class="card-title" style="margin-bottom:var(--space-md)">⚡ Quick Actions</div>
            <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
              <a href="#scheduler" class="btn btn-secondary" style="justify-content:flex-start;width:100%">${icons.calendar} Book Office Hours</a>
              <a href="#helpdesk" class="btn btn-secondary" style="justify-content:flex-start;width:100%">${icons.messageCircle} Ask a Question</a>
              <a href="#peernetwork" class="btn btn-secondary" style="justify-content:flex-start;width:100%">${icons.users} Find a Tutor</a>
            </div>
          </div>

          <!-- Smart Reminders -->
          <div class="card" style="margin-bottom:var(--space-lg)">
            <div class="card-title" style="margin-bottom:var(--space-md)">🔔 Smart Reminders</div>
            <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
              <div class="appt-item" style="border-left:3px solid var(--accent-purple)">
                <div>
                  <div class="appt-title">Office Hours in 15 min</div>
                  <div class="appt-subtitle">Dr. Meera Krishnan · AB-302</div>
                </div>
              </div>
              <div class="appt-item" style="border-left:3px solid var(--accent-amber)">
                <div>
                  <div class="appt-title">Unresolved: Heap complexity</div>
                  <div class="appt-subtitle">2 new answers on your CS201 question</div>
                </div>
              </div>
              <div class="appt-item" style="border-left:3px solid var(--accent-teal)">
                <div>
                  <div class="appt-title">Tutor available now</div>
                  <div class="appt-subtitle">Aisha Khan · Data Structures</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Enrolled Courses -->
          <div class="card">
            <div class="card-title" style="margin-bottom:var(--space-md)">📚 My Courses</div>
            <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
              ${courses.map(c => `
                <div style="display:flex;align-items:center;gap:var(--space-md);padding:8px 0;border-bottom:1px solid var(--border-subtle)">
                  <div style="width:8px;height:8px;border-radius:50%;background:${c.color};flex-shrink:0"></div>
                  <div>
                    <div style="font-weight:600;font-size:0.85rem">${c.code}</div>
                    <div style="font-size:0.78rem;color:var(--text-muted)">${c.name}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
