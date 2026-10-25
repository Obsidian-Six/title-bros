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

export const projectService = {
  async getProjects() {
    return request('/projects', { method: 'GET' });
  },

  async getProjectById(id) {
    return request(`/projects/${id}`, { method: 'GET' });
  },

  async createProject(formData) {
    // Requires multipart/form-data, so we don't use the standard request helper here
    const url = `${API_BASE_URL}/projects`;
    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    const json = await response.json().catch(() => ({
      success: false,
      message: 'Unable to parse server response.',
    }));

    if (!response.ok) {
      throw new Error(json.message || 'Project creation failed');
    }
    return json;
  },

  async updateProject(id, formData) {
    const url = `${API_BASE_URL}/projects/${id}`;
    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: formData,
      credentials: 'include',
    });

    const json = await response.json().catch(() => ({
      success: false,
      message: 'Unable to parse server response.',
    }));

    if (!response.ok) {
      throw new Error(json.message || 'Project update failed');
    }
    return json;
  },

  async deleteProject(id) {
    return request(`/projects/${id}`, { method: 'DELETE' });
  }
};
