const rawBase = (import.meta as any).env?.VITE_API_URL || '/api';
const API_BASE_URL = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers = {}, ...rest } = options;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${API_BASE_URL}${cleanEndpoint}`;
  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = localStorage.getItem('jobzy_token');
  const requestHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Do not set Content-Type if sending FormData (browser automatically sets multipart boundary)
  if (!(rest.body instanceof FormData) && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
  });

  let data: any = {};
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => ({}));
  }

  if (!response.ok) {
    if (response.status === 401) {
      // Clear token if expired
      localStorage.removeItem('jobzy_token');
      localStorage.removeItem('jobzy_user');
      if (window.location.pathname.startsWith('/candidate') || window.location.pathname.startsWith('/recruiter')) {
        window.location.href = '/login?expired=true';
      }
    }
    const errMsg =
      data.message ||
      (response.status === 404
        ? 'Backend API not found (404). Please ensure VITE_API_URL is configured in your Vercel settings.'
        : `Request failed with status ${response.status}`);
    throw new Error(errMsg);
  }

  return data as T;
}
