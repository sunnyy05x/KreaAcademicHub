// ===== KREA HUB — SCHEDULER PAGE =====

import { icons } from '../icons.js';
import { professors, courses, generateTimeSlots } from '../data.js';
import { renderAvatar, renderSlotPicker, renderBadge, showToast, showModal } from '../components.js';

export function renderScheduler() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const selectedDay = 'Tue';

    return `
    <div class="animate-in">
      <div class="page-header">
        <h1>${icons.calendar} The <span class="gradient-text">Scheduler</span></h1>
        <p>Book office hours and appointments with faculty. One-tap booking, zero friction.</p>
      </div>

      <!-- Format & Day Selector -->
      <div class="filter-bar">
        <div class="tabs" id="dayTabs">
          ${days.map(d => `<div class="tab ${d === selectedDay ? 'active' : ''}" data-day="${d}">${d}</div>`).join('')}
        </div>
        <div class="tabs" id="durationTabs">
          <div class="tab active" data-dur="30">30 min</div>
          <div class="tab" data-dur="15">15 min</div>
        </div>
      </div>

      <!-- Professor Cards -->
      <div style="display:flex;flex-direction:column;gap:var(--space-lg)">
        ${professors.map(prof => {
        const daySlots = prof.weeklySlots.filter(s => s.day === selectedDay);
        const courseInfo = courses.find(c => prof.courses.includes(c.code));
        return `
            <div class="card" id="prof-${prof.id}">
              <div class="card-header">
                <div style="display:flex;align-items:center;gap:var(--space-md)">
                  ${renderAvatar(prof.initials, 'var(--grad-indigo)', 44)}
                  <div>
                    <div style="font-weight:700;font-size:1rem">${prof.name}</div>
                    <div style="font-size:0.82rem;color:var(--text-secondary)">${prof.department} · ${icons.mapPin} ${prof.office}</div>
                  </div>
                </div>
                <div style="display:flex;gap:var(--space-sm);align-items:center">
                  ${courseInfo ? `<span class="badge badge-purple">${courseInfo.code}</span>` : ''}
                  <span class="badge badge-amber">${icons.shield} Max ${prof.maxBookingsPerStudent}/week</span>
                </div>
              </div>

              ${daySlots.length > 0 ? daySlots.map(slot => {
            const timeSlots = generateTimeSlots(slot.start, slot.end, 30);
            return `
                  <div style="margin-top:var(--space-md)">
                    <div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:var(--space-sm)">${icons.clock} ${slot.start} — ${slot.end}</div>
                    ${renderSlotPicker(timeSlots)}
                  </div>
                `;
        }).join('') : `
                <div style="padding:var(--space-lg);text-align:center;color:var(--text-muted);font-size:0.88rem">
                  No office hours on ${selectedDay}day
                </div>
              `}

              ${daySlots.length > 0 ? `
                <div style="margin-top:var(--space-lg);padding-top:var(--space-md);border-top:1px solid var(--border-subtle)">
                  <div style="display:flex;gap:var(--space-md);flex-wrap:wrap;align-items:flex-end">
                    <!-- Format -->
                    <div class="input-group" style="flex:1;min-width:140px">
                      <label>Meeting Format</label>
                      <select class="select format-select">
                        <option value="in-person">${'🏢'} In-Person (${prof.office})</option>
                        <option value="virtual">${'💻'} Virtual (Google Meet)</option>
                      </select>
                    </div>
                    <!-- Context -->
                    <div class="input-group" style="flex:2;min-width:200px">
                      <label>What do you want to discuss? *</label>
                      <input type="text" class="input context-input" placeholder="e.g. Help with Assignment 3, Problem 2" />
                    </div>
                    <!-- Book -->
                    <button class="btn btn-primary book-btn" data-prof="${prof.id}" onclick="window.__bookSlot && window.__bookSlot('${prof.id}')">
                      ${icons.check} Book Slot
                    </button>
                  </div>
                </div>
              ` : ''}
            </div>
          `;
    }).join('')}
      </div>
    </div>
  `;
}

export function initScheduler() {
    // Day tab switching
    document.querySelectorAll('#dayTabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#dayTabs .tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // In a real app, re-render with the selected day
            showToast(`Showing ${tab.dataset.day} schedule`, 'info');
        });
    });

    // Duration tab switching
    document.querySelectorAll('#durationTabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#durationTabs .tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            showToast(`Slot duration: ${tab.dataset.dur} minutes`, 'info');
        });
    });

    // Book slot
    window.__bookSlot = (profId) => {
        const profCard = document.getElementById(`prof-${profId}`);
        if (!profCard) return;
        const selected = profCard.querySelector('.slot.selected');
        const context = profCard.querySelector('.context-input');
        const format = profCard.querySelector('.format-select');

        if (!selected) {
            showToast('Please select a time slot first', 'error');
            return;
        }
        if (!context || !context.value.trim()) {
            showToast('Please describe what you want to discuss', 'error');
            return;
        }

        const prof = professors.find(p => p.id === profId);
        const formatVal = format ? format.value : 'in-person';
        const locationText = formatVal === 'virtual' ? 'A Google Meet link will be sent to your email' : `Room: ${prof.office}`;

        showModal('✅ Booking Confirmed!', `
      <div style="display:flex;flex-direction:column;gap:var(--space-md)">
        <div style="background:rgba(110,231,183,0.1);border-radius:var(--radius-md);padding:var(--space-md);border:1px solid rgba(110,231,183,0.2)">
          <div style="font-weight:600;margin-bottom:4px">${prof.name}</div>
          <div style="font-size:0.85rem;color:var(--text-secondary)">${selected.dataset.start} — ${selected.dataset.end}</div>
        </div>
        <div style="font-size:0.88rem">
          <div><strong>Format:</strong> ${formatVal === 'virtual' ? '💻 Virtual' : '🏢 In-Person'}</div>
          <div><strong>Location:</strong> ${locationText}</div>
          <div><strong>Topic:</strong> ${context.value}</div>
        </div>
        <div style="font-size:0.82rem;color:var(--text-muted)">You'll receive a reminder 15 minutes before your appointment.</div>
      </div>
    `, [
            { id: 'modalDone', label: 'Done', class: 'btn-primary', onClick: () => showToast('Appointment added to your calendar!') },
        ]);

        selected.classList.add('booked');
        selected.classList.remove('selected');
    };
}
