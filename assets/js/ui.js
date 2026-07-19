// Shared site chrome + utilities
(function () {
  const nav = [
    { href: 'index.html', label: 'Home' },
    { href: 'services.html', label: 'Services' },
    { href: 'portfolio.html', label: 'Portfolio' },
    { href: 'pricing.html', label: 'Pricing' },
    { href: 'blog.html', label: 'Blog' },
    { href: 'about.html', label: 'About' },
    { href: 'contact.html', label: 'Contact' }
  ];

  function currentFile() {
    const p = window.location.pathname.split('/').pop();
    return p === '' ? 'index.html' : p;
  }

  function rootPrefix() {
    return window.location.pathname.includes('/client/') || window.location.pathname.includes('/admin/') ? '../' : '';
  }

  function themeToggleHTML(extraClass) {
    return `
    <button class="theme-toggle ${extraClass || ''}" data-theme-toggle aria-label="Toggle dark / light mode">
      <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
      <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path stroke-linecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
    </button>`;
  }

  function headerHTML() {
    const root = rootPrefix();
    const cur = currentFile();
    const links = nav.map(n => `<a href="${root}${n.href}" class="nav-link text-sm font-medium ${cur === n.href && root === '' ? 'active text-white' : 'text-slate-300'} hover:text-white transition">${n.label}</a>`).join('');
    return `
    <header class="fixed top-0 inset-x-0 z-50">
      <div class="mx-auto max-w-7xl px-5 lg:px-8">
        <div class="mt-3 glass rounded-2xl flex items-center justify-between px-5 py-3">
          <a href="${root}index.html" class="flex items-center gap-2 group">
            <img src="${root}assets/img/logo-icon.png" alt="King Praise Web Design" class="logo-icon">
            <span class="font-display font-semibold tracking-tight text-white text-lg hidden sm:inline">King Praise <span class="text-gradient">Web Design</span></span>
          </a>
          <nav class="hidden lg:flex items-center gap-7">${links}</nav>
          <div class="hidden lg:flex items-center gap-3">
            ${themeToggleHTML()}
            <a href="${root}client/login.html" class="btn-ghost text-sm px-4 py-2 rounded-lg">Client Login</a>
            <a href="${root}contact.html#schedule" class="btn-primary text-sm px-4 py-2 rounded-lg">Book a Call</a>
          </div>
          <div class="flex items-center gap-2 lg:hidden">
            ${themeToggleHTML()}
            <button id="menu-btn" class="text-white p-2" aria-label="Menu">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h16"/></svg>
            </button>
          </div>
        </div>
        <div id="mobile-menu" class="hidden glass rounded-2xl mt-2 p-5 flex flex-col gap-4 lg:hidden">
          ${nav.map(n => `<a href="${root}${n.href}" class="text-slate-200 hover:text-white font-medium">${n.label}</a>`).join('')}
          <hr class="border-white/10">
          <a href="${root}client/login.html" class="btn-ghost text-center px-4 py-2 rounded-lg">Client Login</a>
          <a href="${root}admin/login.html" class="text-slate-200 hover:text-white text-sm text-center font-medium transition">Admin Login</a>
          <a href="${root}contact.html#schedule" class="btn-primary text-center px-4 py-2 rounded-lg">Book a Call</a>
        </div>
      </div>
    </header>`;
  }

  function footerHTML() {
    const root = rootPrefix();
    return `
    <footer class="border-t border-white/10 mt-24 bg-[#050810]">
      <div class="max-w-7xl mx-auto px-5 lg:px-8 py-14 grid md:grid-cols-4 gap-10">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <img src="${root}assets/img/logo-icon.png" alt="King Praise Web Design" class="logo-icon">
            <span class="font-display font-semibold text-white">King Praise <span class="text-gradient">Web Design</span></span>
          </div>
          <p class="text-slate-400 text-sm leading-relaxed">Premium websites, apps and digital products engineered for growth &mdash; built remotely, delivered globally.</p>
        </div>
        <div>
          <h4 class="font-display font-semibold text-white mb-4 text-sm tracking-wide uppercase">Company</h4>
          <ul class="space-y-2 text-sm text-slate-400">
            <li><a href="${root}about.html" class="hover:text-white transition">About &amp; Team</a></li>
            <li><a href="${root}portfolio.html" class="hover:text-white transition">Portfolio</a></li>
            <li><a href="${root}blog.html" class="hover:text-white transition">Blog</a></li>
            <li><a href="${root}pricing.html" class="hover:text-white transition">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-display font-semibold text-white mb-4 text-sm tracking-wide uppercase">Access</h4>
          <ul class="space-y-2 text-sm text-slate-400">
            <li><a href="${root}client/login.html" class="hover:text-white transition">Client Portal</a></li>
            <li><a href="${root}client/register.html" class="hover:text-white transition">Create Account</a></li>
            <li><a href="${root}admin/login.html" class="hover:text-white transition">Admin Dashboard</a></li>
            <li><a href="${root}contact.html#schedule" class="hover:text-white transition">Schedule a Call</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-display font-semibold text-white mb-4 text-sm tracking-wide uppercase">Contact</h4>
          <ul class="space-y-2 text-sm text-slate-400">
            <li><a href="mailto:kingpraisewebdesign@gmail.com" class="hover:text-white transition">kingpraisewebdesign@gmail.com</a></li>
            <li><a href="https://wa.me/2349030232048" target="_blank" class="hover:text-white transition">+234 903 023 2048 (NG/WhatsApp)</a></li>
            <li><a href="tel:+16507064845" class="hover:text-white transition">+1 650-706-4845 (US)</a></li>
            <li class="text-slate-500">Remote Company &mdash; Global Delivery</li>
          </ul>
        </div>
      </div>
      <div class="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        &copy; <span id="copyright-year"></span> King Praise Web Design. All rights reserved.
      </div>
    </footer>`;
  }

  const THEME_KEY = 'kpwd-theme';

  function getTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function setTheme(theme) {
    applyTheme(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
  }

  function initTheme() {
    let theme = getTheme();
    if (!theme) {
      theme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
    }
    applyTheme(theme);
  }

  function bindThemeToggles() {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        setTheme(current === 'light' ? 'dark' : 'light');
      });
    });
  }

  function mountChrome() {
    const h = document.getElementById('site-header');
    const f = document.getElementById('site-footer');
    if (h) h.outerHTML = headerHTML();
    if (f) f.outerHTML = footerHTML();
    const yearEl = document.getElementById('copyright-year');
    if (yearEl) {
      const start = window.KPWD.FOUNDED_YEAR;
      const now = new Date().getFullYear();
      yearEl.textContent = now > start ? `${start}\u2013${now}` : `${start}`;
    }
    const menuBtn = document.getElementById('menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (menuBtn && menu) {
      menuBtn.addEventListener('click', () => menu.classList.toggle('hidden'));
    }
    bindThemeToggles();
  }

  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  }

  function toast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 3800);
  }

  function hidePageLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;
    loader.classList.add('hide');
    setTimeout(() => loader.remove(), 500);
  }

  window.KPWD_UI = { mountChrome, initReveal, toast, rootPrefix, setTheme, getTheme, initTheme, hidePageLoader };

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    mountChrome();
    initReveal();
  });

  window.addEventListener('load', () => {
    setTimeout(hidePageLoader, 250);
  });
  // Guaranteed fallback in case the load event or ui.js itself is delayed/blocked —
  // the CSS animation on .page-loader also self-dismisses independently after 3.2s.
  setTimeout(hidePageLoader, 1800);
})();
