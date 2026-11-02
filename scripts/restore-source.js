import fs from 'fs';

if (fs.existsSync('index.source.html')) {
  fs.copyFileSync('index.source.html', 'index.html');
  console.log('Restored source index.html for Vite development.');
}
