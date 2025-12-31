const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'data', 'books.json');

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

app.get('/api/books', async (req, res) => {
  const books = await readData();
  res.json(books);
});

app.post('/api/books', async (req, res) => {
  const { title, author } = req.body || {};
  if (!title || !author) return res.status(400).json({ error: 'Missing title or author' });

  const books = await readData();
  const id = books.length ? Math.max(...books.map(b => b.id)) + 1 : 1;
  const book = { id, title, author, status: 'Available' };
  books.push(book);
  await writeData(books);
  res.status(201).json(book);
});

app.put('/api/books/:id', async (req, res) => {
  const id = Number(req.params.id);
  const updates = req.body || {};
  const books = await readData();
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  books[idx] = { ...books[idx], ...updates };
  await writeData(books);
  res.json(books[idx]);
});

app.delete('/api/books/:id', async (req, res) => {
  const id = Number(req.params.id);
  let books = await readData();
  const before = books.length;
  books = books.filter(b => b.id !== id);
  if (books.length === before) return res.status(404).json({ error: 'Not found' });
  await writeData(books);
  res.status(204).end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
