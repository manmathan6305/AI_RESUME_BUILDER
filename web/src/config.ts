// Central API config — reads from VITE_API_URL env variable
// Development fallback uses the local FastAPI server when no env var is set.
const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export default API_URL;
