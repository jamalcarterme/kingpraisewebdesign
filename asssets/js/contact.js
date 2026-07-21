(function () {
  const api = window.KPWD_API;

  function handleContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending...';
      try {
        const payload = {
          name: form.name.value.trim(),
          email: form.email.value.trim(),
          subject: form.subject.value.trim(),
          message: form.message.value.trim()
        };
        await api.post('/contact', payload, { auth: false });
        window.KPWD_UI.toast('Message sent! We\u2019ll reply within 24 hours.', 'success');
        form.reset();
      } catch (err) {
        window.KPWD_UI.toast(err.message || 'Could not send message.', 'error');
      } finally {
        btn.disabled = false; btn.textContent = original;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => { handleContactForm(); });
})();
