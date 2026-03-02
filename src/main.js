// ===== KREA HUB — MAIN ENTRY & ROUTER =====
// Role-based SPA with dynamic sidebar navigation

import './style.css';
import { icons } from './icons.js';
import { ROLES, activeRole, setActiveRole, getActiveUser, userProfiles } from './data.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderScheduler, initScheduler } from './pages/scheduler.js';
import { renderHelpDesk, initHelpDesk } from './pages/helpdesk.js';
import { renderPeerNetwork, initPeerNetwork } from './pages/peernetwork.js';
import { renderFaculty, initFaculty } from './pages/faculty.js';
import { renderTutor, initTutor } from './pages/tutor.js';
import { renderTA, initTA } from './pages/ta.js';

// ---- Page Registry ----
const pages = {
  dashboard: { render: renderDashboard, init: null, label: 'Dashboard', icon: 'dashboard' },
  scheduler: { render: renderScheduler, init: initScheduler, label: 'Scheduler', icon: 'calendar' },
  helpdesk: { render: renderHelpDesk, init: initHelpDesk, label: 'Help Desk', icon: 'messageCircle' },
  peernetwork: { render: renderPeerNetwork, init: initPeerNetwork, label: 'Peer Network', icon: 'users' },
  faculty: { render: renderFaculty, init: initFaculty, label: 'Faculty Panel', icon: 'shield' },
  tutor: { render: renderTutor, init: initTutor, label: 'Tutor Panel', icon: 'award' },
  ta: { render: renderTA, init: initTA, label: 'TA Panel', icon: 'clipboard' },
};

// ---- Role-specific page sets ----
// Pages that are "role-specific" (shown under "My Panel" section)
const rolePanelPages = { faculty: 'faculty', ta: 'ta', tutor: 'tutor' };

// ---- Dynamic Sidebar ----
function renderSidebar() {
  const role = ROLES[activeRole];
  const user = getActiveUser();
  const nav = document.getElementById('sidebarNav');
  const footer = document.getElementById('sidebarFooter');

  // Split pages into "common" and "panel"
  const commonPages = role.pages.filter(p => !rolePanelPages[p]);
  const panelPages = role.pages.filter(p => rolePanelPages[p]);

  let navHTML = '';

  // Common pages
  commonPages.forEach(key => {
    const pg = pages[key];
    navHTML += `
      <a href="#${key}" class="nav-item" data-page="${key}">
        <span class="nav-icon">${icons[pg.icon]}</span>
        <span>${pg.label}</span>
      </a>`;
  });

  // Panel section
  if (panelPages.length) {
    navHTML += `<div class="nav-separator"></div>`;
    navHTML += `<div class="nav-section-label">My Panel</div>`;
    panelPages.forEach(key => {
      const pg = pages[key];
      navHTML += `
        <a href="#${key}" class="nav-item" data-page="${key}">
          <span class="nav-icon">${icons[pg.icon]}</span>
          <span>${pg.label}</span>
        </a>`;
    });
  }

  nav.innerHTML = navHTML;

  // User card + role switcher
  const roleLabel = role.label;
  const yearOrDept = user.year || user.department || (user.assignedCourses ? 'TA' : '');
  footer.innerHTML = `
    <div class="user-card" style="margin-bottom:var(--space-sm)">
      <div class="user-avatar">${user.initials}</div>
      <div class="user-info">
        <span class="user-name">${user.name}</span>
        <span class="user-role">${roleLabel} · ${yearOrDept}</span>
      </div>
    </div>
    <button class="btn btn-ghost btn-sm role-switch-btn" id="roleSwitchBtn" style="width:100%;justify-content:center;font-size:0.78rem;gap:6px;margin-top:2px">
      ${icons.refreshCw} Switch Role
    </button>
    <div class="role-dropdown" id="roleDropdown" style="display:none">
      ${Object.entries(ROLES).map(([key, r]) => `
        <div class="role-option ${key === activeRole ? 'active' : ''}" data-role="${key}">
          <span style="font-weight:600">${r.label}</span>
          <span style="font-size:0.72rem;color:var(--text-muted)">${userProfiles[key].name}</span>
        </div>
      `).join('')}
    </div>
  `;

  // Re-bind nav click handlers
  nav.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = item.dataset.page;
    });
  });

  // Role switcher
  const switchBtn = document.getElementById('roleSwitchBtn');
  const dropdown = document.getElementById('roleDropdown');
  switchBtn.addEventListener('click', () => {
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });
  dropdown.querySelectorAll('.role-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const newRole = opt.dataset.role;
      setActiveRole(newRole);
      dropdown.style.display = 'none';
      renderSidebar();
      const defaultPage = ROLES[newRole].defaultPage;
      window.location.hash = defaultPage;
      navigate(defaultPage);
    });
  });

  // Update active state for current route
  const currentHash = window.location.hash.replace('#', '') || 'dashboard';
  nav.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === currentHash);
  });
}

// ---- Router ----
function navigate(page) {
  const role = ROLES[activeRole];
  // Guard: if page not allowed for this role, redirect to default
  if (!role.pages.includes(page)) {
    const fallback = role.defaultPage;
    window.location.hash = fallback;
    return navigate(fallback);
  }

  const main = document.getElementById('mainContent');
  const p = pages[page];
  if (!p) return navigate('dashboard');

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  // Render page
  main.innerHTML = p.render();
  if (p.init) p.init();

  // Close mobile sidebar
  closeSidebar();

  // Scroll to top
  main.scrollTo(0, 0);
}

function getRoute() {
  const hash = window.location.hash.replace('#', '');
  const role = ROLES[activeRole];
  return (hash && role.pages.includes(hash)) ? hash : role.defaultPage;
}

// ---- Mobile Sidebar ----
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('visible');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('visible');
}

// ---- Init ----
function init() {
  // Render the dynamic sidebar
  renderSidebar();

  // Mobile menu toggle
  document.getElementById('menuToggle').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('open')) closeSidebar();
    else openSidebar();
  });

  // Overlay click closes sidebar
  document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

  // Hash change routing
  window.addEventListener('hashchange', () => navigate(getRoute()));

  // Initial route
  navigate(getRoute());
}

// Boot
document.addEventListener('DOMContentLoaded', init);
