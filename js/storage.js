
// ========================================
// FITZONE FITNESS MEMBERSHIP WEBSITE
// Shared Data and Local Storage
// ========================================

// 1. DEFAULT MEMBERSHIP PLANS

const defaultPlans = [
    {
        id: "PLAN001",
        name: "Monthly",
        price: 999,
        durationMonths: 1,
        features: [
            "Access to gym equipment",
            "Locker facility",
            "Basic fitness support"
        ]
    },
    {
        id: "PLAN002",
        name: "Quarterly",
        price: 2499,
        durationMonths: 3,
        features: [
            "Access to gym equipment",
            "Locker facility",
            "Fitness assessment",
            "Trainer guidance"
        ]
    },
    {
        id: "PLAN003",
        name: "Yearly",
        price: 7999,
        durationMonths: 12,
        features: [
            "Unlimited gym access",
            "Locker facility",
            "Fitness assessment",
            "Trainer guidance",
            "Group workout sessions"
        ]
    }
];

// 2. DEFAULT ADMIN ACCOUNT

const defaultAdmin = {
    id: "ADMIN001",
    name: "Gym Administrator",
    email: "admin@gym.com",
    phone: "9999999999",
    password: "Admin@123",
    role: "admin",
    planId: null,
    startDate: null,
    endDate: null
};

// 3. SAFE STORAGE READER

function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);

        if (!value) return fallback;

        const parsed = JSON.parse(value);

        return parsed === null ? fallback : parsed;

    } catch (error) {
        console.error("Storage error:", key, error);
        return fallback;
    }
}

// 4. INITIALIZE STORAGE

function initializeStorage() {

    // Restore plans if missing, invalid or empty.
    let plans = readStorage("plans", []);

    if (!Array.isArray(plans) || plans.length === 0) {
        plans = JSON.parse(JSON.stringify(defaultPlans));
        localStorage.setItem("plans", JSON.stringify(plans));
    }

    // Restore admin if members are missing or empty.
    let members = readStorage("members", []);

    if (!Array.isArray(members)) {
        members = [];
    }

    const adminExists = members.some(
        member =>
            member &&
            member.email &&
            member.email.toLowerCase() === "admin@gym.com"
    );

    if (!adminExists) {
        members.push(defaultAdmin);
    }

    localStorage.setItem("members", JSON.stringify(members));

    // Initialize payments.
    const payments = readStorage("payments", []);

    if (!Array.isArray(payments)) {
        localStorage.setItem("payments", JSON.stringify([]));
    }

    // Initialize login session.
    if (localStorage.getItem("currentUser") === null) {
        localStorage.setItem("currentUser", "null");
    }
}

// 5. GET PLANS

function getPlans() {
    const plans = readStorage("plans", []);
    return Array.isArray(plans) ? plans : [];
}

// 6. SAVE PLANS

function savePlans(plans) {
    if (!Array.isArray(plans)) {
        console.error("Invalid plans data");
        return;
    }

    localStorage.setItem("plans", JSON.stringify(plans));
}

// 7. GET MEMBERS

function getMembers() {
    const members = readStorage("members", []);
    return Array.isArray(members) ? members : [];
}

// 8. SAVE MEMBERS

function saveMembers(members) {
    if (!Array.isArray(members)) return;

    localStorage.setItem("members", JSON.stringify(members));
}

// 9. GET PAYMENTS

function getPayments() {
    const payments = readStorage("payments", []);
    return Array.isArray(payments) ? payments : [];
}

// 10. SAVE PAYMENTS

function savePayments(payments) {
    if (!Array.isArray(payments)) return;

    localStorage.setItem("payments", JSON.stringify(payments));
}

// 11. GET CURRENT USER

function getCurrentUser() {
    return readStorage("currentUser", null);
}

// 12. SAVE CURRENT USER

function setCurrentUser(user) {
    localStorage.setItem(
        "currentUser",
        JSON.stringify(user || null)
    );
}

// 13. FIND MEMBER BY ID

function getMemberById(id) {
    return getMembers().find(member => member.id === id);
}

// 14. FIND PLAN BY ID

function getPlanById(id) {
    return getPlans().find(plan => plan.id === id);
}

// 15. GENERATE UNIQUE IDS

function generateId(prefix) {
    return prefix + Date.now().toString();
}

// 16. INITIALIZE WHEN SCRIPT LOADS

initializeStorage();
