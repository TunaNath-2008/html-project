
document.addEventListener("DOMContentLoaded", () => {

    // Protect the page: only logged-in members can access it.
    let currentUser = null;

    if (typeof requireAuth === "function") {
        currentUser = requireAuth("member");
    } else if (typeof getCurrentUser === "function") {
        currentUser = getCurrentUser();
    }

    if (!currentUser || !currentUser.id) {
        return;
    }

    const form = document.getElementById("appointmentForm");
    const trainer = document.getElementById("trainer");
    const trainingType = document.getElementById("trainingType");
    const appointmentDate = document.getElementById("appointmentDate");
    const appointmentTime = document.getElementById("appointmentTime");
    const appointmentNote = document.getElementById("appointmentNote");
    const appointmentMessage = document.getElementById("appointmentMessage");
    const appointmentList = document.getElementById("appointmentList");
    const appointmentCount = document.getElementById("appointmentCount");

    const STORAGE_KEY = "activeNationAppointments";

    // Set today's date as the earliest selectable date.
    const today = new Date();

    const localToday = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    if (appointmentDate) {
        appointmentDate.min = localToday;
    }

    // Read appointments from LocalStorage.
    function getAppointments() {
        try {
            const appointments = JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            );

            return Array.isArray(appointments) ? appointments : [];

        } catch (error) {
            console.error("Error reading appointments:", error);
            return [];
        }
    }

    // Save appointments to LocalStorage.
    function saveAppointments(appointments) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(appointments)
        );
    }

    // Escape user-provided text before displaying it in HTML.
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    // Display appointments belonging only to the logged-in member.
    function renderAppointments() {

        const allAppointments = getAppointments();

        const memberAppointments = allAppointments
            .filter(item => item.memberId === currentUser.id);

        appointmentCount.textContent =
            `${memberAppointments.length} appointment${memberAppointments.length === 1 ? "" : "s"}`;

        if (memberAppointments.length === 0) {

            appointmentList.innerHTML = `
                <div class="empty-appointments">
                    <span>▣</span>
                    <h3>No appointments yet</h3>
                    <p>Your booked sessions will appear here.</p>
                </div>
            `;

            return;
        }

        appointmentList.innerHTML = memberAppointments
            .slice()
            .reverse()
            .map(item => {

                const status = String(item.status || "Pending");
                const statusClass = status.toLowerCase();

                return `
                    <article class="appointment-card">
                        <div>
                            <h3>${escapeHTML(item.trainingType)}</h3>

                            <p>
                                <strong>Trainer:</strong>
                                ${escapeHTML(item.trainer)}
                            </p>

                            <p>
                                <strong>Date:</strong>
                                ${escapeHTML(item.date)}
                            </p>

                            <p>
                                <strong>Time:</strong>
                                ${escapeHTML(item.time)}
                            </p>

                            ${item.note ? `
                                <p>
                                    <strong>Note:</strong>
                                    ${escapeHTML(item.note)}
                                </p>
                            ` : ""}
                        </div>

                        <span class="appointment-status ${escapeHTML(statusClass)}">
                            ${escapeHTML(status)}
                        </span>
                    </article>
                `;
            })
            .join("");
    }

    // Book a new appointment.
    if (form) {

        form.addEventListener("submit", event => {

            event.preventDefault();

            if (appointmentDate.value < localToday) {
                appointmentMessage.textContent =
                    "Please select a future date.";

                appointmentMessage.style.color = "#d93025";
                return;
            }

            const appointments = getAppointments();

            const newAppointment = {
                id: Date.now(),

                // Connect the booking to its member.
                memberId: currentUser.id,

                memberName: currentUser.name || "Member",

                trainer: trainer.value,
                trainingType: trainingType.value,
                date: appointmentDate.value,
                time: appointmentTime.value,
                note: appointmentNote.value.trim(),

                status: "Pending"
            };

            appointments.push(newAppointment);

            saveAppointments(appointments);

            appointmentMessage.textContent =
                "Your appointment request has been submitted successfully!";

            appointmentMessage.style.color = "#198754";

            form.reset();

            appointmentDate.min = localToday;

            renderAppointments();
        });
    }

    // Logout.
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (typeof logoutUser === "function") {
                logoutUser();
            }
        });
    }

    renderAppointments();

});
