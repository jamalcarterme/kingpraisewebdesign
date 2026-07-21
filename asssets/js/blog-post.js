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
      const pageUrl = `https://www.kingpraisewebdesign.name.ng/blog-post.html?slug=${p.slug}`;
      const metaDesc = (p.excerpt || p.title).slice(0, 160);
      const setMeta = (id, attr, val) => { const el = document.getElementById(id); if (el) el.setAttribute(attr, val); };
      document.querySelector('meta[name="description"]')?.setAttribute('content', metaDesc);
      setMeta('canonical-link', 'href', pageUrl);
      setMeta('og-title', 'content', p.title);
      setMeta('og-description', 'content', metaDesc);
      setMeta('og-url', 'content', pageUrl);
      if (p.coverImage?.url) setMeta('og-image', 'content', p.coverImage.url);
      setMeta('twitter-title', 'content', p.title);
      setMeta('twitter-description', 'content', metaDesc);
      if (p.coverImage?.url) setMeta('twitter-image', 'content', p.coverImage.url);

      const ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: p.title,
        description: metaDesc,
        image: p.coverImage?.url ? [p.coverImage.url] : undefined,
        datePublished: p.createdAt,
        dateModified: p.updatedAt || p.createdAt,
        author: { '@type': 'Organization', name: 'King Praise Web Design' },
        publisher: {
          '@type': 'Organization',
          name: 'King Praise Web Design',
          logo: { '@type': 'ImageObject', url: 'https://www.kingpraisewebdesign.name.ng/assets/img/logo-full.png' }
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl }
      });
      document.head.appendChild(ld);
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
