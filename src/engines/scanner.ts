/**
 * OpenCourse — Scanner Engine
 * Scans course folder structures and generates course.json manifests.
 * Ported from Python scanner.py
 */

import fs from 'node:fs';
import path from 'node:path';

const VIDEO_EXTS = new Set(['.mp4', '.mkv', '.avi', '.webm', '.mov', '.m4v']);
const PDF_EXTS = new Set(['.pdf']);
const TEXT_EXTS = new Set(['.md']);
const WEB_EXTS = new Set(['.html', '.htm']);
const OFFICE_EXTS = new Set(['.docx', '.pptx', '.xlsx', '.doc', '.ppt', '.xls']);
const QUIZ_SUFFIX = '.quiz.md';
const IGNORED = new Set(['course.json', '.progress.json', '__pycache__', '.git', 'assets', '.DS_Store', 'node_modules']);

import type { CourseData, Lesson, Module } from '../types/course.js';

function detectType(filePath: string): Lesson['type'] {
  const name = path.basename(filePath).toLowerCase();
  const stat = fs.statSync(filePath);

  if (stat.isDirectory()) {
    if (fs.existsSync(path.join(filePath, 'entrega'))) return 'task';
    return 'video'; // placeholder, won't be used for dirs
  }

  if (name.endsWith(QUIZ_SUFFIX)) return 'quiz';
  const ext = path.extname(name);
  if (VIDEO_EXTS.has(ext)) return 'video';
  if (PDF_EXTS.has(ext)) return 'pdf';
  if (TEXT_EXTS.has(ext)) return 'text';
  if (WEB_EXTS.has(ext)) return 'web';
  if (OFFICE_EXTS.has(ext)) return 'office';
  return 'file';
}

function extractOrder(name: string): [number, string] {
  const match = name.match(/^(\d+)\s*[-_.\s]\s*(.+)/);
  if (match) return [parseInt(match[1]!), match[2]!];
  return [9999, name];
}

function cleanName(filename: string): string {
  let name = path.parse(filename).name;
  if (name.endsWith('.quiz')) name = name.slice(0, -5);

  // Remove TODO prefix
  const todoMatch = name.match(/^TODO\s*[-_.\s]*\s*(.+)/i);
  if (todoMatch) name = todoMatch[1]!;

  // Remove numeric prefix
  const numMatch = name.match(/^\d+\s*[-_.\s]\s*(.+)/);
  if (numMatch) name = numMatch[1]!;

  name = name.replace(/[-_]/g, ' ').trim();
  // Title case — capitalize first char of each word, preserve accented chars
  return name.split(' ')
    .map(word => word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : '')
    .join(' ');
}

function sortByOrder(items: string[]): string[] {
  return [...items].sort((a, b) => {
    const [oa] = extractOrder(path.basename(a));
    const [ob] = extractOrder(path.basename(b));
    return oa - ob;
  });
}

function collectFilesRecursive(directory: string, basePath: string): Array<[string, string]> {
  const results: Array<[string, string]> = [];
  if (!fs.existsSync(directory)) return results;

  const items = sortByOrder(
    fs.readdirSync(directory)
      .filter(name => !IGNORED.has(name) && !name.startsWith('.'))
      .map(name => path.join(directory, name))
  );

  for (const item of items) {
    const stat = fs.statSync(item);
    if (stat.isDirectory()) {
      if (fs.existsSync(path.join(item, 'entrega'))) {
        results.push([item, path.relative(basePath, item)]);
      } else {
        results.push(...collectFilesRecursive(item, basePath));
      }
    } else {
      results.push([item, path.relative(basePath, item)]);
    }
  }

  return results;
}

