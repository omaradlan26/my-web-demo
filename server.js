const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'data', 'books.json');
const USERS_PATH = path.join(__dirname, 'data', 'users.json');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Serve frontend static files
app.use(express.static(path.join(__dirname)));

async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

async function writeData(data) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

async function readUsers() {
  try {
    const raw = await fs.readFile(USERS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

async function writeUsers(data) {
  await fs.mkdir(path.dirname(USERS_PATH), { recursive: true });
  await fs.writeFile(USERS_PATH, JSON.stringify(data, null, 2), 'utf8');
}

async function ensureDefaultAdmin() {
  const users = await readUsers();
  if (!users.find(u => u.role === 'admin')) {
    const pwd = 'admin123';
    const hash = await bcrypt.hash(pwd, 10);
    users.push({ id: 1, username: 'admin', password: hash, role: 'admin' });
    await writeUsers(users);
    console.log('Created default admin user -> username: admin password: admin123');
  }
}

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing authorization header' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid auth format' });
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

app.get('/api/books', async (req, res) => {
  const books = await readData();
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) return res.json(books);
  const filtered = books.filter(b => (b.title||'').toLowerCase().includes(q) || (b.author||'').toLowerCase().includes(q));
  res.json(filtered);
});

// Admin: list users (no passwords returned)
app.get('/api/users', authMiddleware, requireRole('admin'), async (req, res) => {
  const users = await readUsers();
  res.json(users.map(u => ({ id: u.id, username: u.username, role: u.role })));
});

// Admin: change user role
app.put('/api/users/:id/role', authMiddleware, requireRole('admin'), async (req, res) => {
  const id = Number(req.params.id);
  const { role } = req.body || {};
  if (!role) return res.status(400).json({ error: 'Missing role' });
  const users = await readUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  users[idx].role = role;
  await writeUsers(users);
  res.json({ id: users[idx].id, username: users[idx].username, role: users[idx].role });
});

app.post('/api/books', authMiddleware, requireRole('admin'), async (req, res) => {
  const { title, author } = req.body || {};
  if (!title || !author) return res.status(400).json({ error: 'Missing title or author' });

  const books = await readData();
  const id = books.length ? Math.max(...books.map(b => b.id)) + 1 : 1;
  const book = { id, title, author, status: 'Available' };
  books.push(book);
  await writeData(books);
  res.status(201).json(book);
});

app.put('/api/books/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const id = Number(req.params.id);
  const updates = req.body || {};
  const books = await readData();
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  books[idx] = { ...books[idx], ...updates };
  await writeData(books);
  res.json(books[idx]);
});

app.delete('/api/books/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const id = Number(req.params.id);
  let books = await readData();
  const before = books.length;
  books = books.filter(b => b.id !== id);
  if (books.length === before) return res.status(404).json({ error: 'Not found' });
  await writeData(books);
  res.status(204).end();
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const users = await readUsers();
  if (users.find(u => u.username === username)) return res.status(400).json({ error: 'User exists' });
  const hash = await bcrypt.hash(password, 10);
  const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const user = { id, username, password: hash, role: 'user' };
  users.push(user);
  await writeUsers(users);
  res.status(201).json({ id: user.id, username: user.username });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const users = await readUsers();
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// simple protected route for user profile
app.get('/api/me', authMiddleware, async (req, res) => {
  const users = await readUsers();
  const u = users.find(x => x.id === req.user.id);
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.json({ id: u.id, username: u.username, role: u.role });
});

// initialize default admin if needed
ensureDefaultAdmin().catch(err => console.error(err));

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}

module.exports = app;
