/**
 * OpenCourse — Progress Engine
 * Reads and writes .progress.json for tracking course completion.
 * Ported from Python progress.py
 */

import fs from 'node:fs';
import path from 'node:path';
import type { CourseData, ProgressData, ProgressLesson } from '../types/course.js';

function progressPath(coursePath: string): string {
  return path.join(coursePath, '.progress.json');
}

export function loadProgress(coursePath: string): ProgressData {
  const fp = progressPath(coursePath);
  if (fs.existsSync(fp)) {
    try {
      return JSON.parse(fs.readFileSync(fp, 'utf-8'));
    } catch { /* ignore corrupt file */ }
  }
  return {
    started_at: new Date().toISOString(),
    last_accessed: new Date().toISOString(),
    lessons: {},
  };
}

export function saveProgress(coursePath: string, progress: ProgressData): void {
  progress.last_accessed = new Date().toISOString();
  fs.writeFileSync(progressPath(coursePath), JSON.stringify(progress, null, 2), 'utf-8');
}

export function markComplete(coursePath: string, lessonKey: string): void {
  const progress = loadProgress(coursePath);
  if (!progress.lessons[lessonKey]) progress.lessons[lessonKey] = {};
  progress.lessons[lessonKey]!.status = 'complete';
  progress.lessons[lessonKey]!.completed_at = new Date().toISOString();
  saveProgress(coursePath, progress);
}

export function markIncomplete(coursePath: string, lessonKey: string): void {
  const progress = loadProgress(coursePath);
  if (progress.lessons[lessonKey]) {
    progress.lessons[lessonKey]!.status = 'incomplete';
  }
  saveProgress(coursePath, progress);
}

export function isComplete(coursePath: string, lessonKey: string): boolean {
  const progress = loadProgress(coursePath);
  return progress.lessons[lessonKey]?.status === 'complete';
}

export function getModuleProgress(coursePath: string, moduleId: string, courseData: CourseData): [number, number] {
  const progress = loadProgress(coursePath);
  let total = 0;
  let completed = 0;

  for (const mod of courseData.modules) {
    if (mod.id === moduleId) {
      for (const lesson of mod.lessons) {
        total++;
        const key = `${moduleId}/${lesson.id}`;
        if (progress.lessons[key]?.status === 'complete') completed++;
      }
      break;
    }
  }

  return [completed, total];
}

export function getCourseProgress(coursePath: string, courseData: CourseData): [number, number] {
  const progress = loadProgress(coursePath);
  let total = 0;
  let completed = 0;

  for (const mod of courseData.modules) {
    for (const lesson of mod.lessons) {
      total++;
      const key = `${mod.id}/${lesson.id}`;
      if (progress.lessons[key]?.status === 'complete') completed++;
    }
  }

  return [completed, total];
}

export function saveQuizAttempt(
  coursePath: string,
  lessonKey: string,
  score: number,
  total: number,
  correct: number,
  answers?: Record<string, string>,
): void {
  const progress = loadProgress(coursePath);
  if (!progress.lessons[lessonKey]) progress.lessons[lessonKey] = { attempts: [] };
  const lesson = progress.lessons[lessonKey]!;
  if (!lesson.attempts) lesson.attempts = [];

  const attempt = { date: new Date().toISOString(), score, total, correct, ...(answers ? { answers } : {}) };
  lesson.attempts.push(attempt);
  lesson.best_score = Math.max(...lesson.attempts.map(a => a.score));

  if (score >= 70) {
    lesson.status = 'complete';
    lesson.completed_at = new Date().toISOString();
  }

  saveProgress(coursePath, progress);
}
