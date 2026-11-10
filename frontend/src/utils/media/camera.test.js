import assert from 'node:assert/strict';
import test from 'node:test';

import { computeCoverCrop } from './camera.js';

const rect = (left, top, width, height) => ({ left, top, width, height });

test('maps the frame onto a portrait phone screen showing a landscape video (cover)', () => {
  // 1920x1080 video shown full-screen on a 400x800 viewport: scale = 800/1080,
  // the sides are cropped off, so the visible window is centred horizontally.
  const crop = computeCoverCrop(
    { width: 1920, height: 1080 },
    rect(0, 0, 400, 800),
    rect(50, 300, 300, 200)
  );

  const scale = 800 / 1080;
  const offsetX = (400 - 1920 * scale) / 2;
  assert.ok(Math.abs(crop.x - (50 - offsetX) / scale) < 1e-6);
  assert.ok(Math.abs(crop.y - 300 / scale) < 1e-6);
  assert.ok(Math.abs(crop.width - 300 / scale) < 1e-6);
  assert.ok(Math.abs(crop.height - 200 / scale) < 1e-6);
  // The old per-axis scaling (videoWidth / elementWidth) would have given x = 240.
  assert.notEqual(Math.round(crop.x), 240);
});

test('is the identity mapping when the element has the same aspect ratio as the video', () => {
  const crop = computeCoverCrop(
    { width: 1280, height: 720 },
    rect(0, 0, 640, 360),
    rect(160, 90, 320, 180)
  );
  assert.deepEqual(
    { x: crop.x, y: crop.y, width: crop.width, height: crop.height },
    { x: 320, y: 180, width: 640, height: 360 }
  );
});

test('clamps a frame that sticks out of the video', () => {
  const crop = computeCoverCrop(
    { width: 1000, height: 1000 },
    rect(0, 0, 500, 500),
    rect(-100, 400, 800, 400)
  );
  assert.equal(crop.x, 0);
  assert.ok(crop.x + crop.width <= 1000);
  assert.ok(crop.y + crop.height <= 1000);
});

test('returns null while the video has no dimensions yet', () => {
  assert.equal(computeCoverCrop({ width: 0, height: 0 }, rect(0, 0, 400, 800), rect(0, 0, 10, 10)), null);
});
