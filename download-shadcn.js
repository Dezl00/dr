const fs = require('fs');
const https = require('https');
const path = require('path');

const components = [
  'button.tsx', 'input.tsx', 'card.tsx', 'dialog.tsx', 'sheet.tsx',
  'dropdown-menu.tsx', 'select.tsx', 'table.tsx', 'badge.tsx', 'tabs.tsx',
  'toast.tsx', 'toaster.tsx', 'use-toast.ts', 'avatar.tsx', 'form.tsx', 'separator.tsx',
  'skeleton.tsx', 'tooltip.tsx', 'popover.tsx', 'command.tsx', 'calendar.tsx', 'label.tsx'
];

const targetDir = path.join(__dirname, 'src', 'components', 'ui');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        reject(new Error(`Failed with status ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  for (const comp of components) {
    let url;
    if (comp === 'use-toast.ts') {
       url = `https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/registry/new-york/hooks/use-toast.ts`;
    } else {
       url = `https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/registry/new-york/ui/${comp}`;
    }
    
    const dest = path.join(targetDir, comp);
    try {
      await download(url, dest);
      console.log(`Downloaded ${comp}`);
    } catch (e) {
      console.error(`Failed ${comp}:`, e.message);
    }
  }
}

main();
