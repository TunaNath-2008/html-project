
const currentMember = requireAuth("member");

if (currentMember) {
    const $ = (id) => document.getElementById(id);

    const welcomeName = $("welcomeName");
    const planName = $("planName");
    const planPrice = $("planPrice");
    const membershipStatus = $("membershipStatus");
    const membershipStart = $("membershipStart");
    const membershipEnd = $("membershipEnd");
    const membershipEndDetails = $("membershipEndDetails");
    const planFeatures = $("planFeatures");
    const paymentHistory = $("paymentHistory");

    const renewBtn = $("renewBtn");
    const renewModal = $("renewModal");
    const closeRenewModal = $("closeRenewModal");
    const renewForm = $("renewForm");
    const renewPlan = $("renewPlan");
    const renewPlanPrice = $("renewPlanPrice");
    const renewMessage = $("renewMessage");
    const logoutBtn = $("logoutBtn");

    function formatDate(dateString) {
        if (!dateString) return "--";

        const date = new Date(dateString + "T00:00:00");

        if (Number.isNaN(date.getTime())) return "--";

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function displayMemberDetails() {
        if (welcomeName) {
            welcomeName.textContent = currentMember.name || "Member";
        }

        const plan = getPlanById(currentMember.planId);

        if (!plan) {
            if (planName) planName.textContent = "No Plan";
            if (planPrice) planPrice.textContent = "₹0";
            if (membershipStatus) membershipStatus.textContent = "Not Subscribed";
            if (membershipStart) membershipStart.textContent = "--";
            if (membershipEnd) membershipEnd.textContent = "--";
            if (membershipEndDetails) membershipEndDetails.textContent = "--";

            if (planFeatures) {
                planFeatures.innerHTML =
                    "<li>You have not selected a membership plan yet.</li>";
            }

            return;
        }

        if (planName) planName.textContent = plan.name;
        if (planPrice) planPrice.textContent = "₹" + plan.price;
        if (membershipStart) {
            membershipStart.textContent = formatDate(currentMember.startDate);
        }
        if (membershipEnd) {
            membershipEnd.textContent = formatDate(currentMember.endDate);
        }
        if (membershipEndDetails) {
            membershipEndDetails.textContent = formatDate(currentMember.endDate);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endDate = currentMember.endDate
            ? new Date(currentMember.endDate + "T00:00:00")
            : null;

        if (membershipStatus) {
            membershipStatus.textContent =
                endDate && !Number.isNaN(endDate.getTime()) && endDate >= today
                    ? "Active"
                    : "Expired";
        }

        if (planFeatures) {
            planFeatures.innerHTML = "";

            (plan.features || []).forEach((feature) => {
                const li = document.createElement("li");
                li.textContent = feature;
                planFeatures.appendChild(li);
            });
        }
    }

    function displayPaymentHistory() {
        if (!paymentHistory) return;

        const payments = getPayments();

        const memberPayments = payments.filter(
            (payment) => payment.memberId === currentMember.id
        );

        paymentHistory.innerHTML = "";

        if (memberPayments.length === 0) {
            paymentHistory.innerHTML = `
                <tr>
                    <td colspan="4">No payment records found.</td>
                </tr>
            `;
            return;
        }

        memberPayments.reverse().forEach((payment) => {
            const plan = getPlanById(payment.planId);
            const row = document.createElement("tr");

            [
                payment.id,
                plan ? plan.name : "Unknown Plan",
                "₹" + payment.amount,
                formatDate(payment.date)
            ].forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            paymentHistory.appendChild(row);
        });
    }

    function loadPlans() {
        if (!renewPlan) return;

        renewPlan.innerHTML = '<option value="">Select a plan</option>';

        getPlans().forEach((plan) => {
            const option = document.createElement("option");
            option.value = plan.id;
            option.textContent = `${plan.name} - ₹${plan.price}`;
            renewPlan.appendChild(option);
        });
    }

    function toDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    if (renewPlan) {
        renewPlan.addEventListener("change", () => {
            const plan = getPlanById(renewPlan.value);

            if (renewPlanPrice) {
                renewPlanPrice.textContent = plan
                    ? "₹" + plan.price
                    : "Select a plan to see its price.";
            }
        });
    }

    if (renewBtn && renewModal) {
        renewBtn.addEventListener("click", () => {
            if (renewMessage) renewMessage.textContent = "";
            if (renewPlanPrice) {
                renewPlanPrice.textContent = "Select a plan to see its price.";
            }

            loadPlans();
            renewModal.classList.remove("hidden");
        });
    }

    function closeModal() {
        if (renewModal) renewModal.classList.add("hidden");
    }

    if (closeRenewModal) {
        closeRenewModal.addEventListener("click", closeModal);
    }

    if (renewModal) {
        renewModal.addEventListener("click", (event) => {
            if (event.target === renewModal) closeModal();
        });
    }

    if (renewForm) {
        renewForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const selectedPlan = getPlanById(renewPlan.value);

            if (!selectedPlan) {
                if (renewMessage) {
                    renewMessage.textContent = "Please select a valid membership plan.";
                }
                return;
            }

            const members = getMembers();
            const memberIndex = members.findIndex(
                (member) => member.id === currentMember.id
            );

            if (memberIndex === -1) {
                if (renewMessage) renewMessage.textContent = "Member account not found.";
                return;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const existingEndDate = members[memberIndex].endDate
                ? new Date(members[memberIndex].endDate + "T00:00:00")
                : null;

            let startDate = new Date(today);

            if (existingEndDate && existingEndDate >= today) {
                startDate = new Date(existingEndDate);
                startDate.setDate(startDate.getDate() + 1);
            }

            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + selectedPlan.durationMonths);

            members[memberIndex].planId = selectedPlan.id;
            members[memberIndex].startDate = toDateString(startDate);
            members[memberIndex].endDate = toDateString(endDate);

            saveMembers(members);

            currentMember.planId = selectedPlan.id;
            currentMember.startDate = members[memberIndex].startDate;
            currentMember.endDate = members[memberIndex].endDate;

            const payments = getPayments();

            payments.push({
                id: generateId("PAY"),
                memberId: currentMember.id,
                planId: selectedPlan.id,
                amount: selectedPlan.price,
                date: toDateString(today)
            });

            savePayments(payments);

            displayMemberDetails();
            displayPaymentHistory();

            if (renewMessage) {
                renewMessage.textContent =
                    "Membership updated successfully! Payment recorded for demo purposes.";
            }

            renewForm.reset();

            if (renewPlanPrice) {
                renewPlanPrice.textContent = "Select a plan to see its price.";
            }

            setTimeout(() => {
                closeModal();
                if (renewMessage) renewMessage.textContent = "";
            }, 1800);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logoutUser);
    }

    displayMemberDetails();
    displayPaymentHistory();
}

