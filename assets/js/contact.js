(function () {
  function handleContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending...';
      
      try {
        // Collect form data
        const formData = new FormData(form);
        
        // Submit to Web3Forms
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
          window.KPWD_UI.toast('Message sent! We\'ll reply within 24 hours.', 'success');
          form.reset();
        } else {
          throw new Error(result.message || 'Failed to send message. Please try again.');
        }
      } catch (err) {
        console.error('Contact form error:', err);
        window.KPWD_UI.toast(err.message || 'Could not send message. Please try again or contact us directly.', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = original;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => { handleContactForm(); });
})();
