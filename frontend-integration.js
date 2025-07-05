// Frontend Integration for AIHerb Backend
// This file shows how to connect your HTML files to the backend API

class AIHerbAPI {
    constructor(baseURL = 'http://localhost:5000/api') {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('aiherb_token');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('aiherb_token', token);
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('aiherb_token');
    }

    // Make API request
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add authorization header if token exists
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication methods
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(credentials) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        this.setToken(data.token);
        return data;
    }

    async logout() {
        this.clearToken();
        // Redirect to login page
        window.location.href = '/index.html';
    }

    async getProfile() {
        return this.request('/auth/profile');
    }

    async updateProfile(profileData) {
        return this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // Symptom analysis methods
    async analyzeSymptoms(symptoms) {
        return this.request('/symptoms/analyze', {
            method: 'POST',
            body: JSON.stringify({ symptoms })
        });
    }

    async getAnalysisHistory(page = 1, limit = 10) {
        return this.request(`/symptoms/history?page=${page}&limit=${limit}`);
    }

    async getAnalysis(analysisId) {
        return this.request(`/symptoms/analysis/${analysisId}`);
    }

    async provideFeedback(analysisId, feedback) {
        return this.request(`/symptoms/analysis/${analysisId}/feedback`, {
            method: 'POST',
            body: JSON.stringify(feedback)
        });
    }

    // Dashboard methods
    async getDashboardOverview() {
        return this.request('/dashboard/overview');
    }

    async getActivities(page = 1, limit = 10) {
        return this.request(`/dashboard/activities?page=${page}&limit=${limit}`);
    }

    async getProgress() {
        return this.request('/dashboard/progress');
    }

    async getRecommendations() {
        return this.request('/dashboard/recommendations');
    }

    async getInsights() {
        return this.request('/dashboard/insights');
    }

    // User methods
    async exportData() {
        return this.request('/users/export');
    }

    async getHealthSummary() {
        return this.request('/users/health-summary');
    }

    async updatePreferences(preferences) {
        return this.request('/users/preferences', {
            method: 'PUT',
            body: JSON.stringify({ preferences })
        });
    }
}

// Global API instance
const api = new AIHerbAPI();

// Utility functions for UI integration
class UIHelper {
    static showLoading(element) {
        element.innerHTML = '<div class="loading">Loading...</div>';
    }

    static showError(element, message) {
        element.innerHTML = `<div class="error">Error: ${message}</div>`;
    }

    static showSuccess(element, message) {
        element.innerHTML = `<div class="success">${message}</div>`;
    }

    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    static createCard(title, content, className = '') {
        return `
            <div class="card ${className}">
                <h3>${title}</h3>
                <div class="card-content">${content}</div>
            </div>
        `;
    }
}

// Example: Integration with your existing HTML files

