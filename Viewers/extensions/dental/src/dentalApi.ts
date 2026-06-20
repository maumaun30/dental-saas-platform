const TOKEN_KEY = 'dental.token';
const USER_KEY = 'dental.user';

function baseUrl(): string {
  const w = window as any;
  if (w.__DENTAL_API__) {
    return String(w.__DENTAL_API__).replace(/\/$/, '');
  }
  if (window.location.port === '3000') {
    return 'http://localhost:4000/api';
  }
  return '/api';
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export const userStore = {
  get: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },
  set: (u: unknown) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
};

async function request(method: string, path: string, body?: unknown) {
  const token = tokenStore.get();
  const res = await fetch(baseUrl() + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) {
    return null;
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err: any = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const dentalApi = {
  register: (payload: unknown) => request('POST', '/auth/register', payload),
  login: (payload: unknown) => request('POST', '/auth/login', payload),
  me: () => request('GET', '/auth/me'),

  getViewerState: () => request('GET', '/viewer-state'),
  saveViewerState: (state: unknown) => request('PUT', '/viewer-state', state),

  listMeasurements: (studyUID?: string) =>
    request('GET', `/measurements${studyUID ? `?studyUID=${encodeURIComponent(studyUID)}` : ''}`),
  replaceMeasurements: (studyUID: string, measurements: unknown[]) =>
    request('PUT', '/measurements', { studyUID, measurements }),
};
