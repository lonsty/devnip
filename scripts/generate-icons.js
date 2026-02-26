/**
 * Generate Devnip icons (16x16, 48x48, 128x128) as PNG files.
 * Design: Connected S-shaped "</>" where all segments are at 45° angles.
 * "<" and ">" each have two equal-length 45° arms. "/" connects them at 45°.
 * The "/" breaks in the middle; the gap is bridged by equal-width rectangles
 * whose length (along the / direction) tapers: long → short → long (shortest
 * in the center).
 *
 * Usage: npm run icons  (auto-installs canvas if missing)
 */

// ========== Tunable Parameters ==========
const DASH_COUNT       = 2;    // 矩形数量（≥48px 时使用，16px 固定 3 个）
const DASH_MAX_LEN     = 1.0;  // 最大矩形长度（线宽的倍数）— 两端的矩形
const DASH_MIN_LEN     = 1.0; // 最小矩形长度（线宽的倍数）— 中间的矩形
const DASH_GAP_RATIO   = 0.5;  // 矩形的宽度（线宽的倍数），即垂直于 / 方向的粗细
// =========================================

let createCanvas;
try {
  ({ createCanvas } = require('canvas'));
} catch {
  console.log('Installing canvas package...');
  require('child_process').execSync('npm install --save-dev canvas', {
    cwd: require('path').join(__dirname, '..'),
    stdio: 'inherit',
  });
  ({ createCanvas } = require('canvas'));
}

