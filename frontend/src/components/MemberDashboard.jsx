import { useEffect, useState, useRef } from 'react';

const BASE = '/api';

function authHeaders() {
  const raw = localStorage.getItem('auth');
  if (!raw) return {};
  try {
    const { token } = JSON.parse(raw);
    return { Authorization: `Bearer ${token}` };
  } catch { return {}; }
}

const sections = [
  { id: 'overview', label: 'Dashboard' },
  { id: 'profile', label: 'My Profile' },
  { id: 'preview', label: 'Preview' },
  { id: 'security', label: 'Security' },
  { id: 'directory', label: 'Team' },
];

export default function MemberDashboard({ user, onLogout }) {
  const [active, setActive] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [team, setTeam] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => {
    fetch(`${BASE}/member/profile`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => {
        if (d.error) { setMsg(d.error); return; }
        setProfile(d);
        setForm({
          initials: d.initials || '',
          name: d.name || '',
          role: d.role || '',
          bio: d.bio || '',
          quote: d.quote || '',
          borderColor: d.borderColor || '#D4AF37',
          gradient: d.gradient || '',
        });
      })
      .catch(() => setMsg('Failed to load profile'));

    fetch(`${BASE}/team`)
      .then(r => r.json())
      .then(d => setTeam(Array.isArray(d) ? d : []))
      .catch(() => {});

    fetch(`${BASE}/services`)
      .then(r => r.json())
      .then(d => setServices(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const saveProfile = async () => {
    if (!form.name || !form.role) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/member/profile`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile(data);
      setMsg('Profile updated');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg(e.message); }
    setSaving(false);
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch(`${BASE}/member/profile/image`, {
        method: 'POST',
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile(prev => ({ ...prev, image: data.image }));
      setForm(prev => ({ ...prev, image: data.image }));
      setMsg('Photo uploaded');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg(e.message); }
    setUploading(false);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      setPwMsg('Fill in all fields');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg('New password must be at least 6 characters');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwMsg('Passwords do not match');
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch(`${BASE}/auth/password`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPwMsg('Password changed');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      setTimeout(() => setPwMsg(''), 3000);
    } catch (e) { setPwMsg(e.error || e.message); }
    setPwSaving(false);
  };

  return (
    <div className="member">
      <aside className="member__sidebar">
        <div className="member__brand">
          <span className="member__brand-mark">◈</span>
          <span className="member__brand-name">TELEIOS</span>
        </div>
        <nav className="member__nav">
          {sections.map(s => (
            <button
              key={s.id}
              className={`member__nav-item ${active === s.id ? 'member__nav-item--active' : ''}`}
              onClick={() => setActive(s.id)}
            >
              <span className="member__nav-label">{s.label}</span>
            </button>
          ))}
        </nav>
        <div className="member__sidebar-footer">
          <div className="member__sidebar-user">{user?.email}</div>
          <div className="member__sidebar-role">member</div>
          <button className="member__logout-btn" onClick={onLogout}>Sign out</button>
        </div>
      </aside>

      <div className="member__body">
        {active === 'overview' && (
          <>
            <div className="member__stats">
              <div className="member__stat">
                <div className="member__stat-top">
                  <span className="member__stat-icon">✦</span>
                  <span className="member__stat-value">{profile ? 'Active' : '—'}</span>
                </div>
                <span className="member__stat-label">My Profile</span>
                {profile && <span className="member__stat-change">{profile.name}</span>}
              </div>
              <div className="member__stat">
                <div className="member__stat-top">
                  <span className="member__stat-icon">◈</span>
                  <span className="member__stat-value">{team.length}</span>
                </div>
                <span className="member__stat-label">Team Members</span>
                <span className="member__stat-change">{team.filter(m => m.role.toLowerCase().includes('architect')).length} architects</span>
              </div>
              <div className="member__stat">
                <div className="member__stat-top">
                  <span className="member__stat-icon">▤</span>
                  <span className="member__stat-value">{services.length}</span>
                </div>
                <span className="member__stat-label">Services</span>
                <span className="member__stat-change">Active</span>
              </div>
            </div>
            <div className="member__section">
              <h2 className="member__section-title">Quick Actions</h2>
              <div className="member__actions-grid">
                <div className="member__action-card" onClick={() => setActive('profile')}>
                  <div className="member__action-icon">✎</div>
                  <div>
                    <div className="member__action-title">Edit Profile</div>
                    <div className="member__action-desc">Update your name, bio, photo</div>
                  </div>
                </div>
                <div className="member__action-card" onClick={() => setActive('preview')}>
                  <div className="member__action-icon">◉</div>
                  <div>
                    <div className="member__action-title">View Preview</div>
                    <div className="member__action-desc">See how your card looks on the site</div>
                  </div>
                </div>
                <div className="member__action-card" onClick={() => setActive('security')}>
                  <div className="member__action-icon">⚙</div>
                  <div>
                    <div className="member__action-title">Change Password</div>
                    <div className="member__action-desc">Update your login credentials</div>
                  </div>
                </div>
                <div className="member__action-card" onClick={() => setActive('directory')}>
                  <div className="member__action-icon">✦</div>
                  <div>
                    <div className="member__action-title">Team Directory</div>
                    <div className="member__action-desc">View all TELEIOS team members</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {active === 'profile' && (
          <div className="member__section">
            <h2 className="member__section-title">My Profile</h2>
            {msg && <div className="member__msg">{msg}</div>}
            {profile && (
              <div className="member__profile-card">
                <div className="member__profile-avatar">
                  {profile.image ? (
                    <img src={profile.image} alt="" className="member__avatar-img" />
                  ) : (
                    <div className="member__avatar-circle" style={{ borderColor: form.borderColor || '#D4AF37' }}>
                      {form.initials || '?'}
                    </div>
                  )}
                  <div className="member__photo-actions">
                    <input ref={fileRef} type="file" accept="image/*" onChange={uploadImage} style={{ display: 'none' }} />
                    <button className="member__btn member__btn--sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? 'Uploading...' : profile.image ? 'Change Photo' : 'Upload Photo'}
                    </button>
                  </div>
                </div>
                <div className="member__form-grid">
                  <div className="member__field">
                    <label className="member__label">Initials</label>
                    <input className="member__input" value={form.initials} onChange={e => setForm({...form, initials: e.target.value})} />
                  </div>
                  <div className="member__field">
                    <label className="member__label">Full Name</label>
                    <input className="member__input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                  <div className="member__field">
                    <label className="member__label">Role / Title</label>
                    <input className="member__input" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
                  </div>
                  <div className="member__field">
                    <label className="member__label">Border Color</label>
                    <input className="member__input" value={form.borderColor} onChange={e => setForm({...form, borderColor: e.target.value})} />
                  </div>
                  <div className="member__field member__field--wide">
                    <label className="member__label">Bio</label>
                    <textarea className="member__textarea" rows={3} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
                  </div>
                  <div className="member__field member__field--wide">
                    <label className="member__label">Quote</label>
                    <textarea className="member__textarea" rows={2} value={form.quote} onChange={e => setForm({...form, quote: e.target.value})} />
                  </div>
                  <div className="member__field member__field--wide">
                    <label className="member__label">Gradient</label>
                    <input className="member__input" value={form.gradient} onChange={e => setForm({...form, gradient: e.target.value})} />
                  </div>
                </div>
                <div className="member__actions">
                  <button className="member__btn" onClick={saveProfile} disabled={saving}>
                    {saving ? 'Saving...' : 'Update Profile'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {active === 'preview' && (
          <div className="member__section">
            <h2 className="member__section-title">Profile Preview</h2>
            <p className="member__preview-hint">This is how your profile card appears on the TELEIOS website.</p>
            {profile ? (
              <div className="member__preview-card">
                <div className="member__preview-avatar">
                  {profile.image ? (
                    <img src={profile.image} alt="" className="member__preview-img" />
                  ) : (
                    <div className="member__preview-initials" style={{ borderColor: form.borderColor || '#D4AF37' }}>
                      {form.initials || '?'}
                    </div>
                  )}
                </div>
                <div className="member__preview-name">{form.name}</div>
                <div className="member__preview-role">{form.role}</div>
                <div className="member__preview-bio">{form.bio}</div>
                {form.quote && <div className="member__preview-quote">{form.quote}</div>}
              </div>
            ) : (
              <div className="member__empty">Load your profile first</div>
            )}
          </div>
        )}

        {active === 'security' && (
          <div className="member__section">
            <h2 className="member__section-title">Security</h2>
            <div className="member__security-card">
              {pwMsg && <div className="member__msg">{pwMsg}</div>}
              <form onSubmit={changePassword}>
                <div className="member__field member__field--wide">
                  <label className="member__label">Current Password</label>
                  <input className="member__input" type="password" value={pwForm.currentPassword}
                    onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})} />
                </div>
                <div className="member__field member__field--wide">
                  <label className="member__label">New Password</label>
                  <input className="member__input" type="password" value={pwForm.newPassword}
                    onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} />
                </div>
                <div className="member__field member__field--wide">
                  <label className="member__label">Confirm New Password</label>
                  <input className="member__input" type="password" value={pwForm.confirm}
                    onChange={e => setPwForm({...pwForm, confirm: e.target.value})} />
                </div>
                <div className="member__actions">
                  <button className="member__btn" type="submit" disabled={pwSaving}>
                    {pwSaving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {active === 'directory' && (
          <div className="member__section">
            <h2 className="member__section-title">Team Directory</h2>
            <div className="member__team-grid">
              {team.map((m, i) => (
                <div key={m.id || i} className="member__team-card">
                  <div className="member__team-card-top">
                    {m.image ? (
                      <img src={m.image} alt="" className="member__team-img" />
                    ) : (
                      <div className="member__team-avatar">{m.initials}</div>
                    )}
                    <div className="member__team-info">
                      <div className="member__team-name">{m.name}</div>
                      <div className="member__team-role">{m.role}</div>
                    </div>
                  </div>
                  {m.bio && <div className="member__team-bio">{m.bio}</div>}
                  {m.quote && <div className="member__team-quote">{m.quote}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
