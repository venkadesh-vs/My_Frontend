const API_BASE_URL = "http://127.0.0.1:8000";

// Helper to check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = '../index.html';
        return null; // Stop execution
    }
    return JSON.parse(user);
}

// Helper to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Helper to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

// Export for module usage if needed, but we are using script tags
// window.API_BASE_URL = API_BASE_URL;
// window.checkAuth = checkAuth;
// window.formatCurrency = formatCurrency;
