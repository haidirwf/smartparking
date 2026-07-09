import axios from 'axios';

const api = axios.create({
    baseURL: '',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Helper to fetch CSRF token before performing POST/PUT/DELETE auth actions
export async function ensureCsrfToken() {
    return api.get('/sanctum/csrf-cookie');
}

export default api;
