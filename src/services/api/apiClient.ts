import axios from "axios";
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "../../utils/authTokens";

const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
const API_KEY = import.meta.env.VITE_REACT_APP_API_KEY;

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the X-API-Key in all requests
apiClient.interceptors.request.use(
  (config) => {
    config.headers["X-API-Key"] = `${API_KEY}`;
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Disable caching for GET requests to payment endpoints
    if (config.method === 'get' && config.url?.includes('/payments')) {
      config.headers["Cache-Control"] = "no-cache";
      config.headers["Pragma"] = "no-cache";
      // Add timestamp to prevent browser caching
      config.params = { ...config.params, _t: Date.now() };
    }
    
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token available, redirect to login
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Create a new axios instance without interceptors to avoid infinite loops
        const refreshClient = axios.create({
          baseURL,
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": `${API_KEY}`,
          },
        });

        // Request a new access token using the refresh token
        const response = await refreshClient.post(
          `/refresh`,
          { token: refreshToken }
        );

        const { accessToken } = response.data;
        saveTokens(accessToken, refreshToken); // Keep the same refresh token

        // Update the authorization header for the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Also update the default headers
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        
        // Retry the original request with the new access token
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
