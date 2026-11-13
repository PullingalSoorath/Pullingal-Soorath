import fs from 'fs';

// 1. Clean and prepare docs directory
if (fs.existsSync('docs')) {
  fs.rmSync('docs', { recursive: true, force: true });
}
fs.mkdirSync('docs', { recursive: true });

// 2. Copy all files from dist to docs (for GitHub Pages /docs configuration)
fs.cpSync('dist', 'docs', { recursive: true });

// 3. Clean and prepare root assets directory
if (fs.existsSync('assets')) {
  fs.rmSync('assets', { recursive: true, force: true });
}
fs.mkdirSync('assets', { recursive: true });
fs.cpSync('dist/assets', 'assets', { recursive: true });

// 4. Copy dist/index.html to root index.html (preserving index.source.html)
if (!fs.existsSync('index.source.html')) {
  fs.copyFileSync('index.html', 'index.source.html');
}
fs.copyFileSync('dist/index.html', 'index.html');

// 5. Add a .nojekyll file to docs and root so GitHub Pages serves all assets and folders starting with underscores or dots
fs.writeFileSync('.nojekyll', '');
fs.writeFileSync('docs/.nojekyll', '');

// 6. Copy all root-level assets and files (PDFs, images, icons) from dist to root for root-based GitHub Pages
const distItems = fs.readdirSync('dist', { withFileTypes: true });
for (const item of distItems) {
  if (item.name === 'index.html' || item.name === 'assets') continue;
  const src = `dist/${item.name}`;
  const dest = item.name;
  if (item.isDirectory()) {
    fs.cpSync(src, dest, { recursive: true });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('Successfully prepared GitHub Pages deployment for both root and /docs!');
