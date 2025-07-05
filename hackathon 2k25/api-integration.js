// AIHerb Frontend-Backend Integration
const API_BASE = 'http://localhost:5000/api';

class AIHerbAPI {
    constructor() {
        this.token = localStorage.getItem('aiherb_token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('aiherb_token', token);
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            headers: { 'Content-Type': 'application/json' },
            ...options
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    }

    // Auth methods
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

    // Symptom analysis
    async analyzeSymptoms(symptoms) {
        return this.request('/symptoms/analyze', {
            method: 'POST',
            body: JSON.stringify({ symptoms })
        });
    }

    // Dashboard
    async getDashboard() {
        return this.request('/dashboard/overview');
    }
}

// Global API instance
const api = new AIHerbAPI();

// Example usage for your HTML files
async function handleSymptomAnalysis() {
    const symptoms = [
        { name: 'anxiety', severity: 'moderate', duration: '2 weeks' }
    ];

    try {
        const result = await api.analyzeSymptoms(symptoms);
        console.log('Analysis result:', result);
        // Update your HTML with the results
    } catch (error) {
        console.error('Analysis failed:', error);
    }
}

// Check if user is logged in
function checkAuth() {
    if (!api.token) {
        console.log('User not authenticated');
        // Redirect to login
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', checkAuth); 