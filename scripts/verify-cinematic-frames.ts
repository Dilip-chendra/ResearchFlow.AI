import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const framesDir = path.join(process.cwd(), 'public', 'cinematic', 'frames');
const files = fs.readdirSync(framesDir).filter(f => f.endsWith('.jpg')).sort();

console.log('=== CINEMATIC FRAME AUDIT ===');
console.log('Frame directory:', framesDir);
console.log('Total frames extracted:', files.length);

if (files.length === 0) {
  console.error('FAIL: No frames found!');
  process.exit(1);
}

const first = files[0];
const last = files[files.length - 1];
console.log('First frame:', first);
console.log('Last frame:', last);

// Verify sequence
let sequential = true;
const missing: Array<{ index: number; expected: string; got?: string }> = [];

for (let i = 1; i <= files.length; i++) {
  const expected = `frame-${String(i).padStart(4, '0')}.jpg`;
  if (files[i - 1] !== expected) {
    sequential = false;
    missing.push({ index: i, expected, got: files[i - 1] });
  }
}

console.log('Sequential numbering check:', sequential ? 'PASS (1 to ' + files.length + ')' : 'FAIL', missing);

// Check file size, non-empty, and read bytes
let totalBytes = 0;
let corrupted = 0;

for (const f of files) {
  const fullPath = path.join(framesDir, f);
  const stat = fs.statSync(fullPath);
  totalBytes += stat.size;

  // Verify JPEG header (SOI marker 0xFFD8) and EOI marker (0xFFD9)
  const buf = fs.readFileSync(fullPath);
  if (buf.length < 4 || buf[0] !== 0xFF || buf[1] !== 0xD8 || buf[buf.length - 2] !== 0xFF || buf[buf.length - 1] !== 0xD9) {
    console.error(`Corrupted JPEG marker detected in ${f}!`);
    corrupted++;
  }
}

console.log('JPEG Header & Tail (0xFFD8 / 0xFFD9) Integrity:', corrupted === 0 ? 'PASS (100% Valid)' : `FAIL (${corrupted} corrupted)`);
console.log('Total Frames Size:', (totalBytes / (1024 * 1024)).toFixed(2), 'MB');
console.log('Average frame size:', (totalBytes / files.length / 1024).toFixed(1), 'KB');

// Probe sample frames for resolution
const sampleIndices = [0, 19, 38, 57, 76, 95, 114, 133, 152, 171, files.length - 1];
let allMatch = true;

for (const idx of sampleIndices) {
  const f = files[idx];
  const fullPath = path.join(framesDir, f);
  const out = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of json "${fullPath}"`).toString();
  const data = JSON.parse(out);
  const w = data.streams[0].width;
  const h = data.streams[0].height;
  const percent = Math.round((idx / (files.length - 1)) * 100);
  console.log(`Frame ${f} (${percent}% progress): ${w}x${h}`);
  if (w !== 1280 || h !== 720) {
    allMatch = false;
  }
}

console.log('Dimension consistency check (1280x720):', allMatch ? 'PASS' : 'FAIL');
console.log('Duration and frame count consistency: 8.0s @ 24fps = 192 frames:', files.length === 192 ? 'PASS' : 'FAIL');
