const user = checkAuth();
if (!user) {
  throw new Error("User Invalid");
}

// Header User Info
const userEmailEl = document.querySelector(".user-email");
if (userEmailEl) userEmailEl.textContent = user.email;

// Remove dummy list if present
const grid = document.querySelector(".customers-grid");
if (grid) grid.innerHTML = "";

const form = document.querySelector(".add-customer-form form");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputs = form.querySelectorAll("input");
    const name = inputs[0].value;
    const phone = inputs[1].value;
    const email = inputs[2].value;

    if (!name || !phone) {
      alert("Warning: Name and Phone are required");
      return;
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      alert("Warning: Phone number must be exactly 10 digits");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          name: name,
          phone: phone,
          email: email,
        }),
      });

      if (response.ok) {
        alert(`Success: Customer ${name} added successfully!`);
        window.location.href = "customers.html";
      } else {
        const err = await response.json();
        alert("Error: " + (err.detail || "Failed to add customer"));
      }
    } catch (error) {
      console.error(error);
      alert("Error: An unexpected error occurred");
    }
  });
}
