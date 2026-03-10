// const API_BASE_URL = "http://localhost:8000";
export const API_BASE_URL = "https://my-backend-pwnq.onrender.com";

// Helper to check if user is logged in
function checkAuth() {
  const user = localStorage.getItem("user");
  if (!user) {
    // Redirect if not on index.html
    if (
      !window.location.href.endsWith("index.html") &&
      !window.location.pathname.endsWith("/")
    ) {
      window.location.href = "../index.html";
    }
    return null;
  }
  return JSON.parse(user);
}

// Helper to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper to format date
function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-IN", options);
}
