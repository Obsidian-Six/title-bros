/**
 * ==============================================================================
 * Title Bros Authentication API Client Service
 * ==============================================================================
 * Centralized HTTP service using modern Fetch API for interacting with
 * the Title Bros Backend authentication endpoints.
 *
 * Supported workflows:
 * - Customer self-registration
 * - Customer authentication
 * - Dedicated internal Administrator authentication
 * - Forgot password link request
 * - Token-based password reset
 * - Current user profile retrieval
 * - Session logout and revocation
 */

export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || `${SERVER_URL}/api/v1`;

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  const isAdm = window.location.pathname.includes('/admin');
  if (isAdm) {
    return localStorage.getItem('titlebros_admin_token') || localStorage.getItem('titlebros_auth_token');
  }
  return localStorage.getItem('titlebros_customer_token') || localStorage.getItem('titlebros_auth_token');
}

/**
 * Standard HTTP request wrapper with JSON serialization & error parsing
 * @param {string} endpoint - API path (e.g. '/auth/login')
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Resolved data or rejected Error
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Attach token if present in localStorage based on active path (admin vs customer)
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
    credentials: 'include', // Support cross-origin cookies
  });

  const json = await response.json().catch(() => ({
    success: false,
    message: 'Unable to parse server response.',
  }));

  if (!response.ok) {
    const errorMessage =
      json.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.statusCode = response.status;
    error.errors = json.errors || [];
    throw error;
  }

  return json;
}

export const authService = {
  /**
   * Register a new customer account
   * @param {Object} data - { name, email, password, phone }
   */
  async customerRegister(data) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Log in customer
   * @param {Object} credentials - { email, password }
   */
  async customerLogin(credentials) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Log in administrative staff (SUPER_ADMIN or ADMIN)
   * Dedicated portal endpoint with strict role verification
   * @param {Object} credentials - { email, password }
   */
  async adminLogin(credentials) {
    return request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Request password reset email
   * @param {string} email
   */
  async forgotPassword(email) {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Reset password with crypto token
   * @param {string} token
   * @param {string} newPassword
   */
  async resetPassword(token, newPassword) {
    return request(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password: newPassword }),
    });
  },

  /**
   * Retrieve authenticated user profile with active session metadata
   */
  async getMe() {
    return request('/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Update authenticated user personal profile
   */
  async updateProfile(data) {
    return request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Log out and invalidate current session in MongoDB
   */
  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('[authService] Logout API request warning:', err.message);
    } finally {
      if (typeof window !== 'undefined') {
        const isAdm = window.location.pathname.includes('/admin');
        if (isAdm) {
          localStorage.removeItem('titlebros_admin_token');
          localStorage.removeItem('titlebros_admin_user');
        } else {
          localStorage.removeItem('titlebros_customer_token');
          localStorage.removeItem('titlebros_customer_user');
        }
        localStorage.removeItem('titlebros_auth_token');
        localStorage.removeItem('titlebros_user_data');
      }
    }
  },
};

export default authService;
