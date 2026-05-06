/**
 * OpenCourse — Progress Engine Tests
 * Tests for progress tracking, quiz attempts, and I/O patterns.
 */

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  loadProgress,
  saveProgress,
  markComplete,
  markIncomplete,
  isComplete,
  getModuleProgress,
  getCourseProgress,
  saveQuizAttempt,
} from '../src/engines/progress.js';
import type { CourseData } from '../src/types/course.js';

const TEST_ROOT = path.join(os.tmpdir(), `oc-test-progress-${Date.now()}`);

function mkdirp(p: string) { fs.mkdirSync(p, { recursive: true }); }
function cleanup() { fs.rmSync(TEST_ROOT, { recursive: true, force: true }); }

const MOCK_COURSE: CourseData = {
  version: '1.0',
  name: 'Test Course',
  provider: '',
  created: '2025-01-01',
  modules: [
    {
      id: 'mod1',
      name: 'Module 1',
      order: 1,
      lessons: [
        { id: 'lesson1', name: 'Lesson 1', type: 'video', file: 'l1.mp4' },
        { id: 'lesson2', name: 'Lesson 2', type: 'text', file: 'l2.md' },
        { id: 'lesson3', name: 'Lesson 3', type: 'quiz', file: 'l3.quiz.md' },
      ],
    },
    {
      id: 'mod2',
      name: 'Module 2',
      order: 2,
      lessons: [
        { id: 'lesson4', name: 'Lesson 4', type: 'pdf', file: 'l4.pdf' },
        { id: 'lesson5', name: 'Lesson 5', type: 'video', file: 'l5.mp4' },
      ],
    },
  ],
};

describe('Progress Engine', () => {
  let coursePath: string;

  before(() => mkdirp(TEST_ROOT));
  after(() => cleanup());

  beforeEach(() => {
    coursePath = path.join(TEST_ROOT, `course-${Date.now()}`);
    mkdirp(coursePath);
  });

  // ─── loadProgress ───

  describe('loadProgress()', () => {
    it('should return default progress for new course', () => {
      const p = loadProgress(coursePath);
      assert.ok(p.started_at);
      assert.ok(p.last_accessed);
      assert.deepEqual(p.lessons, {});
    });

    it('should load existing progress', () => {
      const data = { started_at: '2025-01-01', last_accessed: '2025-01-01', lessons: { 'mod1/l1': { status: 'complete' as const } } };
      fs.writeFileSync(path.join(coursePath, '.progress.json'), JSON.stringify(data));
      const p = loadProgress(coursePath);
      assert.equal(p.lessons['mod1/l1']?.status, 'complete');
    });

    it('should handle corrupt JSON gracefully', () => {
      fs.writeFileSync(path.join(coursePath, '.progress.json'), '{corrupt json!!!');
      const p = loadProgress(coursePath);
      assert.deepEqual(p.lessons, {});
    });
  });

  // ─── markComplete / markIncomplete / isComplete ───

  describe('markComplete() / markIncomplete() / isComplete()', () => {
    it('should mark a lesson as complete', () => {
      markComplete(coursePath, 'mod1/lesson1');
      assert.equal(isComplete(coursePath, 'mod1/lesson1'), true);
    });

    it('should mark a lesson as incomplete', () => {
      markComplete(coursePath, 'mod1/lesson1');
      markIncomplete(coursePath, 'mod1/lesson1');
      assert.equal(isComplete(coursePath, 'mod1/lesson1'), false);
    });

    it('should return false for untracked lessons', () => {
      assert.equal(isComplete(coursePath, 'nonexistent/lesson'), false);
    });

    it('should store completed_at timestamp', () => {
      markComplete(coursePath, 'mod1/lesson1');
      const p = loadProgress(coursePath);
      assert.ok(p.lessons['mod1/lesson1']?.completed_at);
    });

    it('BUG: isComplete reads from disk EVERY call', () => {
      markComplete(coursePath, 'mod1/lesson1');

      // Simulate what Module.tsx does: call isComplete for every lesson
      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        isComplete(coursePath, 'mod1/lesson1');
      }
      const elapsed = Date.now() - start;

      console.log(`  100 isComplete calls took ${elapsed}ms (each reads+parses JSON)`);
      // This is the performance bug — should be cached
    });
  });

  // ─── getModuleProgress / getCourseProgress ───

  describe('getModuleProgress()', () => {
    it('should count completed lessons in a module', () => {
      markComplete(coursePath, 'mod1/lesson1');
      markComplete(coursePath, 'mod1/lesson2');
      const [completed, total] = getModuleProgress(coursePath, 'mod1', MOCK_COURSE);
      assert.equal(completed, 2);
      assert.equal(total, 3);
    });

    it('should return [0, N] when nothing completed', () => {
      const [completed, total] = getModuleProgress(coursePath, 'mod1', MOCK_COURSE);
      assert.equal(completed, 0);
      assert.equal(total, 3);
    });

    it('should return [0, 0] for nonexistent module', () => {
      const [completed, total] = getModuleProgress(coursePath, 'nonexistent', MOCK_COURSE);
      assert.equal(completed, 0);
      assert.equal(total, 0);
    });
  });

  describe('getCourseProgress()', () => {
    it('should aggregate across all modules', () => {
      markComplete(coursePath, 'mod1/lesson1');
      markComplete(coursePath, 'mod2/lesson4');
      const [completed, total] = getCourseProgress(coursePath, MOCK_COURSE);
      assert.equal(completed, 2);
      assert.equal(total, 5);
    });

    it('should show 100% when all complete', () => {
      for (const mod of MOCK_COURSE.modules) {
        for (const lesson of mod.lessons) {
          markComplete(coursePath, `${mod.id}/${lesson.id}`);
        }
      }
      const [completed, total] = getCourseProgress(coursePath, MOCK_COURSE);
      assert.equal(completed, total);
      assert.equal(completed, 5);
    });
  });

  // ─── saveQuizAttempt ───

  describe('saveQuizAttempt()', () => {
    it('should store quiz attempt with score', () => {
      saveQuizAttempt(coursePath, 'mod1/lesson3', 80, 100, 8);
      const p = loadProgress(coursePath);
      const lesson = p.lessons['mod1/lesson3']!;
      assert.equal(lesson.attempts!.length, 1);
      assert.equal(lesson.attempts![0]!.score, 80);
      assert.equal(lesson.best_score, 80);
    });

    it('should auto-complete on score >= 70', () => {
      saveQuizAttempt(coursePath, 'mod1/lesson3', 75, 100, 7);
      assert.equal(isComplete(coursePath, 'mod1/lesson3'), true);
    });

    it('should NOT auto-complete on score < 70', () => {
      saveQuizAttempt(coursePath, 'mod1/lesson3', 50, 100, 5);
      assert.equal(isComplete(coursePath, 'mod1/lesson3'), false);
    });

    it('should track multiple attempts and keep best score', () => {
      saveQuizAttempt(coursePath, 'mod1/lesson3', 50, 100, 5);
      saveQuizAttempt(coursePath, 'mod1/lesson3', 90, 100, 9);
      saveQuizAttempt(coursePath, 'mod1/lesson3', 60, 100, 6);
      const p = loadProgress(coursePath);
      assert.equal(p.lessons['mod1/lesson3']!.attempts!.length, 3);
      assert.equal(p.lessons['mod1/lesson3']!.best_score, 90);
    });
  });
});
