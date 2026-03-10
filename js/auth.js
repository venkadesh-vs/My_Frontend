// Login Handling
import {API_BASE_URL} from './api'


const loginModal = document.getElementById("login-modal");
if (loginModal) {
  const loginBtn = loginModal.querySelector(".btn-primary");
  const inputs = loginModal.querySelectorAll("input");
  const emailInput = inputs[0];
  const passwordInput = inputs[1];

  if (loginBtn) {
    loginBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = emailInput.value;
      const password = passwordInput.value;

      if (!email || !password) {
        shopToast.warning("Please enter both email and password");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const user = await response.json();
          localStorage.setItem("user", JSON.stringify(user));
          setPendingToast("success", "Welcome back to ShopKhata!", "Login Successful");
          window.location.href = "./pages/dashboard.html";
        } else {
          const error = await response.json();
          shopToast.error(error.detail || "Invalid email or password");
        }
      } catch (error) {
        console.error("Login error:", error);
        shopToast.error("An unexpected error occurred. Please try again.");
      }
    });
  }
}

// Signup Handling
const signupModal = document.getElementById("signup-modal");
if (signupModal) {
  const signupBtn = signupModal.querySelector(".btn-primary");
  const inputs = signupModal.querySelectorAll("input");
  // inputs order: 0:shop_name, 1:owner_name, 2:email, 3:phone, 4:password

  if (signupBtn && inputs.length >= 5) {
    signupBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const shopName = inputs[0].value;
      const ownerName = inputs[1].value;
      const email = inputs[2].value;
      const phone = inputs[3].value;
      const password = inputs[4].value;

      if (!shopName || !ownerName || !email || !password || !phone) {
        shopToast.warning("Please fill in all required fields");
        return;
      }

      if (phone.length !== 10 || !/^\d+$/.test(phone)) {
        shopToast.warning("Phone number must be exactly 10 digits");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shop_name: shopName,
            owner_name: ownerName,
            email: email,
            phone: phone,
            password: password,
          }),
        });

        if (response.ok) {
          const user = await response.json();
          localStorage.setItem("user", JSON.stringify(user));
          setPendingToast("success", "Your account has been created successfully.", "Registration Successful");
          window.location.href = "./pages/dashboard.html";
        } else {
          const error = await response.json();
          shopToast.error(error.detail || "Error creating account. Please try again.");
        }
      } catch (error) {
        console.error("Signup error:", error);
      }
    });
  }
}
