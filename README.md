# Library Management System (Phase 1 Demo)

Small demo app using vanilla HTML, CSS and JavaScript. Data is persisted in Browser Local Storage so there are no external dependencies.

**Quick features:**
- Add books (Title + Author)
- Search by title or author
- Local persistence via Local Storage
- Theme toggle (light / dark)
- Live clock and clear-local-data button

**Files:**
- [index.html](index.html) — main HTML that loads the app UI
- [script.js](script.js) — application logic (storage, search, theme)
- [styles.css](styles.css) — basic styling and theme variables

## Run locally

No build steps required. Two easy options:

1. Open directly: double-click `index.html` to open it in your browser.
2. With VS Code: install the Live Server extension and choose "Open with Live Server" on `index.html`.

## Notes for development

- Data key: `library_books_vanilla_demo` (stored in Local Storage)
- To reset data, use the "Clear Local Data" button in the header, or clear localStorage for the site in the browser devtools.

If you'd like, I can run git commands to commit these changes and create a small commit message.
## Backend (optional)

A simple Express JSON API is included in `server.js`. It persists to `data/books.json` and provides the following endpoints:

- `GET /api/books` — list books
- `POST /api/books` — add a book ({ title, author })
- `PUT /api/books/:id` — update a book (e.g., status)
- `DELETE /api/books/:id` — remove a book

To run the backend:

```bash
npm install
npm start
```

The API will listen on `http://localhost:3000` by default. Use the frontend fetch calls or your HTTP client of choice to interact.

## Frontend

The frontend is served statically from the project root. Open `index.html` in the browser or start the backend and visit `http://localhost:3000` to access the landing page.

Default admin credentials (created automatically on first run):

- username: `admin`
- password: `admin123`

Use `login.html` to sign in. Admins are redirected to `admin.html`; regular users go to `user.html` after sign-in.

### New admin endpoints

- `GET /api/users` — list users (admin only)
- `PUT /api/users/:id/role` — change a user's role (admin only)

Admin UI (`admin.html`) now includes a Users table where you can change roles.

