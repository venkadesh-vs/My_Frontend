document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    if (!user) return;

    // Header User Info
    const userEmailEl = document.querySelector('.user-email');
    if (userEmailEl) userEmailEl.textContent = user.email;

    // Clear dummy list
    const list = document.querySelector('.payment-list');
    if (list) list.innerHTML = '';

    // Load Customers into First Select
    const customerSelect = document.querySelector('.add-form-card .form-group:nth-of-type(1) select');

    if (customerSelect) {
        customerSelect.innerHTML = '<option value="">Loading customers...</option>';
        try {
            const response = await fetch(`${API_BASE_URL}/api/customers?user_id=${user.user_id}`);
            const customers = await response.json();

            customerSelect.innerHTML = '<option value="">Select Customer</option>';
            customers.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.customer_id;
                opt.textContent = c.name;
                customerSelect.appendChild(opt);
            });
        } catch (e) {
            console.error('Error loading customers:', e);
            customerSelect.innerHTML = '<option value="">Error loading customers</option>';
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

            const customerSelect = form.querySelector('.form-group:nth-of-type(1) select');
            const amountInput = form.querySelector('.form-group:nth-of-type(2) input');
            const methodSelect = document.getElementById('payment-method');

            const customerId = customerSelect.value;
            const amount = amountInput.value;
            const method = methodSelect.value;
            const dateVal = dateInput.value;

            if (!customerId || !amount) {
                showToast('Please select a customer and enter an amount', 'error');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/payments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.user_id,
                        customer_id: customerId,
                        amount: parseFloat(amount),
                        payment_method: method,
                        date: dateVal
                    })
                });

                if (response.ok) {
                    showToast('Payment added successfully', 'success');
                    setTimeout(() => {
                        window.location.href = 'payments.html';
                    }, 1500);
                } else {
                    const err = await response.json();
                    showToast(err.detail || 'Failed to add payment', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Network error', 'error');
            }
        });
    }
});
