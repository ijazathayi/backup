const fs = require('fs');
const path = require('path');

// Use pdf-parse which is simpler
const pdfPath = path.join(__dirname, '..', 'books for referrence', 'Candlestick Charting For Dummies, 3rd Edition [TRUE PDF].pdf');

console.log('PDF path:', pdfPath);
console.log('File exists:', fs.existsSync(pdfPath));
console.log('File size:', fs.existsSync(pdfPath) ? fs.statSync(pdfPath).size + ' bytes' : 'N/A');

// Try pdf-parse
try {
  const pdfParse = require('pdf-parse');
  const dataBuffer = fs.readFileSync(pdfPath);
  pdfParse(dataBuffer).then(function(data) {
    console.log('\n=== PDF INFO ===');
    console.log('Pages:', data.numpages);
    console.log('Text length:', data.text.length);
    // Write first 50000 chars
    fs.writeFileSync(path.join(__dirname, 'book_extract.txt'), data.text.substring(0, 100000));
    console.log('Written to book_extract.txt');
  }).catch(err => {
    console.error('pdf-parse error:', err.message);
  });
} catch(e) {
  console.log('pdf-parse not available:', e.message);
  // Try pdfjs-dist
  try {
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
    console.log('pdfjs-dist available');
  } catch(e2) {
    console.log('pdfjs-dist not available:', e2.message);
  }
}
