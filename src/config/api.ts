const explicitBase = import.meta.env.VITE_API_BASE_URL;

// Use local backend in development unless explicitly overridden.
const fallbackBase = import.meta.env.DEV ? 'http://127.0.0.1:49999' : '';

export const API_BASE_URL = explicitBase || fallbackBase;
