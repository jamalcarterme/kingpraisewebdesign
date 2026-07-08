(function () {
  const api = window.KPWD_API;

  async function load() {
    const slug = new URLSearchParams(window.location.search).get('slug');
    const container = document.getElementById('post-container');
    if (!slug) { container.innerHTML = '<p class="text-slate-400 text-center py-20">Post not found.</p>'; return; }
    try {
      const data = await api.get(`/blog/${slug}`, { auth: false });
      const p = data.post || data.data;
      if (!p) throw new Error('not found');
      document.title = `${p.title} \u2014 King Praise Web Design`;
      const date = new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      container.innerHTML = `
        <p class="text-[var(--brand-2)] text-sm font-semibold uppercase tracking-wide mb-3">${p.category || 'General'}</p>
        <h1 class="font-display text-3xl md:text-5xl font-bold text-white leading-tight">${p.title}</h1>
        <div class="flex items-center gap-3 text-slate-500 text-sm mt-5">
          <span>${date}</span><span>&middot;</span><span>${p.views || 0} views</span>
        </div>
        ${p.coverImage?.url ? `<img src="${p.coverImage.url}" class="w-full rounded-2xl mt-8 object-cover max-h-[480px]" onerror="this.style.display='none'">` : ''}
        <div class="prose-invert max-w-none mt-10 text-slate-300 leading-relaxed">${p.content}</div>
        <div class="flex flex-wrap gap-2 mt-10">
          ${(p.tags || []).map(t => `<span class="text-xs px-3 py-1 rounded-full bg-white/5 text-slate-300">#${t}</span>`).join('')}
        </div>`;
    } catch (e) {
      container.innerHTML = '<p class="text-slate-400 text-center py-20">This article could not be found.</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', load);
})();