// For index.html - Symptom Analysis Form
async function handleSymptomAnalysis(event) {
    event.preventDefault();
    
    const form = event.target;
    const resultContainer = document.getElementById('analysis-result');
    
    // Collect symptoms from form
    const symptoms = [];
    const symptomCheckboxes = form.querySelectorAll('input[name="symptoms"]:checked');
    
    symptomCheckboxes.forEach(checkbox => {
        symptoms.push({
            name: checkbox.value,
            severity: form.querySelector('select[name="severity"]').value,
            duration: form.querySelector('input[name="duration"]').value,
            frequency: form.querySelector('input[name="frequency"]').value
        });
    });

    if (symptoms.length === 0) {
        UIHelper.showError(resultContainer, 'Please select at least one symptom');
        return;
    }

    try {
        UIHelper.showLoading(resultContainer);
        
        const result = await api.analyzeSymptoms(symptoms);
        
        // Display results
        const analysisHTML = `
            <div class="analysis-result">
                <h2>Analysis Results</h2>
                <div class="dosha-info">
                    <h3>Primary Dosha: ${result.analysis.primaryDosha}</h3>
                    <p>Imbalance: ${result.analysis.imbalance}</p>
                    <p>Severity: ${result.analysis.severity}</p>
                </div>
                
                <div class="recommendations">
                    <h3>Recommendations</h3>
                    <div class="herbs">
                        <h4>Recommended Herbs:</h4>
                        <ul>
                            ${result.recommendations.herbs.map(herb => `
                                <li>
                                    <strong>${herb.name}</strong> - ${herb.description}
                                    <br><small>Dosage: ${herb.dosage}</small>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="lifestyle">
                        <h4>Lifestyle Recommendations:</h4>
                        <ul>
                            ${result.recommendations.lifestyle.diet.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        resultContainer.innerHTML = analysisHTML;
        
    } catch (error) {
        UIHelper.showError(resultContainer, error.message);
    }
}

// For dashboard.html - Load Dashboard Data
async function loadDashboard() {
    const dashboardContainer = document.getElementById('dashboard-content');
    
    try {
        UIHelper.showLoading(dashboardContainer);
        
        const [overview, activities, recommendations] = await Promise.all([
            api.getDashboardOverview(),
            api.getActivities(1, 5),
            api.getRecommendations()
        ]);
        
        const dashboardHTML = `
            <div class="dashboard-grid">
                ${UIHelper.createCard('Welcome', `Hello, ${overview.user.name}!`, 'welcome-card')}
                
                ${UIHelper.createCard('Statistics', `
                    <div class="stats">
                        <div class="stat-item">
                            <span class="stat-number">${overview.statistics.totalAnalyses}</span>
                            <span class="stat-label">Total Analyses</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${overview.statistics.healthScore}%</span>
                            <span class="stat-label">Health Score</span>
                        </div>
                    </div>
                `, 'stats-card')}
                
                ${UIHelper.createCard('Recent Activities', `
                    <ul class="activity-list">
                        ${overview.recentActivities.map(activity => `
                            <li>
                                <strong>${activity.title}</strong>
                                <br><small>${UIHelper.formatDate(activity.createdAt)}</small>
                            </li>
                        `).join('')}
                    </ul>
                `, 'activities-card')}
                
                ${UIHelper.createCard('Top Recommendations', `
                    <ul class="recommendations-list">
                        ${recommendations.topHerbs.map(herb => `
                            <li>
                                <strong>${herb.name}</strong> - ${herb.description}
                            </li>
                        `).join('')}
                    </ul>
                `, 'recommendations-card')}
            </div>
        `;
        
        dashboardContainer.innerHTML = dashboardHTML;
        
    } catch (error) {
        UIHelper.showError(dashboardContainer, error.message);
    }
}

// For homepage.html - User Registration/Login
async function handleRegistration(event) {
    event.preventDefault();
    
    const form = event.target;
    const resultContainer = document.getElementById('registration-result');
    
    const userData = {
        name: form.querySelector('input[name="name"]').value,
        email: form.querySelector('input[name="email"]').value,
        password: form.querySelector('input[name="password"]').value,
        age: parseInt(form.querySelector('input[name="age"]').value),
        gender: form.querySelector('select[name="gender"]').value
    };

    try {
        UIHelper.showLoading(resultContainer);
        
        const result = await api.register(userData);
        
        UIHelper.showSuccess(resultContainer, 'Registration successful! Redirecting to dashboard...');
        
        // Redirect to dashboard after successful registration
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 2000);
        
    } catch (error) {
        UIHelper.showError(resultContainer, error.message);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const resultContainer = document.getElementById('login-result');
    
    const credentials = {
        email: form.querySelector('input[name="email"]').value,
        password: form.querySelector('input[name="password"]').value
    };

    try {
        UIHelper.showLoading(resultContainer);
        
        const result = await api.login(credentials);
        
        UIHelper.showSuccess(resultContainer, 'Login successful! Redirecting to dashboard...');
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 2000);
        
    } catch (error) {
        UIHelper.showError(resultContainer, error.message);
    }
}

// Check authentication status on page load
function checkAuth() {
    if (!api.token) {
        // Redirect to login if no token
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.location.href = '/index.html';
        }
    } else {
        // Load user data if authenticated
        if (window.location.pathname.includes('dashboard.html')) {
            loadDashboard();
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Add event listeners based on current page
    const symptomForm = document.getElementById('symptom-form');
    if (symptomForm) {
        symptomForm.addEventListener('submit', handleSymptomAnalysis);
    }
    
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => api.logout());
    }
});

// Export for use in other scripts
window.AIHerbAPI = AIHerbAPI;
window.UIHelper = UIHelper; 