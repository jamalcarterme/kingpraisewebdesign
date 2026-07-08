// Lightweight API client with auto access-token refresh
(function () {
  const BASE = window.KPWD.API_BASE;

  function getToken() { return localStorage.getItem('kpwd_token') || ''; }
  function setToken(t) { t ? localStorage.setItem('kpwd_token', t) : localStorage.removeItem('kpwd_token'); }
  function getUser() { try { return JSON.parse(localStorage.getItem('kpwd_user') || 'null'); } catch (e) { return null; } }
  function setUser(u) { u ? localStorage.setItem('kpwd_user', JSON.stringify(u)) : localStorage.removeItem('kpwd_user'); }

  async function refreshToken() {
    try {
      const res = await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (data.success) { setToken(data.accessToken); setUser(data.user); return data.accessToken; }
    } catch (e) {}
    return null;
  }

  async function request(path, { method = 'GET', body, isForm = false, auth = true, retry = true } = {}) {
    const headers = {};
    if (!isForm) headers['Content-Type'] = 'application/json';
    if (auth && getToken()) headers['Authorization'] = `Bearer ${getToken()}`;

    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined
    });

    if (res.status === 401 && auth && retry) {
      const newToken = await refreshToken();
      if (newToken) return request(path, { method, body, isForm, auth, retry: false });
    }

    let data;
    try { data = await res.json(); } catch (e) { data = { success: false, message: 'Invalid server response' }; }
    if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
    return data;
  }

  window.KPWD_API = {
    get: (p, opts) => request(p, { ...opts, method: 'GET' }),
    post: (p, body, opts) => request(p, { ...opts, method: 'POST', body }),
    put: (p, body, opts) => request(p, { ...opts, method: 'PUT', body }),
    del: (p, opts) => request(p, { ...opts, method: 'DELETE' }),
    getToken, setToken, getUser, setUser, refreshToken
  };
})();
