// Auto-detect API URL based on where the frontend is accessed from
const getApiUrl = () => {
  // If environment variable is explicitly set and not empty, use it
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl;
  }
  
  // Auto-detect based on current hostname
  const protocol = window.location.protocol; // http: or https:
  const hostname = window.location.hostname; // could be localhost, 10.1.27.166, etc.
  
  // If accessing from localhost, use localhost for API
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/api'; // Use Vite proxy
  }
  
  // If accessing from network IP, use same IP for backend
  return `${protocol}//${hostname}:5000/api`;
};

export const API_URL = getApiUrl();
export default API_URL;
