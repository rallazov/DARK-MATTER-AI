const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const token = localStorage.getItem('pvai_access_token');
  const csrfToken = localStorage.getItem('pvai_csrf_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) headers.Authorization = `Bearer ${token}`;
  if (csrfToken) headers['x-csrf-token'] = csrfToken;

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Request failed');
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  return isJson ? res.json() : res.text();
}

async function download(path, filename) {
  const token = localStorage.getItem('pvai_access_token');
  const csrfToken = localStorage.getItem('pvai_csrf_token');
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (csrfToken) headers['x-csrf-token'] = csrfToken;

  const res = await fetch(`${import.meta.env.VITE_API_URL || ''}${path}`, {
    credentials: 'include',
    headers
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Download failed');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const api = {
  get: (path) => request(path),
  post: (path, body, options = {}) =>
    request(path, { method: 'POST', body: JSON.stringify(body || {}), ...options }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body || {}) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  download,
  postForm: async (path, formData) => {
    const token = localStorage.getItem('pvai_access_token');
    const csrfToken = localStorage.getItem('pvai_csrf_token');
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (csrfToken) headers['x-csrf-token'] = csrfToken;

    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Request failed');
    }

    return res.json();
  }
};
