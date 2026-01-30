document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    if (!user) return;

    // Header User Info
    const userEmailEl = document.querySelector('.user-email');
    if (userEmailEl) userEmailEl.textContent = user.email;

    const list = document.querySelector('.payment-list');
    const paginationControls = document.getElementById('paginationControls');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');

    let allPayments = [];
    let currentPage = 1;
    const itemsPerPage = 4;

    if (list) {
        list.innerHTML = '<p style="color:white; text-align:center;">Loading payments...</p>';

        try {
            const response = await fetch(`${API_BASE_URL}/api/payments?user_id=${user.user_id}`);
            const data = await response.json();

            allPayments = data;
            // Sort by date descending
            allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

            renderPayments();

        } catch (error) {
            console.error('Error:', error);
            list.innerHTML = '<p style="color:red; text-align:center;">Error loading data.</p>';
        }
    }

    function renderPayments() {
        list.innerHTML = '';

        if (allPayments.length === 0) {
            list.innerHTML = '<p style="color:#aaa; text-align:center;">No payments recorded yet.</p>';
            paginationControls.style.display = 'none';
            return;
        }

        // Calculate Pagination
        const totalPages = Math.ceil(allPayments.length / itemsPerPage);

        // Ensure currentPage is valid
        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentSlice = allPayments.slice(startIndex, endIndex);

        // Render Items
        currentSlice.forEach(payment => {
            const item = document.createElement('div');
            item.className = 'payment-item';
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

        // Update Pagination Controls
        if (totalPages > 1) {
            paginationControls.style.display = 'flex';
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
        } else {
            paginationControls.style.display = 'none';
        }

        attachDeleteHandlers();
    }

    function attachDeleteHandlers() {
        document.querySelectorAll('.icon-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                if (confirm('Delete this payment entry?')) {
                    await deletePayment(id, user.user_id);
                }
            });
        });
    }

    // Pagination Events
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPayments();
        }
    });

    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(allPayments.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderPayments();
        }
    });
});

async function deletePayment(id, userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/${id}?user_id=${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Payment deleted successfully', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            const err = await response.json();
            showToast(err.detail || 'Failed to delete payment', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Network error', 'error');
    }
}
