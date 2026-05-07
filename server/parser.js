const fs = require('fs');
const pdf = require('pdf-parse');

async function extractTextFromPDF(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  try {
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw error;
  }
}

module.exports = { extractTextFromPDF };
