const fs = require('fs');
const cp = require('child_process');

try {
  const files = cp.execSync('findstr /S /M /C:"font-bold" src\\*.tsx', { encoding: 'utf8' }).split('\r\n').filter(Boolean);
  files.forEach(f => {
    if (f.includes('invoice') || f.includes('verify')) return;
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/font-bold/g, 'font-semibold');
    fs.writeFileSync(f, c);
    console.log('Updated', f);
  });
} catch (e) {
  console.error(e);
}
