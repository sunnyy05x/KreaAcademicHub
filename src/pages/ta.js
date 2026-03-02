// ===== KREA HUB — TA DASHBOARD =====

import { icons } from '../icons.js';
import { taAnalytics, questions } from '../data.js';
import { renderStatCard, renderBadge, showToast } from '../components.js';

export function renderTA() {
    const ta = taAnalytics;
    const resolvedPct = Math.round((ta.doubtsResolvedThisWeek / ta.doubtsAssigned) * 100);

    return `
    <div class="animate-in">
      <div class="page-header">
        <h1>${icons.clipboard} <span class="gradient-text">TA</span> Panel</h1>
        <p>Manage assigned doubts, run office hours, and endorse student answers for <strong>${ta.assignedCourse}</strong>.</p>
      </div>

      <!-- Stats -->
      <div class="stat-grid">
        ${renderStatCard(`${ta.doubtsResolvedThisWeek}/${ta.doubtsAssigned}`, 'Doubts Resolved', `${resolvedPct}% cleared`, icons.messageCircle, 'purple')}
        ${renderStatCard(ta.avgResponseTime, 'Avg Response Time', '↓ 3 min this week', icons.clock, 'teal')}
        ${renderStatCard(ta.endorsements, 'Endorsements Given', '+4 this week', icons.checkCircle, 'amber')}
        ${renderStatCard(ta.upcomingOH.length, 'Office Hours Slots', 'This week', icons.calendar, 'blue')}
      </div>

      <div class="grid-2">
        <!-- Assigned Doubts Queue -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">${icons.messageCircle} Doubt Queue</div>
            <span class="badge badge-purple">${ta.recentDoubts.filter(d => d.status === 'pending').length} pending</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
            ${ta.recentDoubts.map(d => `
              <div class="appt-item" style="border-left:3px solid ${d.status === 'pending' ? 'var(--accent-amber)' : 'var(--accent-teal)'}">
                <div style="flex:1">
                  <div class="appt-title">${d.student}</div>
                  <div class="appt-subtitle">${d.question}</div>
                  <div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px">${icons.clock} ${d.time}</div>
                </div>
                <div style="display:flex;flex-direction:column;gap:var(--space-xs)">
                  ${d.status === 'pending' ? `
                    <button class="btn btn-primary btn-sm ta-respond-btn">${icons.send} Respond</button>
                    <button class="btn btn-ghost btn-sm ta-endorse-btn">${icons.checkCircle} Endorse</button>
                  ` : `
                    <span class="badge badge-teal">${icons.checkCircle} Answered</span>
                  `}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Resolution progress bar -->
          <div style="margin-top:var(--space-lg);padding-top:var(--space-md);border-top:1px solid var(--border-subtle)">
            <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:var(--space-xs)">
              <span>Weekly Resolution Progress</span>
              <span style="font-weight:600;color:var(--accent-teal)">${resolvedPct}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${resolvedPct}%"></div>
            </div>
          </div>
        </div>

        <!-- Office Hours & Moderation -->
        <div>
          <!-- Upcoming OH -->
          <div class="card" style="margin-bottom:var(--space-lg)">
            <div class="card-header">
              <div class="card-title">${icons.calendar} My Office Hours</div>
            </div>
            <div class="appt-list">
              ${ta.upcomingOH.map(oh => `
                <div class="appt-item">
                  <div class="appt-time" style="min-width:40px">${oh.day}</div>
                  <div class="appt-details">
                    <div class="appt-title">${oh.topic}</div>
                    <div class="appt-subtitle">${oh.time} · ${oh.room}</div>
                  </div>
                  <span class="badge badge-${oh.room.includes('Virtual') ? 'blue' : 'teal'}">${oh.room.includes('Virtual') ? '💻' : '🏢'}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Quick Endorse from Help Desk -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">${icons.checkCircle} Quick Endorse</div>
              <span class="badge badge-amber">Help Desk</span>
            </div>
            <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:var(--space-md)">Peer answers on <strong>${ta.assignedCourse}</strong> that may need your endorsement.</p>
            <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
              ${questions.filter(q => q.course === 'MA102' && !q.resolved).slice(0, 2).map(q => `
                <div class="appt-item">
                  <div style="flex:1">
                    <div class="appt-title">${q.title}</div>
                    <div class="appt-subtitle">${q.answers} answers · ${q.upvotes} upvotes</div>
                  </div>
                  <button class="btn btn-success btn-sm ta-quick-endorse">${icons.checkCircle} Endorse</button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initTA() {
    // Respond buttons
    document.querySelectorAll('.ta-respond-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('Response submitted — student notified!');
            btn.innerHTML = `${icons.checkCircle} Sent`;
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-ghost');
            btn.disabled = true;
        });
    });

    // Endorse buttons
    document.querySelectorAll('.ta-endorse-btn, .ta-quick-endorse').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('Answer endorsed ✅ Thread marked as resolved.');
            btn.innerHTML = `${icons.checkCircle} Endorsed`;
            btn.disabled = true;
            btn.classList.remove('btn-success', 'btn-primary');
            btn.classList.add('btn-ghost');
        });
    });
}
