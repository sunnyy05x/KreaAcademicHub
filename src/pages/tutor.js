// ===== KREA HUB — TUTOR DASHBOARD (REDESIGNED) =====
// Matches Faculty Panel dark-mode aesthetic with tutor-specific widgets

import { icons } from '../icons.js';
import {
  tutorLog, tutorMonthlyStats, tutorUpcomingSessions,
  tutorPendingRequests, TUTOR_RATE
} from '../data.js';
import { renderStatCard, renderAvatar, renderBadge, showToast, showModal } from '../components.js';

export function renderTutor() {
  const stats = tutorMonthlyStats;
  const totalEarnings = stats.hoursThisMonth * TUTOR_RATE;
  const lastMonthEarnings = stats.hoursLastMonth * TUTOR_RATE;
  const hoursTrend = ((stats.hoursThisMonth - stats.hoursLastMonth) / stats.hoursLastMonth * 100).toFixed(0);
  const earningsTrend = ((totalEarnings - lastMonthEarnings) / lastMonthEarnings * 100).toFixed(0);

  return `
    <div class="animate-in">
      <div class="page-header">
        <h1>${icons.award} <span class="gradient-text">Tutor</span> Panel</h1>
        <p>Track your earnings, manage sessions, and respond to tutoring requests.</p>
      </div>

      <!-- ═══════ AVAILABILITY TOGGLE ═══════ -->
      <div class="card" style="margin-bottom:var(--space-lg)">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-md)">
          <div>
            <div style="font-family:var(--font-heading);font-weight:700;font-size:1.1rem;margin-bottom:4px">Quick Availability</div>
            <div style="font-size:0.82rem;color:var(--text-secondary)">Broadcast to students that you're free for drop-in sessions right now.</div>
          </div>
          <div style="display:flex;align-items:center;gap:var(--space-md)">
            <div class="toggle active pulse-glow" id="availToggle" style="width:56px;height:30px"></div>
            <span id="availLabel" style="font-family:var(--font-heading);font-weight:700;font-size:1rem;color:var(--accent-teal)">Available Now</span>
          </div>
        </div>
        <div style="margin-top:var(--space-md);display:flex;gap:var(--space-md);flex-wrap:wrap">
          <div class="input-group" style="flex:1;min-width:200px">
            <label>Current Location</label>
            <input type="text" class="input" value="Library — 2nd Floor, Table 4" id="locationInput" />
          </div>
          <div class="input-group" style="min-width:140px">
            <label>Available Until</label>
            <input type="text" class="input" value="5:00 PM" />
          </div>
        </div>
      </div>

      <!-- ═══════ EARNINGS & HOURS HERO ═══════ -->
      <div class="earnings-hero">
        <div class="earnings-metric">
          <div class="metric-label">${icons.clock} Hours Tutored (This Month)</div>
          <div class="metric-value">${stats.hoursThisMonth}h</div>
          <div class="metric-trend">${icons.trendingUp} +${hoursTrend}% from last month</div>
        </div>
        <div class="divider"></div>
        <div class="earnings-metric">
          <div class="metric-label">${icons.dollarSign} Total Earnings (This Month)</div>
          <div class="metric-value">₹${totalEarnings.toLocaleString('en-IN')}</div>
          <div class="metric-trend">${icons.trendingUp} +${earningsTrend}% from last month</div>
        </div>
      </div>

      <!-- ═══════ SECONDARY STATS ═══════ -->
      <div class="stat-grid">
        ${renderStatCard(stats.sessionsThisMonth, 'Sessions Completed', `+${stats.sessionsThisMonth - stats.sessionsLastMonth} this month`, icons.checkCircle, 'teal')}
        ${renderStatCard(stats.studentsHelped, 'Students Helped', '', icons.users, 'blue')}
        ${renderStatCard(stats.avgRating, 'Your Rating', `★ ${stats.totalReviews} reviews`, icons.star, 'amber')}
        ${renderStatCard(tutorPendingRequests.length, 'Pending Requests', 'Awaiting action', icons.inbox, 'pink')}
      </div>

      <div class="grid-2">
        <!-- ═══════ UPCOMING SESSIONS ═══════ -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">${icons.calendar} Upcoming Sessions</div>
            <span class="badge badge-purple">${tutorUpcomingSessions.length} scheduled</span>
          </div>
          <div class="appt-list">
            ${tutorUpcomingSessions.map(s => `
              <div class="appt-item" style="border-left:3px solid ${s.format === 'virtual' ? 'var(--accent-blue)' : 'var(--accent-teal)'}">
                <div style="display:flex;align-items:center;gap:var(--space-sm)">
                  ${renderAvatar(s.initials, 'var(--grad-primary)', 32)}
                </div>
                <div class="appt-details">
                  <div class="appt-title">${s.student}</div>
                  <div class="appt-subtitle">${s.subject}</div>
                  <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px">
                    ${icons.clock} ${s.date} · ${s.time} · ${s.duration}
                  </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
                  <span class="badge badge-${s.format === 'virtual' ? 'blue' : 'teal'}">
                    ${s.format === 'virtual' ? icons.video + ' Virtual' : icons.mapPin + ' ' + s.location}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- ═══════ PENDING REQUESTS ═══════ -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">${icons.inbox} Pending Requests</div>
            <span class="badge badge-amber">${tutorPendingRequests.length} new</span>
          </div>
          <div id="pendingRequestsList">
            ${tutorPendingRequests.map(r => `
              <div class="request-card" id="request-${r.id}">
                <div style="display:flex;align-items:flex-start;gap:var(--space-md)">
                  ${renderAvatar(r.initials, 'var(--grad-indigo)', 36)}
                  <div style="flex:1">
                    <div style="font-weight:600;font-size:0.92rem;margin-bottom:2px">${r.student}</div>
                    <div style="font-size:0.82rem;color:var(--accent-indigo);margin-bottom:var(--space-sm)">${r.subject}</div>
                    <div style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5">"${r.message}"</div>
                    <div style="display:flex;gap:var(--space-md);margin-top:var(--space-sm);font-size:0.72rem;color:var(--text-muted)">
                      <span>${icons.clock} ${r.date}</span>
                      <span>⏰ ${r.preferredTime}</span>
                    </div>
                  </div>
                </div>
                <div class="request-actions">
                  <button class="btn btn-primary btn-sm accept-btn" data-id="${r.id}" data-student="${r.student}">${icons.check} Accept</button>
                  <button class="btn btn-danger btn-sm decline-btn" data-id="${r.id}" data-student="${r.student}">${icons.x} Decline</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- ═══════ SESSION LOG BOOK ═══════ -->
      <div class="card" style="margin-top:var(--space-lg)">
        <div class="card-header">
          <div class="card-title">${icons.book} Session Log Book</div>
          <div style="display:flex;gap:var(--space-sm)">
            <button class="btn btn-ghost btn-sm" id="exportLogBtn">${icons.arrowRight} Export CSV</button>
            <button class="btn btn-secondary btn-sm" id="downloadCertBtn">📄 Certificate</button>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Subject</th>
                <th>Duration</th>
                <th>Earned</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tutorLog.map(l => {
    const mins = parseInt(l.duration);
    const earned = !isNaN(mins) && l.status === 'completed' ? `₹${Math.round(mins / 60 * TUTOR_RATE)}` : '—';
    return `
                  <tr>
                    <td>${l.date}</td>
                    <td style="font-weight:500">${l.student}</td>
                    <td>${l.subject}</td>
                    <td>${l.duration}</td>
                    <td style="color:var(--accent-teal);font-weight:600">${earned}</td>
                    <td>${l.status === 'completed'
        ? `<span class="badge badge-teal">${icons.checkCircle} Done</span>`
        : `<span class="badge badge-red">${icons.x} No-Show</span>`
      }</td>
                  </tr>`;
  }).join('')}
            </tbody>
          </table>
        </div>
        <div style="margin-top:var(--space-md);display:flex;align-items:center;justify-content:space-between;font-size:0.82rem;color:var(--text-secondary)">
          <span>Rate: <strong style="color:var(--accent-purple)">₹${TUTOR_RATE}/hr</strong></span>
          <span>Showing last ${tutorLog.length} sessions</span>
        </div>
      </div>
    </div>
  `;
}

export function initTutor() {
  // ---- Availability toggle ----
  const toggle = document.getElementById('availToggle');
  const label = document.getElementById('availLabel');
  if (toggle && label) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      toggle.classList.toggle('pulse-glow');
      const isAvailable = toggle.classList.contains('active');
      label.textContent = isAvailable ? 'Available Now' : 'Unavailable';
      label.style.color = isAvailable ? 'var(--accent-teal)' : 'var(--text-muted)';
      showToast(
        isAvailable ? '🟢 You are now visible to students!' : '🔴 You are now hidden from students',
        isAvailable ? 'success' : 'info'
      );
    });
  }

  // ---- Accept / Decline requests ----
  document.querySelectorAll('.accept-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const student = btn.dataset.student;
      const card = document.getElementById(`request-${id}`);
      showToast(`✅ Session with ${student} accepted! Calendar invite sent.`);
      if (card) {
        card.style.opacity = '0.5';
        card.style.pointerEvents = 'none';
        card.querySelector('.request-actions').innerHTML = `<span class="badge badge-teal">${icons.checkCircle} Accepted</span>`;
      }
    });
  });

  document.querySelectorAll('.decline-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const student = btn.dataset.student;
      showModal(`Decline request from ${student}?`, `
        <div class="input-group">
          <label>Optional reason (will be shared with student)</label>
          <textarea class="textarea" placeholder="e.g. Fully booked this week, try next week!" rows="2"></textarea>
        </div>
      `, [
        { id: 'cancelDecline', label: 'Cancel', class: 'btn-ghost', onClick: () => { } },
        {
          id: 'confirmDecline', label: 'Decline', class: 'btn-danger', onClick: () => {
            const card = document.getElementById(`request-${id}`);
            showToast(`Request from ${student} declined.`, 'info');
            if (card) {
              card.style.opacity = '0.5';
              card.style.pointerEvents = 'none';
              card.querySelector('.request-actions').innerHTML = `<span class="badge badge-red">${icons.x} Declined</span>`;
            }
          }
        },
      ]);
    });
  });

  // ---- Export & Certificate ----
  const exportBtn = document.getElementById('exportLogBtn');
  if (exportBtn) exportBtn.addEventListener('click', () => showToast('📊 Log exported as CSV!', 'info'));

  const certBtn = document.getElementById('downloadCertBtn');
  if (certBtn) certBtn.addEventListener('click', () => showToast('📄 Hours certificate downloaded!', 'info'));
}
