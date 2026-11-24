
document.addEventListener("DOMContentLoaded", () => {

    // Protect the page: only logged-in members can access it.
    if (typeof requireAuth === "function") {
        requireAuth("member");
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

    appointmentDate.min = localToday;

    function getAppointments() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (error) {
            return [];
        }
    }

    function saveAppointments(appointments) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    }

    function renderAppointments() {
        const appointments = getAppointments();

        appointmentCount.textContent =
            `${appointments.length} appointment${appointments.length === 1 ? "" : "s"}`;

        if (appointments.length === 0) {
            appointmentList.innerHTML = `
                <div class="empty-appointments">
                    <span>▣</span>
                    <h3>No appointments yet</h3>
                    <p>Your booked sessions will appear here.</p>
                </div>
            `;
            return;
        }

        appointmentList.innerHTML = appointments
            .slice()
            .reverse()
            .map((item) => `
                <article class="appointment-card">
                    <div>
                        <h3>${escapeHTML(item.trainingType)}</h3>
                        <p><strong>Trainer:</strong> ${escapeHTML(item.trainer)}</p>
                        <p><strong>Date:</strong> ${escapeHTML(item.date)}</p>
                        <p><strong>Time:</strong> ${escapeHTML(item.time)}</p>
                        ${item.note ? `<p><strong>Note:</strong> ${escapeHTML(item.note)}</p>` : ""}
                    </div>

                    <span class="appointment-status ${item.status.toLowerCase()}">
                        ${escapeHTML(item.status)}
                    </span>
                </article>
            `)
            .join("");
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (appointmentDate.value < localToday) {
            appointmentMessage.textContent = "Please select a future date.";
            appointmentMessage.style.color = "#d93025";
            return;
        }

        const appointments = getAppointments();

        const newAppointment = {
            id: Date.now(),
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

    // Logout
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
