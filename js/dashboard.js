document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Auth
    const user = checkAuth();
    if (!user) return;

    // 2. Set User Info
    const userEmailEl = document.querySelector('.user-email');
    if (userEmailEl) userEmailEl.textContent = user.email;

    // 3. Logout Logic
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = '../index.html';
        });
    }

    // 4. Load Data
    try {
        await loadDashboardStats(user.user_id);
        await loadDashboardCharts(user.user_id);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
});

async function loadDashboardStats(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/stats?user_id=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch stats');

        const data = await response.json();

        // Update DOM elements
        // Assuming order: Credits, Payments, Outstanding, Customers
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 4) {
            statValues[0].textContent = formatCurrency(data.total_credits);
            statValues[1].textContent = formatCurrency(data.total_payments);
            statValues[2].textContent = formatCurrency(data.outstanding);
            statValues[3].textContent = data.active_customers;
        }
    } catch (error) {
        console.error('Stats Error:', error);
    }
}

async function loadDashboardCharts(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/charts?user_id=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch charts');

        const data = await response.json();

        // 1. Line Chart (Monthly Trend)
        const ctxLine = document.getElementById('lineChart');
        if (ctxLine) {
            const months = data.monthly_data.map(d => d.month);
            const credits = data.monthly_data.map(d => d.credits);
            const payments = data.monthly_data.map(d => d.payments);

            new Chart(ctxLine.getContext('2d'), {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [
                        {
                            label: 'Credits',
                            data: credits,
                            borderColor: '#ff9800', // Orange
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 0
                        },
                        {
                            label: 'Payments',
                            data: payments,
                            borderColor: '#4caf50', // Green
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#aaa', font: { family: 'Inter' } }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#666' },
                            grid: { color: '#333' }
                        },
                        y: {
                            ticks: { color: '#666' },
                            grid: { color: '#333' }
                        }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    }
                }
            });
        }

        // 2. Bar Chart (Top Customers)
        const ctxBar = document.getElementById('barChart');
        if (ctxBar) {
            const names = data.top_customers.map(c => c.name);
            const values = data.top_customers.map(c => c.outstanding);

            new Chart(ctxBar.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: names,
                    datasets: [{
                        label: 'Outstanding',
                        data: values,
                        backgroundColor: '#ff5722',
                        borderRadius: 4,
                        barThickness: 40
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#aaa' },
                            grid: { display: false }
                        },
                        y: {
                            ticks: { color: '#666' },
                            grid: { color: '#333' }
                        }
                    }
                }
            });
        }

    } catch (error) {
        console.error('Charts Error:', error);
    }
}
