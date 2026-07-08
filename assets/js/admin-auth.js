(function () {
  const api = window.KPWD_API;

  document.addEventListener('DOMContentLoaded', () => {
    const user = api.getUser();
    if (user && user.role === 'admin') window.location.href = 'dashboard.html';

    const form = document.getElementById('admin-login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.disabled = true; btn.textContent = 'Signing in...';
      try {
        const data = await api.post('/auth/admin-login', { email: form.email.value.trim(), password: form.password.value }, { auth: false });
        api.setToken(data.accessToken); api.setUser(data.user);
        window.location.href = 'dashboard.html';
      } catch (err) {
        window.KPWD_UI.toast(err.message || 'Login failed', 'error');
        btn.disabled = false; btn.textContent = original;
      }
    });
  });
})();
