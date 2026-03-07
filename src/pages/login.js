// ===== KREA HUB — LOGIN PAGE (Google SSO) =====
import { icons } from '../icons.js';

// ⚠️ Replace this with your actual Google OAuth Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = '386292949358-das6jhqmkadur6ugurai8mfilr9efuid.apps.googleusercontent.com';

/**
 * Decode a JWT ID token payload (base64url → JSON).
 * This is safe for client-side use — Google's ID token is a standard JWT.
 */
function decodeJwtPayload(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')
  );
  return JSON.parse(json);
}

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

        <!-- Right Panel — Google SSO -->
        <div class="login-form-panel">
          <div class="login-form-header">
            <h1>Welcome to KreaHub</h1>
            <p>Sign in with your official Krea University account</p>
          </div>

          <div class="login-form" id="loginForm">
            <div class="login-error" id="loginError" style="display:none">
              <span class="login-error-icon">⚠️</span>
              <span id="loginErrorText"></span>
            </div>

            <div id="googleSsoBtnContainer" class="google-sso-container" style="display:flex; justify-content:center; width:100%; margin: 24px 0;"></div>

            <div class="login-divider">
              <span class="login-divider-line"></span>
              <span class="login-divider-text">Krea accounts only</span>
              <span class="login-divider-line"></span>
            </div>

            <div class="login-footer-note">
              <p>Use your official Krea University email to sign in.</p>

            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initLogin(onLoginSuccess) {
  const errorBox = document.getElementById('loginError');
  const errorText = document.getElementById('loginErrorText');

  function showError(msg) {
    errorBox.style.display = 'flex';
    errorText.textContent = msg;
  }

  function hideError() {
    errorBox.style.display = 'none';
  }

  /**
   * Handle the Google credential response.
   * Decodes the JWT, validates domain, and completes login.
   */
  function handleCredentialResponse(response) {
    hideError();
    try {
      const payload = decodeJwtPayload(response.credential);
      const email = payload.email;
      const name = payload.name || '';
      const hd = payload.hd; // hosted domain claim — present for Google Workspace accounts

      // Domain validation: check the hosted domain claim and email domain
      const emailDomain = email.split('@')[1]?.toLowerCase();
      const allowedDomains = ['krea.ac.in', 'krea.edu.in'];

      if (!allowedDomains.includes(emailDomain) && !allowedDomains.includes(hd)) {
        showError('Unauthorized Domain: Only @krea.ac.in and @krea.edu.in accounts are allowed. Personal Gmail and other domains are not permitted.');
        return;
      }

      // Use the data module to complete login
      import('../data.js').then(({ loginWithGoogle }) => {
        const result = loginWithGoogle(email, name);
        if (result.success) {
          onLoginSuccess(result.role);
        } else {
          showError(result.error);
        }
      });
    } catch (err) {
      console.error('Google SSO error:', err);
      showError('Authentication failed. Please try again.');
    }
  }

  // Initialize Google Identity Services
  function initGoogleSSO() {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        // Restrict to Krea hosted domains
        hosted_domain: 'krea.ac.in', // Primary hint — backup validation is in code
      });

      const btnContainer = document.getElementById('googleSsoBtnContainer');
      if (btnContainer) {
        google.accounts.id.renderButton(
          btnContainer,
          { theme: 'filled_black', size: 'large', text: 'signin_with', width: '320', shape: 'pill' }
        );
      }
    }
  }

  // Initialize Google SSO when the page loads
  // The GIS script may not be loaded yet, so we retry
  if (typeof google !== 'undefined' && google.accounts) {
    initGoogleSSO();
  } else {
    // Wait for the GIS script to load
    const checkGoogle = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts) {
        clearInterval(checkGoogle);
        initGoogleSSO();
      }
    }, 200);
    // Stop checking after 10 seconds
    setTimeout(() => clearInterval(checkGoogle), 10000);
  }
}
