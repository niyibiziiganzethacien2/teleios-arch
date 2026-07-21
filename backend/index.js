const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const multer = require('multer');
const { authenticate, requireRole } = require('./middleware/auth');

let db, query, init;

async function loadDb() {
  try {
    const m = require('./db');
    db = m;
    query = m.query;
    init = m.init;
    await init();
    console.log('Database ready');
  } catch (e) {
    console.error('Database load failed:', e.message);
    query = async () => { throw new Error('Database not available'); };
  }
}

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 7000;

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

async function storeImage(file) {
  const mime = file.mimetype || 'image/jpeg';
  const data = file.buffer.toString('base64');
  const [, result] = await query('INSERT INTO uploads (data, mime) VALUES (?, ?)', [data, mime]);
  return `/api/uploads/${result.insertId}`;
}

app.use(cors());
app.use(express.json());

app.get('/api/ping', (req, res) => res.json({ ok: true }));

app.get('/', (req, res) => {
  const distIndex = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
  fs.access(distIndex, fs.constants.F_OK, (err) => {
    if (!err) return res.sendFile(distIndex);
    res.json({ msg: 'Server running, no frontend build found', cwd: process.cwd(), dir: __dirname });
  });
});

app.get('/api/debug', (req, res) => {
  res.json({ hasDB: !!process.env.DATABASE_URL, cwd: process.cwd(), node: process.version, pid: process.pid, uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);

app.get('/api/uploads/:id', async (req, res) => {
  try {
    const [rows] = await query('SELECT data, mime FROM uploads WHERE id = ?', [Number(req.params.id)]);
    if (rows.length === 0) return res.status(404).json({ error: 'not found' });
    const buf = Buffer.from(rows[0].data, 'base64');
    res.set('Content-Type', rows[0].mime);
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(buf);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/team', async (req, res) => {
  try {
    const [rows] = await query('SELECT id, initials, name, role, bio, quote, "borderColor", gradient, image FROM team ORDER BY id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/services', async (req, res) => {
  try {
    const [rows] = await query('SELECT id, number, title, description AS "desc" FROM services ORDER BY id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/gallery', async (req, res) => {
  try {
    const [rows] = await query('SELECT id, src AS img, alt, width, height FROM gallery ORDER BY id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email and message are required' });
  }
  try {
    await query('INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)', [name, email, subject || '', message]);
    if (process.env.SMTP_HOST && process.env.CONTACT_TO_EMAIL) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
        });
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.CONTACT_TO_EMAIL,
          to: process.env.CONTACT_TO_EMAIL,
          subject: `[Website Contact] ${subject || 'New message'}`,
          text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        });
      } catch (err) {
        console.error('Failed to send email', err);
      }
    }
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/contacts', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await query('SELECT * FROM contacts ORDER BY "createdAt" DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/users', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await query('SELECT id, email, name, role, "createdAt" FROM users ORDER BY id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/contacts/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [result] = await query('DELETE FROM contacts WHERE id = ?', [Number(req.params.id)]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'contact not found' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/team', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await query('SELECT * FROM team ORDER BY id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/team', authenticate, requireRole('admin'), async (req, res) => {
  const { initials, name, role, bio, quote, borderColor, gradient, image } = req.body || {};
  if (!initials || !name || !role) {
    return res.status(400).json({ error: 'initials, name and role required' });
  }
  try {
    const [result] = await query(
      'INSERT INTO team (initials, name, role, bio, quote, "borderColor", gradient, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [initials, name, role, bio || '', quote || '', borderColor || '#D4AF37', gradient || '', image || null]
    );
    const [rows] = await query('SELECT * FROM team WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/team/:id', authenticate, requireRole('admin'), async (req, res) => {
  const id = Number(req.params.id);
  const { initials, name, role, bio, quote, borderColor, gradient, image } = req.body || {};
  try {
    const [result] = await query(
      'UPDATE team SET initials = COALESCE(?, initials), name = COALESCE(?, name), role = COALESCE(?, role), bio = COALESCE(?, bio), quote = COALESCE(?, quote), "borderColor" = COALESCE(?, "borderColor"), gradient = COALESCE(?, gradient), image = COALESCE(?, image) WHERE id = ?',
      [initials, name, role, bio, quote, borderColor, gradient, image, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'team member not found' });
    const [rows] = await query('SELECT * FROM team WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/team/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await query('SELECT * FROM team WHERE id = ?', [Number(req.params.id)]);
    if (rows.length === 0) return res.status(404).json({ error: 'team member not found' });
    await query('DELETE FROM team WHERE id = ?', [Number(req.params.id)]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/services', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await query('SELECT id, number, title, description AS "desc" FROM services ORDER BY id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/services', authenticate, requireRole('admin'), async (req, res) => {
  const { number, title, desc } = req.body || {};
  if (!number || !title || !desc) {
    return res.status(400).json({ error: 'number, title and desc required' });
  }
  try {
    const [result] = await query('INSERT INTO services (number, title, description) VALUES (?, ?, ?)', [number, title, desc]);
    const [rows] = await query('SELECT id, number, title, description AS "desc" FROM services WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/services/:id', authenticate, requireRole('admin'), async (req, res) => {
  const id = Number(req.params.id);
  const { number, title, desc } = req.body || {};
  try {
    const [result] = await query(
      'UPDATE services SET number = COALESCE(?, number), title = COALESCE(?, title), description = COALESCE(?, description) WHERE id = ?',
      [number, title, desc, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'service not found' });
    const [rows] = await query('SELECT id, number, title, description AS "desc" FROM services WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/services/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await query('SELECT id, number, title, description AS "desc" FROM services WHERE id = ?', [Number(req.params.id)]);
    if (rows.length === 0) return res.status(404).json({ error: 'service not found' });
    await query('DELETE FROM services WHERE id = ?', [Number(req.params.id)]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/team-account', authenticate, requireRole('admin'), async (req, res) => {
  const { teamMemberId, email, password } = req.body || {};
  if (!teamMemberId || !email || !password) {
    return res.status(400).json({ error: 'teamMemberId, email and password required' });
  }
  try {
    const [existing] = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'email already registered' });
    }
    const [memberRows] = await query('SELECT id FROM team WHERE id = ?', [teamMemberId]);
    if (memberRows.length === 0) {
      return res.status(404).json({ error: 'team member not found' });
    }
    const hashed = await bcrypt.hash(password, 12);
    const [result] = await query('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email.toLowerCase(), hashed, email.toLowerCase(), 'member']);
    await query('UPDATE team SET email = ?, "userId" = ? WHERE id = ?', [email.toLowerCase(), result.insertId, teamMemberId]);
    const [userRows] = await query('SELECT id, email, name, role, "createdAt" FROM users WHERE id = ?', [result.insertId]);
    res.status(201).json({ ok: true, user: userRows[0], teamMemberId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/member/profile', authenticate, requireRole('admin', 'member'), async (req, res) => {
  try {
    const [rows] = await query('SELECT id, initials, name, role, bio, quote, "borderColor", gradient, image, email FROM team WHERE "userId" = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'no team profile linked to your account' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/member/profile', authenticate, requireRole('admin', 'member'), async (req, res) => {
  const { initials, name, role, bio, quote, borderColor, gradient } = req.body || {};
  try {
    const [result] = await query(
      'UPDATE team SET initials = COALESCE(?, initials), name = COALESCE(?, name), role = COALESCE(?, role), bio = COALESCE(?, bio), quote = COALESCE(?, quote), "borderColor" = COALESCE(?, "borderColor"), gradient = COALESCE(?, gradient) WHERE "userId" = ?',
      [initials, name, role, bio, quote, borderColor, gradient, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'no team profile linked to your account' });
    const [rows] = await query('SELECT id, initials, name, role, bio, quote, "borderColor", gradient, image, email FROM team WHERE "userId" = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/member/profile/image', authenticate, requireRole('admin', 'member'), upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no image file provided' });
  try {
    const imageUrl = await storeImage(req.file);
    const [result] = await query('UPDATE team SET image = ? WHERE "userId" = ?', [imageUrl, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'no team profile linked to your account' });
    res.json({ ok: true, image: imageUrl });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/team/:id/image', authenticate, requireRole('admin'), upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no image file provided' });
  try {
    const imageUrl = await storeImage(req.file);
    const [result] = await query('UPDATE team SET image = ? WHERE id = ?', [imageUrl, Number(req.params.id)]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'team member not found' });
    res.json({ ok: true, image: imageUrl });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/gallery', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await query('SELECT id, src AS img, alt, width, height FROM gallery ORDER BY id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/gallery', authenticate, requireRole('admin'), upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no image file provided' });
  try {
    const src = await storeImage(req.file);
    const [result] = await query('INSERT INTO gallery (src, alt) VALUES (?, ?)', [src, req.body.alt || '']);
    const [rows] = await query('SELECT id, src AS img, alt, width, height FROM gallery WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/gallery/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [result] = await query('UPDATE gallery SET alt = COALESCE(?, alt) WHERE id = ?', [req.body.alt || null, Number(req.params.id)]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'gallery item not found' });
    const [rows] = await query('SELECT id, src AS img, alt, width, height FROM gallery WHERE id = ?', [Number(req.params.id)]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/gallery/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [result] = await query('DELETE FROM gallery WHERE id = ?', [Number(req.params.id)]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'gallery item not found' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

async function seedData() {
  try {
    const [users] = await query('SELECT id FROM users WHERE role = ?', ['admin']);
    if (users.length === 0) {
      const email = process.env.ADMIN_EMAIL || 'admin@teleios.com';
      const password = 'admin123';
      const hashed = await bcrypt.hash(password, 12);
      await query('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', [email, hashed, 'Admin', 'admin']);
      console.log(`Seeded admin user: ${email} / ${password}`);
    }

    const [svcRows] = await query('SELECT id FROM services LIMIT 1');
    if (svcRows.length === 0) {
      const services = [
        { number: '01', title: 'Architectural Design', description: 'Full-spectrum design services from initial concept to construction documentation. We develop buildings that respond authentically to their site, programme, and people with no compromise between beauty and function.' },
        { number: '02', title: 'Interior Architecture', description: 'We design interiors that are an inseparable extension of the architecture where materials, light, and spatial sequence work together to create environments that feel genuinely crafted and deeply lovable.' },
        { number: '03', title: 'Renovation & Adaptive Reuse', description: 'We transform existing structures with sensitivity and precision preserving what is worth keeping, reimagining what is not, and always seeking the opportunity that the original building offers but hasn\'t yet realised.' },
        { number: '04', title: 'Master Planning & Urban Design', description: 'At the neighbourhood and city scale, we develop masterplans that are legible, humane, and resilient frameworks for urban life that balance density, identity, movement, and public space with intelligence and care.' },
        { number: '05', title: 'Project Management & Site Supervision', description: 'We protect the integrity of the design through construction, coordinating consultants, reviewing progress, and ensuring every detail is realised as intended. Our involvement doesn\'t end at the drawing it ends at the door.' },
        { number: '06', title: 'Sustainable Design Consulting', description: 'Sustainability is not an add-on at Tereios it is embedded in every design decision we make. We advise on passive design strategies, green certifications, and environmental performance from the earliest stages of a project.' },
      ];
      for (const s of services) {
        await query('INSERT INTO services (number, title, description) VALUES (?, ?, ?)', [s.number, s.title, s.description]);
      }
      console.log('Seeded 6 services');
    }

    const [teamRows] = await query('SELECT id FROM team LIMIT 1');
    if (teamRows.length === 0) {
      const members = [
        { initials: 'GK', name: 'Gad KWIZERA', role: 'Founder & Principal Architect', bio: 'Founded Tereios Architecture with a single conviction: that great buildings must be honest. With over a decade of experience spanning residential, civic, and cultural projects across East Africa and Europe.', quote: '"I never start a design until I understand why this building needs to exist."', borderColor: '#D4AF37', gradient: 'linear-gradient(145deg, #D4AF37, #03010A)' },
        { initials: 'LI', name: 'Loselyne INEMA', role: 'Co-founder & Design Director', bio: 'Leads design direction at Tereios with a philosophy rooted in material honesty and spatial precision. Her background in both architecture and interior design allows her to work seamlessly across scales.', quote: '"Every material we choose makes a promise to the person who touches it. We keep our promises."', borderColor: '#C9A227', gradient: 'linear-gradient(210deg, #C9A227, #03010A)' },
        { initials: 'NIT', name: 'NIYIBIZI IGANZE Thacier', role: 'Project Architect', bio: 'Manages complex multi-phase projects with precision and calm. Her background in structural coordination means she speaks fluently across disciplines.', quote: null, borderColor: '#F5D76E', gradient: 'linear-gradient(165deg, #F5D76E, #03010A)' },
        { initials: 'EN', name: 'Elissa NDAYISHIMIYE', role: 'Urban Designer', bio: 'Focuses on master planning and public space. He believes cities are shaped by the spaces between buildings just as much as the buildings themselves.', quote: null, borderColor: '#B8860B', gradient: 'linear-gradient(195deg, #B8860B, #03010A)' },
        { initials: 'EN', name: 'Elie NZAYISENGA', role: 'Interior Designer', bio: 'Brings warmth and precision to every interior. His eye for material pairings and spatial rhythm transforms rooms into experiences that last long in memory.', quote: null, borderColor: '#DAA520', gradient: 'linear-gradient(225deg, #DAA520, #03010A)' },
      ];
      for (const m of members) {
        await query('INSERT INTO team (initials, name, role, bio, quote, "borderColor", gradient) VALUES (?, ?, ?, ?, ?, ?, ?)', [m.initials, m.name, m.role, m.bio, m.quote, m.borderColor, m.gradient]);
      }
      console.log('Seeded 5 team members');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

const distPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const index = path.join(distPath, 'index.html');
  fs.access(index, fs.constants.F_OK, (err) => {
    if (err) return next();
    res.sendFile(index);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  loadDb().then(() => {
    seedData().catch(err => console.error('Seed data error:', err.message));
  }).catch(err => {
    console.error('Database init failed:', err);
  });
});
