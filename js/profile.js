const currentMember = requireAuth("member");

if (currentMember) {
    const $ = (id) => document.getElementById(id);

    const photo = $("profilePhoto");
    const photoInput = $("photoInput");
    const nameInput = $("profileName");
    const emailInput = $("profileEmail");
    const phoneInput = $("profilePhone");
    const joinDateInput = $("profileJoinDate");
    const sidebarName = $("sidebarName");
    const editButton = $("editProfileBtn");
    const cancelButton = $("cancelEditBtn");
    const actions = $("profileFormActions");
    const form = $("profileForm");
    const message = $("profileMessage");

     
     const defaultAvatar =
         "https://ui-avatars.com/api/?name=FitZone+Member&background=292929&color=facc15&size=256";


    let originalValues = {};

    function formatDate(value) {
        if (!value) return "--";

        const date = new Date(value + "T00:00:00");
        if (Number.isNaN(date.getTime())) return "--";

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function showMemberInfo() {
        nameInput.value = currentMember.name || "";
        emailInput.value = currentMember.email || "";
        phoneInput.value = currentMember.phone || "";
        joinDateInput.value = formatDate(currentMember.joinDate);

        sidebarName.textContent = currentMember.name || "Member";
        photo.src = currentMember.photo || defaultAvatar;

        const plan = getPlanById(currentMember.planId);
        $("profilePlan").textContent = plan ? plan.name : "No Plan";
        $("profilePrice").textContent = plan ? "₹" + plan.price : "₹0";
        $("profileEndDate").textContent = formatDate(currentMember.endDate);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endDate = currentMember.endDate
            ? new Date(currentMember.endDate + "T00:00:00")
            : null;

        $("profileStatus").textContent =
            endDate && endDate >= today ? "Active" : "Not Subscribed";

        if (currentMember.joinDate) {
            const joinDate = new Date(currentMember.joinDate + "T00:00:00");
            const months = Math.max(
                0,
                (today.getFullYear() - joinDate.getFullYear()) * 12 +
                today.getMonth() - joinDate.getMonth()
            );

            $("monthsActive").textContent = months;
        } else {
            $("monthsActive").textContent = "--";
        }
    }

    function setEditing(enabled) {
        [nameInput, emailInput, phoneInput].forEach((input) => {
            input.disabled = !enabled;
        });

        actions.classList.toggle("hidden", !enabled);
        editButton.classList.toggle("hidden", enabled);
    }

    function saveProfile(event) {
        event.preventDefault();

        const updatedName = nameInput.value.trim();
        const updatedEmail = emailInput.value.trim();
        const updatedPhone = phoneInput.value.trim();

        if (!updatedName || !updatedEmail || !updatedPhone) {
            message.textContent = "Please complete all fields.";
            return;
        }

        const members = getMembers();
        const index = members.findIndex(
            (member) => member.id === currentMember.id
        );

        if (index === -1) {
            message.textContent = "Member account not found.";
            return;
        }

        members[index].name = updatedName;
        members[index].email = updatedEmail;
        members[index].phone = updatedPhone;

        saveMembers(members);

        currentMember.name = updatedName;
        currentMember.email = updatedEmail;
        currentMember.phone = updatedPhone;

        const savedUser = getCurrentUser();

        if (savedUser && savedUser.id === currentMember.id) {
            savedUser.name = updatedName;
            savedUser.email = updatedEmail;
            savedUser.phone = updatedPhone;
            setCurrentUser(savedUser);
        }

        showMemberInfo();
        setEditing(false);
        message.textContent = "Profile updated successfully!";
    }

    editButton.addEventListener("click", () => {
        originalValues = {
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value
        };

        message.textContent = "";
        setEditing(true);
    });

    cancelButton.addEventListener("click", () => {
        nameInput.value = originalValues.name;
        emailInput.value = originalValues.email;
        phoneInput.value = originalValues.phone;

        message.textContent = "";
        setEditing(false);
    });

    form.addEventListener("submit", saveProfile);

    photoInput.addEventListener("change", () => {
        const file = photoInput.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            message.textContent = "Please choose an image file.";
            return;
        }

        if (file.size > 1.5 * 1024 * 1024) {
            message.textContent = "Please choose an image smaller than 1.5 MB.";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const members = getMembers();
            const index = members.findIndex(
                (member) => member.id === currentMember.id
            );

            if (index === -1) return;

            members[index].photo = reader.result;
            saveMembers(members);

            currentMember.photo = reader.result;
            photo.src = reader.result;
            message.textContent = "Profile photo updated!";
        };

        reader.readAsDataURL(file);
    });

    $("logoutBtn").addEventListener("click", logoutUser);

    showMemberInfo();
    setEditing(false);
}


