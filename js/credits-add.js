document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    if (!user) return;

    // Header User Info
    const userEmailEl = document.querySelector('.user-email');
    if (userEmailEl) userEmailEl.textContent = user.email;

    // Clear dummy list
    const list = document.querySelector('.credit-list');
    if (list) list.innerHTML = '';

    // Load Customers
    const select = document.querySelector('.add-form-card select');
    if (select) {
        select.innerHTML = '<option value="">Loading customers...</option>';
        try {
            const response = await fetch(`${API_BASE_URL}/api/customers?user_id=${user.user_id}`);
            const customers = await response.json();

            select.innerHTML = '<option value="">Select Customer</option>';
            customers.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.customer_id;
                opt.textContent = c.name;
                select.appendChild(opt);
            });
        } catch (e) {
            console.error('Error loading customers:', e);
            select.innerHTML = '<option value="">Error loading customers</option>';
        }
    }

    // Set Date Input to Today
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Handle Submit
    const form = document.querySelector('.add-form-card form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const customerId = select.value;
            const amount = form.querySelector('.amount-input').value;
            const description = document.getElementById('description').value;
            const dateVal = dateInput.value;

            if (!customerId || !amount) {
                showToast('Please select a customer and enter an amount', 'error');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/credits`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.user_id,
                        customer_id: customerId,
                        amount: parseFloat(amount),
                        description: description,
                        date: dateVal
                    })
                });

                if (response.ok) {
                    showToast('Credit added successfully', 'success');
                    setTimeout(() => {
                        window.location.href = 'credits.html';
                    }, 1500);
                } else {
                    const err = await response.json();
                    showToast(err.detail || 'Failed to add credit', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Network error', 'error');
            }
        });
    }
});
