

// ========================================
// FITNESS MEMBERSHIP WEBSITE
// Admin and Trainer Dashboard
// File: js/admin.js
// ========================================


// Check that the user is logged in as an admin or trainer
const adminUser = requireAuth(["admin", "trainer"]);

if (adminUser) {

    // =================================
    // ROLE PERMISSIONS
    // =================================

    const isAdministrator = adminUser.role === "admin";
    const isTrainerAccount = adminUser.role === "trainer";


    // =================================
    // SHARED HELPERS
    // =================================

    function formatDate(dateString) {

        if (!dateString) return "--";

        return new Date(dateString + "T00:00:00").toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    function getMembershipStatus(member) {

        if (!member.planId || !member.endDate) {
            return "No Plan";
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endDate = new Date(member.endDate + "T00:00:00");

        return endDate >= today ? "Active" : "Expired";
    }


    function createActionButton(text, className, onClick) {

        const button = document.createElement("button");

        button.type = "button";
        button.textContent = text;
        button.className = className;

        button.addEventListener("click", onClick);

        return button;
    }


    // =================================
    // ROLE-BASED NAVIGATION
    // =================================

    if (isTrainerAccount) {

        // Hide member management navigation
        document.querySelectorAll(
            'a[href="admin-members.html"]'
        ).forEach(function (link) {
            link.style.display = "none";
        });

        // Hide plan management navigation
        document.querySelectorAll(
            'a[href="admin-plans.html"]'
        ).forEach(function (link) {
            link.style.display = "none";
        });

        // Hide admin-only quick action cards
        document.querySelectorAll(
            '[data-admin-only]'
        ).forEach(function (element) {
            element.style.display = "none";
        });
    }


    // =================================
    // LOGOUT
    // =================================

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", function () {
            logoutUser();
        });

    }


    // =================================
    // ADMIN / TRAINER DASHBOARD
    // =================================

    if (document.getElementById("totalMembers")) {

        const members = getMembers().filter(function (member) {
            return member.role === "member";
        });

        const plans = getPlans();

        const payments = getPayments();


        const activeMembers = members.filter(function (member) {
            return getMembershipStatus(member) === "Active";
        });


        // Dashboard statistics

        document.getElementById("totalMembers").textContent =
            members.length;

        document.getElementById("activeMembers").textContent =
            activeMembers.length;

        document.getElementById("totalPlans").textContent =
            plans.length;

        document.getElementById("totalPayments").textContent =
            payments.length;


        // Recent payments

        const recentPayments = document.getElementById("recentPayments");

        if (recentPayments) {

            recentPayments.innerHTML = "";

            const latestPayments = [...payments].reverse().slice(0, 5);

            if (latestPayments.length === 0) {

                recentPayments.innerHTML = `
                    <tr>
                        <td colspan="5">No payment records found.</td>
                    </tr>
                `;

            } else {

                latestPayments.forEach(function (payment) {

                    const member = members.find(function (item) {
                        return item.id === payment.memberId;
                    });

                    const plan = getPlanById(payment.planId);

                    const row = document.createElement("tr");

                    [
                        payment.id,
                        member ? member.name : "Unknown Member",
                        plan ? plan.name : "Unknown Plan",
                        "₹" + payment.amount,
                        formatDate(payment.date)
                    ].forEach(function (value) {

                        const cell = document.createElement("td");

                        cell.textContent = value;

                        row.appendChild(cell);

                    });

                    recentPayments.appendChild(row);

                });

            }

        }

    }


    // =================================
    // MANAGE MEMBERS
    // ADMIN ONLY
    // =================================

    if (
        isAdministrator &&
        document.getElementById("membersTableBody")
    ) {

        const membersTableBody = document.getElementById("membersTableBody");

        const memberSearch = document.getElementById("memberSearch");

        const memberFilter = document.getElementById("memberFilter");

        const membersMessage = document.getElementById("membersMessage");


        function renderMembers() {

            const searchText = memberSearch.value.trim().toLowerCase();

            const selectedFilter = memberFilter.value;


            const members = getMembers().filter(function (member) {
                return member.role === "member";
            });


            const filteredMembers = members.filter(function (member) {

                const matchesSearch =
                    (member.name || "").toLowerCase().includes(searchText) ||
                    (member.email || "").toLowerCase().includes(searchText);

                const status = getMembershipStatus(member);

                let matchesFilter = true;


                if (selectedFilter === "active") {

                    matchesFilter = status === "Active";

                } else if (selectedFilter === "expired") {

                    matchesFilter = status === "Expired";

                } else if (selectedFilter === "none") {

                    matchesFilter = status === "No Plan";

                }


                return matchesSearch && matchesFilter;

            });


            membersTableBody.innerHTML = "";


            if (filteredMembers.length === 0) {

                membersTableBody.innerHTML = `
                    <tr>
                        <td colspan="7">No matching members found.</td>
                    </tr>
                `;

                return;
            }


            filteredMembers.forEach(function (member) {

                const plan = getPlanById(member.planId);

                const row = document.createElement("tr");


                [
                    member.id,
                    member.name,
                    member.email,
                    member.phone || "--",
                    plan ? plan.name : "No Plan",
                    getMembershipStatus(member)
                ].forEach(function (value) {

                    const cell = document.createElement("td");

                    cell.textContent = value;

                    row.appendChild(cell);

                });


                const actionsCell = document.createElement("td");


                const deleteButton = createActionButton(
                    "Delete",
                    "btn-outline",
                    function () {

                        const confirmed = confirm(
                            "Are you sure you want to delete " +
                            member.name + "'s account?"
                        );

                        if (!confirmed) return;


                        const updatedMembers = getMembers().filter(
                            function (item) {
                                return item.id !== member.id;
                            }
                        );

                        saveMembers(updatedMembers);


                        // Remove this member's payment records too

                        const updatedPayments = getPayments().filter(
                            function (payment) {
                                return payment.memberId !== member.id;
                            }
                        );

                        savePayments(updatedPayments);


                        membersMessage.textContent =
                            "Member account deleted.";

                        renderMembers();

                    }
                );


                actionsCell.appendChild(deleteButton);

                row.appendChild(actionsCell);

                membersTableBody.appendChild(row);

            });

        }


        memberSearch.addEventListener("input", renderMembers);

        memberFilter.addEventListener("change", renderMembers);

        renderMembers();

    }


    // =================================
    // MANAGE MEMBERSHIP PLANS
    // ADMIN ONLY
    // =================================

    if (
        isAdministrator &&
        document.getElementById("plansTableBody")
    ) {

        const plansTableBody = document.getElementById("plansTableBody");

        const plansMessage = document.getElementById("plansMessage");

        const addPlanBtn = document.getElementById("addPlanBtn");

        const planModal = document.getElementById("planModal");

        const closePlanModal = document.getElementById("closePlanModal");

        const planForm = document.getElementById("planForm");

        const planModalTitle = document.getElementById("planModalTitle");

        const planNameInput = document.getElementById("planNameInput");

        const planPriceInput = document.getElementById("planPriceInput");

        const planDurationInput = document.getElementById("planDurationInput");

        const planFeaturesInput = document.getElementById("planFeaturesInput");


        let editingPlanId = null;


        function renderPlans() {

            const plans = getPlans();

            plansTableBody.innerHTML = "";


            if (plans.length === 0) {

                plansTableBody.innerHTML = `
                    <tr>
                        <td colspan="6">No membership plans available.</td>
                    </tr>
                `;

                return;
            }


            plans.forEach(function (plan) {

                const row = document.createElement("tr");


                [
                    plan.id,
                    plan.name,
                    "₹" + plan.price,
                    plan.durationMonths + " month(s)",
                    (plan.features || []).join(", ")
                ].forEach(function (value) {

                    const cell = document.createElement("td");

                    cell.textContent = value;

                    row.appendChild(cell);

                });


                const actionsCell = document.createElement("td");


                // EDIT BUTTON

                const editButton = createActionButton(
                    "Edit",
                    "btn-outline",
                    function () {

                        openPlanModal(plan);

                    }
                );


                // DELETE BUTTON

                const deleteButton = createActionButton(
                    "Delete",
                    "btn-outline",
                    function () {

                        const assignedMembers = getMembers().some(
                            function (member) {

                                return member.role === "member" &&
                                    member.planId === plan.id;

                            }
                        );


                        if (assignedMembers) {

                            plansMessage.textContent =
                                "This plan is assigned to members. " +
                                "Change their plans before deleting it.";

                            return;
                        }


                        const confirmed = confirm(
                            "Delete the " + plan.name + " plan?"
                        );

                        if (!confirmed) return;


                        const updatedPlans = getPlans().filter(
                            function (item) {
                                return item.id !== plan.id;
                            }
                        );

                        savePlans(updatedPlans);


                        plansMessage.textContent = "Plan deleted.";

                        renderPlans();

                    }
                );


                actionsCell.appendChild(editButton);

                actionsCell.appendChild(deleteButton);

                row.appendChild(actionsCell);

                plansTableBody.appendChild(row);

            });

        }


        // OPEN PLAN MODAL

        function openPlanModal(plan = null) {

            planForm.reset();

            plansMessage.textContent = "";


            if (plan) {

                editingPlanId = plan.id;

                planModalTitle.textContent = "Edit Membership Plan";

                planNameInput.value = plan.name;

                planPriceInput.value = plan.price;

                planDurationInput.value = plan.durationMonths;

                planFeaturesInput.value = (plan.features || []).join("\n");

            } else {

                editingPlanId = null;

                planModalTitle.textContent = "Add Membership Plan";

            }


            planModal.classList.remove("hidden");

        }


        // CLOSE PLAN MODAL

        function closeModal() {

            planModal.classList.add("hidden");

        }


        addPlanBtn.addEventListener("click", function () {

            openPlanModal();

        });


        closePlanModal.addEventListener("click", closeModal);


        planModal.addEventListener("click", function (event) {

            if (event.target === planModal) {

                closeModal();

            }

        });


        // SAVE PLAN

        planForm.addEventListener("submit", function (event) {

            event.preventDefault();


            const name = planNameInput.value.trim();

            const price = Number(planPriceInput.value);

            const durationMonths = Number(planDurationInput.value);


            const features = planFeaturesInput.value
                .split("\n")
                .map(function (feature) {
                    return feature.trim();
                })
                .filter(function (feature) {
                    return feature.length > 0;
                });


            if (
                !name ||
                price <= 0 ||
                durationMonths <= 0 ||
                features.length === 0
            ) {

                plansMessage.textContent =
                    "Please enter valid plan details and at least one feature.";

                return;

            }


            const plans = getPlans();


            if (editingPlanId) {

                const planIndex = plans.findIndex(function (plan) {

                    return plan.id === editingPlanId;

                });


                if (planIndex === -1) {

                    plansMessage.textContent = "Plan not found.";

                    return;

                }


                plans[planIndex].name = name;

                plans[planIndex].price = price;

                plans[planIndex].durationMonths = durationMonths;

                plans[planIndex].features = features;

            } else {

                plans.push({

                    id: generateId("PLAN"),

                    name: name,

                    price: price,

                    durationMonths: durationMonths,

                    features: features

                });

            }


            savePlans(plans);


            const wasEditing = Boolean(editingPlanId);

            editingPlanId = null;


            closeModal();

            renderPlans();


            plansMessage.textContent = wasEditing
                ? "Plan updated successfully."
                : "Plan added successfully.";

        });


        renderPlans();

    }


    // =================================
    // END ADMIN / TRAINER DASHBOARD
    // =================================

}
