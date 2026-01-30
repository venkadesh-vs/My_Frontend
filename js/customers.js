document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    if (!user) return;

    // Header User Info
    const userEmailEl = document.querySelector('.user-email');
    if (userEmailEl) userEmailEl.textContent = user.email;

    const grid = document.querySelector('.customers-grid');
    const paginationControls = document.getElementById('paginationControls');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');

    let allCustomers = [];
    let currentPage = 1;
    const itemsPerPage = 12;

    if (grid) {
        grid.innerHTML = '<p style="color:white; text-align:center; grid-column: 1/-1;">Loading customers...</p>';

        try {
            const response = await fetch(`${API_BASE_URL}/api/customers?user_id=${user.user_id}`);
            if (!response.ok) throw new Error('Failed to fetch');

            allCustomers = await response.json();

            // Initial Render
            renderCustomers();

        } catch (error) {
            console.error('Error:', error);
            grid.innerHTML = '<p style="color:red; text-align:center; grid-column: 1/-1;">Error loading data.</p>';
        }
    }

    function renderCustomers() {
        grid.innerHTML = '';

        if (allCustomers.length === 0) {
            grid.innerHTML = '<p style="color:#aaa; text-align:center; grid-column: 1/-1;">No customers added yet.</p>';
            paginationControls.style.display = 'none';
            return;
        }

        // Calculate Pagination
        const totalPages = Math.ceil(allCustomers.length / itemsPerPage);

        // Ensure currentPage is valid
        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentSlice = allCustomers.slice(startIndex, endIndex);

        // Render Cards
        currentSlice.forEach(customer => {
            const card = document.createElement('div');
            card.className = 'customer-card';
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

        // Update Pagination Controls
        if (totalPages > 1) {
            paginationControls.style.display = 'flex';
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
        } else {
            paginationControls.style.display = 'none';
        }

        // Re-attach Delete Handlers
        attachDeleteHandlers();
    }

    function attachDeleteHandlers() {
        document.querySelectorAll('.icon-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this customer?')) {
                    await deleteCustomer(id, user.user_id);
                }
            });
        });
    }

    // Pagination Events
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderCustomers();
        }
    });

    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(allCustomers.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderCustomers();
        }
    });
});

async function deleteCustomer(id, userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/customers/${id}?user_id=${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Customer deleted successfully', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            const err = await response.json();
            showToast(err.detail || 'Failed to delete customer', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Network error', 'error');
    }
}
