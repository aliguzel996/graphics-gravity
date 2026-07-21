const fs = require('node:fs');
const path = require('node:path');

const outputFile = path.resolve(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(outputFile, 'utf8');

const moduleScriptPattern = /\s*<script\s+type="module"\s+crossorigin\s+src="([^"]+)"><\/script>/;
const moduleScript = html.match(moduleScriptPattern);

if (!moduleScript) {
  throw new Error('Could not locate the Vite entry script in dist/index.html.');
}

const entrySource = moduleScript[1];
html = html.replace(moduleScriptPattern, '');
html = html.replace(/\s*<script\s+src="\.\/vendor\/matter\.min\.js"><\/script>/, '');

const scripts = [
  '    <script defer src="./vendor/matter.min.js"></script>',
  `    <script defer src="${entrySource}"></script>`,
].join('\n');

html = html.replace('  </head>', `${scripts}\n  </head>`);
fs.writeFileSync(outputFile, html, 'utf8');

console.log('Prepared a cPanel-compatible classic-script web build.');
