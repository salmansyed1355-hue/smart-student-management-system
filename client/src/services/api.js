/**
 * API Service Helper
 * Provides a centralized fetch wrapper that automatically attaches the JWT token
 * to Authorization headers for authenticated requests.
 */

const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // If in browser and not running on localhost (e.g. deployed on Render/Vercel/custom domain),
  // default to relative path '' so requests go to the same origin server!
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return '';
    }
  }

  // If Vite was built for production bundle, use relative URL to prevent localhost hardcoding
  if (import.meta.env.PROD) {
    return '';
  }

  return 'http://localhost:5000';
};

export const API_BASE_URL = resolveApiBaseUrl();
export const BASE_URL = API_BASE_URL ? (API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`) : '/api';

/**
 * Get the stored JWT token from localStorage
 */
export const getStoredToken = () => {
  return localStorage.getItem('sms_token');
};

/**
 * Get the stored User from localStorage
 */
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('sms_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
};

/**
 * Generic API request function
 * @param {string} endpoint - API path (e.g., '/auth/login', '/students')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // If token has expired or is invalid (401), and it's not a login attempt
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('sms_token');
      localStorage.removeItem('sms_user');
    }
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

/**
 * Fetch all authorized faculty emails
 */
export const getFacultyWhitelist = async () => {
  return await apiRequest('/faculty-access');
};

/**
 * Authorize a new faculty email
 */
export const addFacultyEmail = async (email, name = '') => {
  return await apiRequest('/faculty-access', {
    method: 'POST',
    body: JSON.stringify({ email, name }),
  });
};

/**
 * Revoke faculty authorization for an email
 */
export const revokeFacultyEmail = async (email) => {
  return await apiRequest(`/faculty-access/${encodeURIComponent(email)}`, {
    method: 'DELETE',
  });
};

/**
 * Fetch recent portal website access and login activity logs
 */
export const getRecentPortalActivity = async (limit = 50) => {
  return await apiRequest(`/faculty-access/recent-activity?limit=${limit}`);
};

export default apiRequest;
