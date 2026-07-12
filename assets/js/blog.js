(function () {
  const api = window.KPWD_API;
  let all = [];

  function card(p) {
    const date = new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    return `
    <a href="blog-post.html?slug=${p.slug}" class="reveal glass rounded-2xl overflow-hidden card-hover group">
      <div class="aspect-[16/10] overflow-hidden bg-[var(--surface-2)]">
        <img src="${p.coverImage?.url || ''}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.style.display='none'">
      </div>
      <div class="p-6">
        <div class="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span class="text-[var(--brand-2)] font-semibold uppercase">${p.category || 'General'}</span>&middot;<span>${date}</span>
        </div>
        <h3 class="font-display text-lg font-semibold text-white clamp-2">${p.title}</h3>
        <p class="text-slate-400 text-sm mt-2 clamp-3">${p.excerpt}</p>
        <span class="inline-block text-[var(--brand-2)] text-xs font-semibold mt-3 group-hover:underline">Read full article &rarr;</span>
      </div>
    </a>`;
  }

  function render(list) {
    const grid = document.getElementById('blog-grid');
    grid.innerHTML = list.length ? list.map(card).join('') : '<p class="text-slate-400 col-span-full text-center py-12">No articles found.</p>';
    window.KPWD_UI.initReveal();
  }

  function buildFilters() {
    const cats = ['All', ...new Set(all.map(p => p.category).filter(Boolean))];
    document.getElementById('blog-filters').innerHTML = cats.map((c, i) => `
      <button data-cat="${c}" class="filter-btn ${i === 0 ? 'btn-primary' : 'btn-ghost'} px-4 py-2 rounded-lg text-sm">${c}</button>`).join('');
    document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-ghost'); });
      btn.classList.remove('btn-ghost'); btn.classList.add('btn-primary');
      applyFilters();
    }));
  }

  function applyFilters() {
    const activeCat = document.querySelector('.filter-btn.btn-primary')?.dataset.cat || 'All';
    const q = document.getElementById('blog-search').value.trim().toLowerCase();
    let list = activeCat === 'All' ? all : all.filter(p => p.category === activeCat);
    if (q) list = list.filter(p => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q));
    render(list);
  }

  async function load() {
    const grid = document.getElementById('blog-grid');
    grid.innerHTML = Array.from({ length: 6 }).map(() => '<div class="skeleton rounded-2xl" style="height:320px"></div>').join('');
    try {
      const data = await api.get('/blog', { auth: false });
      all = (data.posts || data.data || []).filter(p => p.status !== 'draft');
      buildFilters();
      render(all);
      document.getElementById('blog-search').addEventListener('input', applyFilters);
    } catch (e) {
      grid.innerHTML = '<p class="text-slate-400 col-span-full text-center py-12">Unable to load articles right now.</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', load);
})();
