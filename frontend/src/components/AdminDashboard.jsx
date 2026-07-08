import { useEffect, useState, useRef } from 'react';

const BASE = '/api';

function authHeaders() {
  const raw = localStorage.getItem('auth');
  if (!raw) return {};
  try {
    const { token } = JSON.parse(raw);
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

const sections = [
  { id: 'overview', label: 'Dashboard' },
  { id: 'messages', label: 'Messages' },
  { id: 'team', label: 'Team' },
  { id: 'services', label: 'Services' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
];

export default function AdminDashboard({ user, onLogout }) {
  const [active, setActive] = useState('overview');
  const [contacts, setContacts] = useState([]);
  const [team, setTeam] = useState([]);
  const [services, setServices] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('dark');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({});
  const [accountForm, setAccountForm] = useState(null);
  const [accountCreds, setAccountCreds] = useState({ email: '', password: '' });
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryFileRef = useRef(null);
  const [imgUploading, setImgUploading] = useState(false);
  const imgRef = useRef(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    setSelectedMsg(null);

    const fetches = [];
    if (active === 'overview' || active === 'messages') {
      fetches.push(
        fetch(`${BASE}/admin/contacts`, { headers: authHeaders() })
          .then(r => r.json())
          .then(d => {
            const list = Array.isArray(d) ? d : d.value || [];
            list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setContacts(list);
          })
      );
    }
    if (active === 'overview' || active === 'team') {
      fetches.push(
        fetch(`${BASE}/team`)
          .then(r => r.json())
          .then(d => setTeam(Array.isArray(d) ? d : d.value || []))
      );
    }
    if (active === 'services') {
      fetches.push(
        fetch(`${BASE}/services`)
          .then(r => r.json())
          .then(d => setServices(Array.isArray(d) ? d : d.value || []))
      );
    }
    if (active === 'gallery' || active === 'overview') {
      fetches.push(
        fetch(`${BASE}/admin/gallery`, { headers: authHeaders() })
          .then(r => r.json())
          .then(d => setGallery(Array.isArray(d) ? d : d.value || []))
      );
    }
    if (active === 'overview' || active === 'reports') {
      fetches.push(
        fetch(`${BASE}/admin/users`, { headers: authHeaders() })
          .then(r => r.json())
          .then(d => setUsers(Array.isArray(d) ? d : d.value || []))
      );
    }
    Promise.all(fetches).then(() => setLoading(false));
  }, [active]);

  const deleteContact = async (id) => {
    await fetch(`${BASE}/admin/contacts/${id}`, { method: 'DELETE', headers: authHeaders() });
    setContacts(prev => prev.filter(c => c.id !== id));
    if (selectedMsg?.id === id) setSelectedMsg(null);
  };

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const newThisWeek = contacts.filter(c => new Date(c.createdAt) >= weekAgo).length;

  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Subject', 'Message', 'Date']];
    contacts.forEach(c => {
      rows.push([c.name, c.email, c.subject || '', c.message, new Date(c.createdAt).toLocaleString()]);
    });
    const csv = rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'teleios-contacts.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.subject || '').toLowerCase().includes(search.toLowerCase()) ||
    c.message.toLowerCase().includes(search.toLowerCase())
  );

  const saveMember = async () => {
    if (!form.name || !form.role) return;
    setSaving(true);
    try {
      const url = editing?.id ? `${BASE}/admin/team/${editing.id}` : `${BASE}/admin/team`;
      const method = editing?.id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (editing?.id) {
        setTeam(prev => prev.map(m => m.id === editing.id ? data : m));
      } else {
        setTeam(prev => [...prev, data]);
      }
      setEditing(null);
      setForm({});
    } catch (e) {
      alert(e.message);
    }
    setSaving(false);
  };

  const deleteMember = async (id) => {
    if (!confirm('Delete this team member?')) return;
    try {
      const res = await fetch(`${BASE}/admin/team/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error('Delete failed');
      setTeam(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const saveService = async () => {
    if (!serviceForm.number || !serviceForm.title || !serviceForm.desc) return;
    setSaving(true);
    try {
      const url = editingService?.id ? `${BASE}/admin/services/${editingService.id}` : `${BASE}/admin/services`;
      const method = editingService?.id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(serviceForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (editingService?.id) {
        setServices(prev => prev.map(s => s.id === editingService.id ? data : s));
      } else {
        setServices(prev => [...prev, data]);
      }
      setEditingService(null);
      setServiceForm({});
    } catch (e) {
      alert(e.message);
    }
    setSaving(false);
  };

  const deleteService = async (id) => {
    if (!confirm('Delete this service?')) return;
    try {
      const res = await fetch(`${BASE}/admin/services/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error('Delete failed');
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const createAccount = async (memberId) => {
    if (!accountCreds.email || !accountCreds.password) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/admin/team-account`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamMemberId: memberId, ...accountCreds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAccountForm(null);
      setAccountCreds({ email: '', password: '' });
      setTeam(prev => prev.map(m => m.id === memberId ? { ...m, email: accountCreds.email } : m));
    } catch (e) {
      alert(e.message);
    }
    setSaving(false);
  };

  const uploadTeamImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editing?.id) return;
    setImgUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch(`${BASE}/admin/team/${editing.id}/image`, {
        method: 'POST',
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm(prev => ({ ...prev, image: data.image }));
      setTeam(prev => prev.map(m => m.id === editing.id ? { ...m, image: data.image } : m));
    } catch (e) {
      alert(e.message);
    }
    setImgUploading(false);
  };

  const uploadGallery = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGalleryUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('alt', file.name.replace(/\.[^.]+$/, ''));
    try {
      const res = await fetch(`${BASE}/admin/gallery`, {
        method: 'POST',
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGallery(prev => [...prev, data]);
    } catch (e) {
      alert(e.message);
    }
    setGalleryUploading(false);
  };

  const deleteGallery = async (id) => {
    if (!confirm('Delete this gallery image?')) return;
    try {
      const res = await fetch(`${BASE}/admin/gallery/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error('Delete failed');
      setGallery(prev => prev.filter(g => g.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__brand">
          <span className="admin__brand-mark">◈</span>
          <span className="admin__brand-name">TELEIOS</span>
        </div>
        <nav className="admin__nav">
          {sections.map(s => (
            <button
              key={s.id}
              className={`admin__nav-item ${active === s.id ? 'admin__nav-item--active' : ''}`}
              onClick={() => setActive(s.id)}
            >
              <span className="admin__nav-label">{s.label}</span>
              {s.id === 'messages' && contacts.length > 0 && (
                <span className="admin__badge">{contacts.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="admin__sidebar-footer">
          <div className="admin__sidebar-row">
            <button className="admin__theme-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            <span className="admin__sidebar-user">{user?.name}</span>
          </div>
          <button className="admin__logout-btn" onClick={onLogout}>Sign out</button>
        </div>
      </aside>

      <div className="admin__body">
        {loading ? (
          <div className="admin__loading">
            {[1,2,3,4].map(i => <div key={i} className="admin__skeleton" />)}
          </div>
        ) : active === 'overview' ? (
          <>
            <div className="admin__stats">
              <div className="admin__stat">
                <div className="admin__stat-top">
                  <span className="admin__stat-icon">✉</span>
                  <span className="admin__stat-value">{contacts.length}</span>
                </div>
                <span className="admin__stat-label">Total Messages</span>
                <span className="admin__stat-change">{newThisWeek > 0 ? '+' : ''}{newThisWeek} this week</span>
              </div>
              <div className="admin__stat">
                <div className="admin__stat-top">
                  <span className="admin__stat-icon">✦</span>
                  <span className="admin__stat-value">{team.length}</span>
                </div>
                <span className="admin__stat-label">Team Members</span>
                <span className="admin__stat-change">Active</span>
              </div>
              <div className="admin__stat">
                <div className="admin__stat-top">
                  <span className="admin__stat-icon">◈</span>
                  <span className="admin__stat-value">{services.length}</span>
                </div>
                <span className="admin__stat-label">Services</span>
                <span className="admin__stat-change">Active</span>
              </div>
              <div className="admin__stat">
                <div className="admin__stat-top">
                  <span className="admin__stat-icon">▤</span>
                  <span className="admin__stat-value">{users.length}</span>
                </div>
                <span className="admin__stat-label">Users</span>
                {users.filter(u => u.role === 'admin').length > 0 && (
                  <span className="admin__stat-change">{users.filter(u => u.role === 'admin').length} admin</span>
                )}
              </div>
            </div>

            <div className="admin__section">
              <h2 className="admin__section-title">Recent Messages</h2>
              <div className="admin__table">
                <div className="admin__table-head">
                  <span className="admin__th">Name</span>
                  <span className="admin__th">Email</span>
                  <span className="admin__th">Message</span>
                  <span className="admin__th">Date</span>
                </div>
                {contacts.slice(0, 5).map(c => (
                  <div key={c.id} className="admin__tr">
                    <span className="admin__td admin__td--name">{c.name}</span>
                    <span className="admin__td admin__td--email">{c.email}</span>
                    <span className="admin__td admin__td--msg">{c.message.slice(0, 50)}{c.message.length > 50 ? '...' : ''}</span>
                    <span className="admin__td admin__td--date">
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
                {contacts.length === 0 && <div className="admin__empty">No messages yet</div>}
              </div>
            </div>

            <div className="admin__section">
              <h2 className="admin__section-title">Team</h2>
              <div className="admin__team-grid">
                {team.slice(0, 3).map((m, i) => (
                  <div key={i} className="admin__team-card">
                    <div className="admin__team-avatar">{m.initials}</div>
                    <div>
                      <div className="admin__team-name">{m.name}</div>
                      <div className="admin__team-role">{m.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : active === 'messages' ? (
          <div className="admin__messages">
            <div className="admin__messages-list">
              <div className="admin__messages-header">
                <h2 className="admin__section-title">Messages</h2>
                <span className="admin__msg-count">{filteredContacts.length} total</span>
              </div>
              <div style={{ padding: '0.5rem 1rem' }}>
                <input
                  className="admin__search-input"
                  type="text"
                  placeholder="Search messages..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              {filteredContacts.length === 0 ? (
                <div className="admin__empty">{search ? 'No matches' : 'No messages yet'}</div>
              ) : (
                filteredContacts.map(c => (
                  <div
                    key={c.id}
                    className={`admin__msg-row ${selectedMsg?.id === c.id ? 'admin__msg-row--active' : ''}`}
                    onClick={() => setSelectedMsg(selectedMsg?.id === c.id ? null : c)}
                  >
                    <div className="admin__msg-avatar">{c.name.charAt(0)}</div>
                    <div className="admin__msg-body">
                      <div className="admin__msg-head">
                        <span className="admin__msg-name">{c.name}</span>
                        <span className="admin__msg-time">
                          {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <span className="admin__msg-email">{c.email}</span>
                      <span className="admin__msg-text">{c.message.slice(0, 80)}{c.message.length > 80 ? '...' : ''}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {selectedMsg && (
              <div className="admin__messages-detail">
                <div className="admin__detail-card">
                  <div className="admin__detail-top">
                    <div className="admin__detail-info">
                      <div className="admin__detail-avatar">{selectedMsg.name.charAt(0)}</div>
                      <div>
                        <h3 className="admin__detail-name">{selectedMsg.name}</h3>
                        <span className="admin__detail-email">{selectedMsg.email}</span>
                      </div>
                    </div>
                    <div className="admin__detail-actions">
                      <button className="admin__btn admin__btn--danger" onClick={() => deleteContact(selectedMsg.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                  {selectedMsg.subject && (
                    <div className="admin__detail-subject">{selectedMsg.subject}</div>
                  )}
                  <div className="admin__detail-body">{selectedMsg.message}</div>
                  <div className="admin__detail-footer">
                    {new Date(selectedMsg.createdAt).toLocaleString('en-US', {
                      dateStyle: 'full', timeStyle: 'short',
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : active === 'team' ? (
          <div className="admin__section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 className="admin__section-title" style={{ marginBottom: 0 }}>Team Members</h2>
              <button className="admin__btn" onClick={() => setEditing({})}>+ Add Member</button>
            </div>
            {editing && (
              <div className="admin__team-form">
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: '#f0ece4', marginBottom: '0.8rem' }}>
                  {editing.id ? 'Edit Member' : 'New Member'}
                </h3>
                <div className="admin__team-form-grid">
                  <input className="admin__form-input" placeholder="Initials" value={form.initials} onChange={e => setForm({...form, initials: e.target.value})} />
                  <input className="admin__form-input" placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  <input className="admin__form-input" placeholder="Role" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
                  <input className="admin__form-input" placeholder="Border Color (hex)" value={form.borderColor} onChange={e => setForm({...form, borderColor: e.target.value})} />
                  <textarea className="admin__form-textarea" placeholder="Bio" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={2} />
                  <textarea className="admin__form-textarea" placeholder="Quote" value={form.quote} onChange={e => setForm({...form, quote: e.target.value})} rows={2} />
                  {editing?.id && (
                    <div className="admin__form-img-row">
                      <label className="admin__label">Profile Photo</label>
                      <input type="file" accept="image/*" onChange={uploadTeamImage} style={{ display: 'none' }} ref={imgRef} />
                      <button className="admin__btn admin__btn--sm" onClick={() => imgRef.current?.click()} disabled={imgUploading}>
                        {imgUploading ? 'Uploading...' : form.image ? 'Change Photo' : 'Upload Photo'}
                      </button>
                      {form.image && <span className="admin__img-name">✓ photo set</span>}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                  <button className="admin__btn" onClick={saveMember} disabled={saving}>
                    {saving ? 'Saving...' : editing.id ? 'Update' : 'Create'}
                  </button>
                  <button className="admin__btn admin__btn--ghost" onClick={() => { setEditing(null); setForm({}); }}>Cancel</button>
                </div>
              </div>
            )}
            <div className="admin__team-grid admin__team-grid--full">
              {team.map((m, i) => (
                <div key={m.id || i} className="admin__team-card admin__team-card--full">
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    {m.image ? (
                      <img src={m.image} alt="" className="admin__team-img" />
                    ) : (
                      <div className="admin__team-avatar admin__team-avatar--lg">{m.initials}</div>
                    )}
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {!m.email && (
                        <button className="admin__btn admin__btn--sm admin__btn--gold" onClick={() => { setAccountForm(m.id); setAccountCreds({ email: '', password: '' }); }}>+ Account</button>
                      )}
                      {m.email && <span className="admin__account-badge">✓ account</span>}
                      <button className="admin__btn admin__btn--sm" onClick={() => { setEditing(m); setForm({ initials: m.initials || '', name: m.name || '', role: m.role || '', bio: m.bio || '', quote: m.quote || '', borderColor: m.borderColor || '#D4AF37', image: m.image || '' }); }}>Edit</button>
                      <button className="admin__btn admin__btn--sm admin__btn--danger" onClick={() => deleteMember(m.id)}>Delete</button>
                    </div>
                  </div>
                  {accountForm === m.id && (
                    <div className="admin__account-form">
                      <input className="admin__form-input" placeholder="Email" value={accountCreds.email} onChange={e => setAccountCreds({...accountCreds, email: e.target.value})} style={{ marginBottom: '0.4rem' }} />
                      <input className="admin__form-input" placeholder="Password" type="password" value={accountCreds.password} onChange={e => setAccountCreds({...accountCreds, password: e.target.value})} style={{ marginBottom: '0.4rem' }} />
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button className="admin__btn admin__btn--sm" onClick={() => createAccount(m.id)} disabled={saving}>{saving ? 'Creating...' : 'Create'}</button>
                        <button className="admin__btn admin__btn--sm admin__btn--ghost" onClick={() => setAccountForm(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                  <div className="admin__team-card-body">
                    <div className="admin__team-name">{m.name}</div>
                    <div className="admin__team-role">{m.role}</div>
                    <p className="admin__team-bio">{m.bio}</p>
                    {m.quote && <p className="admin__team-quote">{m.quote}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : active === 'services' ? (
          <div className="admin__section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 className="admin__section-title" style={{ marginBottom: 0 }}>Services</h2>
              <button className="admin__btn" onClick={() => setEditingService({})}>+ Add Service</button>
            </div>
            {editingService && (
              <div className="admin__team-form">
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: '#f0ece4', marginBottom: '0.8rem' }}>
                  {editingService.id ? 'Edit Service' : 'New Service'}
                </h3>
                <div className="admin__team-form-grid">
                  <input className="admin__form-input" placeholder="Number (e.g. 01)" value={serviceForm.number || ''} onChange={e => setServiceForm({...serviceForm, number: e.target.value})} />
                  <input className="admin__form-input" placeholder="Title" value={serviceForm.title || ''} onChange={e => setServiceForm({...serviceForm, title: e.target.value})} />
                  <textarea className="admin__form-textarea" placeholder="Description" value={serviceForm.desc || ''} onChange={e => setServiceForm({...serviceForm, desc: e.target.value})} rows={3} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                  <button className="admin__btn" onClick={saveService} disabled={saving}>
                    {saving ? 'Saving...' : editingService.id ? 'Update' : 'Create'}
                  </button>
                  <button className="admin__btn admin__btn--ghost" onClick={() => { setEditingService(null); setServiceForm({}); }}>Cancel</button>
                </div>
              </div>
            )}
            {services.map((s, i) => (
              <div key={s.id || i} className="admin__service-card">
                <div className="admin__service-number">{s.number}</div>
                <div className="admin__service-body">
                  <h3 className="admin__service-title">{s.title}</h3>
                  <p className="admin__service-desc">{s.desc}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'flex-start', paddingTop: '0.2rem' }}>
                  <button className="admin__btn admin__btn--sm" onClick={() => { setEditingService(s); setServiceForm({ number: s.number || '', title: s.title || '', desc: s.desc || '' }); }}>Edit</button>
                  <button className="admin__btn admin__btn--sm admin__btn--danger" onClick={() => deleteService(s.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : active === 'gallery' ? (
          <div className="admin__section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 className="admin__section-title" style={{ marginBottom: 0 }}>Gallery</h2>
              <input ref={galleryFileRef} type="file" accept="image/*" onChange={uploadGallery} style={{ display: 'none' }} />
              <button className="admin__btn" onClick={() => galleryFileRef.current?.click()} disabled={galleryUploading}>
                {galleryUploading ? 'Uploading...' : '+ Add Image'}
              </button>
            </div>
            <div className="admin__gallery-grid">
              {gallery.map((item, i) => (
                <div key={item.id || i} className="admin__gallery-card">
                  <img src={item.img} alt={item.alt || ''} className="admin__gallery-img" />
                  <div className="admin__gallery-overlay">
                    <button className="admin__btn admin__btn--sm admin__btn--danger" onClick={() => deleteGallery(item.id)}>
                      Delete
                    </button>
                  </div>
                  <div className="admin__gallery-footer">
                    <span className="admin__gallery-label">{item.alt || 'untitled'}</span>
                  </div>
                </div>
              ))}
              {gallery.length === 0 && <div className="admin__empty">No gallery images yet</div>}
            </div>
          </div>
        ) : active === 'reports' ? (
          <div className="admin__section">
            <h2 className="admin__section-title">Reports</h2>
            <div className="admin__reports-grid">
              <div className="admin__report-card" onClick={exportCSV}>
                <div className="admin__report-icon">▤</div>
                <div>
                  <h3 className="admin__report-title">Export Contacts</h3>
                  <p className="admin__report-desc">Download all messages as CSV</p>
                </div>
                <span className="admin__report-count">{contacts.length} records</span>
              </div>
              <div className="admin__report-card">
                <div className="admin__report-icon">✦</div>
                <div>
                  <h3 className="admin__report-title">Team Summary</h3>
                  <p className="admin__report-desc">{team.length} members across {services.length} services</p>
                </div>
              </div>
              <div className="admin__report-card">
                <div className="admin__report-icon">◈</div>
                <div>
                  <h3 className="admin__report-title">Users</h3>
                  <p className="admin__report-desc">{users.length} registered accounts</p>
                </div>
                <span className="admin__report-count">{users.filter(u => u.role === 'admin').length} admins</span>
              </div>
            </div>
          </div>
        ) : active === 'settings' ? (
          <div className="admin__section">
            <h2 className="admin__section-title">Settings</h2>
            <div className="admin__settings-card">
              <div className="admin__settings-row">
                <span className="admin__settings-label">Theme</span>
                <span className="admin__settings-value">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                <button className="admin__btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
                  Toggle
                </button>
              </div>
              <div className="admin__settings-row">
                <span className="admin__settings-label">Email</span>
                <span className="admin__settings-value">{user?.email || 'admin@teleios.com'}</span>
              </div>
              <div className="admin__settings-row">
                <span className="admin__settings-label">Role</span>
                <span className="admin__settings-value admin__settings-value--gold">{user?.role || 'admin'}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
