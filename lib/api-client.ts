export type ApiError = { error?: { code: string; message: string } };

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (!token) localStorage.removeItem('auth_token');
  else localStorage.setItem('auth_token', token);
}

export function getUser(): any | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem('auth_user');
  if (!v) return null;
  try { return JSON.parse(v); } catch { return null; }
}

export function setUser(u: any | null) {
  if (typeof window === 'undefined') return;
  if (!u) localStorage.removeItem('auth_user');
  else localStorage.setItem('auth_user', JSON.stringify(u));
}

export async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: any = { ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, { ...opts, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || 'Request failed';
    throw new Error(msg);
  }
  return data as T;
}
