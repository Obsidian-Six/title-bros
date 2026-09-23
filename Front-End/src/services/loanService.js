/**
 * ==============================================================================
 * Title Bros Loan & Admin Management API Service
 * ==============================================================================
 * Connects the Frontend (Admin Dashboard and Customer Portal) dynamically to
 * the Node/Express backend on http://localhost:5000/api/v1.
 */
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || `${SERVER_URL}/api/v1`;

/**
 * Resolves a document/asset path into a full URL using the configured SERVER_URL.
 * Supports absolute URLs, relative URLs, and null/undefined values safely.
 * @param {string} path - Document relative path (e.g., '/uploads/documents/...')
 * @returns {string} Fully qualified URL
 */
export function getDocumentUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SERVER_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  const isAdm = window.location.pathname.includes('/admin');
  if (isAdm) {
    return localStorage.getItem('titlebros_admin_token') || localStorage.getItem('titlebros_auth_token');
  }
  return localStorage.getItem('titlebros_customer_token') || localStorage.getItem('titlebros_auth_token');
}

/**
 * Universal JSON Request Helper
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = getAuthToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
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

export const loanService = {
  // ==========================================
  // LOAN APPLICATION & REVIEW ENDPOINTS
  // ==========================================

  /**
   * Submit loan application (Online application form)
   */
  async submitLoanApplication(data) {
    const res = await request('/loans/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (typeof window !== 'undefined' && res?.data?.token) {
      localStorage.setItem('titlebros_customer_token', res.data.token);
      localStorage.setItem('titlebros_customer_user', JSON.stringify(res.data.customer));
      localStorage.setItem('titlebros_auth_token', res.data.token);
      localStorage.setItem('titlebros_user_data', JSON.stringify(res.data.customer));
    }

    return res;
  },

  /**
   * Admin Overview Statistics (5 Summary Cards & 24h Alerts)
   */
  async getAdminStats() {
    return request('/loans/admin/stats', { method: 'GET' });
  },

  /**
   * List all loan applications with filter, search, pagination
   */
  async getAllLoans({ status, search, page = 1, limit = 20 } = {}) {
    const query = new URLSearchParams();
    if (status && status !== 'All') query.append('status', status);
    if (search) query.append('search', search);
    query.append('page', page);
    query.append('limit', limit);

    return request(`/loans?${query.toString()}`, { method: 'GET' });
  },

  /**
   * Get single loan detail with history, documents, notes
   */
  async getLoanById(id) {
    return request(`/loans/${id}`, { method: 'GET' });
  },

  /**
   * Mark loan application as read by staff
   */
  async markLoanAsRead(id) {
    return request(`/loans/${id}/read`, { method: 'PATCH' });
  },

  /**
   * Update loan status (Approve with terms, Reject with reason, Request docs, Under review)
   */
  async updateLoanStatus(id, payload) {
    return request(`/loans/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Add internal staff note to loan
   */
  async addLoanNote(id, note) {
    return request(`/loans/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  },

  /**
   * Upload loan document using Multer multipart/form-data
   */
  async uploadDocument(loanId, file, documentName) {
    const formData = new FormData();
    formData.append('document', file);
    if (documentName) formData.append('documentName', documentName);

    const token = getAuthToken() || '';

    const response = await fetch(`${API_BASE_URL}/loans/${loanId}/documents`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Upload failed');
    return json;
  },

  /**
   * Admin review document (Accept / Reject)
   */
  async reviewDocument(loanId, docId, { status, rejectionReason }) {
    return request(`/loans/${loanId}/documents/${docId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReason }),
    });
  },

  /**
   * Customer: View own applications
   */
  async getMyApplications() {
    return request('/loans/my-applications', { method: 'GET' });
  },

  // ==========================================
  // CUSTOMER MANAGEMENT ENDPOINTS
  // ==========================================

  /**
   * List customers with search and pagination
   */
  async getCustomers({ search, page = 1, limit = 20 } = {}) {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    query.append('page', page);
    query.append('limit', limit);

    return request(`/customers?${query.toString()}`, { method: 'GET' });
  },

  /**
   * Customer 360 profile detail
   */
  async getCustomerDetail(id) {
    return request(`/customers/${id}`, { method: 'GET' });
  },

  /**
   * Manually create walk-in customer profile
   */
  async createWalkInCustomer(data) {
    return request('/customers/walk-in', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Super Admin permanent deletion of customer & all records
   */
  async deleteCustomer(id) {
    return request(`/customers/${id}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // COMMUNICATIONS & MESSAGING LOG ENDPOINTS
  // ==========================================

  /**
   * Get communication audit logs
   */
  async getCommunicationLogs({ channel, search, page = 1, limit = 25 } = {}) {
    const query = new URLSearchParams();
    if (channel && channel !== 'ALL') query.append('channel', channel);
    if (search) query.append('search', search);
    query.append('page', page);
    query.append('limit', limit);

    return request(`/communications?${query.toString()}`, { method: 'GET' });
  },

  /**
   * Send custom email or SMS message to customer
   */
  async sendManualMessage(data) {
    return request('/communications/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ==========================================
  // TEAM & STAFF MANAGEMENT (SUPER ADMIN)
  // ==========================================

  async getAllAdmins() {
    return request('/users/admins', { method: 'GET' });
  },

  async createAdmin(data) {
    return request('/users/create-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateUserStatus(id, status) {
    return request(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // ==========================================
  // BLOG POST MANAGEMENT
  // ==========================================

  async getPublicBlogs(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/blogs${qs}`, { method: 'GET' });
  },

  async getBlogBySlug(slug) {
    return request(`/blogs/${encodeURIComponent(slug)}`, { method: 'GET' });
  },

  async getAdminBlogs(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/blogs/admin/all${qs}`, { method: 'GET' });
  },

  async createBlog(data) {
    return request('/blogs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateBlog(id, data) {
    return request(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteBlog(id) {
    return request(`/blogs/${id}`, {
      method: 'DELETE',
    });
  },

  async uploadBlogImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const url = `${API_BASE_URL}/blogs/upload-image`;
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
      const error = new Error(json.message || 'Image upload failed');
      error.statusCode = response.status;
      throw error;
    }

    return json;
  },

  // Helper utility for generating document URLs dynamically
  getDocumentUrl(path) {
    return getDocumentUrl(path);
  },
  SERVER_URL,
  API_BASE_URL,
};

// Export default and individual submit function for backwards compatibility with ApplyContent.jsx
export const submitLoanApplication = loanService.submitLoanApplication;
export default loanService;