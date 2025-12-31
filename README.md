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
