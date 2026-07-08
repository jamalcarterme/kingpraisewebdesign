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

  async function loadTeam() {
    const grid = document.getElementById('team-grid');
    if (!grid) return;
    grid.innerHTML = skeletonCards(4, 280);
    try {
      const data = await api.get('/team', { auth: false });
      const list = (data.team || data.data || []).filter(t => t.isActive !== false).sort((a, b) => (a.order || 0) - (b.order || 0)).slice(0, 4);
      if (!list.length) { document.getElementById('team-section')?.classList.add('hidden'); return; }
      grid.innerHTML = list.map(m => `
        <div class="reveal glass rounded-2xl p-6 text-center card-hover">
          <img src="${m.photo?.url || ''}" onerror="this.style.display='none'" class="w-24 h-24 rounded-full object-cover mx-auto bg-[var(--surface-2)]">
          <h3 class="font-display font-semibold text-white mt-4">${m.name}</h3>
          <p class="text-[var(--brand-2)] text-xs font-semibold uppercase tracking-wide mt-1">${m.role}</p>
          <p class="text-slate-400 text-sm mt-3 clamp-3">${m.bio || ''}</p>
          <div class="flex justify-center gap-3 mt-4 text-slate-500">
            ${m.socials?.linkedin ? `<a href="${m.socials.linkedin}" target="_blank" class="hover:text-white transition">in</a>` : ''}
            ${m.socials?.twitter ? `<a href="${m.socials.twitter}" target="_blank" class="hover:text-white transition">tw</a>` : ''}
            ${m.socials?.github ? `<a href="${m.socials.github}" target="_blank" class="hover:text-white transition">gh</a>` : ''}
            ${m.socials?.instagram ? `<a href="${m.socials.instagram}" target="_blank" class="hover:text-white transition">ig</a>` : ''}
          </div>
        </div>`).join('');
      window.KPWD_UI.initReveal();
    } catch (e) { document.getElementById('team-section')?.classList.add('hidden'); }
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

  /* Hero "live coding" typewriter animation */
  function initHeroTyper() {
    const el = document.getElementById('hero-code');
    if (!el) return;

    const cls = {
      kw: 'text-[var(--brand-3)]',
      id: 'text-white',
      op: 'text-slate-400',
      prop: 'text-[var(--brand-2)]',
      str: 'text-emerald-300',
      com: 'text-slate-500'
    };

    // Each snippet is an array of lines; each line is an array of {t, c} tokens
    const snippets = [
      [
        [{ t: 'const ', c: 'kw' }, { t: 'project', c: 'id' }, { t: ' = {', c: 'op' }],
        [{ t: '  client', c: 'prop' }, { t: ': ', c: 'op' }, { t: '"your-brand"', c: 'str' }, { t: ',', c: 'op' }],
        [{ t: '  stack', c: 'prop' }, { t: ': [', c: 'op' }, { t: '"design"', c: 'str' }, { t: ', ', c: 'op' }, { t: '"code"', c: 'str' }, { t: ', ', c: 'op' }, { t: '"growth"', c: 'str' }, { t: ']', c: 'op' }, { t: ',', c: 'op' }],
        [{ t: '  status', c: 'prop' }, { t: ': ', c: 'op' }, { t: '"shipped"', c: 'str' }],
        [{ t: '};', c: 'op' }]
      ],
      [
        [{ t: '// spin up a new build', c: 'com' }],
        [{ t: 'async function ', c: 'kw' }, { t: 'deploy', c: 'id' }, { t: '(site) {', c: 'op' }],
        [{ t: '  await ', c: 'kw' }, { t: 'build', c: 'id' }, { t: '(site);', c: 'op' }],
        [{ t: '  await ', c: 'kw' }, { t: 'test', c: 'id' }, { t: '(site);', c: 'op' }],
        [{ t: '  return ', c: 'kw' }, { t: '"live"', c: 'str' }, { t: ';', c: 'op' }],
        [{ t: '}', c: 'op' }]
      ],
      [
        [{ t: 'const ', c: 'kw' }, { t: 'results', c: 'id' }, { t: ' = {', c: 'op' }],
        [{ t: '  speed', c: 'prop' }, { t: ': ', c: 'op' }, { t: '"fast"', c: 'str' }, { t: ',', c: 'op' }],
        [{ t: '  design', c: 'prop' }, { t: ': ', c: 'op' }, { t: '"premium"', c: 'str' }, { t: ',', c: 'op' }],
        [{ t: '  clients', c: 'prop' }, { t: ': ', c: 'op' }, { t: '"happy"', c: 'str' }],
        [{ t: '};', c: 'op' }]
      ]
    ];

    function escapeHtml(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function flatten(lines) {
      const tokens = [];
      lines.forEach((line, i) => {
        if (i > 0) tokens.push({ brk: true });
        line.forEach(t => tokens.push(t));
      });
      return tokens;
    }

    function totalLen(tokens) {
      return tokens.reduce((n, t) => n + (t.brk ? 1 : t.t.length), 0);
    }

    function render(tokens, count) {
      let out = '';
      let remaining = count;
      for (const t of tokens) {
        if (remaining <= 0) break;
        if (t.brk) { out += '\n'; remaining--; continue; }
        const slice = t.t.slice(0, remaining);
        out += `<span class="${cls[t.c] || ''}">${escapeHtml(slice)}</span>`;
        remaining -= slice.length;
      }
      return out;
    }

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      const tokens = flatten(snippets[0]);
      el.innerHTML = render(tokens, totalLen(tokens)) + '<span class="caret">&nbsp;</span>';
      return;
    }

    const TYPE_SPEED = 34;
    const DELETE_SPEED = 16;
    const PAUSE_AFTER_TYPE = 1700;
    const PAUSE_BETWEEN = 650;

    let snippetIndex = 0;
    let charIndex = 0;
    let mode = 'typing'; // 'typing' | 'pausing' | 'deleting' | 'thinking'
    let modeStart = performance.now();

    function step(now) {
      const tokens = flatten(snippets[snippetIndex]);
      const max = totalLen(tokens);

      if (mode === 'typing') {
        el.innerHTML = render(tokens, charIndex) + '<span class="caret">&nbsp;</span>';
        if (charIndex >= max) { mode = 'pausing'; modeStart = now; }
        else { charIndex++; }
        setTimeout(() => requestAnimationFrame(step), TYPE_SPEED);
      } else if (mode === 'pausing') {
        if (now - modeStart >= PAUSE_AFTER_TYPE) mode = 'deleting';
        requestAnimationFrame(step);
      } else if (mode === 'deleting') {
        el.innerHTML = render(tokens, charIndex) + '<span class="caret">&nbsp;</span>';
        if (charIndex <= 0) { mode = 'thinking'; modeStart = now; }
        else { charIndex--; }
        setTimeout(() => requestAnimationFrame(step), DELETE_SPEED);
      } else if (mode === 'thinking') {
        el.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
        if (now - modeStart >= PAUSE_BETWEEN) {
          snippetIndex = (snippetIndex + 1) % snippets.length;
          charIndex = 0;
          mode = 'typing';
        }
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadAnnouncements();
    loadProjects();
    loadTeam();
    loadTestimonials();
    loadGoogleReviews();
    initHeroTyper();
  });
})();
