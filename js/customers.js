const user = checkAuth();
if (!user) {
  throw new Error("Invalid user");
}

// Header User Info
const userEmailEl = document.querySelector(".user-email");
if (userEmailEl) userEmailEl.textContent = user.email;

const grid = document.querySelector(".customers-grid");

let allCustomers = [];

if (grid) {
  grid.innerHTML =
    '<p style="color:white; text-align:center; grid-column: 1/-1;">Loading customers...</p>';

  try {
    const getCustomer = async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/customers?user_id=${user.user_id}`,
      );
      if (!response.ok) throw new Error("Failed to fetch");

      allCustomers = await response.json();

      // Initial Render
      renderCustomers();
    };
    getCustomer();
  } catch (error) {
    console.error("Error:", error);
    grid.innerHTML =
      '<p style="color:red; text-align:center; grid-column: 1/-1;">Error loading data.</p>';
  }
}

function renderCustomers() {
  grid.innerHTML = "";

  if (allCustomers.length === 0) {
    grid.innerHTML =
      '<p style="color:#aaa; text-align:center; grid-column: 1/-1;">No customers added yet.</p>';
    return;
  }

  // Render Cards
  allCustomers.forEach((customer) => {
    const card = document.createElement("div");
    card.className = "customer-card";
    card.innerHTML = `
                <div class="customer-info">
                    <h3 class="customer-name">${customer.name}</h3>
                    <p class="customer-detail">${customer.phone}</p>
                    <p class="customer-detail">${customer.email}</p>
                </div>
                <div class="customer-actions">
                    <a href="customers-edit.html?id=${customer.customer_id}" class="icon-edit" title="Edit">✏️</a>
                    <a href="#" class="icon-delete" data-id="${customer.customer_id}" title="Delete">🗑️</a>
                </div>
            `;
    grid.appendChild(card);
  });

  // Re-attach Delete Handlers
  attachDeleteHandlers();
}

function attachDeleteHandlers() {
  document.querySelectorAll(".icon-delete").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const id = btn.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this customer?")) {
        await deleteCustomer(id, user.user_id);
      }
    });
  });
}

async function deleteCustomer(id, userId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/customers/${id}?user_id=${userId}`,
      {
        method: "DELETE",
      },
    );

    if (response.ok) {
      alert("Success: Customer deleted successfully!");
      window.location.reload();
    } else {
      const err = await response.json();
      alert("Error: " + (err.detail || "Failed to delete customer"));
    }
  } catch (error) {
    console.error("Delete error:", error);
    alert("Error: An unexpected error occurred");
  }
}

