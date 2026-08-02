// Central API config — prefers VITE_API_URL, but ignores localhost URLs in production builds.
const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const isProdBuild = import.meta.env.PROD;
const isLocalApiUrl = (value: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value);
const isVercelHost = typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app');
const productionFallbackApiUrl = 'https://ai-resume-builder-backend.onrender.com';
const localFallbackApiUrl = 'http://127.0.0.1:8000';

const explicitApiUrl = rawApiUrl && !(isProdBuild && isLocalApiUrl(rawApiUrl)) ? rawApiUrl : '';
const fallbackApiUrl = isProdBuild || isVercelHost ? productionFallbackApiUrl : localFallbackApiUrl;

const API_URL = (explicitApiUrl || fallbackApiUrl).replace(/\/$/, '');

export default API_URL;
