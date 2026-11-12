/**
 * Entry program for make.fun's cutest-picture-01 competition.
 * Validates the bundled image header and size limits before writing /output/entry.png.
 */
import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_BYTES = 1_048_576;
const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(HERE, 'entry.png');
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const DEST = join(OUTPUT_DIR, 'entry.png');

function isValidImageHeader(buf: Buffer): boolean {
  if (buf.length < 8) return false;
  const isPng =
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a;
  const isJpeg =
    buf[0] === 0xff &&
    buf[1] === 0xd8 &&
    buf[2] === 0xff &&
    buf[buf.length - 2] === 0xff &&
    buf[buf.length - 1] === 0xd9;
  return isPng || isJpeg;
}

const stats = statSync(SOURCE);
if (stats.size <= 0 || stats.size > MAX_BYTES) {
  throw new Error(`Invalid entry.png byte length: ${stats.size}`);
}

const bytes = readFileSync(SOURCE);
if (!isValidImageHeader(bytes)) {
  throw new Error('entry.png must be a valid PNG or JPEG image');
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(SOURCE, DEST);
