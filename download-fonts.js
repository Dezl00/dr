const fs = require('fs');
const https = require('https');
const path = require('path');

const fonts = [
  { weight: 400, url: 'https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4i1UQUf.woff2' },
  { weight: 500, url: 'https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4i1UQUf.woff2' }, // Usually a different file, reusing for mock
  { weight: 600, url: 'https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4i1UQUf.woff2' },
  { weight: 700, url: 'https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4i1UQUf.woff2' }
];

const fontDir = path.join(__dirname, 'public', 'fonts');

if (!fs.existsSync(fontDir)) {
  fs.mkdirSync(fontDir, { recursive: true });
}

fonts.forEach(font => {
  const filePath = path.join(fontDir, `rubik-${font.weight}.woff2`);
  const file = fs.createWriteStream(filePath);
  https.get(font.url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded rubik-${font.weight}.woff2`);
    });
  }).on('error', err => {
    fs.unlink(filePath, () => {});
    console.error(`Error downloading ${font.weight}:`, err.message);
  });
});
