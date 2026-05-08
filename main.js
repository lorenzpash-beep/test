const { app, BrowserWindow, ipcMain, protocol, shell, net } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs-extra');
const url = require('url');

// Import backend logic
const { extractTextFromPDF } = require('./server/parser');
const { classifyContent } = require('./server/classifier');
const { extractData } = require('./server/extractor');
const { generatePDF } = require('./server/renderer');
const db = require('./server/db');

// Paths
const userDataPath = app.getPath('userData');
const uploadsDir = path.join(userDataPath, 'uploads');
const generatedDir = path.join(userDataPath, 'generated_pdfs');
const thumbDir = path.join(userDataPath, 'thumbnails');

// Ensure directories
fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(generatedDir);
fs.ensureDirSync(thumbDir);

// Register custom protocol for local assets
protocol.registerSchemesAsPrivileged([
  { scheme: 'app-data', privileges: { secure: true, standard: true, supportFetchAPI: true } }
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, 'client/build/index.html')}`
  );
}

app.whenReady().then(() => {
  // Secure protocol handler with path traversal protection
  protocol.handle('app-data', (request) => {
    const urlPath = decodeURIComponent(new URL(request.url).pathname);
    const normalizedPath = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(userDataPath, normalizedPath);

    // Safety check: ensure the path is within userDataPath
    if (!fullPath.startsWith(userDataPath)) {
        return new Response('Access Denied', { status: 403 });
    }

    return net.fetch(url.pathToFileURL(fullPath).toString());
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('upload-files', async (event, { pdfPath, imagePath }) => {
  const destPdf = path.join(uploadsDir, Date.now() + '-' + path.basename(pdfPath));
  await fs.copy(pdfPath, destPdf);

  let destImageName = null;
  if (imagePath) {
    destImageName = Date.now() + '-' + path.basename(imagePath);
    await fs.copy(imagePath, path.join(uploadsDir, destImageName));
  }

  const text = await extractTextFromPDF(destPdf);
  const type = classifyContent(text);
  const extractedData = extractData(type, text);

  return {
    text,
    type,
    imagePath: destImageName ? `uploads/${destImageName}` : null,
    extractedData
  };
});

ipcMain.handle('generate-pdf', async (event, { name, type, data, imagePath }) => {
  const timestamp = Date.now();
  const filename = `generated-${timestamp}.pdf`;
  const thumbName = `thumb-${timestamp}.png`;
  const outputPath = path.join(generatedDir, filename);
  const thumbPath = path.join(thumbDir, thumbName);

  const fullImagePath = imagePath ? path.join(userDataPath, imagePath) : null;

  await generatePDF(type, { ...data, imagePath: fullImagePath }, outputPath, thumbPath);

  const creationId = db.createCreation(
    name || 'Unnamed',
    type,
    outputPath,
    fullImagePath,
    data
  );

  return { id: creationId, pdfUrl: `app-data:///generated_pdfs/${filename}` };
});

ipcMain.handle('get-creations', async () => {
  return db.getAllCreations().map(c => ({
      ...c,
      result_pdf_path: `app-data:///generated_pdfs/${path.basename(c.result_pdf_path)}`,
      thumbnail_path: `app-data:///thumbnails/${path.basename(c.thumbnail_path)}`
  }));
});

ipcMain.handle('delete-creation', async (event, id) => {
  const creation = db.getCreationById(id);
  if (creation) {
    if (creation.result_pdf_path && fs.existsSync(creation.result_pdf_path)) {
      fs.unlinkSync(creation.result_pdf_path);
    }
    if (creation.thumbnail_path && fs.existsSync(creation.thumbnail_path)) {
        fs.unlinkSync(creation.thumbnail_path);
    }
    db.deleteCreation(id);
  }
  return { success: true };
});

ipcMain.handle('open-pdf', async (event, pdfUrl) => {
    const urlPath = decodeURIComponent(new URL(pdfUrl).pathname);
    const normalizedPath = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(userDataPath, normalizedPath);
    if (fullPath.startsWith(userDataPath)) {
        shell.openPath(fullPath);
    }
});
