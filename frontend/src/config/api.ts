// API Configuration
export const API_CONFIG = {
  // Development: local backend
  // Production: deployed backend
  BASE_URL: import.meta.env.DEV 
    ? 'http://localhost:3000/api' 
    : 'https://shoppy-s-ai-backend.vercel.app/api',
  
  // Timeout untuk request
  TIMEOUT: 10000,
  
  // Headers default
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  }
};

// Helper function untuk mendapatkan headers dengan auth
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function untuk membuat URL endpoint
export const createApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};
