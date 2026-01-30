document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    if (!user) return;

    // Header User Info
    const userEmailEl = document.querySelector('.user-email');
    if (userEmailEl) userEmailEl.textContent = user.email;

    const list = document.querySelector('.credit-list');
    const paginationControls = document.getElementById('paginationControls');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');

    let allCredits = [];
    let currentPage = 1;
    const itemsPerPage = 5;

    if (list) {
        list.innerHTML = '<p style="color:white; text-align:center;">Loading credits...</p>';

        try {
            const response = await fetch(`${API_BASE_URL}/api/credits?user_id=${user.user_id}`);
            if (!response.ok) throw new Error('Failed to fetch');

            allCredits = await response.json();

            // Sort by date descending (newest first)
            allCredits.sort((a, b) => new Date(b.date) - new Date(a.date));

            renderCredits();

        } catch (error) {
            console.error('Error:', error);
            list.innerHTML = '<p style="color:red; text-align:center;">Error loading data.</p>';
        }
    }

    function renderCredits() {
        list.innerHTML = '';

        if (allCredits.length === 0) {
            list.innerHTML = '<p style="color:#aaa; text-align:center;">No credits recorded yet.</p>';
            paginationControls.style.display = 'none';
            return;
        }

        // Calculate Pagination
        const totalPages = Math.ceil(allCredits.length / itemsPerPage);

        // Ensure currentPage is valid
        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentSlice = allCredits.slice(startIndex, endIndex);

        // Render Items
        currentSlice.forEach(credit => {
            const item = document.createElement('div');
            item.className = 'credit-item';
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
                if (confirm('Delete this credit entry?')) {
                    await deleteCredit(id, user.user_id);
                }
            });
        });
    }

    // Pagination Events
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderCredits();
        }
    });

    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(allCredits.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderCredits();
        }
    });
});

async function deleteCredit(id, userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/credits/${id}?user_id=${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Credit deleted successfully', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            const err = await response.json();
            showToast(err.detail || 'Failed to delete credit', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Network error', 'error');
    }
}
