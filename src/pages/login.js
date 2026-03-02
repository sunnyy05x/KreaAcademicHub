// ===== KREA HUB — LOGIN PAGE =====
import { icons } from '../icons.js';

export function renderLogin() {
    return `
    <div class="login-page">
      <div class="login-bg-shapes">
        <div class="login-shape shape-1"></div>
        <div class="login-shape shape-2"></div>
        <div class="login-shape shape-3"></div>
      </div>

      <div class="login-container">
        <!-- Left Panel — branding -->
        <div class="login-branding">
          <div class="login-logo-wrap">
            <img src="/krea-logo.png" alt="Krea University" class="login-logo-img">
          </div>
          <h2 class="login-tagline">Academic Hub</h2>
          <p class="login-tagline-sub">Book office hours · Solve doubts · Find peer tutors</p>
          <div class="login-features">
            <div class="login-feature-item">
              <span class="login-feature-icon">${icons.calendar}</span>
              <span>Smart Scheduling</span>
            </div>
            <div class="login-feature-item">
              <span class="login-feature-icon">${icons.messageCircle}</span>
              <span>Help Desk</span>
            </div>
            <div class="login-feature-item">
              <span class="login-feature-icon">${icons.users}</span>
              <span>Peer Network</span>
            </div>
          </div>
        </div>

        <!-- Right Panel — form -->
        <div class="login-form-panel">
          <div class="login-form-header">
            <h1>Welcome Back</h1>
            <p>Sign in with your Krea account</p>
          </div>

          <form id="loginForm" class="login-form" autocomplete="on">
            <div class="login-domain-badges">
              <span class="badge badge-teal">Students: @krea.ac.in</span>
              <span class="badge badge-purple">Faculty / TA: @krea.edu.in</span>
            </div>

            <div class="input-group">
              <label for="loginEmail">Email Address</label>
              <div class="input-with-icon">
                <span class="input-icon">${icons.mail || `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`}</span>
                <input type="email" id="loginEmail" class="input" placeholder="yourname@krea.ac.in" required autocomplete="email">
              </div>
            </div>

            <div class="input-group">
              <label for="loginPassword">Password</label>
              <div class="input-with-icon">
                <span class="input-icon">${icons.lock || `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`}</span>
                <input type="password" id="loginPassword" class="input" placeholder="Enter your password" required autocomplete="current-password">
              </div>
            </div>

            <div class="login-error" id="loginError" style="display:none">
              <span class="login-error-icon">⚠️</span>
              <span id="loginErrorText"></span>
            </div>

            <button type="submit" class="btn btn-primary btn-lg login-submit-btn" id="loginSubmitBtn">
              Sign In
            </button>

            <div class="login-footer-note">
              <p>Use your official Krea University email to sign in.</p>
              <p class="login-footer-small">Students → <strong>@krea.ac.in</strong> &nbsp;|&nbsp; Faculty & TA → <strong>@krea.edu.in</strong></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

export function initLogin(onLoginSuccess) {
    const form = document.getElementById('loginForm');
    const errorBox = document.getElementById('loginError');
    const errorText = document.getElementById('loginErrorText');
    const submitBtn = document.getElementById('loginSubmitBtn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email) {
            showError('Please enter your email address.');
            return;
        }
        if (!password) {
            showError('Please enter your password.');
            return;
        }

        // Validate domain
        const domain = email.split('@')[1]?.toLowerCase();
        if (!domain || !['krea.ac.in', 'krea.edu.in'].includes(domain)) {
            showError('Only @krea.ac.in (students) and @krea.edu.in (faculty/TA) accounts are allowed.');
            return;
        }

        // Animate button
        submitBtn.textContent = 'Signing in…';
        submitBtn.disabled = true;

        // Simulate brief auth delay for UX
        setTimeout(() => {
            // Import login dynamically to avoid circular deps
            import('../data.js').then(({ login }) => {
                const result = login(email, password);
                if (result.success) {
                    onLoginSuccess(result.role);
                } else {
                    showError(result.error);
                    submitBtn.textContent = 'Sign In';
                    submitBtn.disabled = false;
                }
            });
        }, 600);
    });

    function showError(msg) {
        errorBox.style.display = 'flex';
        errorText.textContent = msg;
    }

    // Focus the email field
    setTimeout(() => {
        document.getElementById('loginEmail')?.focus();
    }, 100);
}
