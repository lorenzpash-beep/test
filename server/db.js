const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

// Initialize the database
db.exec(`
  CREATE TABLE IF NOT EXISTS creations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    result_pdf_path TEXT,
    image_path TEXT,
    thumbnail_path TEXT,
    metadata TEXT
  )
`);

function getAllCreations() {
  return db.prepare('SELECT * FROM creations ORDER BY date DESC').all();
}

function getCreationById(id) {
  return db.prepare('SELECT * FROM creations WHERE id = ?').get(id);
}

function createCreation(name, type, result_pdf_path, image_path, metadata) {
  // If thumbnail path is needed, we should add it here.
  // For simplicity, let's assume we derive thumbnail path from result_pdf_path or pass it.
  const date = new Date().toISOString();
  // Derive thumb path from timestamp if we want, but better to pass it.
  const thumbPath = result_pdf_path.replace('/generated_pdfs/generated-', '/thumbnails/thumb-').replace('.pdf', '.png');

  const info = db.prepare('INSERT INTO creations (name, type, date, result_pdf_path, image_path, thumbnail_path, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(name, type, date, result_pdf_path, image_path, thumbPath, JSON.stringify(metadata));
  return info.lastInsertRowid;
}

function deleteCreation(id) {
  return db.prepare('DELETE FROM creations WHERE id = ?').run(id);
}

module.exports = {
  getAllCreations,
  getCreationById,
  createCreation,
  deleteCreation
};
