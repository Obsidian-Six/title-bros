import { API_BASE_URL } from './loanService';

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  const isAdm = window.location.pathname.includes('/admin');
  if (isAdm) {
    return localStorage.getItem('titlebros_admin_token') || localStorage.getItem('titlebros_auth_token');
  }
  return localStorage.getItem('titlebros_customer_token') || localStorage.getItem('titlebros_auth_token');
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = { 'Content-Type': 'application/json' };
  
  if (typeof window !== 'undefined') {
    const token = getAuthToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
    credentials: 'include',
  });

  const json = await response.json().catch(() => ({
    success: false,
    message: 'Unable to parse server response.',
  }));

  if (!response.ok) {
    const error = new Error(json.message || `Request failed (${response.status})`);
    error.statusCode = response.status;
    throw error;
  }
  return json;
}

export const cmsFormService = {
  async submitForm(data) {
    return request('/cms-forms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getFormSubmissions() {
    return request('/cms-forms', { method: 'GET' });
  },

  async markAsRead(id) {
    return request(`/cms-forms/${id}/read`, { method: 'PATCH' });
  },

  async deleteFormSubmission(id) {
    return request(`/cms-forms/${id}`, { method: 'DELETE' });
  }
};
