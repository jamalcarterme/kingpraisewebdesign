(function () {
  const api = window.KPWD_API;

  function guard() {
    const user = api.getUser();
    if (!user || user.role !== 'client' || !api.getToken()) {
      window.location.href = 'login.html';
      return false;
    }
    document.getElementById('client-name').textContent = user.name;
    return true;
  }

  const statusColors = {
    'not-started': 'bg-slate-500/20 text-slate-300',
    'in-progress': 'bg-blue-500/20 text-blue-300',
    'in-review': 'bg-amber-500/20 text-amber-300',
    'completed': 'bg-emerald-500/20 text-emerald-300',
    'on-hold': 'bg-rose-500/20 text-rose-300'
  };

  function projectCard(p) {
    const milestones = p.milestones || [];
    const done = milestones.filter(m => m.status === 'completed').length;
    return `
    <div class="reveal glass rounded-2xl p-7">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 class="font-display text-xl font-semibold text-white">${p.projectName}</h3>
          <p class="text-slate-500 text-sm">${p.projectType || 'Website'} ${p.startDate ? '&middot; started ' + new Date(p.startDate).toLocaleDateString() : ''}</p>
        </div>
        <span class="badge ${statusColors[p.status] || 'bg-slate-500/20 text-slate-300'}">${(p.status || '').replace('-', ' ')}</span>
      </div>
      <p class="text-slate-400 text-sm mt-4">${p.description || ''}</p>
      <div class="mt-5">
        <div class="flex justify-between text-xs text-slate-500 mb-1"><span>Progress</span><span>${p.progressPercent || 0}%</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${p.progressPercent || 0}%"></div></div>
      </div>
      ${milestones.length ? `
      <div class="mt-6">
        <p class="text-xs text-slate-500 uppercase font-semibold mb-3">Milestones (${done}/${milestones.length} complete)</p>
        <ul class="space-y-2">
          ${milestones.sort((a, b) => (a.order || 0) - (b.order || 0)).map(m => `
            <li class="flex items-center gap-3 text-sm">
              <span class="w-2 h-2 rounded-full ${m.status === 'completed' ? 'bg-emerald-400' : m.status === 'blocked' ? 'bg-rose-400' : m.status === 'in-progress' ? 'bg-blue-400' : 'bg-slate-500'}"></span>
              <span class="text-slate-300 flex-1">${m.title}</span>
              <span class="text-xs text-slate-500 capitalize">${m.status.replace('-', ' ')}</span>
            </li>`).join('')}
        </ul>
      </div>` : ''}
      ${(p.notes || []).length ? `
      <div class="mt-6 border-t border-white/10 pt-4">
        <p class="text-xs text-slate-500 uppercase font-semibold mb-3">Updates from our team</p>
        <ul class="space-y-3">
          ${p.notes.slice().reverse().map(n => `<li class="text-sm text-slate-300 bg-white/5 rounded-lg p-3">${n.text}<div class="text-xs text-slate-500 mt-1">${new Date(n.createdAt).toLocaleString()}</div></li>`).join('')}
        </ul>
      </div>` : ''}
    </div>`;
  }

  async function loadProjects() {
    const container = document.getElementById('projects-container');
    container.innerHTML = '<div class="skeleton rounded-2xl" style="height:220px"></div>';
    try {
      const data = await api.get('/client-projects/mine');
      const list = data.projects || [];
      container.innerHTML = list.length ? list.map(projectCard).join('') : '<div class="glass rounded-2xl p-10 text-center text-slate-400">No active projects yet. Reach out to your account manager to get started.</div>';
      window.KPWD_UI.initReveal();
    } catch (e) {
      container.innerHTML = '<div class="glass rounded-2xl p-10 text-center text-slate-400">Unable to load your projects right now.</div>';
    }
  }

  function handleLogout() {
    const btn = document.getElementById('logout-btn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      try { await api.post('/auth/logout', {}); } catch (e) {}
      api.setToken(null); api.setUser(null);
      window.location.href = 'login.html';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!guard()) return;
    loadProjects();
    handleLogout();
  });
})();
