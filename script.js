const STORAGE_KEY = 'library_books_vanilla_demo';

const bookListBody = document.getElementById('book-list-body');
const addBookForm = document.getElementById('add-book-form');
const messageArea = document.getElementById('message-area');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');
const clearStorageBtn = document.getElementById('clear-storage');
const clockEl = document.getElementById('clock');

const initialBooks = [
    { id: 101, title: 'Introduction to Web', author: 'J. Doe', status: 'Available' },
    { id: 102, title: 'VS Code Essentials', author: 'A. Smith', status: 'Available' },
    { id: 103, title: 'Software Engineering', author: 'M. Jones', status: 'Issued' },
];

let books = [];
let messageTimeout;

function displayMessage(text, type = 'success') {
    if (messageTimeout) clearTimeout(messageTimeout);
    messageArea.textContent = text;
    messageArea.className = type === 'error' ? 'message-error' : 'message-success';
    messageArea.style.display = 'block';
    messageTimeout = setTimeout(() => (messageArea.style.display = 'none'), 6000);
}

function loadBooks() {
    // Prefer backend API if available
    fetch('/api/books').then(r => {
        if (!r.ok) throw new Error('no-api');
        return r.json();
    }).then(data => {
        books = data || [];
        renderBooks();
    }).catch(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        try {
            books = stored ? JSON.parse(stored) : initialBooks.slice();
        } catch (e) {
            console.error('Failed reading storage', e);
            books = initialBooks.slice();
        }
        renderBooks();
    });
}

function saveBooks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function renderBooks() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    bookListBody.innerHTML = '';

    const list = books
        .slice()
        .reverse()
        .filter(b => !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));

    if (list.length === 0) {
        const row = bookListBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 3;
        cell.textContent = 'No matching books found.';
        cell.style.textAlign = 'center';
        return;
    }

    for (const book of list) {
        const row = bookListBody.insertRow();
        const t = row.insertCell();
        t.textContent = book.title;
        const a = row.insertCell();
        a.textContent = book.author;
        const s = row.insertCell();
        s.textContent = book.status;
        s.className = book.status.toLowerCase().includes('available') ? 'status-available' : 'status-issued';
    }
}

function handleAddBook(evt) {
    evt.preventDefault();
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    if (!title || !author) return displayMessage('Please enter title and author.', 'error');

    const duplicate = books.some(b => b.title.toLowerCase() === title.toLowerCase() && b.author.toLowerCase() === author.toLowerCase());
    if (duplicate) return displayMessage('That book already exists.', 'error');

    const id = books.length ? Math.max(...books.map(b => b.id)) + 1 : 1;
    const book = { id, title, author, status: 'Available' };
    books.push(book);
    saveBooks();
    renderBooks();
    displayMessage(`Added "${book.title}"`);
    titleInput.value = '';
    authorInput.value = '';
}

function handleSearch() {
    renderBooks();
}

function toggleTheme() {
    document.documentElement.classList.toggle('dark');
}

function clearStorage() {
    if (!confirm('Clear local library data? This cannot be undone.')) return;
    localStorage.removeItem(STORAGE_KEY);
    loadBooks();
    displayMessage('Local data cleared.');
}

function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleString();
}

if (addBookForm) addBookForm.addEventListener('submit', handleAddBook);
searchInput?.addEventListener('input', handleSearch);
themeToggle?.addEventListener('click', toggleTheme);
clearStorageBtn?.addEventListener('click', clearStorage);

loadBooks();
updateClock();
setInterval(updateClock, 1000);
