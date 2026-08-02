// Central API config — reads from VITE_API_URL when available.
// If Vercel env vars are missing, default to the deployed Render backend.
const explicitApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const isVercelHost = typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app');
const fallbackApiUrl = isVercelHost
	? 'https://ai-resume-builder-backend.onrender.com'
	: 'http://127.0.0.1:8000';

const API_URL = (explicitApiUrl || fallbackApiUrl).replace(/\/$/, '');

export default API_URL;
