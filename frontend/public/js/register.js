document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = {
                first_name: document.getElementById('firstName').value,
                last_name: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                role: document.querySelector('input[name="role"]:checked').value
            };

            try {
                const response = await fetch('http://localhost:3000/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Registration failed');
                }

                // Show success message
                if (successMessage) {
                    successMessage.textContent = 'Registration successful! Redirecting to login...';
                    successMessage.style.display = 'block';
                }
                if (errorMessage) {
                    errorMessage.style.display = 'none';
                }

                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    window.location.href = '/login_2.html';
                }, 2000);

            } catch (error) {
                console.error('Registration error:', error);
                if (errorMessage) {
                    errorMessage.textContent = error.message || 'Error registering user';
                    errorMessage.style.display = 'block';
                }
                if (successMessage) {
                    successMessage.style.display = 'none';
                }
            }
        });
    }
}); 