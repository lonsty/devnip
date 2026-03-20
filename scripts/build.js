// Build script - 先用 esbuild 打包，再将文件复制到 dist/ 目录，可选生成 zip
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const ZIP_FLAG = process.argv.includes('--zip');

// 需要复制的文件和目录
const COPY_LIST = [
  'manifest.json',
  'popup/',
  'background/',
  'icons/'
];

// popup/ 目录下不需要复制的源文件（已打包进 bundle）
// NOTE: i18n.js and constants.js are NOT excluded because
// background/service-worker.js imports them via ../popup/
const POPUP_EXCLUDE = [
  'popup.js',
  'cm-editor.js',
  'cache.js',
  'theme.js',
  'render.js',
  'icons.js',
  'popup.bundle.js.map',
];

function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest, excludes = []) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      if (excludes.includes(item)) continue;
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function createZip(sourceDir, outputPath) {
  const cwd = path.dirname(sourceDir);
  const dirName = path.basename(sourceDir);
  try {
    execSync(`cd "${cwd}" && zip -r "${outputPath}" "${dirName}"`, { stdio: 'pipe' });
    return true;
  } catch {
    console.warn('zip command not available, skipping zip creation');
    return false;
  }
}

// Step 1: Run esbuild to create the bundle
console.log('Building Devnip...');
console.log('  Bundling popup.js with esbuild...');
try {
  execSync('node scripts/esbuild.js --minify', { cwd: ROOT, stdio: 'inherit' });
} catch (e) {
  console.error('esbuild failed:', e.message);
  process.exit(1);
}

// Step 2: Copy files to dist/
cleanDir(DIST);

for (const item of COPY_LIST) {
  const src = path.join(ROOT, item);
  const dest = path.join(DIST, item);
  if (!fs.existsSync(src)) {
    console.warn(`Warning: ${item} not found, skipping`);
    continue;
  }
  // For popup/, exclude source files that are bundled
  const excludes = item === 'popup/' ? POPUP_EXCLUDE : [];
  copyRecursive(src, dest, excludes);
  console.log(`  Copied ${item}`);
}

// Note: utils/ is no longer needed in dist (bundled into popup.bundle.js)
// But background/service-worker.js still uses ES module imports from utils/
// Check if background service worker needs utils
const swPath = path.join(ROOT, 'background/service-worker.js');
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  if (swContent.includes('../utils/') || swContent.includes("'../utils/")) {
    // Service worker references utils, copy them
    copyRecursive(path.join(ROOT, 'utils'), path.join(DIST, 'utils'));
    console.log('  Copied utils/ (needed by service worker)');
  }
}

// 统计文件大小
let totalSize = 0;
function countSize(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) countSize(full);
    else totalSize += stat.size;
  }
}
countSize(DIST);
console.log(`\nBuild output: ${DIST}`);
console.log(`Total size: ${(totalSize / 1024).toFixed(1)} KB`);

if (ZIP_FLAG) {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const zipName = `devnip-v${pkg.version}.zip`;
  const zipPath = path.join(ROOT, zipName);
  if (createZip(DIST, zipPath)) {
    const zipSize = fs.statSync(zipPath).size;
    console.log(`\nZip created: ${zipName} (${(zipSize / 1024).toFixed(1)} KB)`);
  }
}

console.log('\nDone!');
