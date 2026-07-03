const { PDFParse, VerbosityLevel } = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const pdfPath = path.join(__dirname, '..', 'books for referrence', 'Candlestick Charting For Dummies, 3rd Edition [TRUE PDF].pdf');

async function run() {
    const parser = new PDFParse({ verbosity: VerbosityLevel.ERRORS });
    // Try loading with file:// URL
    const fileUrl = 'file:///' + pdfPath.replace(/\\/g, '/');
    console.log('Loading from URL:', fileUrl);
    try {
        await parser.load(fileUrl);
        const info = await parser.getInfo();
        console.log('Info:', JSON.stringify(info, null, 2));
    } catch(e) {
        console.log('file:// URL error:', e.message);
        
        // Try with path directly
        try {
            await parser.load(pdfPath);
            const info = await parser.getInfo();
            console.log('Info:', JSON.stringify(info, null, 2));
        } catch(e2) {
            console.log('direct path error:', e2.message);
        }
    }
}

run().catch(console.error);
