// ===== COURSE-TIED SLOT BOOKING =====
// CRUD for managing time slot bookings tied to a course + professor pair.
// Data stored in Vercel KV.

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const cookies = parseCookies(req.headers.cookie);
    const userEmail = cookies.krea_user_email;

    if (!userEmail) {
        return res.status(401).json({ error: 'Not authenticated.' });
    }

    switch (req.method) {
        case 'GET':
            return getSlots(req, res, userEmail);
        case 'POST':
            return bookSlot(req, res, userEmail);
        case 'DELETE':
            return cancelSlot(req, res, userEmail);
        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

// ---- Get available slots for a course + professor ----

async function getSlots(req, res, userEmail) {
    const { courseId, professorId } = req.query;

    if (!courseId || !professorId) {
        return res.status(400).json({ error: 'courseId and professorId are required.' });
    }

    const slotsKey = `slots:${courseId}:${professorId}`;
    const slotData = await kv.get(slotsKey);

    if (!slotData) {
        return res.json({
            success: true,
            courseId,
            professorId,
            slots: [],
            message: 'No slots published for this course/professor yet.',
        });
    }

    return res.json({
        success: true,
        courseId: slotData.courseId,
        professorId: slotData.professorId,
        professorName: slotData.professorName,
        slots: slotData.slots,
    });
}

// ---- Book a specific slot ----

async function bookSlot(req, res, userEmail) {
    const { courseId, professorId, slotId, studentName } = req.body || {};

    if (!courseId || !professorId || !slotId) {
        return res.status(400).json({ error: 'courseId, professorId, and slotId are required.' });
    }

    const slotsKey = `slots:${courseId}:${professorId}`;
    const slotData = await kv.get(slotsKey);

    if (!slotData) {
        return res.status(404).json({ error: 'No slot schedule found.' });
    }

    const slot = slotData.slots.find(s => s.id === slotId);
    if (!slot) {
        return res.status(404).json({ error: 'Slot not found.' });
    }

    if (slot.booked) {
        return res.status(409).json({ error: 'Slot already booked.', bookedBy: slot.studentEmail === userEmail ? 'you' : 'another student' });
    }

    // Check max bookings per student
    const studentBookings = slotData.slots.filter(s => s.booked && s.studentEmail === userEmail);
    const maxBookings = slotData.maxBookingsPerStudent || 2;
    if (studentBookings.length >= maxBookings) {
        return res.status(429).json({
            error: `Maximum ${maxBookings} bookings per student for this course.`,
        });
    }

    // Book the slot
    slot.booked = true;
    slot.studentEmail = userEmail;
    slot.studentName = studentName || userEmail.split('@')[0];
    slot.bookedAt = new Date().toISOString();

    await kv.set(slotsKey, slotData);

    // Also add to user's booking list
    const userBookingsKey = `bookings:${userEmail}`;
    const userBookings = await kv.get(userBookingsKey) || [];
    userBookings.push({
        courseId,
        professorId,
        professorName: slotData.professorName,
        slotId,
        day: slot.day,
        start: slot.start,
        end: slot.end,
        bookedAt: slot.bookedAt,
    });
    await kv.set(userBookingsKey, userBookings);

    return res.json({ success: true, slot });
}

// ---- Cancel a booking ----

async function cancelSlot(req, res, userEmail) {
    const { courseId, professorId, slotId } = req.body || req.query;

    if (!courseId || !professorId || !slotId) {
        return res.status(400).json({ error: 'courseId, professorId, and slotId are required.' });
    }

    const slotsKey = `slots:${courseId}:${professorId}`;
    const slotData = await kv.get(slotsKey);

    if (!slotData) {
        return res.status(404).json({ error: 'No slot schedule found.' });
    }

    const slot = slotData.slots.find(s => s.id === slotId);
    if (!slot) {
        return res.status(404).json({ error: 'Slot not found.' });
    }

    // Only the student who booked it (or the professor) can cancel
    if (slot.studentEmail !== userEmail) {
        return res.status(403).json({ error: 'You can only cancel your own bookings.' });
    }

    slot.booked = false;
    delete slot.studentEmail;
    delete slot.studentName;
    delete slot.bookedAt;

    await kv.set(slotsKey, slotData);

    // Remove from user's booking list
    const userBookingsKey = `bookings:${userEmail}`;
    const userBookings = await kv.get(userBookingsKey) || [];
    const updatedBookings = userBookings.filter(b => !(b.courseId === courseId && b.professorId === professorId && b.slotId === slotId));
    await kv.set(userBookingsKey, updatedBookings);

    return res.json({ success: true, message: 'Booking cancelled.' });
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
