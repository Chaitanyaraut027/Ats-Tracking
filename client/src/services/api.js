// Centralized API client for TalentTrack ATS
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
    const token = localStorage.getItem('usertoken') || localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = token;
    }
    return headers;
};

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        try {
            const data = await response.json();
            if (data && (data.message || data.error)) {
                errorMessage = data.message || data.error;
            }
        } catch (e) {
            // Not JSON
        }
        throw new Error(errorMessage);
    }
    return response.json();
};

export const api = {
    baseUrl: API_BASE_URL,

    async get(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: getAuthHeaders(),
            credentials: 'include',
        });
        return handleResponse(response);
    },

    async post(endpoint, body) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
            credentials: 'include',
        });
        return handleResponse(response);
    },

    async put(endpoint, body) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
            credentials: 'include',
        });
        return handleResponse(response);
    },

    async delete(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            credentials: 'include',
        });
        return handleResponse(response);
    },

    async upload(endpoint, formData) {
        const token = localStorage.getItem('usertoken') || localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers['Authorization'] = token;
        }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
            credentials: 'include',
        });
        return handleResponse(response);
    },
};

export default api;
