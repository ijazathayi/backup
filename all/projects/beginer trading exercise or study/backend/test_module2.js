const { PDFParse, VerbosityLevel } = require('pdf-parse');
console.log('VerbosityLevel:', VerbosityLevel);

// Try constructing with options
try {
    const parser = new PDFParse({ verbosity: 0 });
    console.log('Parser created:', typeof parser);
    console.log('Parser methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(parser)));
} catch(e) {
    console.log('Constructor error:', e.message);
}
