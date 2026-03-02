// ===== KREA HUB — MOCK DATA =====

// ---- Role Definitions ----
export const ROLES = {
    student: {
        label: 'Student',
        pages: ['dashboard', 'scheduler', 'helpdesk', 'peernetwork'],
        defaultPage: 'dashboard',
    },
    faculty: {
        label: 'Faculty',
        pages: ['dashboard', 'scheduler', 'helpdesk', 'faculty'],
        defaultPage: 'faculty',
    },
    ta: {
        label: 'Teaching Assistant',
        pages: ['dashboard', 'helpdesk', 'scheduler', 'ta'],
        defaultPage: 'ta',
    },
    tutor: {
        label: 'Peer Tutor',
        pages: ['dashboard', 'helpdesk', 'peernetwork', 'tutor'],
        defaultPage: 'tutor',
    },
};

// ---- User Profiles per Role ----
export const userProfiles = {
    student: {
        id: 'u1', name: 'Arjun Patel', initials: 'AP',
        email: 'arjun.patel@krea.edu.in', role: 'student', year: 'CS 2027',
        courses: ['CS201', 'MA102', 'PH101', 'EC110', 'HS201'],
    },
    faculty: {
        id: 'p1', name: 'Dr. Meera Krishnan', initials: 'MK',
        email: 'meera.krishnan@krea.edu.in', role: 'faculty', department: 'Computer Science',
        courses: ['CS201'],
    },
    ta: {
        id: 'ta1', name: 'Ravi Sundaram', initials: 'RS',
        email: 'ravi.sundaram@krea.edu.in', role: 'ta', year: 'MA 2025',
        assignedCourses: ['MA102'],
    },
    tutor: {
        id: 't1', name: 'Aisha Khan', initials: 'AK',
        email: 'aisha.khan@krea.edu.in', role: 'tutor', year: 'CS 2025',
        subjects: ['Data Structures', 'Algorithms', 'Python'],
    },
};

// ---- Authentication ----
// Students: @krea.ac.in  |  Faculty / TA / Tutors: @krea.edu.in
const ALLOWED_DOMAINS = ['krea.ac.in', 'krea.edu.in'];

export function isLoggedIn() {
    return localStorage.getItem('kreaHub_loggedIn') === 'true';
}

export function getLoggedInUser() {
    const data = localStorage.getItem('kreaHub_user');
    return data ? JSON.parse(data) : null;
}

export function login(email, password) {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
        return { success: false, error: 'Only @krea.ac.in (students) and @krea.edu.in (faculty/TA) accounts are allowed.' };
    }
    if (!password || password.length < 1) {
        return { success: false, error: 'Please enter your password.' };
    }

    // Determine role from domain
    let detectedRole = 'student';
    if (domain === 'krea.edu.in') {
        // Check if the email matches any known faculty/TA/tutor profile
        const lowerEmail = email.toLowerCase();
        if (userProfiles.faculty.email.toLowerCase() === lowerEmail) detectedRole = 'faculty';
        else if (userProfiles.ta.email.toLowerCase() === lowerEmail) detectedRole = 'ta';
        else if (userProfiles.tutor.email.toLowerCase() === lowerEmail) detectedRole = 'tutor';
        else detectedRole = 'faculty'; // default for @krea.edu.in
    }

    const user = userProfiles[detectedRole];
    const userData = { ...user, loginEmail: email };

    localStorage.setItem('kreaHub_loggedIn', 'true');
    localStorage.setItem('kreaHub_user', JSON.stringify(userData));
    localStorage.setItem('kreaHub_role', detectedRole);

    activeRole = detectedRole;
    return { success: true, role: detectedRole, user: userData };
}

export function logout() {
    localStorage.removeItem('kreaHub_loggedIn');
    localStorage.removeItem('kreaHub_user');
    localStorage.removeItem('kreaHub_role');
    activeRole = 'student';
}

// Active role state — mutable via role switcher
export let activeRole = localStorage.getItem('kreaHub_role') || 'student';
export function setActiveRole(role) { activeRole = role; localStorage.setItem('kreaHub_role', role); }
export function getActiveUser() { return userProfiles[activeRole]; }

export const currentUser = {
    id: 'u1',
    name: 'Arjun Patel',
    initials: 'AP',
    email: 'arjun.patel@krea.edu.in',
    role: 'student',
    year: 'CS 2027',
    courses: ['CS201', 'MA102', 'PH101', 'EC110', 'HS201'],
};

export const courses = [
    { code: 'CS201', name: 'Data Structures & Algorithms', color: '#818cf8' },
    { code: 'MA102', name: 'Linear Algebra', color: '#60a5fa' },
    { code: 'PH101', name: 'Foundation Physics', color: '#6ee7b7' },
    { code: 'EC110', name: 'Microeconomics', color: '#fbbf24' },
    { code: 'HS201', name: 'Critical Thinking & Writing', color: '#f472b6' },
];

