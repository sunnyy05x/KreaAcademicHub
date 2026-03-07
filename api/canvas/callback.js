// ===== CANVAS OAUTH2 — CALLBACK HANDLER =====
// Receives the authorization code from Canvas, exchanges it for
// access + refresh tokens, stores them securely in Vercel KV,
// and redirects the user back to the app.

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const { code, state, error: oauthError } = req.query;

    // ---- Handle denied / error responses from Canvas ----
    if (oauthError) {
        console.error('Canvas OAuth error:', oauthError);
        return res.redirect(302, '/#dashboard?canvas_error=denied');
    }

    if (!code || !state) {
        return res.status(400).json({ error: 'Missing authorization code or state parameter.' });
    }

    // ---- CSRF validation ----
    const cookies = parseCookies(req.headers.cookie);
    if (state !== cookies.canvas_oauth_state) {
        return res.status(403).json({ error: 'Invalid state — CSRF validation failed.' });
    }

    // ---- Identify the user ----
    const userEmail = cookies.krea_user_email;
    if (!userEmail) {
        return res.status(401).json({
            error: 'No KreaHub session found. Please log in to KreaHub first, then link Canvas.',
        });
    }

    // ---- Exchange authorization code for tokens (server-to-server) ----
    const canvasDomain = process.env.CANVAS_DOMAIN;
    const redirectUri = getRedirectUri(req);

    try {
        const tokenRes = await fetch(`${canvasDomain}/login/oauth2/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: process.env.CANVAS_CLIENT_ID,
                client_secret: process.env.CANVAS_CLIENT_SECRET,
                redirect_uri: redirectUri,
                code,
            }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok) {
            console.error('Canvas token exchange failed:', tokenData);
            return res.redirect(302, '/#dashboard?canvas_error=token_exchange');
        }

        // ---- Store tokens in Vercel KV (keyed by user email) ----
        const tokenRecord = {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || null,
            expires_at: Date.now() + (tokenData.expires_in * 1000),
            linked_at: new Date().toISOString(),
        };

        await kv.set(`canvas_token:${userEmail}`, tokenRecord, {
            ex: 7 * 24 * 60 * 60, // TTL: 7 days
        });

        // ---- Clean up state cookie and redirect to app ----
        res.setHeader('Set-Cookie', [
            'canvas_oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/',
        ]);

        return res.redirect(302, '/#courses?canvas_linked=true');

    } catch (err) {
        console.error('Canvas callback error:', err);
        return res.redirect(302, '/#dashboard?canvas_error=server');
    }
}

// ---- Helpers ----

function parseCookies(cookieHeader) {
    if (!cookieHeader) return {};
    return Object.fromEntries(
        cookieHeader.split(';').map(pair => {
            const [key, ...rest] = pair.trim().split('=');
            return [key, rest.join('=')];
        })
    );
}

function getRedirectUri(req) {
    const host = req.headers?.host || process.env.VERCEL_URL || 'localhost:3000';
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    return `${protocol}://${host}/api/canvas/callback`;
}
