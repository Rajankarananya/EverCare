// API Service for handling all backend requests
const API_URL = 'http://localhost:3000/api';

const apiService = {
    // Authentication APIs
    register: async (userData) => {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Registration failed');
            }

            return response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    login: async (credentials) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Login failed');
            }

            const data = await response.json();
            // Store the token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Personal Plan APIs
    createPersonalPlan: async (planData) => {
        const response = await fetch(`${API_URL}/personal-plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.getToken()}`
            },
            body: JSON.stringify(planData)
        });
        return response.json();
    },

    getPersonalPlan: async () => {
        const response = await fetch(`${API_URL}/personal-plan`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });
        return response.json();
    },

    // Guardian APIs
    addGuardian: async (guardianData) => {
        const response = await fetch(`${API_URL}/guardians`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.getToken()}`
            },
            body: JSON.stringify(guardianData)
        });
        return response.json();
    },

    getGuardians: async () => {
        const response = await fetch(`${API_URL}/guardians`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });
        return response.json();
    },

    // Daily Care Plan APIs
    addDailyCareTask: async (taskData) => {
        const response = await fetch(`${API_URL}/daily-care`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.getToken()}`
            },
            body: JSON.stringify(taskData)
        });
        return response.json();
    },

    getDailyCareTasks: async () => {
        const response = await fetch(`${API_URL}/daily-care`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });
        return response.json();
    },

    // Voice Recording APIs
    saveRecording: async (recordingData) => {
        const response = await fetch(`${API_URL}/recordings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.getToken()}`
            },
            body: JSON.stringify(recordingData)
        });
        return response.json();
    },

    getRecordings: async () => {
        const response = await fetch(`${API_URL}/recordings`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });
        return response.json();
    },

    // Document APIs
    saveDocument: async (documentData) => {
        const response = await fetch(`${API_URL}/documents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.getToken()}`
            },
            body: JSON.stringify(documentData)
        });
        return response.json();
    },

    getDocuments: async () => {
        const response = await fetch(`${API_URL}/documents`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });
        return response.json();
    },

    // Feedback API
    submitFeedback: async (feedbackData) => {
        const response = await fetch(`${API_URL}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.getToken()}`
            },
            body: JSON.stringify(feedbackData)
        });
        return response.json();
    },

    // Contact Message API
    sendMessage: async (messageData) => {
        const response = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        });
        return response.json();
    }
}; 