import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${name}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${name} - ${detail || 'Failed'}`);
  }
}

console.log('================================================================');
console.log(' RESEARCHFLOW AI - CINEMATIC CANVAS ASSET & RENDERER TEST');
console.log('================================================================\n');

// 1. Manifest verification
console.log('--- 1. Manifest Integrity & Schema ---');
const manifestPath = path.join(process.cwd(), 'public', 'cinematic', 'manifest.json');
assert(fs.existsSync(manifestPath), 'Manifest file exists on disk');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert(manifest.totalFrames === 192, `totalFrames is 192 (Got: ${manifest.totalFrames})`);
assert(manifest.width === 1280, `width is 1280 (Got: ${manifest.width})`);
assert(manifest.height === 720, `height is 720 (Got: ${manifest.height})`);
assert(manifest.aspectRatio === '16:9', `aspectRatio is 16:9 (Got: ${manifest.aspectRatio})`);
assert(manifest.fps === 24, `fps is 24 (Got: ${manifest.fps})`);
assert(manifest.durationSeconds === 8.0, `durationSeconds is 8.0 (Got: ${manifest.durationSeconds})`);
assert(manifest.padLength === 4, `padLength is 4 (Got: ${manifest.padLength})`);
assert(fs.existsSync(path.join(process.cwd(), 'public', manifest.sourceVideo)), `Master source video exists (${manifest.sourceVideo})`);

// 2. Frame URL resolution & completeness
console.log('\n--- 2. Programmatic Frame URL Generation & Zero-Missing Check ---');
function getFrameUrl(index: number): string {
  const clamped = Math.max(1, Math.min(manifest.totalFrames, Math.round(index)));
  const padded = String(clamped).padStart(manifest.padLength, '0');
  return manifest.framePattern.replace('{index}', padded);
}

const firstUrl = getFrameUrl(1);
const midUrl = getFrameUrl(96);
const lastUrl = getFrameUrl(192);

assert(firstUrl === '/cinematic/frames/frame-0001.jpg', `Frame 1 URL: ${firstUrl}`);
assert(midUrl === '/cinematic/frames/frame-0096.jpg', `Frame 96 (Middle) URL: ${midUrl}`);
assert(lastUrl === '/cinematic/frames/frame-0192.jpg', `Frame 192 (Last) URL: ${lastUrl}`);

let allFramesExist = true;
let corruptedFrames = 0;
for (let i = 1; i <= manifest.totalFrames; i++) {
  const relative = getFrameUrl(i).replace(/^\//, '');
  const full = path.join(process.cwd(), 'public', relative);
  if (!fs.existsSync(full)) {
    allFramesExist = false;
    console.error(`Missing frame: ${full}`);
  } else {
    const stat = fs.statSync(full);
    if (stat.size < 1000) corruptedFrames++;
  }
}
assert(allFramesExist, `All ${manifest.totalFrames} frames exist sequentially on disk without missing numbers`);
assert(corruptedFrames === 0, `All ${manifest.totalFrames} frames are healthy non-zero image assets`);

// 3. Scroll Progress Mapping & Reversibility
console.log('\n--- 3. Full-Page Document Scroll Progress Mapping ---');
function progressToFrame(progress: number): number {
  const norm = Math.max(0, Math.min(1, progress));
  return 1 + Math.round(norm * (manifest.totalFrames - 1));
}

assert(progressToFrame(0.0) === 1, 'Page top (0.0 progress) maps to Frame 1');
assert(progressToFrame(0.5) === 97, 'Page midpoint (0.5 progress) maps to Frame 97');
assert(progressToFrame(1.0) === 192, 'Page bottom / Footer (1.0 progress) maps to Frame 192');

// Forward scroll progression
let forwardStrict = true;
let prevFrame = 0;
for (let p = 0; p <= 1.0; p += 0.05) {
  const f = progressToFrame(p);
  if (f < prevFrame) forwardStrict = false;
  prevFrame = f;
}
assert(forwardStrict, 'Forward document scrolling produces strictly monotonic frame advancement');

// Reverse scroll progression
let reverseStrict = true;
prevFrame = 999;
for (let p = 1.0; p >= 0.0; p -= 0.05) {
  const f = progressToFrame(p);
  if (f > prevFrame) reverseStrict = false;
  prevFrame = f;
}
assert(reverseStrict, 'Reverse document scrolling cleanly steps frames backwards in reverse');

// 4. Responsive Object-Fit Cover Math across Viewports
console.log('\n--- 4. Responsive Canvas Sizing & Cover Math (High-DPI / No Distortion) ---');
interface CoverResult {
  drawW: number;
  drawH: number;
  offsetX: number;
  offsetY: number;
  scale: number;
}

function calculateCover(targetW: number, targetH: number, srcW: number = 1280, srcH: number = 720, focal = { x: 0.5, y: 0.5 }): CoverResult {
  const srcAspect = srcW / srcH;
  const canvasAspect = targetW / targetH;
  let drawW = targetW;
  let drawH = targetH;
  let offsetX = 0;
  let offsetY = 0;

  if (canvasAspect > srcAspect) {
    drawW = targetW;
    drawH = Math.round(targetW / srcAspect);
    offsetY = Math.round((targetH - drawH) * focal.y);
  } else {
    drawH = targetH;
    drawW = Math.round(targetH * srcAspect);
    offsetX = Math.round((targetW - drawW) * focal.x);
  }

  const scale = drawW / srcW;
  return { drawW, drawH, offsetX, offsetY, scale };
}

// Test 4.1: Desktop 1920x1080 (16:9 exact match)
const desktop16x9 = calculateCover(1920, 1080);
assert(desktop16x9.drawW === 1920 && desktop16x9.drawH === 1080, 'Desktop 1920x1080: perfect 1:1 aspect match');
assert(desktop16x9.offsetX === 0 && desktop16x9.offsetY === 0, 'Desktop 1920x1080: zero cropping offset');

// Test 4.2: Ultra-wide 2560x1080 (21:9)
const ultrawide = calculateCover(2560, 1080);
assert(ultrawide.drawW === 2560, 'Ultra-wide: covers full width (2560px)');
assert(ultrawide.drawH >= 1080, 'Ultra-wide: height fully covered without letterbox bars');

// Test 4.3: Mobile portrait 390x844 (iPhone 14 / vertical screen)
const mobile = calculateCover(390, 844);
assert(mobile.drawH === 844, 'Mobile portrait: covers full screen height');
assert(mobile.drawW >= 390, 'Mobile portrait: covers full screen width');
const effectiveAspect = mobile.drawW / mobile.drawH;
assert(Math.abs(effectiveAspect - (1280 / 720)) < 0.01, 'Mobile: preserves exact 16:9 aspect ratio (Zero stretching/distortion)');

// Test 4.4: High-DPI buffer scaling (Retina 2x)
const dpr = 2;
const retinaBufferW = 1920 * dpr;
const retinaBufferH = 1080 * dpr;
const retinaCover = calculateCover(retinaBufferW, retinaBufferH);
assert(retinaCover.drawW === 3840 && retinaCover.drawH === 2160, 'Retina 2x buffer renders at 3840x2160 crisp internal resolution');

// 5. Transformation Stage Mapping
console.log('\n--- 5. Transformation Stage Mapping ---');
const stages = manifest.transformationStages || [];
assert(stages.length === 6, `Defined ${stages.length} cinematic narrative stages`);
assert(stages[0].stage === 'MARKET_CHAOS', 'Stage 0%: MARKET_CHAOS');
assert(stages[1].stage === 'DISCOVERY', 'Stage 20%: DISCOVERY');
assert(stages[2].stage === 'EVIDENCE', 'Stage 40%: EVIDENCE');
assert(stages[3].stage === 'INTELLIGENCE', 'Stage 60%: INTELLIGENCE');
assert(stages[4].stage === 'STRATEGY', 'Stage 80%: STRATEGY');
assert(stages[5].stage === 'ACTION', 'Stage 100%: ACTION');

console.log('\n================================================================');
console.log(`CANVAS ASSET & RENDERER TEST RESULTS: ${passed} PASS / ${failed} FAIL`);
console.log('================================================================');

if (failed > 0) process.exit(1);
else process.exit(0);
