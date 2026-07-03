const m = require('pdf-parse');
console.log('type:', typeof m);
if (typeof m === 'object') {
    console.log('keys:', Object.keys(m));
    Object.keys(m).forEach(k => console.log(k, '->', typeof m[k]));
}
if (typeof m === 'function') {
    console.log('it is a function directly');
}
