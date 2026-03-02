// ===== KREA HUB — PEER NETWORK PAGE =====

import { icons } from '../icons.js';
import { tutors } from '../data.js';
import { renderProfileCard, renderStars, showToast, showModal } from '../components.js';

export function renderPeerNetwork() {
    return `
    <div class="animate-in">
      <div class="page-header">
        <h1>${icons.users} The <span class="gradient-text">Peer Network</span></h1>
        <p>Find verified peer tutors, book sessions, and leave reviews.</p>
      </div>

      <!-- Search & Filter -->
      <div class="filter-bar">
        <div class="search-bar" style="flex:1;max-width:360px">
          <span class="search-icon">${icons.search}</span>
          <input type="text" class="input" placeholder="Search by subject, tutor name, or assignment..." id="tutorSearch" />
        </div>
        <div class="tabs" id="availTabs">
          <div class="tab active" data-avail="all">All Tutors</div>
          <div class="tab" data-avail="available">Available Now</div>
          <div class="tab" data-avail="paid">Paid</div>
          <div class="tab" data-avail="volunteer">Volunteer</div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stat-grid" style="margin-bottom:var(--space-xl)">
        <div class="stat-card">
          <div class="card-icon teal">${icons.users}</div>
          <div>
            <div class="stat-value">${tutors.length}</div>
            <div class="stat-label">Active Tutors</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="card-icon purple">${icons.zap}</div>
          <div>
            <div class="stat-value">${tutors.filter(t => t.available).length}</div>
            <div class="stat-label">Available Now</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="card-icon amber">${icons.star}</div>
          <div>
            <div class="stat-value">${(tutors.reduce((s, t) => s + t.rating, 0) / tutors.length).toFixed(1)}</div>
            <div class="stat-label">Avg Rating</div>
          </div>
        </div>
      </div>

      <!-- Tutor Grid -->
      <div class="grid-3" id="tutorGrid">
        ${tutors.map(t => renderProfileCard(t)).join('')}
      </div>
    </div>
  `;
}

export function initPeerNetwork() {
    // Search
    const searchInput = document.getElementById('tutorSearch');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            const cards = document.querySelectorAll('.profile-card');
            cards.forEach((card, i) => {
                const tutor = tutors[i];
                const text = `${tutor.name} ${tutor.subjects.join(' ')} ${tutor.year}`.toLowerCase();
                card.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }

    // Availability filter
    document.querySelectorAll('#availTabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#availTabs .tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const filter = tab.dataset.avail;
            const cards = document.querySelectorAll('.profile-card');
            cards.forEach((card, i) => {
                const tutor = tutors[i];
                if (filter === 'all') card.style.display = '';
                else if (filter === 'available') card.style.display = tutor.available ? '' : 'none';
                else if (filter === 'paid') card.style.display = tutor.isPaid ? '' : 'none';
                else if (filter === 'volunteer') card.style.display = !tutor.isPaid ? '' : 'none';
            });
        });
    });

    // Book session buttons
    document.querySelectorAll('.profile-card .btn-primary').forEach((btn, i) => {
        btn.addEventListener('click', () => {
            const tutor = tutors[i];
            showModal(`📚 Book Session with ${tutor.name}`, `
        <div style="display:flex;flex-direction:column;gap:var(--space-md)">
          <div class="input-group">
            <label>Subject</label>
            <select class="select">
              ${tutor.subjects.map(s => `<option>${s}</option>`).join('')}
            </select>
          </div>
          <div class="input-group">
            <label>Preferred Date & Time</label>
            <input type="text" class="input" placeholder="e.g. Tomorrow at 3 PM" />
          </div>
          <div class="input-group">
            <label>What do you need help with?</label>
            <textarea class="textarea" placeholder="Describe the topic or assignment..."></textarea>
          </div>
          <div style="background:rgba(167,139,250,0.08);border-radius:var(--radius-md);padding:var(--space-md);font-size:0.82rem;color:var(--text-secondary)">
            ${tutor.isPaid ? `💰 Rate: ${tutor.rate}` : '🤝 This is a volunteer session (free)'}
          </div>
        </div>
      `, [
                { id: 'cancelBook', label: 'Cancel', class: 'btn-ghost', onClick: () => { } },
                { id: 'confirmBook', label: 'Send Request', class: 'btn-primary', onClick: () => showToast(`Session request sent to ${tutor.name}!`) },
            ]);
        });
    });
}
