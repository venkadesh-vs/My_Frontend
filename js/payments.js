const user = checkAuth();
if (!user) {
  throw new Error("User Invalid");
}

// Header User Info
const userEmailEl = document.querySelector(".user-email");
if (userEmailEl) userEmailEl.textContent = user.email;

const list = document.querySelector(".payment-list");

let allPayments = [];

if (list) {
  list.innerHTML =
    '<p style="color:white; text-align:center;">Loading payments...</p>';

  try {
    const payments = async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/payments?user_id=${user.user_id}`,
      );
      const data = await response.json();

      allPayments = data;
      // Sort by date descending
      allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

      renderPayments();
    };
    payments();
  } catch (error) {
    console.error("Error:", error);
    list.innerHTML =
      '<p style="color:red; text-align:center;">Error loading data.</p>';
  }
}

function renderPayments() {
  list.innerHTML = "";

  if (allPayments.length === 0) {
    list.innerHTML =
      '<p style="color:#aaa; text-align:center;">No payments recorded yet.</p>';
    return;
  }

  // Render Items
  allPayments.forEach((payment) => {
    const item = document.createElement("div");
    item.className = "payment-item";
    item.innerHTML = `
                <div class="payment-info">
                    <h3 class="payment-name">${payment.customer_name}</h3>
                    <p class="payment-method">${payment.payment_method}</p>
                    <p class="payment-date">${formatDate(payment.date)}</p>
                </div>
                <div class="payment-right">
                    <span class="payment-amount">${formatCurrency(payment.amount)}</span>
                    <a href="#" class="icon-delete" data-id="${payment.payment_id}" title="Delete">🗑️</a>
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
      if (confirm("Delete this payment entry?")) {
        await deletePayment(id, user.user_id);
      }
    });
  });
}

async function deletePayment(id, userId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/payments/${id}?user_id=${userId}`,
      {
        method: "DELETE",
      },
    );

    if (response.ok) {
      setPendingToast("success", "Payment record deleted successfully!", "Deleted");
      window.location.reload();
    } else {
      const err = await response.json();
      shopToast.error(err.detail || "Failed to delete payment record");
    }
  } catch (error) {
    console.error("Delete error:", error);
    shopToast.error("An unexpected error occurred");
  }
}
