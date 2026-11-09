const fs = require('fs');
const path = require('path');

const [,, targetRelPath, base64Content] = process.argv;
if (!targetRelPath || !base64Content) {
  console.error('Usage: node scripts/b64write.js <relPath> <base64>');
  process.exit(1);
}

const fullPath = path.join(__dirname, '..', targetRelPath);
const dir = path.dirname(fullPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const content = Buffer.from(base64Content, 'base64').toString('utf8');
fs.writeFileSync(fullPath, content, 'utf8');
console.log('Created:', targetRelPath);
