document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    if (!user) return;

    // Header User Info
    const userEmailEl = document.querySelector('.user-email');
    if (userEmailEl) userEmailEl.textContent = user.email;

    // Remove dummy list if present
    const grid = document.querySelector('.customers-grid');
    if (grid) grid.innerHTML = '';

    const form = document.querySelector('.add-customer-form form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const inputs = form.querySelectorAll('input');
            const name = inputs[0].value;
            const phone = inputs[1].value;
            const email = inputs[2].value;

            if (!name || !phone) {
                showToast('Name and Phone are required', 'error');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/customers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.user_id,
                        name: name,
                        phone: phone,
                        email: email
                    })
                });

                if (response.ok) {
                    showToast('Customer added successfully', 'success');
                    setTimeout(() => {
                        window.location.href = 'customers.html';
                    }, 1500);
                } else {
                    const err = await response.json();
                    showToast(err.detail || 'Failed to add customer', 'error');
                }
            } catch (error) {
                console.error(error);
                showToast('Error adding customer', 'error');
            }
        });
    }
});