export const professors = [
    {
        id: 'p1', name: 'Dr. Meera Krishnan', initials: 'MK',
        department: 'Computer Science', office: 'AB-302',
        courses: ['CS201'],
        weeklySlots: [
            { day: 'Tue', start: '14:00', end: '16:00' },
            { day: 'Thu', start: '10:00', end: '11:30' },
        ],
        maxBookingsPerStudent: 2,
    },
    {
        id: 'p2', name: 'Prof. Rakesh Sharma', initials: 'RS',
        department: 'Mathematics', office: 'AB-205',
        courses: ['MA102'],
        weeklySlots: [
            { day: 'Mon', start: '11:00', end: '13:00' },
            { day: 'Wed', start: '15:00', end: '16:30' },
        ],
        maxBookingsPerStudent: 3,
    },
    {
        id: 'p3', name: 'Dr. Ananya Rao', initials: 'AR',
        department: 'Physics', office: 'SB-108',
        courses: ['PH101'],
        weeklySlots: [
            { day: 'Tue', start: '09:00', end: '10:30' },
            { day: 'Fri', start: '14:00', end: '15:30' },
        ],
        maxBookingsPerStudent: 2,
    },
    {
        id: 'p4', name: 'Dr. Vikram Desai', initials: 'VD',
        department: 'Economics', office: 'AB-410',
        courses: ['EC110'],
        weeklySlots: [
            { day: 'Wed', start: '10:00', end: '12:00' },
        ],
        maxBookingsPerStudent: 2,
    },
    {
        id: 'p5', name: 'Prof. Lakshmi Iyer', initials: 'LI',
        department: 'Humanities', office: 'HB-201',
        courses: ['HS201'],
        weeklySlots: [
            { day: 'Thu', start: '14:00', end: '16:00' },
            { day: 'Fri', start: '11:00', end: '12:30' },
        ],
        maxBookingsPerStudent: 2,
    },
];

export function generateTimeSlots(start, end, duration = 30) {
    const slots = [];
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let cur = sh * 60 + sm;
    const endMin = eh * 60 + em;
    while (cur + duration <= endMin) {
        const h = Math.floor(cur / 60);
        const m = cur % 60;
        const endH = Math.floor((cur + duration) / 60);
        const endM = (cur + duration) % 60;
        slots.push({
            start: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
            end: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
            booked: Math.random() < 0.3,
        });
        cur += duration;
    }
    return slots;
}

export const upcomingAppointments = [
    {
        id: 'a1',
        professor: 'Dr. Meera Krishnan',
        course: 'CS201',
        date: 'Today',
        time: '2:30 PM',
        format: 'in-person',
        location: 'AB-302',
        context: 'Binary tree traversal doubt',
    },
    {
        id: 'a2',
        professor: 'Prof. Rakesh Sharma',
        course: 'MA102',
        date: 'Tomorrow',
        time: '11:30 AM',
        format: 'virtual',
        location: 'Google Meet',
        context: 'Eigenvalue proofs help',
    },
    {
        id: 'a3',
        professor: 'Dr. Ananya Rao',
        course: 'PH101',
        date: 'Fri, Mar 7',
        time: '2:00 PM',
        format: 'in-person',
        location: 'SB-108',
        context: 'Kinematics problem set #4',
    },
];

