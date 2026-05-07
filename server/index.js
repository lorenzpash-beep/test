const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');
const { extractTextFromPDF } = require('./parser');
const { classifyContent } = require('./classifier');
const { extractData } = require('./extractor');
const { generatePDF } = require('./renderer');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3001;

// Ensure directories exist
fs.ensureDirSync(path.join(__dirname, 'uploads'));
fs.ensureDirSync(path.join(__dirname, 'generated_pdfs'));
fs.ensureDirSync(path.join(__dirname, 'thumbnails'));

app.use(cors());
app.use(express.json());
app.use('/generated_pdfs', express.static(path.join(__dirname, 'generated_pdfs')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/thumbnails', express.static(path.join(__dirname, 'thumbnails')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

app.post('/api/upload', upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
  try {
    if (!req.files.pdf) {
      return res.status(400).send('No PDF file uploaded.');
    }

    const pdfPath = req.files.pdf[0].path;
    const text = await extractTextFromPDF(pdfPath);
    const type = classifyContent(text);
    const extractedData = extractData(type, text);

    let imagePath = null;
    if (req.files.image) {
      imagePath = req.files.image[0].path;
    }

    res.json({
      text,
      type,
      imagePath,
      extractedData
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing upload.');
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    const { name, type, data, imagePath } = req.body;
    const timestamp = Date.now();
    const filename = `generated-${timestamp}.pdf`;
    const thumbName = `thumb-${timestamp}.png`;
    const outputPath = path.join(__dirname, 'generated_pdfs', filename);
    const thumbPath = path.join(__dirname, 'thumbnails', thumbName);

    // Image path for renderer should be absolute or accessible URL
    const fullImagePath = imagePath ? path.join(__dirname, imagePath) : null;

    await generatePDF(type, { ...data, imagePath: fullImagePath }, outputPath, thumbPath);

    const creationId = db.createCreation(
      name || 'Unnamed',
      type,
      `/generated_pdfs/${filename}`,
      imagePath ? `/${imagePath}` : null,
      data
    );

    res.json({ id: creationId, pdfUrl: `/generated_pdfs/${filename}` });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating PDF.');
  }
});

app.get('/api/creations', (req, res) => {
  try {
    const creations = db.getAllCreations();
    res.json(creations);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching creations.');
  }
});

app.delete('/api/creations/:id', (req, res) => {
  try {
    const { id } = req.params;
    const creation = db.getCreationById(id);
    if (creation) {
      if (creation.result_pdf_path) {
          const fullPath = path.join(__dirname, creation.result_pdf_path);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
      db.deleteCreation(id);
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting creation.');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
