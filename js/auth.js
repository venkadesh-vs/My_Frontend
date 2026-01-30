document.addEventListener('DOMContentLoaded', () => {
    // Login Handling
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        const loginBtn = loginModal.querySelector('.btn-primary');
        const inputs = loginModal.querySelectorAll('input');
        const emailInput = inputs[0];
        const passwordInput = inputs[1];

        if (loginBtn) {
            loginBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const email = emailInput.value;
                const password = passwordInput.value;

                if (!email || !password) {
                    showToast('Please enter email and password', 'error');
                    return;
                }

                try {
                    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });

                    if (response.ok) {
                        const user = await response.json();
                        localStorage.setItem('user', JSON.stringify(user));
                        showToast('Login successful', 'success');
                        setTimeout(() => {
                            window.location.href = './pages/dashboard.html';
                        }, 1500);
                    } else {
                        const error = await response.json();
                        showToast(error.detail || 'Login failed', 'error');
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    showToast('Network error. Ensure backend is running.', 'error');
                }
            });
        }
    }

    // Signup Handling
    const signupModal = document.getElementById('signup-modal');
    if (signupModal) {
        const signupBtn = signupModal.querySelector('.btn-primary');
        const inputs = signupModal.querySelectorAll('input');
        // inputs order: 0:shop_name, 1:owner_name, 2:email, 3:phone, 4:password

        if (signupBtn && inputs.length >= 5) {
            signupBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const shopName = inputs[0].value;
                const ownerName = inputs[1].value;
                const email = inputs[2].value;
                const phone = inputs[3].value;
                const password = inputs[4].value;

                if (!shopName || !ownerName || !email || !password) {
                    showToast('Please fill all required fields', 'error');
                    return;
                }

                try {
                    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            shop_name: shopName,
                            owner_name: ownerName,
                            email: email,
                            phone: phone,
                            password: password
                        })
                    });

                    if (response.ok) {
                        showToast('Account created successfully! Please login.', 'success');
                        window.location.hash = '#login-modal';
                    } else {
                        const error = await response.json();
                        showToast(error.detail || 'Signup failed', 'error');
                    }
                } catch (error) {
                    console.error('Signup error:', error);
                    showToast('Network error. Ensure backend is running.', 'error');
                }
            });
        }
    }
});