export const questions = [
    {
        id: 'q1',
        course: 'CS201',
        title: 'Why does Dijkstra\'s algorithm fail with negative weights?',
        body: 'I understand the greedy approach but I\'m confused about why negative edge weights break the algorithm. Can someone explain with an example?',
        author: 'Priya Menon',
        authorInitials: 'PM',
        anonymous: false,
        timestamp: '2 hours ago',
        upvotes: 12,
        answers: 3,
        views: 45,
        resolved: true,
        tags: ['graphs', 'shortest-path'],
    },
    {
        id: 'q2',
        course: 'CS201',
        title: 'Time complexity of building a heap — O(n) or O(n log n)?',
        body: 'Inserting each element is O(log n), so n elements should be O(n log n). But the textbook says building a heap is O(n). What am I missing?',
        author: 'Anonymous',
        authorInitials: '?',
        anonymous: true,
        timestamp: '5 hours ago',
        upvotes: 8,
        answers: 2,
        views: 32,
        resolved: false,
        tags: ['heaps', 'complexity'],
    },
    {
        id: 'q3',
        course: 'MA102',
        title: 'Geometric intuition for eigenvalues?',
        body: 'I can compute eigenvalues mechanically but I don\'t understand what they represent geometrically. Can someone help build intuition?',
        author: 'Karthik Nair',
        authorInitials: 'KN',
        anonymous: false,
        timestamp: '1 day ago',
        upvotes: 21,
        answers: 5,
        views: 87,
        resolved: true,
        tags: ['eigenvalues', 'linear-algebra'],
    },
    {
        id: 'q4',
        course: 'PH101',
        title: 'Confusion about reference frames in relative motion',
        body: 'When solving problems involving two objects moving relative to each other, how do I choose which frame to work in? Are there general guidelines?',
        author: 'Sneha Reddy',
        authorInitials: 'SR',
        anonymous: false,
        timestamp: '3 hours ago',
        upvotes: 6,
        answers: 1,
        views: 19,
        resolved: false,
        tags: ['kinematics', 'reference-frames'],
    },
    {
        id: 'q5',
        course: 'EC110',
        title: 'Difference between Marshallian and Hicksian demand?',
        body: 'Both seem to describe demand curves but I\'m confused about when to use which. The income vs substitution effects are tripping me up.',
        author: 'Anonymous',
        authorInitials: '?',
        anonymous: true,
        timestamp: '6 hours ago',
        upvotes: 15,
        answers: 4,
        views: 52,
        resolved: true,
        tags: ['demand', 'consumer-theory'],
    },
    {
        id: 'q6',
        course: 'HS201',
        title: 'How to structure a critical analysis essay?',
        body: 'Prof. Iyer mentioned the "they say / I say" framework but I\'m still struggling with the thesis-antithesis structure. Any tips?',
        author: 'Rohan Das',
        authorInitials: 'RD',
        anonymous: false,
        timestamp: '1 day ago',
        upvotes: 9,
        answers: 3,
        views: 41,
        resolved: false,
        tags: ['essay-writing', 'critical-analysis'],
    },
];

export const tutors = [
    {
        id: 't1',
        name: 'Aisha Khan',
        initials: 'AK',
        year: 'CS 2025',
        subjects: ['Data Structures', 'Algorithms', 'Python'],
        rating: 4.8,
        reviews: 23,
        hoursTutored: 120,
        rate: '₹300/hr',
        isPaid: true,
        available: true,
        bio: 'Dean\'s lister specialising in competitive programming. Love helping juniors crack problems!',
        gradient: 'linear-gradient(135deg, #818cf8, #6366f1)',
    },
    {
        id: 't2',
        name: 'Ravi Sundaram',
        initials: 'RS',
        year: 'MA 2025',
        subjects: ['Linear Algebra', 'Calculus', 'Probability'],
        rating: 4.9,
        reviews: 31,
        hoursTutored: 185,
        rate: 'Volunteer',
        isPaid: false,
        available: false,
        bio: 'Math enthusiast and TA for MA102. I believe anyone can learn math with the right approach.',
        gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
    },
    {
        id: 't3',
        name: 'Diya Sharma',
        initials: 'DS',
        year: 'PH 2026',
        subjects: ['Physics', 'Mechanics', 'Thermodynamics'],
        rating: 4.6,
        reviews: 14,
        hoursTutored: 65,
        rate: '₹250/hr',
        isPaid: true,
        available: true,
        bio: 'KVPY fellow. Patient with fundamentals and love solving tricky numericals.',
        gradient: 'linear-gradient(135deg, #6ee7b7, #10b981)',
    },
    {
        id: 't4',
        name: 'Nikhil Joshi',
        initials: 'NJ',
        year: 'EC 2025',
        subjects: ['Microeconomics', 'Game Theory', 'Statistics'],
        rating: 4.7,
        reviews: 19,
        hoursTutored: 90,
        rate: '₹350/hr',
        isPaid: true,
        available: true,
        bio: 'Interned at RBI research. Can make economics intuitive with real-world examples.',
        gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    },
    {
        id: 't5',
        name: 'Meghna Iyer',
        initials: 'MI',
        year: 'HS 2025',
        subjects: ['Academic Writing', 'Critical Analysis', 'Philosophy'],
        rating: 4.5,
        reviews: 11,
        hoursTutored: 40,
        rate: 'Volunteer',
        isPaid: false,
        available: false,
        bio: 'Published in student journals. Happy to review drafts and help with essay structure.',
        gradient: 'linear-gradient(135deg, #f472b6, #ec4899)',
    },
    {
        id: 't6',
        name: 'Arjun Mehta',
        initials: 'AM',
        year: 'CS 2026',
        subjects: ['Web Development', 'JavaScript', 'React'],
        rating: 4.4,
        reviews: 8,
        hoursTutored: 35,
        rate: '₹200/hr',
        isPaid: true,
        available: true,
        bio: 'Full-stack developer contributing to open source. Can teach from basics to deployment.',
        gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    },
];

