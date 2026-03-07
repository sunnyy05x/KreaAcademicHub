// ===== COURSE-SPECIFIC GROUP CHAT ROOMS =====
// CRUD for creating and retrieving chat rooms tied to Canvas courses.
// Data stored in Vercel KV.

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const cookies = parseCookies(req.headers.cookie);
    const userEmail = cookies.krea_user_email;

    if (!userEmail) {
        return res.status(401).json({ error: 'Not authenticated.' });
    }

    switch (req.method) {
        case 'POST':
            return createRoom(req, res, userEmail);
        case 'GET':
            return getRooms(req, res, userEmail);
        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

// ---- Create a chat room for a course (idempotent) ----

async function createRoom(req, res, userEmail) {
    const { courseId, courseName, courseCode } = req.body || {};

    if (!courseId || !courseName) {
        return res.status(400).json({ error: 'courseId and courseName are required.' });
    }

    const roomKey = `chat_room:${courseId}`;
    let room = await kv.get(roomKey);

    if (room) {
        // Room exists — add user as member if not already present
        const isMember = room.members.some(m => m.email === userEmail);
        if (!isMember) {
            room.members.push({
                email: userEmail,
                joinedAt: new Date().toISOString(),
            });
            await kv.set(roomKey, room);

            // Also track in user's room list
            await addRoomToUser(userEmail, courseId);
        }
        return res.json({ success: true, room, created: false });
    }

    // Create new room
    room = {
        courseId,
        courseName,
        courseCode: courseCode || '',
        members: [{
            email: userEmail,
            joinedAt: new Date().toISOString(),
        }],
        createdAt: new Date().toISOString(),
        messages: [],
    };

    await kv.set(roomKey, room);
    await addRoomToUser(userEmail, courseId);

    return res.status(201).json({ success: true, room, created: true });
}

// ---- Get all chat rooms the user is a member of ----

async function getRooms(req, res, userEmail) {
    const userRoomsKey = `user_rooms:${userEmail}`;
    const courseIds = await kv.get(userRoomsKey) || [];

    const rooms = [];
    for (const courseId of courseIds) {
        const room = await kv.get(`chat_room:${courseId}`);
        if (room) {
            rooms.push({
                courseId: room.courseId,
                courseName: room.courseName,
                courseCode: room.courseCode,
                memberCount: room.members.length,
                messageCount: room.messages.length,
                lastMessage: room.messages.length > 0
                    ? room.messages[room.messages.length - 1]
                    : null,
                createdAt: room.createdAt,
            });
        }
    }

    return res.json({ success: true, rooms });
}

// ---- Track which rooms a user belongs to ----

async function addRoomToUser(userEmail, courseId) {
    const key = `user_rooms:${userEmail}`;
    const current = await kv.get(key) || [];
    if (!current.includes(courseId)) {
        current.push(courseId);
        await kv.set(key, current);
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
