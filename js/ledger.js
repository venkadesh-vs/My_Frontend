document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    if (!user) return;

    // Header User Info
    const userEmailEl = document.querySelector('.user-email');
    if (userEmailEl) userEmailEl.textContent = user.email;

    const select = document.getElementById('customerSelect');
    const searchInput = document.getElementById('customerSearch');

    // Clear initial options
    if (select) select.innerHTML = '<option value="">Loading customers...</option>';

    let allCustomerOptions = []; // Store original options for filtering

    try {
        const response = await fetch(`${API_BASE_URL}/api/customers?user_id=${user.user_id}`);
        const customers = await response.json();

        if (select) {
            select.innerHTML = '<option value="">Select a customer</option>';

            // Populate Dropdown
            customers.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.customer_id;
                opt.textContent = c.name;
                select.appendChild(opt);

                // Save for filtering
                allCustomerOptions.push({
                    value: c.customer_id,
                    text: c.name.toLowerCase(),
                    element: opt
                });
            });

            // Handle Selection
            select.addEventListener('change', (e) => loadLedger(e.target.value, user.user_id));

            // Handle Search
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();

                    // Clear current options
                    select.innerHTML = '<option value="">Select a customer</option>';

                    // Filter and re-append matches
                    allCustomerOptions.forEach(option => {
                        if (option.text.includes(searchTerm)) {
                            select.appendChild(option.element);
                        }
                    });

                    // If exact match or only one option, maybe auto-select? (Optional, let's keep simple first)
                });
            }
        }

    } catch (error) {
        console.error('Error loading customers for ledger:', error);
    }
});

async function loadLedger(customerId, userId) {
    if (!customerId) return;

    const summaryName = document.querySelector('.account-summary .customer-name');
    const summaryAmount = document.querySelector('.account-summary .outstanding-amount');
    const tableContainer = document.querySelector('.ledger-table');

    // Loading state
    if (summaryName) summaryName.textContent = 'Loading...';

    // Clear rows but keep header
    const rows = tableContainer.querySelectorAll('.table-row');
    rows.forEach(r => r.remove());

    try {
        const response = await fetch(`${API_BASE_URL}/api/ledger/${customerId}?user_id=${userId}`);

        if (!response.ok) throw new Error('Failed to fetch ledger');

        const data = await response.json();

        // Update Summary
        if (summaryName) summaryName.textContent = data.customer_name;
        if (summaryAmount) summaryAmount.textContent = formatCurrency(data.outstanding_balance);

        // Populate Table
        data.transactions.forEach(t => {
            const row = document.createElement('div');
            row.className = 'table-row';

            row.innerHTML = `
                <div class="col-date">${formatDate(t.date)}</div>
                <div class="col-description">${t.description}</div>
                <div class="col-debit">${t.debit > 0 ? formatCurrency(t.debit) : '-'}</div>
                <div class="col-credit">${t.credit > 0 ? formatCurrency(t.credit) : '-'}</div>
                <div class="col-balance ${t.balance >= 0 ? 'balance-green' : 'balance-red'}" style="color: ${t.balance >= 0 ? 'var(--success-color)' : 'var(--danger-color)'}">${formatCurrency(t.balance)}</div>
            `;
            tableContainer.appendChild(row);
        });

    } catch (error) {
        console.error(error);
        if (summaryName) summaryName.textContent = 'Error loading ledger';
    }
}