export const facultyAnalytics = {
    topTopics: [
        { label: 'Graph Algos', value: 28 },
        { label: 'Trees', value: 22 },
        { label: 'Sorting', value: 18 },
        { label: 'DP', value: 15 },
        { label: 'Hashing', value: 12 },
        { label: 'Recursion', value: 9 },
    ],
    weeklyBookings: [
        { label: 'Mon', value: 5 },
        { label: 'Tue', value: 12 },
        { label: 'Wed', value: 8 },
        { label: 'Thu', value: 15 },
        { label: 'Fri', value: 10 },
    ],
    totalBookingsThisWeek: 50,
    totalQuestionsThisWeek: 34,
    avgSessionDuration: '22 min',
    noShowRate: '8%',
};

export const tutorLog = [
    { date: 'Mar 1', student: 'Arjun Patel', subject: 'Data Structures', duration: '45 min', status: 'completed' },
    { date: 'Feb 28', student: 'Sneha Reddy', subject: 'Algorithms', duration: '30 min', status: 'completed' },
    { date: 'Feb 27', student: 'Rohan Das', subject: 'Python Basics', duration: '60 min', status: 'completed' },
    { date: 'Feb 26', student: 'Priya Menon', subject: 'Linked Lists', duration: '45 min', status: 'completed' },
    { date: 'Feb 25', student: 'Karthik Nair', subject: 'Trees & Graphs', duration: '50 min', status: 'no-show' },
    { date: 'Feb 24', student: 'Diya Sharma', subject: 'Sorting Algos', duration: '30 min', status: 'completed' },
];

// ---- TA-specific data ----
export const taAnalytics = {
    assignedCourse: 'MA102 — Linear Algebra',
    doubtsResolvedThisWeek: 18,
    doubtsAssigned: 24,
    avgResponseTime: '12 min',
    endorsements: 14,
    upcomingOH: [
        { day: 'Mon', time: '4:00 — 5:30 PM', room: 'AB-204', topic: 'Eigenvalues Tutorial' },
        { day: 'Wed', time: '2:00 — 3:00 PM', room: 'Virtual (Meet)', topic: 'Assignment 6 Help' },
    ],
    recentDoubts: [
        { student: 'Arjun Patel', question: 'Why is the determinant zero for singular matrices?', time: '20 min ago', status: 'pending' },
        { student: 'Sneha Reddy', question: 'Difference between row echelon and reduced row echelon form?', time: '1 hour ago', status: 'answered' },
        { student: 'Anonymous', question: 'How to prove that eigenvalues of symmetric matrices are real?', time: '3 hours ago', status: 'pending' },
    ],
};

// ---- Tutor Panel — redesigned data ----
export const TUTOR_RATE = 200; // ₹ per hour

export const tutorMonthlyStats = {
    hoursThisMonth: 18,
    hoursLastMonth: 15.5,
    sessionsThisMonth: 14,
    sessionsLastMonth: 11,
    studentsHelped: 9,
    avgRating: 4.8,
    totalReviews: 23,
};

export const tutorUpcomingSessions = [
    { id: 'ts1', student: 'Arjun Patel', initials: 'AP', subject: 'Binary Search Trees', date: 'Today', time: '4:00 PM', format: 'in-person', location: 'Library 2F', duration: '45 min' },
    { id: 'ts2', student: 'Sneha Reddy', initials: 'SR', subject: 'Graph Traversals (BFS/DFS)', date: 'Today', time: '6:00 PM', format: 'virtual', location: 'Google Meet', duration: '30 min' },
    { id: 'ts3', student: 'Rohan Das', initials: 'RD', subject: 'Python List Comprehensions', date: 'Tomorrow', time: '11:00 AM', format: 'in-person', location: 'Cafeteria', duration: '30 min' },
    { id: 'ts4', student: 'Priya Menon', initials: 'PM', subject: 'Linked List Reversal', date: 'Mar 4', time: '3:00 PM', format: 'virtual', location: 'Google Meet', duration: '45 min' },
];

export const tutorPendingRequests = [
    { id: 'tr1', student: 'Karthik Nair', initials: 'KN', subject: 'Dynamic Programming — Knapsack', message: 'Struggling with the 0/1 knapsack problem. Can you walk me through the DP table?', date: 'Requested today', preferredTime: 'Any evening this week' },
    { id: 'tr2', student: 'Diya Sharma', initials: 'DS', subject: 'Recursion & Backtracking', message: 'Need help understanding how backtracking works for N-Queens. Having trouble with the recursive calls.', date: 'Requested yesterday', preferredTime: 'Tomorrow 10 AM' },
    { id: 'tr3', student: 'Nikhil Joshi', initials: 'NJ', subject: 'Sorting Algorithms Comparison', message: 'Preparing for the midterm — need a walkthrough comparing merge sort, quick sort, and heap sort.', date: 'Requested 2 days ago', preferredTime: 'Flexible' },
];
