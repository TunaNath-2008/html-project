

// ========================================
// FITNESS MEMBERSHIP WEBSITE
// Authentication and Access Control
// File: js/auth.js
// ========================================


// 1. GET THE LOGGED-IN USER

function getAuthenticatedUser() {

    // Get the login information.
    const currentUser = getCurrentUser();

    // No user is logged in.
    if (!currentUser || !currentUser.id) {
        return null;
    }

    // Find the actual account in stored members.
    const members = getMembers();

    const user = members.find(function (member) {
        return member.id === currentUser.id;
    });

    // Account no longer exists.
    if (!user) {
        setCurrentUser(null);
        return null;
    }

    // Return account information.
    return user;
}


// 2. CHECK LOGIN AND ROLE

function requireAuth(allowedRole) {

    const user = getAuthenticatedUser();

    // If nobody is logged in, go to login.
    if (!user) {
        window.location.replace("login.html");
        return null;
    }

    // Support one role or multiple roles.
    const allowedRoles = Array.isArray(allowedRole)
        ? allowedRole
        : [allowedRole];

    // Check whether the user has the required role.
    if (allowedRole && !allowedRoles.includes(user.role)) {

        // Admins and trainers go to the admin dashboard.
        if (user.role === "admin" || user.role === "trainer") {
            window.location.replace("admin-dashboard.html");
        }

        // Members go to their dashboard.
        else {
            window.location.replace("dashboard.html");
        }

        return null;
    }

    // User has the correct role.
    return user;
}


// 3. LOG OUT

function logoutUser() {

    // Clear the current login session.
    setCurrentUser(null);

    // Redirect to the home page.
    window.location.replace("index.html");
}


// 4. GET THE CURRENT USER'S ID

function getCurrentUserId() {

    const user = getAuthenticatedUser();

    if (!user) {
        return null;
    }

    return user.id;
}


// 5. CHECK WHETHER A USER IS AN ADMIN

function isAdmin() {

    const user = getAuthenticatedUser();

    return user !== null && user.role === "admin";
}


// 6. CHECK WHETHER A USER IS A TRAINER

function isTrainer() {

    const user = getAuthenticatedUser();

    return user !== null && user.role === "trainer";
}


// 7. CHECK WHETHER A USER IS A MEMBER

function isMember() {

    const user = getAuthenticatedUser();

    return user !== null && user.role === "member";
}
