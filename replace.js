const fs = require('fs');
const cp = require('child_process');

try {
  const files = cp.execSync('findstr /S /M /C:"toLocaleString()" src\\*.tsx src\\*.ts', { encoding: 'utf8' }).split('\r\n').filter(Boolean);
  files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/\.toLocaleString\(\)/g, '.toLocaleString(\'en-US\')');
    fs.writeFileSync(f, c);
    console.log('Updated', f);
  });
} catch (e) {
  console.error(e);
}
