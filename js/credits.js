const user = checkAuth();
if (!user) {
  throw new Error("Invalid User");
}

// Header User Info
const userEmailEl = document.querySelector(".user-email");
if (userEmailEl) userEmailEl.textContent = user.email;

const list = document.querySelector(".credit-list");

let allCredits = [];

if (list) {
  list.innerHTML =
    '<p style="color:white; text-align:center;">Loading credits...</p>';

  try {
    const credit = async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/credits?user_id=${user.user_id}`,
      );
      if (!response.ok) throw new Error("Failed to fetch");

      allCredits = await response.json();

      // Sort by date descending (newest first)
      allCredits.sort((a, b) => new Date(b.date) - new Date(a.date));

      renderCredits();
    };
    credit();
  } catch (error) {
    console.error("Error:", error);
    list.innerHTML =
      '<p style="color:red; text-align:center;">Error loading data.</p>';
  }
}

function renderCredits() {
  list.innerHTML = "";

  if (allCredits.length === 0) {
    list.innerHTML =
      '<p style="color:#aaa; text-align:center;">No credits recorded yet.</p>';
    return;
  }

  // Render Items
  allCredits.forEach((credit) => {
    const item = document.createElement("div");
    item.className = "credit-item";
    item.innerHTML = `
                <div class="credit-info">
                    <h3 class="credit-name">${credit.customer_name}</h3>
                    <p class="credit-description">${credit.description}</p>
                    <p class="credit-date">${formatDate(credit.date)}</p>
                </div>
                <div class="credit-right">
                    <span class="credit-amount">${formatCurrency(credit.amount)}</span>
                    <a href="#" class="icon-delete" data-id="${credit.credit_id}" title="Delete">🗑️</a>
                </div>
            `;
    list.appendChild(item);
  });

  attachDeleteHandlers();
}

function attachDeleteHandlers() {
  document.querySelectorAll(".icon-delete").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const id = btn.getAttribute("data-id");
      if (confirm("Delete this credit entry?")) {
        await deleteCredit(id, user.user_id);
      }
    });
  });
}

async function deleteCredit(id, userId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/credits/${id}?user_id=${userId}`,
      {
        method: "DELETE",
      },
    );

    if (response.ok) {
      setPendingToast("success", "Credit record deleted successfully!", "Deleted");
      window.location.reload();
    } else {
      const err = await response.json();
      shopToast.error(err.detail || "Failed to delete credit record");
    }
  } catch (error) {
    console.error("Delete error:", error);
    shopToast.error("An unexpected error occurred");
  }
}
