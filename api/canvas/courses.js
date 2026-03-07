// ===== CANVAS COURSE RETRIEVAL PROXY =====
// Fetches the authenticated user's enrolled courses from Canvas API.
// Handles token refresh transparently. Returns a clean, minimal payload.

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // ---- Identify the user from session cookie ----
    const cookies = parseCookies(req.headers.cookie);
    const userEmail = cookies.krea_user_email;

    if (!userEmail) {
        return res.status(401).json({ error: 'Not authenticated with KreaHub.' });
    }

    // ---- Retrieve stored Canvas token ----
    let tokenData = await kv.get(`canvas_token:${userEmail}`);

    if (!tokenData) {
        return res.status(401).json({
            error: 'Canvas account not linked.',
            needsAuth: true,
        });
    }

    // ---- Refresh token if expired (or about to expire in 60s) ----
    if (Date.now() > tokenData.expires_at - 60000) {
        try {
            tokenData = await refreshCanvasToken(userEmail, tokenData);
        } catch (err) {
            console.error('Token refresh failed:', err);
            return res.status(401).json({
                error: 'Canvas session expired. Please re-link your Canvas account.',
                needsAuth: true,
            });
        }
    }

    // ---- Proxy the Canvas API call ----
    const canvasDomain = process.env.CANVAS_DOMAIN;
    const enrollmentType = req.query.enrollment_type || 'student';

    try {
        const canvasRes = await fetch(
            `${canvasDomain}/api/v1/users/self/courses?` + new URLSearchParams({
                enrollment_type: enrollmentType,
                enrollment_state: 'active',
                include: ['term', 'total_scores', 'course_image'].join(','),
                per_page: '50',
            }),
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    Accept: 'application/json',
                },
            }
        );

        if (!canvasRes.ok) {
            const errBody = await canvasRes.text();
            console.error('Canvas API error:', canvasRes.status, errBody);

            if (canvasRes.status === 401) {
                // Token revoked on Canvas side
                await kv.del(`canvas_token:${userEmail}`);
                return res.status(401).json({
                    error: 'Canvas access revoked. Please re-link your account.',
                    needsAuth: true,
                });
            }

            return res.status(canvasRes.status).json({ error: 'Canvas API request failed.' });
        }

        const rawCourses = await canvasRes.json();

        // ---- Transform to clean, minimal shape for frontend ----
        const courses = rawCourses.map(c => ({
            id: c.id,
            code: c.course_code || '',
            name: c.name || 'Untitled Course',
            term: c.term?.name || null,
            termId: c.enrollment_term_id || null,
            enrolledAs: c.enrollments?.[0]?.type?.replace('Enrollment', '').toLowerCase() || enrollmentType,
            imageUrl: c.image_download_url || null,
            startDate: c.start_at || null,
            endDate: c.end_at || null,
        }));

        // ---- Cache in KV for 5 minutes to avoid hammering Canvas ----
        await kv.set(`canvas_courses:${userEmail}`, courses, { ex: 300 });

        return res.json({
            success: true,
            count: courses.length,
            courses,
        });

    } catch (err) {
        console.error('Course fetch error:', err);
        return res.status(500).json({ error: 'Failed to retrieve courses from Canvas.' });
    }
}

// ---- Token Refresh ----

async function refreshCanvasToken(userEmail, tokenData) {
    if (!tokenData.refresh_token) {
        throw new Error('No refresh token available');
    }

    const res = await fetch(`${process.env.CANVAS_DOMAIN}/login/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: process.env.CANVAS_CLIENT_ID,
            client_secret: process.env.CANVAS_CLIENT_SECRET,
            refresh_token: tokenData.refresh_token,
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        console.error('Canvas refresh failed:', errText);
        // Clear invalid token
        await kv.del(`canvas_token:${userEmail}`);
        throw new Error('Token refresh failed');
    }

    const newData = await res.json();
    const updated = {
        access_token: newData.access_token,
        refresh_token: newData.refresh_token || tokenData.refresh_token,
        expires_at: Date.now() + (newData.expires_in * 1000),
        linked_at: tokenData.linked_at,
    };

    await kv.set(`canvas_token:${userEmail}`, updated, { ex: 7 * 24 * 60 * 60 });
    return updated;
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
