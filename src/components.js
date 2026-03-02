// ===== KREA HUB — SHARED COMPONENTS =====

import { icons } from './icons.js';

/* ---- Toast ---- */
export function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? icons.checkCircle : type === 'error' ? icons.x : icons.bell;
    toast.innerHTML = `<span>${icon}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/* ---- Star Rating ---- */
export function renderStars(rating, max = 5, interactive = false, onChange = null) {
    let html = '<div class="stars">';
    for (let i = 1; i <= max; i++) {
        const filled = i <= Math.round(rating);
        html += `<span class="star ${filled ? 'filled' : 'empty'}" data-value="${i}">
      ${filled ? icons.starFilled : icons.star}
    </span>`;
    }
    html += '</div>';
    if (interactive && onChange) {
        setTimeout(() => {
            document.querySelectorAll('.star[data-value]').forEach(s => {
                s.addEventListener('click', () => onChange(parseInt(s.dataset.value)));
            });
        }, 0);
    }
    return html;
}

/* ---- Badge ---- */
export function renderBadge(text, color = 'purple') {
    return `<span class="badge badge-${color}">${text}</span>`;
}

/* ---- Tag ---- */
export function renderTag(text) {
    return `<span class="tag">${icons.hash} ${text}</span>`;
}

/* ---- Avatar ---- */
export function renderAvatar(initials, gradient, size = 36) {
    const bg = gradient || 'var(--grad-primary)';
    return `<div class="user-avatar" style="width:${size}px;height:${size}px;background:${bg};font-size:${size * 0.38}px">${initials}</div>`;
}

/* ---- Stat Card ---- */
export function renderStatCard(value, label, change, iconHtml, iconColor = 'purple') {
    const changeClass = change && change.startsWith('+') ? 'up' : 'down';
    return `
    <div class="stat-card">
      <div class="card-icon ${iconColor}">${iconHtml}</div>
      <div>
        <div class="stat-value">${value}</div>
        <div class="stat-label">${label}</div>
        ${change ? `<div class="stat-change ${changeClass}">${change}</div>` : ''}
      </div>
    </div>`;
}

/* ---- Appointment Item ---- */
export function renderApptItem(appt) {
    const formatIcon = appt.format === 'virtual' ? icons.video : icons.mapPin;
    return `
    <div class="appt-item">
      <div class="appt-time">${appt.time}</div>
      <div class="appt-details">
        <div class="appt-title">${appt.professor}</div>
        <div class="appt-subtitle">${appt.course} · ${appt.context}</div>
      </div>
      <span class="badge badge-${appt.format === 'virtual' ? 'blue' : 'teal'}">${formatIcon} ${appt.format === 'virtual' ? 'Virtual' : appt.location}</span>
    </div>`;
}

/* ---- Slot Picker ---- */
export function renderSlotPicker(slots, onSelect) {
    const id = 'slotPicker_' + Date.now();
    let html = `<div class="slot-grid" id="${id}">`;
    slots.forEach((slot, i) => {
        html += `<div class="slot ${slot.booked ? 'booked' : ''}" data-index="${i}" ${slot.booked ? '' : `data-start="${slot.start}" data-end="${slot.end}"`}>
      ${slot.start}
    </div>`;
    });
    html += '</div>';
    setTimeout(() => {
        const grid = document.getElementById(id);
        if (!grid) return;
        grid.querySelectorAll('.slot:not(.booked)').forEach(s => {
            s.addEventListener('click', () => {
                grid.querySelectorAll('.slot').forEach(el => el.classList.remove('selected'));
                s.classList.add('selected');
                if (onSelect) onSelect(s.dataset);
            });
        });
    }, 0);
    return html;
}

/* ---- Question Thread ---- */
export function renderThread(q) {
    return `
    <div class="thread ${q.resolved ? 'resolved' : ''}" id="thread-${q.id}">
      <div class="thread-header">
        ${renderAvatar(q.authorInitials, null, 32)}
        <div>
          <div style="font-weight:600;font-size:0.88rem">${q.anonymous ? 'Anonymous' : q.author}</div>
          <div class="thread-meta">
            <span>${icons.clock} ${q.timestamp}</span>
            <span>${icons.eye} ${q.views} views</span>
          </div>
        </div>
        ${q.resolved ? `<span class="badge badge-teal" style="margin-left:auto">${icons.checkCircle} Resolved</span>` : ''}
      </div>
      <div class="thread-body">
        <strong style="font-size:1rem">${q.title}</strong><br/>
        <span style="color:var(--text-secondary)">${q.body}</span>
      </div>
      <div class="thread-footer">
        <div style="display:flex;gap:4px">${q.tags.map(t => renderTag(t)).join('')}</div>
        <div style="display:flex;align-items:center;gap:var(--space-md);margin-left:auto">
          <button class="btn btn-ghost btn-sm">${icons.thumbsUp} ${q.upvotes}</button>
          <button class="btn btn-ghost btn-sm">${icons.messageSquare} ${q.answers}</button>
        </div>
      </div>
    </div>`;
}

/* ---- Profile Card ---- */
export function renderProfileCard(tutor) {
    return `
    <div class="profile-card">
      ${renderAvatar(tutor.initials, tutor.gradient, 64)}
      <div class="profile-name">${tutor.name}</div>
      <div class="profile-subtitle">${tutor.year} ${tutor.available ? `<span class="badge badge-teal" style="margin-left:4px">● Available</span>` : ''}</div>
      <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:var(--space-md);line-height:1.5">${tutor.bio}</p>
      <div class="profile-tags">${tutor.subjects.map(s => renderTag(s)).join('')}</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:var(--space-sm);margin-bottom:var(--space-md)">
        ${renderStars(tutor.rating)}
        <span style="font-size:0.82rem;color:var(--text-secondary)">${tutor.rating} (${tutor.reviews})</span>
      </div>
      <div class="profile-stats">
        <div class="profile-stat-item">
          <div class="profile-stat-value">${tutor.hoursTutored}</div>
          <div class="profile-stat-label">Hours</div>
        </div>
        <div class="profile-stat-item">
          <div class="profile-stat-value">${tutor.rate}</div>
          <div class="profile-stat-label">${tutor.isPaid ? 'Rate' : 'Free'}</div>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" style="width:100%;margin-top:var(--space-md);justify-content:center">
        ${icons.calendar} Book Session
      </button>
    </div>`;
}

/* ---- Simple Bar Chart ---- */
export function renderBarChart(data, maxHeight = 140) {
    const maxVal = Math.max(...data.map(d => d.value));
    let html = '<div class="chart-bars">';
    data.forEach(d => {
        const h = maxVal > 0 ? (d.value / maxVal) * maxHeight : 4;
        html += `
      <div class="chart-bar-wrap">
        <div class="chart-bar-value">${d.value}</div>
        <div class="chart-bar" style="height:${h}px"></div>
        <div class="chart-bar-label">${d.label}</div>
      </div>`;
    });
    html += '</div>';
    return html;
}

/* ---- Modal ---- */
export function showModal(title, bodyHtml, actions = []) {
    const existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">${title}</div>
        <button class="modal-close" id="modalClose">${icons.x}</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-actions">
        ${actions.map(a => `<button class="btn ${a.class || 'btn-secondary'}" id="${a.id}">${a.label}</button>`).join('')}
      </div>
    </div>`;
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('#modalClose').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    actions.forEach(a => {
        const btn = overlay.querySelector(`#${a.id}`);
        if (btn && a.onClick) btn.addEventListener('click', () => { a.onClick(); close(); });
    });

    return { close };
}
