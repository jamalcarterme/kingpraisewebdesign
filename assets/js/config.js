// Global site configuration
window.KPWD = {
  // Auto-switches to your local backend when developing on localhost,
  // otherwise uses the live Render URL. Replace the Render URL below
  // with your actual deployed backend if it differs.
  API_BASE: (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : 'https://kingpraisewebdesign-backend.onrender.com/api',
  SITE_URL: 'https://www.kingpraisewebdesign.name.ng',
  EMAIL: 'kingpraisewebdesign@gmail.com',
  PHONE_NG: '+2349030232048',
  PHONE_US: '+1 650-706-4845',
  WHATSAPP: '2349030232048',
  FOUNDED_YEAR: 2026
};
