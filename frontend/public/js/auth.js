// Authentication state management
const auth = {
    // Check if user is logged in
    isLoggedIn() {
        return !!localStorage.getItem('token');
    },

    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Get token
    getToken() {
        return localStorage.getItem('token');
    },

    // Logout
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    },

    // Protected route handler
    requireAuth() {
        if (!this.isLoggedIn()) {
            // Store the current URL to redirect back after login
            localStorage.setItem('redirectUrl', window.location.pathname);
            window.location.href = '/login_2.html';
            return false;
        }
        return true;
    },

    // Protected pages - only persona planner and tools & resources features
    protectedPages: [
        '/persona-planner.html',      // Persona Planner
        '/daily-planner.html',        // Daily Planner tool
        '/medication-tracker.html',    // Medication Tracker tool
        '/cognitive-exercises.html',   // Cognitive Exercises tool
        '/voice_rec.html',            // Voice Recognition tool
        '/caregiver-community.html',  // Caregiver Community tool
        '/dashboard.html'             // Dashboard tool
    ],

    // Check if current page is protected
    isProtectedPage() {
        return this.protectedPages.includes(window.location.pathname);
    },

    // Initialize auth check on page load
    init() {
        // Check if current page is protected
        if (this.isProtectedPage()) {
            this.requireAuth();
        }

        // Update UI based on auth state
        this.updateUI();

        // Add event listener for storage changes (for multi-tab support)
        window.addEventListener('storage', (e) => {
            if (e.key === 'token') {
                this.updateUI();
            }
        });
    },

    // Update UI elements based on auth state
    updateUI() {
        const isLoggedIn = this.isLoggedIn();
        const loggedOutActions = document.querySelectorAll('.logged-out-actions');
        const loggedInActions = document.querySelectorAll('.logged-in-actions');
        const protectedElements = document.querySelectorAll('.auth-required');
        const userNameElements = document.querySelectorAll('.user-name');
        
        // Update header actions
        loggedOutActions.forEach(el => el.style.display = isLoggedIn ? 'none' : 'flex');
        loggedInActions.forEach(el => el.style.display = isLoggedIn ? 'flex' : 'none');

        // Update user name if logged in
        if (isLoggedIn) {
            const user = this.getCurrentUser();
            userNameElements.forEach(el => {
                el.textContent = user ? `${user.first_name} ${user.last_name}` : 'User';
            });
        }

        // Handle protected elements
        protectedElements.forEach(el => {
            if (!isLoggedIn) {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.requireAuth();
                });
            }
        });
    }
};

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
}); 