export function scanFolder(coursePath: string): CourseData {
  const courseName = cleanName(path.basename(coursePath));

  const topItems = fs.readdirSync(coursePath)
    .filter(name => !IGNORED.has(name) && !name.startsWith('.'))
    .map(name => path.join(coursePath, name));

  const topDirs = sortByOrder(topItems.filter(p => fs.statSync(p).isDirectory()));
  const topFiles = sortByOrder(topItems.filter(p => fs.statSync(p).isFile()));

  const modules: Module[] = [];

  // Root-level files as "General" module
  if (topFiles.length > 0) {
    const rootLessons: Lesson[] = topFiles.map(filePath => {
      const fileName = path.basename(filePath);
      const contentType = detectType(filePath);
      const lesson: Lesson = {
        id: fileName.toLowerCase().replace(/ /g, '-'),
        name: cleanName(fileName),
        type: contentType,
        file: fileName,
      };
      if (contentType === 'quiz') {
        try {
          const text = fs.readFileSync(filePath, 'utf-8');
          lesson.question_count = (text.match(/^## /gm) || []).length;
        } catch { /* ignore */ }
      }
      return lesson;
    });

    if (rootLessons.length > 0) {
      modules.push({ id: '__root__', name: 'General', order: 0, lessons: rootLessons });
    }
  }

  // Process subdirectories as modules
  topDirs.forEach((moduleDir, idx) => {
    const dirName = path.basename(moduleDir);
    const moduleId = dirName.toLowerCase().replace(/ /g, '-');
    const moduleName = cleanName(dirName);

    const allFiles = collectFilesRecursive(moduleDir, moduleDir);
    const lessons: Lesson[] = allFiles.map(([itemPath, relPath]) => {
      const contentType = detectType(itemPath);
      const lesson: Lesson = {
        id: relPath.toLowerCase().replace(/ /g, '-').replace(/\\/g, '/'),
        name: cleanName(path.basename(itemPath)),
        type: contentType,
        file: relPath.replace(/\\/g, '/'),
      };
      if (contentType === 'quiz') {
        try {
          const text = fs.readFileSync(itemPath, 'utf-8');
          lesson.question_count = (text.match(/^## /gm) || []).length;
        } catch { /* ignore */ }
      }
      if (contentType === 'task') {
        lesson.file = relPath.replace(/\\/g, '/') + '/';
      }
      return lesson;
    });

    if (lessons.length > 0) {
      modules.push({ id: moduleId, name: moduleName, dir: dirName, order: idx + 1, lessons });
    }
  });

  if (modules.length === 0) {
    modules.push({ id: 'main', name: courseName, order: 1, lessons: [] });
  }

  return {
    version: '1.0',
    name: courseName,
    provider: '',
    created: new Date().toISOString().split('T')[0]!,
    modules,
  };
}

export function saveCourseJson(coursePath: string, courseData?: CourseData): string {
  const jsonPath = path.join(coursePath, 'course.json');
  const data = courseData || scanFolder(coursePath);
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
  return jsonPath;
}

export function loadCourseJson(coursePath: string): CourseData {
  const jsonPath = path.join(coursePath, 'course.json');
  if (!fs.existsSync(jsonPath)) {
    saveCourseJson(coursePath);
  }
  return JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
}

export function findCourses(rootDir: string): string[] {
  if (!fs.existsSync(rootDir)) return [];
  const ALL_MEDIA = new Set([...VIDEO_EXTS, ...PDF_EXTS, ...TEXT_EXTS]);
  const courses: string[] = [];

  const items = fs.readdirSync(rootDir)
    .filter(name => !IGNORED.has(name) && !name.startsWith('.'))
    .map(name => path.join(rootDir, name))
    .filter(p => fs.statSync(p).isDirectory())
    .sort();

  for (const item of items) {
    if (fs.existsSync(path.join(item, 'course.json'))) {
      courses.push(item);
      continue;
    }
    // Search recursively for media files
    let hasMedia = false;
    const walk = (dir: string, depth: number) => {
      if (hasMedia || depth > 3) return;
      for (const f of fs.readdirSync(dir)) {
        const fp = path.join(dir, f);
        try {
          const stat = fs.statSync(fp);
          if (stat.isFile() && ALL_MEDIA.has(path.extname(f).toLowerCase())) {
            hasMedia = true;
            return;
          }
          if (stat.isDirectory() && depth < 3) walk(fp, depth + 1);
        } catch { /* ignore */ }
      }
    };
    walk(item, 0);
    if (hasMedia) courses.push(item);
  }

  return courses;
}
