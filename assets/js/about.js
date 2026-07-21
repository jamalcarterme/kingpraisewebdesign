(function () {
  const api = window.KPWD_API;

  async function loadTeam() {
    const grid = document.getElementById('team-grid');
    grid.innerHTML = Array.from({ length: 4 }).map(() => '<div class="skeleton rounded-2xl" style="height:280px"></div>').join('');
    try {
      const data = await api.get('/team', { auth: false });
      const list = (data.team || data.data || []).filter(t => t.isActive !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
      if (!list.length) { grid.innerHTML = '<p class="text-slate-400 col-span-full text-center">Team profiles coming soon.</p>'; return; }
      grid.innerHTML = list.map(m => `
        <div class="reveal glass rounded-2xl p-6 text-center card-hover">
          <img src="${m.photo?.url || ''}" alt="${m.name || 'Team member'}" onerror="this.style.display='none'" class="w-24 h-24 rounded-full object-cover mx-auto bg-[var(--surface-2)]" loading="lazy" decoding="async">
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
    } catch (e) { grid.innerHTML = '<p class="text-slate-400 col-span-full text-center">Team profiles coming soon.</p>'; }
  }

  async function loadAnnouncements() {
    const list = document.getElementById('announcements-list');
    if (!list) return;
    try {
      const data = await api.get('/announcements', { auth: false });
      const anns = (data.announcements || data.data || []).filter(a => a.isActive !== false && a.audience !== 'clients');
      if (!anns.length) { list.innerHTML = '<p class="text-slate-400">No announcements right now.</p>'; return; }
      const colors = { info: 'text-[var(--brand-2)]', success: 'text-emerald-400', warning: 'text-amber-400', urgent: 'text-rose-400' };
      list.innerHTML = anns.map(a => `
        <div class="reveal glass rounded-xl p-5">
          <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${colors[a.type] || colors.info}">
            ${a.isPinned ? '\ud83d\udccc ' : ''}${a.type}
          </div>
          <h4 class="text-white font-semibold mt-2">${a.title}</h4>
          <p class="text-slate-400 text-sm mt-1">${a.message}</p>
        </div>`).join('');
      window.KPWD_UI.initReveal();
    } catch (e) { list.innerHTML = ''; }
  }

  document.addEventListener('DOMContentLoaded', () => { loadTeam(); loadAnnouncements(); });
})();
