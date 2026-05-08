const path = require('path');
const fs = require('fs-extra');
const { app } = require('electron');

const userDataPath = app ? app.getPath('userData') : __dirname;
const dbPath = path.join(userDataPath, 'creations.json');

function initDb() {
  if (!fs.existsSync(dbPath)) {
    fs.writeJsonSync(dbPath, []);
  }
}

initDb();

function getAllCreations() {
  try {
    return fs.readJsonSync(dbPath);
  } catch (error) {
    return [];
  }
}

function getCreationById(id) {
  const creations = getAllCreations();
  return creations.find(c => c.id === id);
}

function createCreation(name, type, result_pdf_path, image_path, metadata) {
  const creations = getAllCreations();
  const date = (typeof Temporal !== 'undefined') ? Temporal.Now.instant().toString() : new Date().toISOString();

  const thumbPath = result_pdf_path.replace('generated-pdfs' + path.sep + 'generated-', 'thumbnails' + path.sep + 'thumb-').replace('generated_pdfs' + path.sep + 'generated-', 'thumbnails' + path.sep + 'thumb-').replace('.pdf', '.png');

  const newCreation = {
    id: Date.now(),
    name,
    type,
    date,
    result_pdf_path,
    image_path,
    thumbnail_path: thumbPath,
    metadata: JSON.stringify(metadata)
  };

  creations.unshift(newCreation);
  fs.writeJsonSync(dbPath, creations);
  return newCreation.id;
}

function deleteCreation(id) {
  let creations = getAllCreations();
  creations = creations.filter(c => c.id !== id);
  fs.writeJsonSync(dbPath, creations);
}

module.exports = {
  getAllCreations,
  getCreationById,
  createCreation,
  deleteCreation
};
