// ===== KREA HUB — MAIN ENTRY & ROUTER =====
// Role-based SPA with dynamic sidebar navigation & auth gate

import './style.css';
import { icons } from './icons.js';
import { ROLES, activeRole, setActiveRole, getActiveUser, userProfiles, isLoggedIn, logout } from './data.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderScheduler, initScheduler } from './pages/scheduler.js';
import { renderHelpDesk, initHelpDesk } from './pages/helpdesk.js';
import { renderPeerNetwork, initPeerNetwork } from './pages/peernetwork.js';
import { renderFaculty, initFaculty } from './pages/faculty.js';
import { renderTutor, initTutor } from './pages/tutor.js';
import { renderTA, initTA } from './pages/ta.js';
import { renderLogin, initLogin } from './pages/login.js';

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
    <button class="btn btn-ghost btn-sm logout-btn" id="logoutBtn">
      ${icons.logOut || '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'} Sign Out
    </button>
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

  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', () => {
    logout();
    showLogin();
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

// ---- Login / App Toggle ----
function showLogin() {
  // Hide the app shell
  document.getElementById('app').style.display = 'none';

  // Create login overlay if not already present
  let loginRoot = document.getElementById('loginRoot');
  if (!loginRoot) {
    loginRoot = document.createElement('div');
    loginRoot.id = 'loginRoot';
    document.body.appendChild(loginRoot);
  }
  loginRoot.innerHTML = renderLogin();
  initLogin((role) => {
    // On successful login
    showApp();
  });
}

function showApp() {
  // Remove login overlay
  const loginRoot = document.getElementById('loginRoot');
  if (loginRoot) loginRoot.innerHTML = '';

  // Show the app shell
  document.getElementById('app').style.display = '';

  // Render the dynamic sidebar
  renderSidebar();

  // Initial route
  navigate(getRoute());
}

// ---- Init ----
function init() {
  // Mobile menu toggle
  document.getElementById('menuToggle').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('open')) closeSidebar();
    else openSidebar();
  });

  // Overlay click closes sidebar
  document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

  // Hash change routing
  window.addEventListener('hashchange', () => {
    if (isLoggedIn()) navigate(getRoute());
  });

  // Auth gate: show login or app
  if (isLoggedIn()) {
    showApp();
  } else {
    showLogin();
  }
}

// Boot
document.addEventListener('DOMContentLoaded', init);