const fs = require('fs');
const path = require('path');

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size;
  const r = s * 0.18;

  // --- Background ---
  drawRoundedRect(ctx, 0, 0, s, s, r);
  const grad = ctx.createLinearGradient(0, 0, s, s);
  grad.addColorStop(0, '#4f46e5');
  grad.addColorStop(0.5, '#6366f1');
  grad.addColorStop(1, '#3b82f6');
  ctx.fillStyle = grad;
  ctx.fill();

  drawRoundedRect(ctx, 0, 0, s, s, r);
  const glowGrad = ctx.createRadialGradient(s * 0.3, s * 0.3, 0, s * 0.5, s * 0.5, s * 0.7);
  glowGrad.addColorStop(0, 'rgba(255,255,255,0.10)');
  glowGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glowGrad;
  ctx.fill();

  ctx.save();
  drawRoundedRect(ctx, 0, 0, s, s, r);
  ctx.clip();

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // ===== Geometry =====
  // All segments at 45°. The icon center is (cx, cy).
  //
  // Layout (all 45° diagonals):
  //
  //   "<" apex at left, arms go 45° up-right and 45° down-right (equal length = armLen).
  //     top arm:  apex → (+armLen, -armLen)   i.e. direction (1,-1)/√2
  //     bottom arm: apex → (+armLen, +armLen)  i.e. direction (1,+1)/√2
  //
  //   ">" apex at right, arms go 45° up-left and 45° down-left (equal length = armLen).
  //     top arm:  apex → (-armLen, -armLen)   i.e. direction (-1,-1)/√2
  //     bottom arm: apex → (-armLen, +armLen)  i.e. direction (-1,+1)/√2
  //
  //   "/" connects bottom of "<" to top of ">" at 45°: direction (1,-1)/√2.
  //     bottom of "<" = (apexLx + armLen, cy + armLen)
  //     top of ">"    = (apexRx - armLen, cy - armLen)
  //
  // For them to connect at 45°:
  //   (top_of_> .x - bottom_of_< .x) must equal -(top_of_> .y - bottom_of_< .y)
  //   i.e. going right by D and up by D.
  //
  // Let's define:
  //   pad = minimal edge padding
  //   apexLx = pad  (leftmost point)
  //   apexRx = s - pad  (rightmost point)
  //   Both apexes at y = cy.
  //
  //   armLen: length of each arm of < and > (projected on one axis).
  //
  //   bottom of "<": B = (pad + armLen, cy + armLen)
  //   top of ">":    T = (s - pad - armLen, cy - armLen)
  //
  //   "/" span: T.x - B.x = (s - 2*pad - 2*armLen), T.y - B.y = -2*armLen
  //   For 45°: T.x - B.x = -(T.y - B.y) = 2*armLen
  //   => s - 2*pad - 2*armLen = 2*armLen
  //   => armLen = (s - 2*pad) / 4

  const pad = s * 0.08;
  const lw = Math.max(s * 0.08, 1.6);
  ctx.lineWidth = lw;

  const cx = s * 0.5;
  const cy = s * 0.5;

  const armLen = (s - 2 * pad) / 4;

  // "<" points
  const ltApex = { x: pad, y: cy };
  const ltTop  = { x: pad + armLen, y: cy - armLen };
  const ltBot  = { x: pad + armLen, y: cy + armLen };

  // ">" points
  const gtApex = { x: s - pad, y: cy };
  const gtTop  = { x: s - pad - armLen, y: cy - armLen };
  const gtBot  = { x: s - pad - armLen, y: cy + armLen };

  // "/" endpoints: ltBot → gtTop  (45° going up-right)
  const slashStart = ltBot;   // bottom-left
  const slashEnd   = gtTop;   // top-right

  // --- Draw "<" ---
  ctx.beginPath();
  ctx.moveTo(ltTop.x, ltTop.y);
  ctx.lineTo(ltApex.x, ltApex.y);
  ctx.lineTo(ltBot.x, ltBot.y);
  ctx.stroke();

  // --- Draw ">" ---
  ctx.beginPath();
  ctx.moveTo(gtTop.x, gtTop.y);
  ctx.lineTo(gtApex.x, gtApex.y);
  ctx.lineTo(gtBot.x, gtBot.y);
  ctx.stroke();

  // --- Draw "/" with gap ---
  const dx = slashEnd.x - slashStart.x;
  const dy = slashEnd.y - slashStart.y;
  const slashLen = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / slashLen;  // unit direction along /
  const ny = dy / slashLen;
  // Perpendicular (for drawing rectangles): rotate 90°
  const px = -ny;
  const py = nx;

  // --- Draw "/" with gap in the middle 1/2 ---
  // "/" total length = slashLen. Keep first 1/4 and last 1/4 as solid line.
  // Middle 1/2 is the gap region filled with 5 decorative rectangles.
  const quarterLen = slashLen / 4;
  const gapRegionLen = slashLen / 2;  // middle half

  // Solid segment: start → 1/4 (butt cap = flat edge at 1/4 point)
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(slashStart.x, slashStart.y);
  ctx.lineTo(slashStart.x + nx * quarterLen, slashStart.y + ny * quarterLen);
  ctx.stroke();

  // Solid segment: 3/4 → end (butt cap = flat edge at 3/4 point)
  ctx.beginPath();
  ctx.moveTo(slashStart.x + nx * quarterLen * 3, slashStart.y + ny * quarterLen * 3);
  ctx.lineTo(slashEnd.x, slashEnd.y);
  ctx.stroke();
  ctx.lineCap = 'round';

  // --- Decorative rectangles in the middle 1/2 ---
  // Same width as stroke (= lw), length along "/" varies: large→small→large.
  // Equal GAPS (whitespace) between adjacent rectangles.
  const dashCount = size >= 48 ? DASH_COUNT : 3;

  const maxLen = lw * DASH_MAX_LEN;
  const minLen = lw * DASH_MIN_LEN;

  // Compute each dash length (V-shaped)
  const dashLengths = [];
  for (let i = 0; i < dashCount; i++) {
    const t = dashCount > 1 ? i / (dashCount - 1) : 0.5;
    const distFromCenter = Math.abs(t - 0.5) * 2;
    dashLengths.push(minLen + (maxLen - minLen) * distFromCenter);
  }

  // Equal gap between dashes
  const totalDashLen = dashLengths.reduce((a, b) => a + b, 0);
  const equalSpace = (gapRegionLen - totalDashLen) / (dashCount + 1);

  const halfW = lw * DASH_GAP_RATIO;

  // Gap region starts at 1/4 of slash
  const gapStartX = slashStart.x + nx * quarterLen;
  const gapStartY = slashStart.y + ny * quarterLen;

  ctx.lineCap = 'butt';
  let offset = equalSpace;
  for (let i = 0; i < dashCount; i++) {
    const dLen = dashLengths[i];
    const centerAlong = offset + dLen / 2;
    const dCx = gapStartX + nx * centerAlong;
    const dCy = gapStartY + ny * centerAlong;

    const halfLen = dLen / 2;
    ctx.beginPath();
    ctx.moveTo(dCx - nx * halfLen - px * halfW, dCy - ny * halfLen - py * halfW);
    ctx.lineTo(dCx + nx * halfLen - px * halfW, dCy + ny * halfLen - py * halfW);
    ctx.lineTo(dCx + nx * halfLen + px * halfW, dCy + ny * halfLen + py * halfW);
    ctx.lineTo(dCx - nx * halfLen + px * halfW, dCy - ny * halfLen + py * halfW);
    ctx.closePath();
    ctx.fill();

    offset += dLen + equalSpace;
  }

  ctx.restore();
  return canvas.toBuffer('image/png');
}

const iconsDir = path.join(__dirname, '..', 'icons');

for (const size of [16, 48, 128]) {
  const buf = generateIcon(size);
  const outPath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(outPath, buf);
  console.log(`Generated ${outPath} (${buf.length} bytes)`);
}

console.log('Done!');
