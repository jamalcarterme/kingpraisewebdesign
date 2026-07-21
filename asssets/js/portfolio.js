(function () {
  const api = window.KPWD_API;
  let all = [];

  function render(list) {
    const grid = document.getElementById('portfolio-grid');
    if (!list.length) { grid.innerHTML = '<p class="text-slate-400 col-span-full text-center py-12">No projects in this category yet.</p>'; return; }
    grid.innerHTML = list.map(p => `
      <div class="reveal glass rounded-2xl overflow-hidden card-hover group">
        <div class="aspect-[4/3] overflow-hidden bg-[var(--surface-2)] relative">
          <img src="${p.image?.url || ''}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.style.display='none'" loading="lazy" decoding="async">
          ${p.isFeatured ? '<span class="absolute top-3 left-3 badge bg-[var(--brand)] text-white">Featured</span>' : ''}
        </div>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[var(--brand-2)] uppercase tracking-wide">${p.category || 'Website'}</span>
            ${p.country ? `<span class="text-xs text-slate-500">${p.country}</span>` : ''}
          </div>
          <h3 class="font-display text-lg font-semibold text-white mt-1">${p.title}</h3>
          ${p.client ? `<p class="text-slate-500 text-xs mt-1">for ${p.client}</p>` : ''}
          <p class="text-slate-400 text-sm mt-2 clamp-3">${p.description || ''}</p>
          <div class="flex flex-wrap gap-2 mt-4">
            ${(p.tags || []).slice(0, 4).map(t => `<span class="text-xs px-2 py-1 rounded-full bg-white/5 text-slate-300">${t}</span>`).join('')}
          </div>
          ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" class="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-2)] hover:underline">Visit live site &rarr;</a>` : ''}
        </div>
      </div>`).join('');
    window.KPWD_UI.initReveal();
  }

  function buildFilters() {
    const cats = ['All', ...new Set(all.map(p => p.category).filter(Boolean))];
    document.getElementById('portfolio-filters').innerHTML = cats.map((c, i) => `
      <button data-cat="${c}" class="filter-btn ${i === 0 ? 'btn-primary' : 'btn-ghost'} px-4 py-2 rounded-lg text-sm">${c}</button>`).join('');
    document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-ghost'); });
      btn.classList.remove('btn-ghost'); btn.classList.add('btn-primary');
      const cat = btn.dataset.cat;
      render(cat === 'All' ? all : all.filter(p => p.category === cat));
    }));
  }

  async function load() {
    const grid = document.getElementById('portfolio-grid');
    grid.innerHTML = Array.from({ length: 6 }).map(() => '<div class="skeleton rounded-2xl" style="height:340px"></div>').join('');
    try {
      const data = await api.get('/projects', { auth: false });
      all = (data.projects || data.data || []).sort((a, b) => (a.order || 0) - (b.order || 0));
      buildFilters();
      render(all);
    } catch (e) {
      grid.innerHTML = '<p class="text-slate-400 col-span-full text-center py-12">Unable to load portfolio right now. Please try again shortly.</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', load);
})();
