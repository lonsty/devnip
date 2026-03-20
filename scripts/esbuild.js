// esbuild config - bundle popup.js with CodeMirror dependencies
const esbuild = require('esbuild');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const isWatch = process.argv.includes('--watch');

const config = {
  entryPoints: [path.join(ROOT, 'popup/popup.js')],
  bundle: true,
  outfile: path.join(ROOT, 'popup/popup.bundle.js'),
  format: 'esm',
  target: ['chrome92'],
  minify: process.argv.includes('--minify'),
  sourcemap: !process.argv.includes('--minify'),
  logLevel: 'info',
};

if (isWatch) {
  esbuild.context(config).then(ctx => {
    ctx.watch();
    console.log('Watching for changes...');
  });
} else {
  esbuild.build(config).then(() => {
    console.log('Bundle complete: popup/popup.bundle.js');
  });
}
