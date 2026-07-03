const { PDFParse, VerbosityLevel } = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const pdfPath = path.join(__dirname, '..', 'books for referrence', 'Candlestick Charting For Dummies, 3rd Edition [TRUE PDF].pdf');

async function extractPDF() {
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const parser = new PDFParse({ verbosity: VerbosityLevel.ERRORS });
        
        // Load the PDF
        await parser.load(dataBuffer);
        
        const info = await parser.getInfo();
        console.log('=== PDF INFO ===');
        console.log(JSON.stringify(info, null, 2));
        
        // Get total pages from info
        const totalPages = info.pages || info.numPages || 100;
        console.log('\nTotal Pages detected:', totalPages);
        console.log('\n=== EXTRACTING TEXT PAGE BY PAGE ===\n');
        
        for (let p = 1; p <= totalPages; p++) {
            try {
                const pageText = await parser.getPageText(p);
                console.log(`\n========== PAGE ${p} ==========\n`);
                console.log(pageText);
            } catch(pe) {
                console.log(`Page ${p} error: ${pe.message}`);
                break;
            }
        }
        
    } catch (err) {
        console.error('Error:', err.message);
        console.error(err.stack);
    }
}

extractPDF();
