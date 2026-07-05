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

export default function MemberDashboard({ user, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);

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
      setMsg('Photo uploaded');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg(e.message); }
    setUploading(false);
  };

  return (
    <div className="member">
      <div className="member__sidebar">
        <div className="member__brand">
          <span className="member__brand-mark">◈</span>
          <span className="member__brand-name">TELEIOS</span>
        </div>
        <div className="member__nav">
          <div className="member__nav-item member__nav-item--active">
            <span className="member__nav-label">My Profile</span>
          </div>
        </div>
        <div className="member__sidebar-footer">
          <div className="member__sidebar-user">{user?.email}</div>
          <div className="member__sidebar-role">member</div>
          <button className="member__logout-btn" onClick={onLogout}>Sign out</button>
        </div>
      </div>

      <div className="member__body">
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
      </div>
    </div>
  );
}
