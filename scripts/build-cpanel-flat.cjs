const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const inputDir = path.join(projectRoot, 'dist');
const outputDir = path.join(projectRoot, 'dist-cpanel');
const inputHtml = fs.readFileSync(path.join(inputDir, 'index.html'), 'utf8');

const cssSource = inputHtml.match(/href="(\.\/assets\/[^"]+\.css)"/)?.[1];
const appSource = inputHtml.match(/src="(\.\/assets\/[^"]+\.js)"/)?.[1];

if (!cssSource || !appSource) {
  throw new Error('Could not locate the built CSS and JavaScript entry files.');
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

let html = inputHtml
  .replace(cssSource, './graphics-gravity.css')
  .replace(appSource, './graphics-gravity.js')
  .replace('./vendor/matter.min.js', './matter.min.js');

fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf8');
fs.copyFileSync(path.resolve(inputDir, cssSource), path.join(outputDir, 'graphics-gravity.css'));
fs.copyFileSync(path.resolve(inputDir, appSource), path.join(outputDir, 'graphics-gravity.js'));
fs.copyFileSync(path.join(inputDir, 'vendor', 'matter.min.js'), path.join(outputDir, 'matter.min.js'));
fs.copyFileSync(path.join(inputDir, 'vendor', 'opentype.LICENSE.txt'), path.join(outputDir, 'opentype.LICENSE.txt'));
fs.copyFileSync(path.join(inputDir, 'graphics-gravity-icon.png'), path.join(outputDir, 'graphics-gravity-icon.png'));
fs.copyFileSync(path.join(inputDir, '.htaccess'), path.join(outputDir, '.htaccess'));

for (const fileName of [
  'graphics-gravity-space-mono.ttf',
  'graphics-gravity-space-mono.LICENSE.txt',
  'graphics-gravity-sans.ttf',
  'graphics-gravity-sans.LICENSE.txt',
  'graphics-gravity-script.ttf',
  'graphics-gravity-script.LICENSE.txt',
]) {
  fs.copyFileSync(path.join(inputDir, fileName), path.join(outputDir, fileName));
}

console.log('Created a flat cPanel build in dist-cpanel/.');
