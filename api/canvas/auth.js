// ===== CANVAS OAUTH2 — INITIATE AUTHORIZATION =====
// Redirects user to Canvas LMS OAuth2 consent screen.
// After user approves, Canvas redirects to /api/canvas/callback with a code.

import crypto from 'crypto';

export default function handler(req, res) {
    const canvasDomain = process.env.CANVAS_DOMAIN;
    const clientId = process.env.CANVAS_CLIENT_ID;

    if (!canvasDomain || !clientId) {
        return res.status(500).json({
            error: 'Canvas integration not configured. Set CANVAS_DOMAIN and CANVAS_CLIENT_ID in environment variables.',
        });
    }

    // Generate CSRF state token
    const state = crypto.randomUUID();

    // Store state in a short-lived HttpOnly cookie for validation on callback
    res.setHeader('Set-Cookie', [
        `canvas_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=300; Path=/`,
    ]);

    // Build Canvas OAuth2 authorization URL
    const baseUrl = `${canvasDomain}/login/oauth2/auth`;
    const redirectUri = getRedirectUri(req);

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        state,
        // Request read-only scope for courses
        scope: 'url:GET|/api/v1/users/self/courses url:GET|/api/v1/courses',
    });

    return res.redirect(302, `${baseUrl}?${params.toString()}`);
}

/**
 * Determine the redirect URI based on environment.
 * Vercel sets VERCEL_URL automatically; locally we fall back to localhost.
 */
function getRedirectUri(req) {
    const host = req.headers?.host || process.env.VERCEL_URL || 'localhost:3000';
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    return `${protocol}://${host}/api/canvas/callback`;
}
