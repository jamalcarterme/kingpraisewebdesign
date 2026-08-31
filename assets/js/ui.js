// Shared site chrome + utilities
(function () {
  const nav = [
    { href: 'index.html', label: 'Home' },
    { href: 'services.html', label: 'Services' },
    { href: 'locations', label: 'Locations' },
    { href: 'portfolio.html', label: 'Portfolio' },
    { href: 'pricing.html', label: 'Pricing' },
    { href: 'blog.html', label: 'Blog' },
    { href: 'about.html', label: 'About' },
    { href: 'contact.html', label: 'Contact' }
  ];

  const serviceLinks = [
    { href: 'web-design-for-law-firms.html', label: 'Web Design for Law Firms' },
    { href: 'real-estate-website-design.html', label: 'Real Estate Website Design' },
    { href: 'restaurant-website-design.html', label: 'Restaurant Website Design' },
    { href: 'med-spa-web-design.html', label: 'Med Spa Web Design' },
    { href: 'seo-services-for-small-business.html', label: 'SEO for Small Business' },
    { href: 'landing-page-design.html', label: 'Landing Page Design' },
    { href: 'ecommerce-web-design-abuja.html', label: 'Ecommerce Web Design (Abuja)' }
  ];

  const locationLinks = [
    { href: 'web-design-lagos.html', label: 'Lagos' },
    { href: 'web-design-abuja.html', label: 'Abuja' },
    { href: 'web-design-benin-city.html', label: 'Benin City' },
    { href: 'web-design-port-harcourt.html', label: 'Port Harcourt' },
    { href: 'web-design-ibadan.html', label: 'Ibadan' }
  ];

  function currentFile() {
    const p = window.location.pathname.split('/').pop();
    return p === '' ? 'index.html' : p;
  }

  function rootPrefix() {
    return window.location.pathname.includes('/client/') || window.location.pathname.includes('/admin/') ? '../' : '';
  }

  function headerHTML() {
    const root = rootPrefix();
    const cur = currentFile();
    const svcActive = serviceLinks.some(s => s.href === cur);
    const locActive = locationLinks.some(s => s.href === cur);
    const links = nav.map(n => {
      if (n.href === 'services.html') {
        return `
      <div class="relative group">
        <a href="${root}services.html" class="nav-link text-sm font-medium ${(cur === 'services.html' || svcActive) && root === '' ? 'active text-white' : 'text-slate-300'} hover:text-white transition inline-flex items-center gap-1">Services
          <svg class="w-3 h-3 transition-transform group-hover:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
        </a>
        <div class="absolute left-0 top-full pt-3 hidden group-hover:block group-hover:opacity-100 group-hover:visible z-50 transition-all duration-200">
          <div class="glass rounded-xl p-2 min-w-[240px] shadow-lg border border-white/10">
            ${serviceLinks.map(s => `<a href="${root}${s.href}" class="mobile-menu-item block px-4 py-3 rounded-lg text-sm ${cur === s.href ? 'text-white bg-gradient-to-r from-white/10 to-white/5' : 'text-slate-300'} hover:text-white hover:bg-white/5 transition">${s.label}</a>`).join('')}
          </div>
        </div>
      </div>`;
      }
      if (n.href === 'locations') {
        return `
      <div class="relative group">
        <a href="${root}web-design-lagos.html" class="nav-link text-sm font-medium ${locActive && root === '' ? 'active text-white' : 'text-slate-300'} hover:text-white transition inline-flex items-center gap-1">Locations
          <svg class="w-3 h-3 transition-transform group-hover:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
        </a>
        <div class="absolute left-0 top-full pt-3 hidden group-hover:block group-hover:opacity-100 group-hover:visible z-50 transition-all duration-200">
          <div class="glass rounded-xl p-2 min-w-[200px] shadow-lg border border-white/10">
            ${locationLinks.map(s => `<a href="${root}${s.href}" class="mobile-menu-item block px-4 py-3 rounded-lg text-sm ${cur === s.href ? 'text-white bg-gradient-to-r from-white/10 to-white/5' : 'text-slate-300'} hover:text-white hover:bg-white/5 transition">${s.label}</a>`).join('')}
          </div>
        </div>
      </div>`;
      }
      return `<a href="${root}${n.href}" class="nav-link text-sm font-medium ${cur === n.href && root === '' ? 'active text-white' : 'text-slate-300'} hover:text-white transition">${n.label}</a>`;
    }).join('');
    return `
    <header class="fixed top-0 inset-x-0 z-50">
      <div class="mx-auto max-w-7xl px-5 lg:px-8">
        <div class="mt-3 glass rounded-2xl flex items-center justify-between px-5 py-3">
          <a href="${root}index.html" class="flex items-center gap-2 group">
            <img src="${root}assets/img/logo-icon.png" alt="King Praise Web Design" class="logo-icon">
            <span class="font-display font-semibold tracking-tight text-lg hidden sm:inline" style="color:var(--text)">King Praise <span class="text-gradient">Web Design</span></span>
          </a>
          <nav class="hidden lg:flex items-center gap-7">${links}</nav>
          <div class="hidden lg:flex items-center gap-3">
            <a href="${root}client/login.html" class="btn-ghost text-sm px-4 py-2 rounded-lg">Client Login</a>
            <a href="${root}contact.html#schedule" class="btn-primary text-sm px-4 py-2 rounded-lg">Book a Call</a>
          </div>
          <div class="flex items-center gap-2 lg:hidden">
            <button id="menu-btn" class="text-white p-2" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h16"/></svg>
            </button>
          </div>
        </div>
      </div>
      <div id="mobile-menu-overlay" class="mobile-menu-overlay" hidden></div>
      <div id="mobile-menu" class="mobile-menu glass" aria-hidden="true">
        <div class="flex items-center justify-between mb-6">
          <span class="font-display font-semibold text-white text-lg">Menu</span>
          <button id="menu-close-btn" class="text-white p-2" aria-label="Close menu">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="flex flex-col gap-4">
          ${nav.filter(n => n.href !== 'locations').map(n => `<a href="${root}${n.href}" class="text-slate-200 hover:text-white font-medium">${n.label}</a>`).join('')}
          <div class="pl-3 border-l border-white/10 flex flex-col gap-3">
            ${serviceLinks.map(s => `<a href="${root}${s.href}" class="text-slate-400 hover:text-white text-sm">${s.label}</a>`).join('')}
          </div>
          <span class="text-slate-200 font-medium">Locations</span>
          <div class="pl-3 border-l border-white/10 flex flex-col gap-3">
            ${locationLinks.map(s => `<a href="${root}${s.href}" class="text-slate-400 hover:text-white text-sm">${s.label}</a>`).join('')}
          </div>
          <hr class="border-white/10">
          <a href="${root}client/login.html" class="btn-ghost text-center px-4 py-2 rounded-lg">Client Login</a>
          <a href="${root}admin/login.html" class="text-sm text-center font-medium transition rounded-lg py-2" style="color:var(--text);background:var(--surface-2);border:1px solid var(--border)">Admin Login</a>
          <a href="${root}contact.html#schedule" class="btn-primary text-center px-4 py-2 rounded-lg">Book a Call</a>
        </div>
      </div>
    </header>`;
  }

  function footerHTML() {
    const root = rootPrefix();
    return `
    <footer class="border-t border-white/10 mt-24" style="background:var(--surface)">
      <div class="max-w-7xl mx-auto px-5 lg:px-8 py-14 grid md:grid-cols-4 gap-10">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <img src="${root}assets/img/logo-icon.png" alt="King Praise Web Design" class="logo-icon">
            <span class="font-display font-semibold" style="color:var(--text)">King Praise <span class="text-gradient">Web Design</span></span>
          </div>
          <p class="text-slate-400 text-sm leading-relaxed">Premium websites, e-commerce and custom software built as one system for growth, with no cookie-cutter templates and no corporate fluff.</p>
        </div>
        <div>
          <h4 class="font-display font-semibold text-white mb-4 text-sm tracking-wide uppercase">Company</h4>
          <ul class="space-y-2 text-sm text-slate-400">
            <li><a href="${root}about.html" class="hover:text-white transition">About &amp; Team</a></li>
            <li><a href="${root}portfolio.html" class="hover:text-white transition">Portfolio</a></li>
            <li><a href="${root}blog.html" class="hover:text-white transition">Blog</a></li>
            <li><a href="${root}pricing.html" class="hover:text-white transition">Pricing</a></li>
            <li><a href="${root}web-design-lagos.html" class="hover:text-white transition">Web Design in Lagos</a></li>
            <li><a href="${root}web-design-abuja.html" class="hover:text-white transition">Web Design in Abuja</a></li>
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
            <li class="text-slate-500">Remote Company, Global Delivery</li>
          </ul>
        </div>
      </div>

      <div class="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        &copy; <span id="copyright-year"></span> King Praise Web Design. All rights reserved.
      </div>
    </footer>`;
  }

  const THEME_KEY = 'kpwd-theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function initTheme() {
    applyTheme('light');
  }

  function whatsappHTML() {
    return `
    <a href="https://wa.me/2349030232048" target="_blank" rel="noopener" class="wa-float" aria-label="Chat with us on WhatsApp">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" width="28" height="28"><path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.386.7 4.607 1.91 6.47L4 29l7.72-1.87A11.94 11.94 0 0016.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3zm0 21.8c-2.02 0-3.9-.57-5.5-1.56l-.394-.24-4.583 1.11 1.15-4.47-.256-.41A9.77 9.77 0 016.2 15c0-5.41 4.395-9.8 9.804-9.8 5.41 0 9.8 4.39 9.8 9.8 0 5.41-4.39 9.8-9.8 9.8zm5.37-7.34c-.29-.145-1.727-.852-1.995-.95-.267-.098-.462-.145-.657.146-.194.29-.755.95-.926 1.145-.17.194-.34.218-.63.073-.29-.146-1.224-.451-2.332-1.437-.862-.768-1.444-1.716-1.613-2.007-.17-.29-.018-.447.128-.591.13-.13.29-.34.435-.51.146-.17.194-.29.29-.485.097-.194.049-.364-.024-.51-.073-.145-.657-1.584-.9-2.169-.237-.568-.478-.49-.657-.5-.17-.008-.364-.01-.559-.01-.194 0-.51.073-.777.364-.267.29-1.02 1-1.02 2.436s1.045 2.824 1.19 3.02c.146.194 2.057 3.14 4.985 4.404.696.3 1.24.48 1.663.615.699.222 1.335.19 1.838.115.56-.084 1.727-.706 1.97-1.388.243-.681.243-1.266.17-1.388-.073-.122-.267-.194-.558-.34z"/></svg>
    </a>`;
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
    const menuCloseBtn = document.getElementById('menu-close-btn');
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-menu-overlay');
    function openMenu() {
      if (!menu || !overlay) return;
      overlay.hidden = false;
      requestAnimationFrame(() => {
        menu.classList.add('open');
        overlay.classList.add('open');
      });
      menu.setAttribute('aria-hidden', 'false');
      menuBtn && menuBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
    }
    function closeMenu() {
      if (!menu || !overlay) return;
      menu.classList.remove('open');
      overlay.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      menuBtn && menuBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      setTimeout(() => { if (!menu.classList.contains('open')) overlay.hidden = true; }, 300);
    }
    if (menuBtn && menu) {
      menuBtn.addEventListener('click', openMenu);
      menuCloseBtn && menuCloseBtn.addEventListener('click', closeMenu);
      overlay && overlay.addEventListener('click', closeMenu);
      menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    }
    if (!document.getElementById('wa-float-btn') && !document.body.classList.contains('no-wa-float')) {
      const wa = document.createElement('div');
      wa.id = 'wa-float-btn';
      wa.innerHTML = whatsappHTML();
      document.body.appendChild(wa);
    }
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

  window.KPWD_UI = { mountChrome, initReveal, toast, rootPrefix, initTheme, hidePageLoader };

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    mountChrome();
    initReveal();
  });

  window.addEventListener('load', () => {
    setTimeout(hidePageLoader, 250);
  });
  // Guaranteed fallback in case the load event or ui.js itself is delayed/blocked ,
  // the CSS animation on .page-loader also self-dismisses independently after 3.2s.
  setTimeout(hidePageLoader, 1800);
})();
