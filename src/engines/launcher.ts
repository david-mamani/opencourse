/**
 * OpenCourse — Launcher Engine
 * Opens files in VLC, system viewer, Explorer, etc.
 * Ported from Python launcher.py
 */

import { execSync, spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function findVlc(): string {
  const candidates = [
    'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe',
    'C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe',
    path.join(process.env['LOCALAPPDATA'] || '', 'Programs', 'VideoLAN', 'VLC', 'vlc.exe'),
  ];

  for (const vlcPath of candidates) {
    if (fs.existsSync(vlcPath)) return vlcPath;
  }

  try {
    const result = execSync('where vlc', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    if (result) return result.split('\n')[0]!.trim();
  } catch { /* not found */ }

  return '';
}

export interface VideoProcess {
  playerName: string;
  process: ChildProcess;
}

export function openVideo(filePath: string): VideoProcess {
  const resolved = path.resolve(filePath);
  const vlc = findVlc();

  if (vlc) {
    const proc = spawn(vlc, [resolved], { detached: true, stdio: 'ignore', windowsHide: true });
    return { playerName: 'VLC', process: proc };
  } else {
    const proc = spawn('cmd', ['/c', 'start', '/wait', '', resolved], { detached: false, stdio: 'ignore', windowsHide: true });
    return { playerName: 'System Default', process: proc };
  }
}

export function openPdf(filePath: string): void {
  const resolved = path.resolve(filePath);
  spawn('cmd', ['/c', 'start', '', resolved], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
}

export function openFile(filePath: string): void {
  const resolved = path.resolve(filePath);
  spawn('cmd', ['/c', 'start', '', resolved], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
}

export function openInEditor(filePath: string): void {
  openFile(filePath);
}

export function openFolder(folderPath: string): void {
  spawn('explorer', [path.resolve(folderPath)], { detached: true, stdio: 'ignore' }).unref();
}

export function openInBrowser(url: string): void {
  spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
}

export function openMermaidLive(mermaidCode: string): void {
  const state = JSON.stringify({ code: mermaidCode, mermaid: { theme: 'dark' } });
  const encoded = Buffer.from(state).toString('base64url');
  openInBrowser(`https://mermaid.live/edit#pako:${encoded}`);
}
