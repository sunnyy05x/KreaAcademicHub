// ===== KREA HUB — FACULTY DASHBOARD =====

import { icons } from '../icons.js';
import { facultyAnalytics, upcomingAppointments, questions } from '../data.js';
import { renderStatCard, renderBarChart, renderBadge, showToast } from '../components.js';

export function renderFaculty() {
    const a = facultyAnalytics;
    const pendingModeration = questions.filter(q => q.anonymous);

    return `
    <div class="animate-in">
      <div class="page-header">
        <h1>${icons.shield} <span class="gradient-text">Faculty</span> Panel</h1>
        <p>Manage office hours, review analytics, and moderate the Help Desk.</p>
      </div>

      <!-- Stats -->
      <div class="stat-grid">
        ${renderStatCard(a.totalBookingsThisWeek, 'Bookings This Week', '+12%', icons.calendar, 'purple')}
        ${renderStatCard(a.totalQuestionsThisWeek, 'Questions This Week', '+8%', icons.messageCircle, 'blue')}
        ${renderStatCard(a.avgSessionDuration, 'Avg Session', '', icons.clock, 'teal')}
        ${renderStatCard(a.noShowRate, 'No-Show Rate', '↓ 2%', icons.trendingUp, 'amber')}
      </div>

      <div class="grid-2">
        <!-- Topic Analytics -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">${icons.barChart} Top Topics by Bookings</div>
            <span class="badge badge-purple">This Month</span>
          </div>
          ${renderBarChart(a.topTopics)}
          <p style="font-size:0.78rem;color:var(--text-muted);margin-top:var(--space-md)">💡 Consider dedicating extra time to <strong>Graph Algorithms</strong> in your next lecture.</p>
        </div>

        <!-- Weekly Bookings -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">${icons.calendar} Weekly Booking Trend</div>
            <span class="badge badge-teal">This Week</span>
          </div>
          ${renderBarChart(a.weeklyBookings)}
          <p style="font-size:0.78rem;color:var(--text-muted);margin-top:var(--space-md)">📈 Peak booking day: <strong>Thursday</strong> with 15 appointments</p>
        </div>
      </div>

      <div class="grid-2" style="margin-top:var(--space-lg)">
        <!-- Gatekeeping Controls -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">${icons.shield} Gatekeeping Controls</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--space-md)">
            <div class="input-group">
              <label>Max bookings per student per week</label>
              <div style="display:flex;align-items:center;gap:var(--space-md)">
                <input type="range" min="1" max="5" value="2" id="maxBookings" style="flex:1;accent-color:var(--accent-purple)" />
                <span id="maxBookingsVal" style="font-family:var(--font-heading);font-weight:700;font-size:1.1rem;min-width:30px;text-align:center">2</span>
              </div>
            </div>
            <div class="input-group">
              <label>Default slot duration</label>
              <select class="select">
                <option>15 minutes</option>
                <option selected>30 minutes</option>
                <option>45 minutes</option>
                <option>60 minutes</option>
              </select>
            </div>
            <div class="toggle-wrap">
              <div class="toggle active" id="autoApproveToggle"></div>
              <span class="toggle-label">Auto-approve bookings</span>
            </div>
            <div class="toggle-wrap">
              <div class="toggle" id="contextReqToggle"></div>
              <span class="toggle-label">Require discussion context</span>
            </div>
            <button class="btn btn-primary btn-sm" id="saveSettingsBtn">${icons.check} Save Settings</button>
          </div>
        </div>

        <!-- Upcoming with Context -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">${icons.calendar} Upcoming Appointments</div>
          </div>
          <div class="appt-list">
            ${upcomingAppointments.map(appt => `
              <div class="appt-item">
                <div class="appt-time">${appt.time}</div>
                <div class="appt-details">
                  <div class="appt-title">Student: Arjun Patel</div>
                  <div class="appt-subtitle">${appt.course} · "${appt.context}"</div>
                </div>
                <span class="badge badge-${appt.format === 'virtual' ? 'blue' : 'teal'}">${appt.format === 'virtual' ? '💻' : '🏢'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Moderation Queue -->
      <div class="card" style="margin-top:var(--space-lg)">
        <div class="card-header">
          <div class="card-title">${icons.eye} Moderation Queue</div>
          <span class="badge badge-amber">${pendingModeration.length} anonymous posts</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
          ${pendingModeration.map(q => `
            <div class="appt-item">
              <div style="flex:1">
                <div class="appt-title">${q.title}</div>
                <div class="appt-subtitle">${q.course} · ${q.timestamp} · Anonymous post</div>
              </div>
              <div style="display:flex;gap:var(--space-sm)">
                <button class="btn btn-success btn-sm endorse-btn">${icons.checkCircle} Endorse</button>
                <button class="btn btn-danger btn-sm">${icons.x} Flag</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export function initFaculty() {
    // Range slider
    const range = document.getElementById('maxBookings');
    const rangeVal = document.getElementById('maxBookingsVal');
    if (range && rangeVal) {
        range.addEventListener('input', () => { rangeVal.textContent = range.value; });
    }

    // Toggles
    document.querySelectorAll('.toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
        });
    });

    // Save settings
    const saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => showToast('Settings saved successfully!'));
    }

    // Endorse
    document.querySelectorAll('.endorse-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('Answer endorsed ✅');
            btn.disabled = true;
            btn.innerHTML = `${icons.checkCircle} Endorsed`;
            btn.classList.remove('btn-success');
            btn.classList.add('btn-ghost');
        });
    });
}
