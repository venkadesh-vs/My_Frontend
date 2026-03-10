const user = checkAuth();
if (!user) {
  throw new Error("Invalid User");
}

// Header User Info
const userEmailEl = document.querySelector(".user-email");
if (userEmailEl) userEmailEl.textContent = user.email;

// Clear dummy list
const list = document.querySelector(".credit-list");
if (list) list.innerHTML = "";

// Load Customers
const select = document.querySelector(".add-form-card select");
if (select) {
  select.innerHTML = '<option value="">Loading customers...</option>';
  try {
    const creditAdd = async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/customers?user_id=${user.user_id}`,
      );
      const customers = await response.json();

      select.innerHTML = '<option value="">Select Customer</option>';
      customers.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c.customer_id;
        opt.textContent = c.name;
        select.appendChild(opt);
      });
    };
    creditAdd();
  } catch (e) {
    console.error("Error loading customers:", e);
    select.innerHTML = '<option value="">Error loading customers</option>';
  }
}

// Set Date Input to Today
const dateInput = document.getElementById("date");
if (dateInput) {
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;
  dateInput.max = today; // Restrict future dates
}

// Handle Submit
const form = document.querySelector(".add-form-card form");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const customerId = select.value;
    const amount = form.querySelector(".amount-input").value;
    const description = document.getElementById("description").value;
    const dateVal = dateInput.value;

    if (!customerId || !amount) {
      shopToast.warning("Customer and Amount are required");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          customer_id: customerId,
          amount: parseFloat(amount),
          description: description,
          date: dateVal,
        }),
      });

      if (response.ok) {
        setPendingToast("success", "Credit record added successfully!", "Success");
        window.location.href = "credits.html";
      } else {
        const err = await response.json();
        shopToast.error(err.detail || "Failed to add credit record");
      }
    } catch (error) {
      console.error("Error:", error);
      shopToast.error("An unexpected error occurred");
    }
  });
}