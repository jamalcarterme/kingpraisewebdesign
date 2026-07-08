(function () {
  const api = window.KPWD_API;
  const BASE = window.KPWD.API_BASE;

  /* ---------- guard + shell ---------- */
  function guard() {
    const user = api.getUser();
    if (!user || user.role !== 'admin' || !api.getToken()) { window.location.href = 'login.html'; return false; }
    document.getElementById('admin-name').textContent = user.name;
    return true;
  }

  function showToast(msg, type) { window.KPWD_UI.toast(msg, type); }

  const sections = ['overview', 'projects', 'blog', 'team', 'testimonials', 'announcements', 'bookings', 'contact', 'clients'];

  function switchSection(name) {
    sections.forEach(s => {
      document.getElementById(`panel-${s}`).classList.toggle('hidden', s !== name);
      document.getElementById(`tab-${s}`).classList.toggle('bg-white/10', s === name);
      document.getElementById(`tab-${s}`).classList.toggle('text-white', s === name);
    });
    const loaders = { overview: loadOverview, projects: loadProjects, blog: loadBlog, team: loadTeam, testimonials: loadTestimonials, announcements: loadAnnouncements, bookings: loadBookings, contact: loadContact, clients: loadClientProjects };
    loaders[name] && loaders[name]();
    window.location.hash = name;
  }

  /* ---------- modal ---------- */
  function openModal(title, bodyHTML) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('admin-modal').classList.remove('hidden');
  }
  function closeModal() { document.getElementById('admin-modal').classList.add('hidden'); }

  /* ---------- generic multipart request ---------- */
  async function sendForm(path, method, formEl) {
    const fd = new FormData(formEl);
    return api[method === 'POST' ? 'post' : 'put'](path, fd, { isForm: true });
  }

  /* ================= PROJECTS ================= */
  async function loadProjects() {
    const body = document.getElementById('projects-tbody');
    body.innerHTML = `<tr><td colspan="6" class="text-slate-500 py-6 text-center">Loading...</td></tr>`;
    try {
      const data = await api.get('/projects', { auth: false });
      const list = data.projects || data.data || [];
      body.innerHTML = list.length ? list.map(p => `
        <tr>
          <td><img src="${p.image?.url || ''}" class="w-12 h-12 rounded object-cover bg-[var(--surface-2)]" onerror="this.style.display='none'"></td>
          <td class="text-white font-medium">${p.title}${p.isFeatured ? ' <span class="badge bg-[var(--brand)] text-white ml-1">Featured</span>' : ''}</td>
          <td>${p.category || ''}</td>
          <td>${p.client || ''}</td>
          <td>${p.country || ''}</td>
          <td class="text-right whitespace-nowrap">
            <button class="text-[var(--brand-2)] hover:underline mr-3" onclick='adminProjects.edit(${JSON.stringify(p).replace(/'/g, "&#39;")})'>Edit</button>
            <button class="text-rose-400 hover:underline" onclick="adminProjects.remove('${p._id}')">Delete</button>
          </td>
        </tr>`).join('') : `<tr><td colspan="6" class="text-slate-500 py-6 text-center">No projects yet.</td></tr>`;
    } catch (e) { body.innerHTML = `<tr><td colspan="6" class="text-rose-400 py-6 text-center">Failed to load.</td></tr>`; }
  }

  function projectFormHTML(p = {}) {
    return `
    <form id="project-form" class="space-y-4">
      <input type="hidden" name="_id" value="${p._id || ''}">
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="form-label">Title</label><input required name="title" value="${p.title || ''}" class="form-input"></div>
        <div><label class="form-label">Client name</label><input name="client" value="${p.client || ''}" class="form-input"></div>
      </div>
      <div class="grid sm:grid-cols-3 gap-4">
        <div><label class="form-label">Category</label>
          <select name="category" class="form-input">
            ${['Website', 'Mobile App', 'Custom Software', 'E-Commerce', 'Web Application', 'Other'].map(c => `<option ${p.category === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div><label class="form-label">Country</label><input name="country" value="${p.country || ''}" class="form-input"></div>
        <div><label class="form-label">Order</label><input type="number" name="order" value="${p.order || 0}" class="form-input"></div>
      </div>
      <div><label class="form-label">Description</label><textarea required name="description" rows="3" class="form-input">${p.description || ''}</textarea></div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="form-label">Live URL</label><input name="liveUrl" value="${p.liveUrl || ''}" class="form-input"></div>
        <div><label class="form-label">Tags (comma separated)</label><input name="tags" value="${(p.tags || []).join(', ')}" class="form-input"></div>
      </div>
      <div class="flex items-center gap-3"><input type="checkbox" name="isFeatured" id="isFeatured" ${p.isFeatured ? 'checked' : ''} class="w-4 h-4"><label for="isFeatured" class="text-sm text-slate-300">Featured project</label></div>
      <div><label class="form-label">Image ${p._id ? '(leave empty to keep current)' : ''}</label><input type="file" name="image" accept="image/*" class="form-input"></div>
      <button class="btn-primary w-full py-3 rounded-lg">${p._id ? 'Update' : 'Create'} Project</button>
    </form>`;
  }

  window.adminProjects = {
    create() { openModal('New Project', projectFormHTML()); bindProjectForm(); },
    edit(p) { openModal('Edit Project', projectFormHTML(p)); bindProjectForm(); },
    async remove(id) {
      if (!confirm('Delete this project?')) return;
      try { await api.del(`/projects/${id}`); showToast('Project deleted', 'success'); loadProjects(); } catch (e) { showToast(e.message, 'error'); }
    }
  };

  function bindProjectForm() {
    const form = document.getElementById('project-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = form._id.value;
      // tags -> convert csv string to repeated fields for FormData
      const tagsInput = form.querySelector('[name="tags"]');
      const tagsVal = tagsInput.value; tagsInput.remove();
      const fd = new FormData(form);
      tagsVal.split(',').map(t => t.trim()).filter(Boolean).forEach(t => fd.append('tags[]', t));
      if (!fd.has('isFeatured')) fd.append('isFeatured', 'false');
      try {
        if (id) await api.put(`/projects/${id}`, fd, { isForm: true });
        else await api.post('/projects', fd, { isForm: true });
        showToast('Saved', 'success'); closeModal(); loadProjects();
      } catch (err) { showToast(err.message, 'error'); }
    });
  }

  /* ================= BLOG ================= */
  async function loadBlog() {
    const body = document.getElementById('blog-tbody');
    body.innerHTML = `<tr><td colspan="5" class="text-slate-500 py-6 text-center">Loading...</td></tr>`;
    try {
      const data = await api.get('/blog', { auth: false });
      const list = data.posts || data.data || [];
      body.innerHTML = list.length ? list.map(p => `
        <tr>
          <td><img src="${p.coverImage?.url || ''}" class="w-12 h-12 rounded object-cover bg-[var(--surface-2)]" onerror="this.style.display='none'"></td>
          <td class="text-white font-medium">${p.title}</td>
          <td>${p.category || ''}</td>
          <td><span class="badge ${p.status === 'published' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'}">${p.status}</span></td>
          <td class="text-right whitespace-nowrap">
            <button class="text-[var(--brand-2)] hover:underline mr-3" onclick='adminBlog.edit(${JSON.stringify(p).replace(/'/g, "&#39;")})'>Edit</button>
            <button class="text-rose-400 hover:underline" onclick="adminBlog.remove('${p._id}')">Delete</button>
          </td>
        </tr>`).join('') : `<tr><td colspan="5" class="text-slate-500 py-6 text-center">No posts yet.</td></tr>`;
    } catch (e) { body.innerHTML = `<tr><td colspan="5" class="text-rose-400 py-6 text-center">Failed to load.</td></tr>`; }
  }

  function blogFormHTML(p = {}) {
    return `
    <form id="blog-form" class="space-y-4">
      <input type="hidden" name="_id" value="${p._id || ''}">
      <div><label class="form-label">Title</label><input required name="title" value="${p.title || ''}" class="form-input"></div>
      <div><label class="form-label">Excerpt (max 240 chars)</label><textarea required maxlength="240" name="excerpt" rows="2" class="form-input">${p.excerpt || ''}</textarea></div>
      <div><label class="form-label">Content (HTML supported)</label><textarea required name="content" rows="6" class="form-input">${p.content || ''}</textarea></div>
      <div class="grid sm:grid-cols-3 gap-4">
        <div><label class="form-label">Category</label><input name="category" value="${p.category || 'General'}" class="form-input"></div>
        <div><label class="form-label">Tags (comma separated)</label><input name="tags" value="${(p.tags || []).join(', ')}" class="form-input"></div>
        <div><label class="form-label">Status</label>
          <select name="status" class="form-input">
            <option value="published" ${p.status === 'published' ? 'selected' : ''}>Published</option>
            <option value="draft" ${p.status === 'draft' ? 'selected' : ''}>Draft</option>
          </select>
        </div>
      </div>
      <div><label class="form-label">Cover image ${p._id ? '(leave empty to keep current)' : ''}</label><input type="file" name="coverImage" accept="image/*" class="form-input"></div>
      <button class="btn-primary w-full py-3 rounded-lg">${p._id ? 'Update' : 'Publish'} Post</button>
    </form>`;
  }

  window.adminBlog = {
    create() { openModal('New Blog Post', blogFormHTML()); bindBlogForm(); },
    edit(p) { openModal('Edit Blog Post', blogFormHTML(p)); bindBlogForm(); },
    async remove(id) {
      if (!confirm('Delete this post?')) return;
      try { await api.del(`/blog/${id}`); showToast('Post deleted', 'success'); loadBlog(); } catch (e) { showToast(e.message, 'error'); }
    }
  };

  function bindBlogForm() {
    const form = document.getElementById('blog-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = form._id.value;
      const tagsInput = form.querySelector('[name="tags"]');
      const tagsVal = tagsInput.value; tagsInput.remove();
      const fd = new FormData(form);
      tagsVal.split(',').map(t => t.trim()).filter(Boolean).forEach(t => fd.append('tags[]', t));
      try {
        if (id) await api.put(`/blog/${id}`, fd, { isForm: true });
        else await api.post('/blog', fd, { isForm: true });
        showToast('Saved', 'success'); closeModal(); loadBlog();
      } catch (err) { showToast(err.message, 'error'); }
    });
  }

  /* ================= TEAM ================= */
  async function loadTeam() {
    const body = document.getElementById('team-tbody');
    body.innerHTML = `<tr><td colspan="5" class="text-slate-500 py-6 text-center">Loading...</td></tr>`;
    try {
      const data = await api.get('/team', { auth: false });
      const list = data.team || data.data || [];
      body.innerHTML = list.length ? list.map(m => `
        <tr>
          <td><img src="${m.photo?.url || ''}" class="w-12 h-12 rounded-full object-cover bg-[var(--surface-2)]" onerror="this.style.display='none'"></td>
          <td class="text-white font-medium">${m.name}</td>
          <td>${m.role}</td>
          <td><span class="badge ${m.isActive !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'}">${m.isActive !== false ? 'Active' : 'Hidden'}</span></td>
          <td class="text-right whitespace-nowrap">
            <button class="text-[var(--brand-2)] hover:underline mr-3" onclick='adminTeam.edit(${JSON.stringify(m).replace(/'/g, "&#39;")})'>Edit</button>
            <button class="text-rose-400 hover:underline" onclick="adminTeam.remove('${m._id}')">Delete</button>
          </td>
        </tr>`).join('') : `<tr><td colspan="5" class="text-slate-500 py-6 text-center">No team members yet.</td></tr>`;
    } catch (e) { body.innerHTML = `<tr><td colspan="5" class="text-rose-400 py-6 text-center">Failed to load.</td></tr>`; }
  }

  function teamFormHTML(m = {}) {
    const s = m.socials || {};
    return `
    <form id="team-form" class="space-y-4">
      <input type="hidden" name="_id" value="${m._id || ''}">
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="form-label">Name</label><input required name="name" value="${m.name || ''}" class="form-input"></div>
        <div><label class="form-label">Role</label><input required name="role" value="${m.role || ''}" class="form-input"></div>
      </div>
      <div><label class="form-label">Bio</label><textarea name="bio" rows="3" maxlength="400" class="form-input">${m.bio || ''}</textarea></div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="form-label">LinkedIn</label><input name="socials[linkedin]" value="${s.linkedin || ''}" class="form-input"></div>
        <div><label class="form-label">Twitter / X</label><input name="socials[twitter]" value="${s.twitter || ''}" class="form-input"></div>
        <div><label class="form-label">GitHub</label><input name="socials[github]" value="${s.github || ''}" class="form-input"></div>
        <div><label class="form-label">Instagram</label><input name="socials[instagram]" value="${s.instagram || ''}" class="form-input"></div>
      </div>
      <div class="grid sm:grid-cols-2 gap-4 items-end">
        <div><label class="form-label">Order</label><input type="number" name="order" value="${m.order || 0}" class="form-input"></div>
        <div class="flex items-center gap-3 pb-2"><input type="checkbox" name="isActive" id="isActive" ${m.isActive !== false ? 'checked' : ''} class="w-4 h-4"><label for="isActive" class="text-sm text-slate-300">Visible on site</label></div>
      </div>
      <div><label class="form-label">Photo ${m._id ? '(leave empty to keep current)' : ''}</label><input type="file" name="photo" accept="image/*" class="form-input"></div>
      <button class="btn-primary w-full py-3 rounded-lg">${m._id ? 'Update' : 'Add'} Team Member</button>
    </form>`;
  }

  window.adminTeam = {
    create() { openModal('New Team Member', teamFormHTML()); bindTeamForm(); },
    edit(m) { openModal('Edit Team Member', teamFormHTML(m)); bindTeamForm(); },
    async remove(id) {
      if (!confirm('Remove this team member?')) return;
      try { await api.del(`/team/${id}`); showToast('Removed', 'success'); loadTeam(); } catch (e) { showToast(e.message, 'error'); }
    }
  };

  function bindTeamForm() {
    const form = document.getElementById('team-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = form._id.value;
      const fd = new FormData(form);
      if (!fd.has('isActive')) fd.append('isActive', 'false');
      try {
        if (id) await api.put(`/team/${id}`, fd, { isForm: true });
        else await api.post('/team', fd, { isForm: true });
        showToast('Saved', 'success'); closeModal(); loadTeam();
      } catch (err) { showToast(err.message, 'error'); }
    });
  }

  /* ================= TESTIMONIALS ================= */
  async function loadTestimonials() {
    const body = document.getElementById('testimonials-tbody');
    body.innerHTML = `<tr><td colspan="5" class="text-slate-500 py-6 text-center">Loading...</td></tr>`;
    try {
      const data = await api.get('/testimonials', { auth: false });
      const list = data.testimonials || data.data || [];
      body.innerHTML = list.length ? list.map(t => `
        <tr>
          <td class="text-white font-medium">${t.name}</td>
          <td>${t.role || ''}</td>
          <td>${'\u2605'.repeat(t.rating || 5)}</td>
          <td><span class="badge ${t.source === 'google' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'}">${t.source}</span></td>
          <td class="text-right whitespace-nowrap">
            <button class="text-[var(--brand-2)] hover:underline mr-3" onclick='adminTestimonials.edit(${JSON.stringify(t).replace(/'/g, "&#39;")})'>Edit</button>
            <button class="text-rose-400 hover:underline" onclick="adminTestimonials.remove('${t._id}')">Delete</button>
          </td>
        </tr>`).join('') : `<tr><td colspan="5" class="text-slate-500 py-6 text-center">No testimonials yet.</td></tr>`;
    } catch (e) { body.innerHTML = `<tr><td colspan="5" class="text-rose-400 py-6 text-center">Failed to load.</td></tr>`; }
  }

  function testimonialFormHTML(t = {}) {
    return `
    <form id="testimonial-form" class="space-y-4">
      <input type="hidden" name="_id" value="${t._id || ''}">
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="form-label">Name</label><input required name="name" value="${t.name || ''}" class="form-input"></div>
        <div><label class="form-label">Role / Company</label><input name="role" value="${t.role || ''}" class="form-input"></div>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="form-label">Country</label><input name="country" value="${t.country || ''}" class="form-input"></div>
        <div><label class="form-label">Rating (1-5)</label><input type="number" min="1" max="5" name="rating" value="${t.rating || 5}" class="form-input"></div>
      </div>
      <div><label class="form-label">Quote</label><textarea required name="quote" rows="3" class="form-input">${t.quote || ''}</textarea></div>
      <div class="flex items-center gap-3"><input type="checkbox" name="isActive" id="tIsActive" ${t.isActive !== false ? 'checked' : ''} class="w-4 h-4"><label for="tIsActive" class="text-sm text-slate-300">Show on site</label></div>
      <div><label class="form-label">Photo ${t._id ? '(leave empty to keep current)' : ''}</label><input type="file" name="photo" accept="image/*" class="form-input"></div>
      <button class="btn-primary w-full py-3 rounded-lg">${t._id ? 'Update' : 'Add'} Testimonial</button>
    </form>`;
  }

  window.adminTestimonials = {
    create() { openModal('New Testimonial', testimonialFormHTML()); bindTestimonialForm(); },
    edit(t) { openModal('Edit Testimonial', testimonialFormHTML(t)); bindTestimonialForm(); },
    async remove(id) {
      if (!confirm('Delete this testimonial?')) return;
      try { await api.del(`/testimonials/${id}`); showToast('Deleted', 'success'); loadTestimonials(); } catch (e) { showToast(e.message, 'error'); }
    }
  };

  function bindTestimonialForm() {
    const form = document.getElementById('testimonial-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = form._id.value;
      const fd = new FormData(form);
      if (!fd.has('isActive')) fd.append('isActive', 'false');
      try {
        if (id) await api.put(`/testimonials/${id}`, fd, { isForm: true });
        else await api.post('/testimonials', fd, { isForm: true });
        showToast('Saved', 'success'); closeModal(); loadTestimonials();
      } catch (err) { showToast(err.message, 'error'); }
    });
  }

  /* ================= ANNOUNCEMENTS ================= */
  async function loadAnnouncements() {
    const body = document.getElementById('announcements-tbody');
    body.innerHTML = `<tr><td colspan="5" class="text-slate-500 py-6 text-center">Loading...</td></tr>`;
    try {
      const data = await api.get('/announcements', { auth: false });
      const list = data.announcements || data.data || [];
      body.innerHTML = list.length ? list.map(a => `
        <tr>
          <td class="text-white font-medium">${a.isPinned ? '\ud83d\udccc ' : ''}${a.title}</td>
          <td class="capitalize">${a.type}</td>
          <td class="capitalize">${a.audience}</td>
          <td><span class="badge ${a.isActive !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'}">${a.isActive !== false ? 'Active' : 'Off'}</span></td>
          <td class="text-right whitespace-nowrap">
            <button class="text-[var(--brand-2)] hover:underline mr-3" onclick='adminAnnouncements.edit(${JSON.stringify(a).replace(/'/g, "&#39;")})'>Edit</button>
            <button class="text-rose-400 hover:underline" onclick="adminAnnouncements.remove('${a._id}')">Delete</button>
          </td>
        </tr>`).join('') : `<tr><td colspan="5" class="text-slate-500 py-6 text-center">No announcements yet.</td></tr>`;
    } catch (e) { body.innerHTML = `<tr><td colspan="5" class="text-rose-400 py-6 text-center">Failed to load.</td></tr>`; }
  }

  function announcementFormHTML(a = {}) {
    return `
    <form id="announcement-form" class="space-y-4">
      <input type="hidden" name="_id" value="${a._id || ''}">
      <div><label class="form-label">Title</label><input required name="title" value="${a.title || ''}" class="form-input"></div>
      <div><label class="form-label">Message</label><textarea required name="message" rows="3" class="form-input">${a.message || ''}</textarea></div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="form-label">Type</label>
          <select name="type" class="form-input">${['info', 'success', 'warning', 'urgent'].map(t => `<option ${a.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
        </div>
        <div><label class="form-label">Audience</label>
          <select name="audience" class="form-input">${['all', 'clients', 'public'].map(t => `<option ${a.audience === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
        </div>
      </div>
      <div class="grid sm:grid-cols-2 gap-4 items-end">
        <div><label class="form-label">Expires at</label><input type="date" name="expiresAt" value="${a.expiresAt ? a.expiresAt.split('T')[0] : ''}" class="form-input"></div>
        <div class="flex gap-6 pb-2">
          <label class="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" name="isPinned" ${a.isPinned ? 'checked' : ''} class="w-4 h-4">Pinned</label>
          <label class="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" name="isActive" ${a.isActive !== false ? 'checked' : ''} class="w-4 h-4">Active</label>
        </div>
      </div>
      <button class="btn-primary w-full py-3 rounded-lg">${a._id ? 'Update' : 'Publish'} Announcement</button>
    </form>`;
  }

  window.adminAnnouncements = {
    create() { openModal('New Announcement', announcementFormHTML()); bindAnnouncementForm(); },
    edit(a) { openModal('Edit Announcement', announcementFormHTML(a)); bindAnnouncementForm(); },
    async remove(id) {
      if (!confirm('Delete this announcement?')) return;
      try { await api.del(`/announcements/${id}`); showToast('Deleted', 'success'); loadAnnouncements(); } catch (e) { showToast(e.message, 'error'); }
    }
  };

  function bindAnnouncementForm() {
    const form = document.getElementById('announcement-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = form._id.value;
      const payload = {
        title: form.title.value.trim(), message: form.message.value.trim(),
        type: form.type.value, audience: form.audience.value,
        isPinned: form.isPinned.checked, isActive: form.isActive.checked,
        expiresAt: form.expiresAt.value || undefined
      };
      try {
        if (id) await api.put(`/announcements/${id}`, payload);
        else await api.post('/announcements', payload);
        showToast('Saved', 'success'); closeModal(); loadAnnouncements();
      } catch (err) { showToast(err.message, 'error'); }
    });
  }

  /* ================= BOOKINGS ================= */
  async function loadBookings() {
    const body = document.getElementById('bookings-tbody');
    body.innerHTML = `<tr><td colspan="6" class="text-slate-500 py-6 text-center">Loading...</td></tr>`;
    try {
      const data = await api.get('/bookings');
      const list = data.bookings || data.data || [];
      body.innerHTML = list.length ? list.map(b => `
        <tr>
          <td class="text-white font-medium">${b.name}<div class="text-xs text-slate-500">${b.email}</div></td>
          <td>${b.projectType}</td>
          <td>${new Date(b.preferredDate).toLocaleDateString()} ${b.preferredTime}</td>
          <td>${b.country || ''}</td>
          <td>
            <select onchange="adminBookings.updateStatus('${b._id}', this.value)" class="form-input !py-1 !text-xs">
              ${['pending', 'confirmed', 'completed', 'cancelled'].map(s => `<option value="${s}" ${b.status === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </td>
          <td class="text-right"><button class="text-rose-400 hover:underline" onclick="adminBookings.remove('${b._id}')">Delete</button></td>
        </tr>`).join('') : `<tr><td colspan="6" class="text-slate-500 py-6 text-center">No calls scheduled yet.</td></tr>`;
    } catch (e) { body.innerHTML = `<tr><td colspan="6" class="text-rose-400 py-6 text-center">Failed to load.</td></tr>`; }
  }

  window.adminBookings = {
    async updateStatus(id, status) {
      try { await api.put(`/bookings/${id}`, { status }); showToast('Status updated', 'success'); } catch (e) { showToast(e.message, 'error'); }
    },
    async remove(id) {
      if (!confirm('Delete this booking?')) return;
      try { await api.del(`/bookings/${id}`); showToast('Deleted', 'success'); loadBookings(); } catch (e) { showToast(e.message, 'error'); }
    }
  };

  /* ================= CONTACT MESSAGES ================= */
  async function loadContact() {
    const body = document.getElementById('contact-tbody');
    body.innerHTML = `<tr><td colspan="5" class="text-slate-500 py-6 text-center">Loading...</td></tr>`;
    try {
      const data = await api.get('/contact');
      const list = data.messages || data.data || [];
      body.innerHTML = list.length ? list.map(m => `
        <tr class="${m.isRead ? '' : 'font-semibold'}">
          <td class="text-white">${m.name}<div class="text-xs text-slate-500 font-normal">${m.email}</div></td>
          <td>${m.subject || ''}</td>
          <td class="max-w-xs clamp-2 text-slate-300">${m.message}</td>
          <td>${new Date(m.createdAt).toLocaleDateString()}</td>
          <td class="text-right whitespace-nowrap">
            ${!m.isRead ? `<button class="text-[var(--brand-2)] hover:underline mr-3" onclick="adminContact.markRead('${m._id}')">Mark read</button>` : ''}
            <button class="text-rose-400 hover:underline" onclick="adminContact.remove('${m._id}')">Delete</button>
          </td>
        </tr>`).join('') : `<tr><td colspan="5" class="text-slate-500 py-6 text-center">No messages yet.</td></tr>`;
    } catch (e) { body.innerHTML = `<tr><td colspan="5" class="text-rose-400 py-6 text-center">Failed to load.</td></tr>`; }
  }

  window.adminContact = {
    async markRead(id) {
      try { await api.put(`/contact/${id}/read`, {}); loadContact(); } catch (e) { showToast(e.message, 'error'); }
    },
    async remove(id) {
      if (!confirm('Delete this message?')) return;
      try { await api.del(`/contact/${id}`); showToast('Deleted', 'success'); loadContact(); } catch (e) { showToast(e.message, 'error'); }
    }
  };

  /* ================= CLIENT PROJECTS ================= */
  async function loadClientProjects() {
    const body = document.getElementById('clients-tbody');
    body.innerHTML = `<tr><td colspan="5" class="text-slate-500 py-6 text-center">Loading...</td></tr>`;
    try {
      const data = await api.get('/client-projects');
      const list = data.projects || data.data || [];
      body.innerHTML = list.length ? list.map(p => `
        <tr>
          <td class="text-white font-medium">${p.projectName}</td>
          <td>${p.client?.name || ''}<div class="text-xs text-slate-500">${p.client?.email || ''}</div></td>
          <td><span class="badge bg-blue-500/20 text-blue-300 capitalize">${(p.status || '').replace('-', ' ')}</span></td>
          <td>${p.progressPercent || 0}%</td>
          <td class="text-right whitespace-nowrap">
            <button class="text-[var(--brand-2)] hover:underline" onclick="adminClients.viewDetail('${p._id}')">Manage</button>
          </td>
        </tr>`).join('') : `<tr><td colspan="5" class="text-slate-500 py-6 text-center">No client projects yet.</td></tr>`;
    } catch (e) { body.innerHTML = `<tr><td colspan="5" class="text-rose-400 py-6 text-center">Failed to load.</td></tr>`; }
  }

  function newClientProjectFormHTML() {
    return `
    <form id="new-client-project-form" class="space-y-4">
      <div><label class="form-label">Client email (must have a client account already)</label><input required type="email" name="clientEmail" class="form-input" placeholder="client@example.com"></div>
      <div><label class="form-label">Project name</label><input required name="projectName" class="form-input"></div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="form-label">Project type</label>
          <select name="projectType" class="form-input"><option>Website</option><option>Mobile App</option><option>Custom Software</option></select>
        </div>
        <div><label class="form-label">Start date</label><input type="date" name="startDate" class="form-input"></div>
      </div>
      <div><label class="form-label">Estimated end date</label><input type="date" name="estimatedEndDate" class="form-input"></div>
      <div><label class="form-label">Description</label><textarea name="description" rows="3" class="form-input"></textarea></div>
      <button class="btn-primary w-full py-3 rounded-lg">Create Client Project</button>
    </form>`;
  }

  function detailHTML(p) {
    const milestones = p.milestones || [];
    return `
    <div class="space-y-6">
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="form-label">Status</label>
          <select id="detail-status" class="form-input">
            ${['not-started', 'in-progress', 'in-review', 'completed', 'on-hold'].map(s => `<option value="${s}" ${p.status === s ? 'selected' : ''}>${s.replace('-', ' ')}</option>`).join('')}
          </select>
        </div>
        <div><label class="form-label">Progress %</label><input id="detail-progress" type="number" min="0" max="100" value="${p.progressPercent || 0}" class="form-input"></div>
      </div>
      <button id="save-detail-btn" class="btn-primary px-5 py-2 rounded-lg text-sm">Save Status</button>

      <div class="border-t border-white/10 pt-5">
        <h4 class="font-display font-semibold text-white mb-3">Milestones</h4>
        <ul class="space-y-2 mb-4">
          ${milestones.map(m => `
            <li class="flex items-center gap-3 glass rounded-lg p-3 text-sm">
              <span class="flex-1 text-slate-200">${m.title}</span>
              <select onchange="adminClients.updateMilestone('${p._id}','${m._id}', this.value)" class="form-input !py-1 !text-xs !w-32">
                ${['pending', 'in-progress', 'completed', 'blocked'].map(s => `<option value="${s}" ${m.status === s ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
              <button class="text-rose-400 text-xs" onclick="adminClients.deleteMilestone('${p._id}','${m._id}')">Remove</button>
            </li>`).join('') || '<li class="text-slate-500 text-sm">No milestones yet.</li>'}
        </ul>
        <form id="milestone-form" class="flex gap-2">
          <input required name="title" placeholder="New milestone title" class="form-input flex-1">
          <button class="btn-ghost px-4 rounded-lg text-sm">Add</button>
        </form>
      </div>

      <div class="border-t border-white/10 pt-5">
        <h4 class="font-display font-semibold text-white mb-3">Client Updates / Notes</h4>
        <ul class="space-y-2 mb-4">
          ${(p.notes || []).slice().reverse().map(n => `<li class="glass rounded-lg p-3 text-sm text-slate-300">${n.text}<div class="text-xs text-slate-500 mt-1">${new Date(n.createdAt).toLocaleString()}</div></li>`).join('') || '<li class="text-slate-500 text-sm">No notes yet.</li>'}
        </ul>
        <form id="note-form" class="flex gap-2">
          <input required name="text" placeholder="Write an update for the client..." class="form-input flex-1">
          <button class="btn-ghost px-4 rounded-lg text-sm">Post</button>
        </form>
      </div>
    </div>`;
  }

  window.adminClients = {
    createNew() { openModal('New Client Project', newClientProjectFormHTML()); bindNewClientProjectForm(); },
    async viewDetail(id) {
      try {
        const data = await api.get(`/client-projects/${id}`);
        const p = data.project || data.data;
        openModal(`Manage: ${p.projectName}`, detailHTML(p));
        bindDetailHandlers(p);
      } catch (e) { showToast(e.message, 'error'); }
    },
    async updateMilestone(projectId, milestoneId, status) {
      try { await api.put(`/client-projects/${projectId}/milestones/${milestoneId}`, { status }); showToast('Milestone updated', 'success'); window.adminClients.viewDetail(projectId); } catch (e) { showToast(e.message, 'error'); }
    },
    async deleteMilestone(projectId, milestoneId) {
      if (!confirm('Remove this milestone?')) return;
      try { await api.del(`/client-projects/${projectId}/milestones/${milestoneId}`); showToast('Milestone removed', 'success'); window.adminClients.viewDetail(projectId); } catch (e) { showToast(e.message, 'error'); }
    }
  };

  function bindNewClientProjectForm() {
    const form = document.getElementById('new-client-project-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(form).entries());
      try {
        await api.post('/client-projects', payload);
        showToast('Client project created', 'success'); closeModal(); loadClientProjects();
      } catch (err) { showToast(err.message, 'error'); }
    });
  }

  function bindDetailHandlers(p) {
    document.getElementById('save-detail-btn').addEventListener('click', async () => {
      const status = document.getElementById('detail-status').value;
      const progressPercent = Number(document.getElementById('detail-progress').value);
      try { await api.put(`/client-projects/${p._id}`, { status, progressPercent }); showToast('Saved', 'success'); loadClientProjects(); } catch (e) { showToast(e.message, 'error'); }
    });
    document.getElementById('milestone-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = e.target.title.value.trim();
      try { await api.post(`/client-projects/${p._id}/milestones`, { title }); window.adminClients.viewDetail(p._id); } catch (err) { showToast(err.message, 'error'); }
    });
    document.getElementById('note-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = e.target.text.value.trim();
      try { await api.post(`/client-projects/${p._id}/notes`, { text }); window.adminClients.viewDetail(p._id); } catch (err) { showToast(err.message, 'error'); }
    });
  }

  /* ================= OVERVIEW ================= */
  async function loadOverview() {
    const grid = document.getElementById('overview-stats');
    grid.innerHTML = Array.from({ length: 4 }).map(() => '<div class="skeleton rounded-2xl" style="height:110px"></div>').join('');
    try {
      const [projects, blog, bookings, contact] = await Promise.all([
        api.get('/projects', { auth: false }).catch(() => ({ projects: [] })),
        api.get('/blog', { auth: false }).catch(() => ({ posts: [] })),
        api.get('/bookings').catch(() => ({ bookings: [] })),
        api.get('/contact').catch(() => ({ messages: [] }))
      ]);
      const stats = [
        { label: 'Portfolio Projects', value: (projects.projects || projects.data || []).length },
        { label: 'Blog Posts', value: (blog.posts || blog.data || []).length },
        { label: 'Calls Scheduled', value: (bookings.bookings || bookings.data || []).length },
        { label: 'Unread Messages', value: (contact.messages || contact.data || []).filter(m => !m.isRead).length }
      ];
      grid.innerHTML = stats.map(s => `
        <div class="glass rounded-2xl p-6">
          <p class="text-3xl font-display font-bold text-white">${s.value}</p>
          <p class="text-slate-400 text-sm mt-1">${s.label}</p>
        </div>`).join('');
    } catch (e) { grid.innerHTML = '<p class="text-slate-400 col-span-full">Unable to load stats.</p>'; }
  }

  /* ---------- init ---------- */
  function handleLogout() {
    document.getElementById('logout-btn').addEventListener('click', async () => {
      try { await api.post('/auth/logout', {}); } catch (e) {}
      api.setToken(null); api.setUser(null);
      window.location.href = 'login.html';
    });
  }

  function openSidebar() {
    document.getElementById('admin-sidebar').classList.remove('-translate-x-full');
    document.getElementById('sidebar-overlay').classList.remove('hidden');
  }
  function closeSidebar() {
    document.getElementById('admin-sidebar').classList.add('-translate-x-full');
    document.getElementById('sidebar-overlay').classList.add('hidden');
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!guard()) return;
    sections.forEach(s => document.getElementById(`tab-${s}`).addEventListener('click', () => { switchSection(s); closeSidebar(); }));
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('admin-modal').addEventListener('click', (e) => { if (e.target.id === 'admin-modal') closeModal(); });
    document.getElementById('add-project-btn').addEventListener('click', () => window.adminProjects.create());
    document.getElementById('add-blog-btn').addEventListener('click', () => window.adminBlog.create());
    document.getElementById('add-team-btn').addEventListener('click', () => window.adminTeam.create());
    document.getElementById('add-testimonial-btn').addEventListener('click', () => window.adminTestimonials.create());
    document.getElementById('add-announcement-btn').addEventListener('click', () => window.adminAnnouncements.create());
    document.getElementById('add-client-project-btn').addEventListener('click', () => window.adminClients.createNew());
    document.getElementById('sidebar-toggle').addEventListener('click', openSidebar);
    document.getElementById('sidebar-close').addEventListener('click', closeSidebar);
    document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);
    handleLogout();
    switchSection(window.location.hash.replace('#', '') || 'overview');
  });
})();
