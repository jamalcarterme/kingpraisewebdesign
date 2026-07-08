(function () {
  const api = window.KPWD_API;

  function skeletonCards(n, h) {
    return Array.from({ length: n }).map(() => `<div class="skeleton rounded-2xl" style="height:${h}px"></div>`).join('');
  }

  async function loadAnnouncements() {
    try {
      const data = await api.get('/announcements', { auth: false });
      const list = (data.announcements || data.data || []).filter(a => a.isActive !== false && a.audience !== 'clients');
      const bar = document.getElementById('announcement-bar');
      if (!list.length || !bar) return;
      const a = list.find(x => x.isPinned) || list[0];
      const colors = { info: 'bg-[var(--brand)]', success: 'bg-emerald-600', warning: 'bg-amber-600', urgent: 'bg-rose-600' };
      bar.innerHTML = `<div class="${colors[a.type] || colors.info} text-white text-sm text-center py-2 px-4">
        <strong class="font-semibold">${a.title}:</strong> ${a.message}
      </div>`;
      bar.classList.remove('hidden');
    } catch (e) { /* silent */ }
  }

  async function loadProjects() {
    const grid = document.getElementById('featured-projects');
    if (!grid) return;
    grid.innerHTML = skeletonCards(3, 300);
    try {
      const data = await api.get('/projects', { auth: false });
      const projects = (data.projects || data.data || []).filter(p => p.isFeatured).slice(0, 3);
      const list = projects.length ? projects : (data.projects || data.data || []).slice(0, 3);
      if (!list.length) { grid.innerHTML = '<p class="text-slate-400 col-span-3 text-center">Portfolio coming soon.</p>'; return; }
      grid.innerHTML = list.map(p => `
        <a href="portfolio.html" class="reveal glass rounded-2xl overflow-hidden card-hover group">
          <div class="aspect-[4/3] overflow-hidden bg-[var(--surface-2)]">
            <img src="${p.image?.url || ''}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.style.display='none'">
          </div>
          <div class="p-6">
            <span class="text-xs font-semibold text-[var(--brand-2)] uppercase tracking-wide">${p.category || 'Website'}</span>
            <h3 class="font-display text-lg font-semibold text-white mt-1">${p.title}</h3>
            <p class="text-slate-400 text-sm mt-2 clamp-2">${p.description || ''}</p>
          </div>
        </a>`).join('');
      window.KPWD_UI.initReveal();
    } catch (e) { grid.innerHTML = '<p class="text-slate-400 col-span-3 text-center">Portfolio coming soon.</p>'; }
  }

  async function loadTestimonials() {
    const track = document.getElementById('testimonials-track');
    if (!track) return;
    try {
      const data = await api.get('/testimonials', { auth: false });
      const list = (data.testimonials || data.data || []).filter(t => t.isActive !== false);
      if (!list.length) { document.getElementById('testimonials-section')?.classList.add('hidden'); return; }
      track.innerHTML = list.map(t => `
        <div class="reveal glass rounded-2xl p-7 card-hover min-w-[300px] max-w-sm">
          <div class="flex gap-1 text-amber-400 mb-3">${'\u2605'.repeat(t.rating || 5)}</div>
          <p class="text-slate-200 text-sm leading-relaxed">&ldquo;${t.quote}&rdquo;</p>
          <div class="flex items-center gap-3 mt-5">
            <img src="${t.photo?.url || ''}" onerror="this.style.display='none'" class="w-10 h-10 rounded-full object-cover bg-[var(--surface-2)]">
            <div>
              <p class="text-white text-sm font-semibold">${t.name}</p>
              <p class="text-slate-500 text-xs">${t.role || ''}${t.country ? ' &middot; ' + t.country : ''}</p>
            </div>
          </div>
        </div>`).join('');
      window.KPWD_UI.initReveal();
    } catch (e) { document.getElementById('testimonials-section')?.classList.add('hidden'); }
  }

  async function loadGoogleReviews() {
    const box = document.getElementById('google-reviews');
    if (!box) return;
    try {
      const data = await api.get('/reviews/google', { auth: false });
      if (!data.configured || !data.reviews?.length) { document.getElementById('google-reviews-section')?.classList.add('hidden'); return; }
      document.getElementById('google-rating-summary').innerHTML = `
        <span class="text-3xl font-display font-bold text-white">${data.rating || ''}</span>
        <span class="text-amber-400 text-lg">${'\u2605'.repeat(Math.round(data.rating || 5))}</span>
        <span class="text-slate-400 text-sm">(${data.totalRatings || 0} Google reviews)</span>`;
      box.innerHTML = data.reviews.slice(0, 6).map(r => `
        <div class="reveal glass rounded-2xl p-6 card-hover">
          <div class="flex items-center gap-3 mb-3">
            <img src="${r.photo || ''}" onerror="this.style.display='none'" class="w-9 h-9 rounded-full">
            <div>
              <p class="text-white text-sm font-semibold">${r.author}</p>
              <p class="text-amber-400 text-xs">${'\u2605'.repeat(r.rating || 5)}</p>
            </div>
          </div>
          <p class="text-slate-300 text-sm clamp-3">${r.text}</p>
        </div>`).join('');
      const link = document.getElementById('google-profile-link');
      if (link && data.profileUrl) link.href = data.profileUrl;
      window.KPWD_UI.initReveal();
    } catch (e) { document.getElementById('google-reviews-section')?.classList.add('hidden'); }
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadAnnouncements();
    loadProjects();
    loadTestimonials();
    loadGoogleReviews();
  });
})();
