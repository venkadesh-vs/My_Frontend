document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    if (!user) return;

    // Header User Info
    const userEmailEl = document.querySelector('.user-email');
    if (userEmailEl) userEmailEl.textContent = user.email;

    // Clear dummy list
    const grid = document.querySelector('.customers-grid');
    if (grid) grid.innerHTML = '';

    // Parse ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        showToast('No customer ID provided', 'error');
        window.location.href = 'customers.html';
        return;
    }

    const form = document.querySelector('.edit-form-card form');
    if (!form) return;

    // Inputs
    // Assuming order: Text (Name), Tel (Phone), Email
    const inputs = form.querySelectorAll('input');
    const nameInput = inputs[0];
    const phoneInput = inputs[1];
    const emailInput = inputs[2];

    // Load Customer Data
    try {
        // Since we don't have GET /id, we fetch all and find
        const response = await fetch(`${API_BASE_URL}/api/customers?user_id=${user.user_id}`);
        const customers = await response.json();
        const customer = customers.find(c => c.customer_id == id);

        if (customer) {
            nameInput.value = customer.name;
            phoneInput.value = customer.phone;
            emailInput.value = customer.email;
        } else {
            showToast('Customer not found', 'error');
            window.location.href = 'customers.html';
            return;
        }
    } catch (error) {
        console.error('Error loading customer:', error);
        showToast('Error loading customer details', 'error');
    }

    // Handle Update
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_BASE_URL}/api/customers/${id}?user_id=${user.user_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: nameInput.value,
                    phone: phoneInput.value,
                    email: emailInput.value
                })
            });

            if (response.ok) {
                showToast('Customer updated successfully', 'success');
                setTimeout(() => {
                    window.location.href = 'customers.html';
                }, 1500);
            } else {
                const err = await response.json();
                showToast(err.detail || 'Failed to update customer', 'error');
            }
        } catch (error) {
            console.error('Update error:', error);
            showToast('Network error', 'error');
        }
    });
});
