(function () {
  const api = window.KPWD_API;

  function guardRedirectIfLoggedIn() {
    const user = api.getUser();
    if (user && user.role === 'client') window.location.href = 'dashboard.html';
  }

  function handleLogin() {
    const form = document.getElementById('client-login-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.disabled = true; btn.textContent = 'Signing in...';
      try {
        const data = await api.post('/auth/login', { email: form.email.value.trim(), password: form.password.value }, { auth: false });
        if (data.user.role !== 'client') throw new Error('This account is not a client account.');
        api.setToken(data.accessToken); api.setUser(data.user);
        window.KPWD_UI.toast('Welcome back!', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 600);
      } catch (err) {
        window.KPWD_UI.toast(err.message || 'Login failed', 'error');
      } finally {
        btn.disabled = false; btn.textContent = original;
      }
    });
  }

  function handleRegister() {
    const form = document.getElementById('client-register-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.disabled = true; btn.textContent = 'Creating account...';
      try {
        const payload = {
          name: form.name.value.trim(),
          email: form.email.value.trim(),
          password: form.password.value,
          phone: form.phone.value.trim(),
          company: form.company.value.trim(),
          country: form.country.value.trim()
        };
        const data = await api.post('/auth/register', payload, { auth: false });
        api.setToken(data.accessToken); api.setUser(data.user);
        window.KPWD_UI.toast('Account created!', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 600);
      } catch (err) {
        window.KPWD_UI.toast(err.message || 'Registration failed', 'error');
      } finally {
        btn.disabled = false; btn.textContent = original;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    guardRedirectIfLoggedIn();
    handleLogin();
    handleRegister();
  });
})();
