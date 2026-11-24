const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers = {}, ...rest } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
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

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      // Clear token if expired
      localStorage.removeItem('jobzy_token');
      localStorage.removeItem('jobzy_user');
      if (window.location.pathname.startsWith('/candidate') || window.location.pathname.startsWith('/recruiter')) {
        window.location.href = '/login?expired=true';
      }
    }
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}
