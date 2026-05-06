/**
 * OpenCourse — Scanner Engine Tests
 * Rigorous tests for folder scanning, course detection, name cleaning.
 */

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { scanFolder, findCourses, loadCourseJson, saveCourseJson } from '../src/engines/scanner.js';

const TEST_ROOT = path.join(os.tmpdir(), `oc-test-scanner-${Date.now()}`);

function mkdirp(p: string) { fs.mkdirSync(p, { recursive: true }); }
function touch(p: string, content = '') { fs.writeFileSync(p, content, 'utf-8'); }
function cleanup() { fs.rmSync(TEST_ROOT, { recursive: true, force: true }); }

// ─── Helpers ───

function createCourseStructure(name: string, modules: Record<string, string[]>): string {
  const coursePath = path.join(TEST_ROOT, name);
  mkdirp(coursePath);
  for (const [mod, files] of Object.entries(modules)) {
    const modPath = path.join(coursePath, mod);
    mkdirp(modPath);
    for (const file of files) {
      touch(path.join(modPath, file));
    }
  }
  return coursePath;
}

// ═══════════════════════════════════════════
// TEST SUITE: Scanner Engine
// ═══════════════════════════════════════════

describe('Scanner Engine', () => {
  before(() => mkdirp(TEST_ROOT));
  after(() => cleanup());

  // ─── scanFolder ───

  describe('scanFolder()', () => {
    it('should detect video files correctly', () => {
      const cp = createCourseStructure('Video Course', {
        '01 - Intro': ['01 - Welcome.mp4', '02 - Setup.mkv'],
        '02 - Advanced': ['01 - Deep Dive.avi', '02 - Summary.webm'],
      });
      const data = scanFolder(cp);
      assert.equal(data.modules.length, 2);
      assert.equal(data.modules[0]!.lessons.length, 2);
      assert.equal(data.modules[0]!.lessons[0]!.type, 'video');
      assert.equal(data.modules[0]!.lessons[1]!.type, 'video');
    });

    it('should detect PDF files correctly', () => {
      const cp = createCourseStructure('PDF Course', {
        '01 - Docs': ['01 - Manual.pdf', '02 - Reference.pdf'],
      });
      const data = scanFolder(cp);
      assert.equal(data.modules[0]!.lessons[0]!.type, 'pdf');
    });

    it('should detect quiz files (.quiz.md)', () => {
      const cp = path.join(TEST_ROOT, 'Quiz Course');
      mkdirp(path.join(cp, '01 - Module'));
      touch(path.join(cp, '01 - Module', '01 - Final Exam.quiz.md'), '## Question 1\n- [ ] A\n- [x] B\n\n## Question 2\n- [x] C\n- [ ] D');
      const data = scanFolder(cp);
      assert.equal(data.modules[0]!.lessons[0]!.type, 'quiz');
      assert.equal(data.modules[0]!.lessons[0]!.question_count, 2);
    });

    it('should detect markdown text files', () => {
      const cp = createCourseStructure('Text Course', {
        '01 - Notes': ['01 - Lecture.md'],
      });
      const data = scanFolder(cp);
      assert.equal(data.modules[0]!.lessons[0]!.type, 'text');
    });

    it('should detect HTML/web files', () => {
      const cp = createCourseStructure('Web Course', {
        '01 - Slides': ['01 - Slide.html', '02 - Page.htm'],
      });
      const data = scanFolder(cp);
      assert.equal(data.modules[0]!.lessons[0]!.type, 'web');
      assert.equal(data.modules[0]!.lessons[1]!.type, 'web');
    });

    it('should detect office files', () => {
      const cp = createCourseStructure('Office Course', {
        '01 - Docs': ['01 - Slides.pptx', '02 - Doc.docx', '03 - Sheet.xlsx'],
      });
      const data = scanFolder(cp);
      assert.equal(data.modules[0]!.lessons[0]!.type, 'office');
      assert.equal(data.modules[0]!.lessons[1]!.type, 'office');
      assert.equal(data.modules[0]!.lessons[2]!.type, 'office');
    });

    it('should handle root-level files as __root__ module', () => {
      const cp = path.join(TEST_ROOT, 'Root Files Course');
      mkdirp(cp);
      touch(path.join(cp, 'README.md'));
      touch(path.join(cp, 'intro.mp4'));
      const data = scanFolder(cp);
      const rootMod = data.modules.find(m => m.id === '__root__');
      assert.ok(rootMod, 'Should have __root__ module');
      assert.equal(rootMod!.lessons.length, 2);
    });

    it('should order modules by numeric prefix', () => {
      const cp = createCourseStructure('Ordered Course', {
        '03 - Third': ['a.mp4'],
        '01 - First': ['b.mp4'],
        '02 - Second': ['c.mp4'],
      });
      const data = scanFolder(cp);
      assert.equal(data.modules[0]!.name, 'First');
      assert.equal(data.modules[1]!.name, 'Second');
      assert.equal(data.modules[2]!.name, 'Third');
    });

    it('should order lessons by numeric prefix', () => {
      const cp = createCourseStructure('Lesson Order', {
        '01 - Mod': ['03 - Third.mp4', '01 - First.mp4', '02 - Second.mp4'],
      });
      const data = scanFolder(cp);
      assert.equal(data.modules[0]!.lessons[0]!.name, 'First');
      assert.equal(data.modules[0]!.lessons[1]!.name, 'Second');
      assert.equal(data.modules[0]!.lessons[2]!.name, 'Third');
    });

    it('should clean names properly (remove prefix, underscores, hyphens)', () => {
      const cp = createCourseStructure('Name Cleaning', {
        '01_my-module_name': ['01_my-lesson_name.mp4'],
      });
      const data = scanFolder(cp);
      assert.equal(data.modules[0]!.name, 'My Module Name');
      assert.equal(data.modules[0]!.lessons[0]!.name, 'My Lesson Name');
    });

    it('should handle empty course (no files)', () => {
      const cp = path.join(TEST_ROOT, 'Empty Course');
      mkdirp(cp);
      const data = scanFolder(cp);
      // Should have a fallback module
      assert.ok(data.modules.length >= 1);
    });

    it('should ignore .git, node_modules, .DS_Store', () => {
      const cp = path.join(TEST_ROOT, 'Ignored Files');
      mkdirp(cp);
      mkdirp(path.join(cp, '.git'));
      mkdirp(path.join(cp, 'node_modules'));
      touch(path.join(cp, '.DS_Store'));
      mkdirp(path.join(cp, '01 - Real'));
      touch(path.join(cp, '01 - Real', 'lesson.mp4'));
      const data = scanFolder(cp);
      const moduleNames = data.modules.map(m => m.name);
      assert.ok(!moduleNames.includes('.git'));
      assert.ok(!moduleNames.includes('node_modules'));
    });

    it('should flatten subdirectories within modules', () => {
      const cp = path.join(TEST_ROOT, 'Nested Course');
      mkdirp(path.join(cp, '01 - Module', 'SubFolder'));
      touch(path.join(cp, '01 - Module', 'SubFolder', 'deep-lesson.mp4'));
      const data = scanFolder(cp);
      assert.ok(data.modules[0]!.lessons.length >= 1);
    });

    it('BUG: should handle MODULE ID COLLISION gracefully', () => {
      const cp = path.join(TEST_ROOT, 'ID Collision');
      mkdirp(cp);
      mkdirp(path.join(cp, '01 - Module_A'));
      touch(path.join(cp, '01 - Module_A', 'a.mp4'));
      mkdirp(path.join(cp, '02 - Module-A'));
      touch(path.join(cp, '02 - Module-A', 'b.mp4'));
      const data = scanFolder(cp);

      const ids = data.modules.map(m => m.id);
      // BUG CHECK: these two modules might have same ID
      // '01-module_a' and '02-module-a' — underscores are NOT replaced
      console.log('  Module IDs:', ids);
      // This test documents the collision issue
    });
  });

  // ─── findCourses ───

  describe('findCourses()', () => {
    let rootDir: string;

    before(() => {
      rootDir = path.join(TEST_ROOT, 'library');
      mkdirp(rootDir);
    });

    it('should find courses with media files', () => {
      const c1 = path.join(rootDir, 'Course1');
      mkdirp(path.join(c1, 'mod'));
      touch(path.join(c1, 'mod', 'lesson.mp4'));
      const found = findCourses(rootDir);
      assert.ok(found.includes(c1));
    });

    it('should find courses with existing course.json', () => {
      const c2 = path.join(rootDir, 'Course2');
      mkdirp(c2);
      touch(path.join(c2, 'course.json'), '{}');
      const found = findCourses(rootDir);
      assert.ok(found.includes(c2));
    });

    it('should NOT find empty directories', () => {
      const c3 = path.join(rootDir, 'EmptyCourse');
      mkdirp(c3);
      const found = findCourses(rootDir);
      assert.ok(!found.includes(c3));
    });

    it('should return [] for non-existent root', () => {
      const found = findCourses('/nonexistent/path/that/doesnt/exist');
      assert.deepEqual(found, []);
    });
  });

  // ─── loadCourseJson / saveCourseJson ───

  describe('loadCourseJson() / saveCourseJson()', () => {
    it('should scan and save if course.json missing', () => {
      const cp = createCourseStructure('Load Test', {
        '01 - Mod': ['01 - Lesson.mp4'],
      });
      // No course.json yet
      const data = loadCourseJson(cp);
      assert.ok(data.name);
      assert.ok(fs.existsSync(path.join(cp, 'course.json')));
    });

    it('should read existing course.json', () => {
      const cp = path.join(TEST_ROOT, 'Existing JSON');
      mkdirp(cp);
      const custom = { version: '1.0', name: 'Custom', provider: '', created: '2025-01-01', modules: [] };
      touch(path.join(cp, 'course.json'), JSON.stringify(custom));
      const data = loadCourseJson(cp);
      assert.equal(data.name, 'Custom');
    });

    it('BUG: Library.tsx deletes course.json on every open', () => {
      const cp = createCourseStructure('Delete Bug', {
        '01 - Mod': ['01 - Lesson.mp4'],
      });
      // Save custom data
      const custom = { version: '1.0', name: 'My Custom Name', provider: 'Me', created: '2025-01-01', modules: [] };
      saveCourseJson(cp, custom);
      
      // Verify it's saved
      const before = loadCourseJson(cp);
      assert.equal(before.name, 'My Custom Name');

      // Simulate what Library.tsx does: delete then re-scan
      const cj = path.join(cp, 'course.json');
      fs.unlinkSync(cj);
      const after = loadCourseJson(cp);

      // BUG: The custom name is LOST — it was regenerated from folder name
      assert.notEqual(after.name, 'My Custom Name', 'BUG CONFIRMED: custom course.json destroyed');
      console.log('  ⚠ Custom name was:', before.name, '→ now:', after.name);
    });
  });
});
