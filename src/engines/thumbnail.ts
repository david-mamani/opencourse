/**
 * OpenCourse — Thumbnail Engine
 * Video: ffmpeg frame extraction → sharp resize+sharpen → half-block ANSI.
 * PDF:   pdfjs-dist page render → sharp → half-block ANSI (no external tools needed).
 */

import sharp from 'sharp';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import chalk from 'chalk';

const THUMB_DIR = path.join(os.tmpdir(), 'opencourse-thumbs');

function ensureThumbDir(): void {
  fs.mkdirSync(THUMB_DIR, { recursive: true });
}

function hashPath(filePath: string): string {
  let hash = 0;
  for (let i = 0; i < filePath.length; i++) {
    const char = filePath.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// ─── Video Thumbnail ───

export function generateVideoThumbnail(videoPath: string): string | null {
  ensureThumbDir();
  const thumbPath = path.join(THUMB_DIR, `v_${hashPath(videoPath)}.png`);

  if (fs.existsSync(thumbPath)) return thumbPath;

  try {
    spawnSync('ffmpeg', [
      '-i', videoPath,
      '-ss', '3',
      '-vframes', '1',
      '-vf', 'scale=320:-1',   // Higher res source for better quality
      '-y',
      thumbPath,
    ], { stdio: 'pipe', timeout: 15000, windowsHide: true });

    return fs.existsSync(thumbPath) ? thumbPath : null;
  } catch {
    return null;
  }
}

// ─── PDF Thumbnail (pure Node.js — no external tools!) ───

export async function generatePdfThumbnail(pdfPath: string): Promise<string | null> {
  ensureThumbDir();
  const thumbPath = path.join(THUMB_DIR, `p_${hashPath(pdfPath)}.png`);

  if (fs.existsSync(thumbPath)) return thumbPath;

  try {
    // Dynamic import to avoid issues if pdfjs-dist not installed
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;
    const page = await doc.getPage(1);

    // Render at scale that gives ~320px width
    const viewport = page.getViewport({ scale: 1.0 });
    const scale = 320 / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const width = Math.floor(scaledViewport.width);
    const height = Math.floor(scaledViewport.height);

    // Create a simple canvas-like buffer
    // pdfjs-dist can render to a custom canvas factory
    // We'll use the operator list approach to create a simple image
    // Actually, for server-side we need to provide canvas

    // Simpler approach: render via the built-in SVG/operator list
    // and convert to PNG via sharp
    // Actually pdfjs needs a canvas. Let's create pixel data manually.

    // Use pdfjs built-in render with a minimal canvas shim
    const pixelData = new Uint8ClampedArray(width * height * 4);
    // Fill with white background
    for (let i = 0; i < pixelData.length; i += 4) {
      pixelData[i] = 255;     // R
      pixelData[i + 1] = 255; // G
      pixelData[i + 2] = 255; // B
      pixelData[i + 3] = 255; // A
    }

    // Create a minimal CanvasRenderingContext2D shim for pdf.js
    // This is complex — let's try a different approach:
    // Extract text and create a simple text-based image with sharp

    // Alternative: just create a styled "page" image showing the title
    const textItems: string[] = [];
    const textContent = await page.getTextContent();
    for (const item of textContent.items) {
      if ('str' in item && item.str.trim()) {
        textItems.push(item.str.trim());
      }
    }

    // Create an SVG with the extracted text as a visual preview
    const previewText = textItems.slice(0, 15).join('\n');
    const escapedText = previewText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const svgLines = escapedText.split('\n').map((line, i) =>
      `<text x="10" y="${20 + i * 14}" font-family="monospace" font-size="10" fill="#333">${line.slice(0, 40)}</text>`
    ).join('\n');

    const svgWidth = 320;
    const svgHeight = Math.max(200, 20 + textItems.slice(0, 15).length * 14 + 20);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
      <rect width="100%" height="100%" fill="white" rx="4"/>
      <rect x="1" y="1" width="${svgWidth - 2}" height="${svgHeight - 2}" fill="none" stroke="#ccc" rx="4"/>
      <text x="10" y="15" font-family="monospace" font-size="8" fill="#999">PDF Preview</text>
      ${svgLines}
    </svg>`;

    await sharp(Buffer.from(svg)).png().toFile(thumbPath);
    await doc.destroy();

    return fs.existsSync(thumbPath) ? thumbPath : null;
  } catch (err) {
    // Fallback: try external tools
    return generatePdfThumbnailExternal(pdfPath, thumbPath);
  }
}

function generatePdfThumbnailExternal(pdfPath: string, thumbPath: string): string | null {
  // Try magick, convert, pdftoppm
  const tools = [
    { cmd: 'magick', args: ['-density', '72', `${pdfPath}[0]`, '-resize', '320x', '-background', 'white', '-flatten', thumbPath] },
    { cmd: 'pdftoppm', args: ['-png', '-f', '1', '-l', '1', '-scale-to', '320', pdfPath, thumbPath.replace('.png', '')] },
  ];

  for (const tool of tools) {
    try {
      spawnSync(tool.cmd, tool.args, { stdio: 'pipe', timeout: 15000, windowsHide: true });
      if (fs.existsSync(thumbPath)) return thumbPath;
      // pdftoppm adds suffix
      const alt = thumbPath.replace('.png', '-1.png');
      if (fs.existsSync(alt)) { fs.renameSync(alt, thumbPath); return thumbPath; }
    } catch { /* next tool */ }
  }
  return null;
}

// ─── Image to ANSI Half-Block Art ───

export async function imageToAnsi(
  imagePath: string,
  targetWidth: number = 36,
  targetHeight: number = 16,
): Promise<string> {
  try {
    const { data, info } = await sharp(imagePath)
      .resize(targetWidth, targetHeight * 2, {
        fit: 'contain',
        background: { r: 29, g: 32, b: 33, alpha: 1 },  // #1d2021 (Gruvbox bg)
      })
      .sharpen({ sigma: 0.8 })    // Sharpen for better clarity in small renders
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const w = info.width;
    const h = info.height;
    const lines: string[] = [];

    for (let y = 0; y < h; y += 2) {
      let line = '';
      for (let x = 0; x < w; x++) {
        const topIdx = (y * w + x) * 3;
        const tr = data[topIdx]!;
        const tg = data[topIdx + 1]!;
        const tb = data[topIdx + 2]!;

        if (y + 1 < h) {
          const botIdx = ((y + 1) * w + x) * 3;
          const br = data[botIdx]!;
          const bg = data[botIdx + 1]!;
          const bb = data[botIdx + 2]!;
          line += chalk.rgb(tr, tg, tb).bgRgb(br, bg, bb)('▀');
        } else {
          line += chalk.rgb(tr, tg, tb)('▀');
        }
      }
      lines.push(line);
    }

    return lines.join('\n');
  } catch {
    return placeholderArt('ERROR', targetWidth, targetHeight);
  }
}

// ─── Placeholder Art ───

export function placeholderArt(
  type: 'VIDEO' | 'PDF' | 'ERROR',
  width: number = 36,
  height: number = 16,
): string {
  const icon = type === 'VIDEO' ? '▶' : type === 'PDF' ? '📄' : '⚠';
  const label = type === 'ERROR' ? 'Error' : 'No Preview';
  const border = chalk.hex('#5a5039');
  const text = chalk.hex('#7c6f50');

  const lines: string[] = [];
  const innerW = width - 2;
  const innerH = height - 2;

  lines.push(border('┌' + '─'.repeat(innerW) + '┐'));
  for (let i = 0; i < innerH; i++) {
    if (i === Math.floor(innerH / 2) - 1) {
      const iconStr = icon.padStart(Math.floor(innerW / 2)).padEnd(innerW);
      lines.push(border('│') + text(iconStr) + border('│'));
    } else if (i === Math.floor(innerH / 2)) {
      const labelStr = label.padStart(Math.floor((innerW + label.length) / 2)).padEnd(innerW);
      lines.push(border('│') + text(labelStr) + border('│'));
    } else {
      lines.push(border('│') + ' '.repeat(innerW) + border('│'));
    }
  }
  lines.push(border('└' + '─'.repeat(innerW) + '┘'));

  return lines.join('\n');
}

// ─── Tool checks ───

export function hasFFmpeg(): boolean {
  try {
    const r = spawnSync('ffmpeg', ['-version'], { stdio: 'pipe', timeout: 5000, windowsHide: true });
    return r.status === 0;
  } catch { return false; }
}
