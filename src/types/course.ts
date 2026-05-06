/**
 * OpenCourse — Type Definitions
 */

export interface Lesson {
  id: string;
  name: string;
  type: 'video' | 'pdf' | 'text' | 'quiz' | 'web' | 'office' | 'file' | 'task';
  file: string;
  duration?: string;
  question_count?: number;
}

export interface Module {
  id: string;
  name: string;
  dir?: string;
  order: number;
  lessons: Lesson[];
}

export interface CourseData {
  version: string;
  name: string;
  provider: string;
  created: string;
  modules: Module[];
}

export interface ProgressLesson {
  status?: 'complete' | 'incomplete';
  completed_at?: string;
  best_score?: number;
  attempts?: QuizAttempt[];
}

export interface QuizAttempt {
  date: string;
  score: number;
  total: number;
  correct: number;
  answers?: Record<string, string>;
}

export interface ProgressData {
  started_at: string;
  last_accessed: string;
  lessons: Record<string, ProgressLesson>;
}

export interface Config {
  courses_dir: string;
}

export type ScreenType =
  | { name: 'folder-select' }
  | { name: 'library'; initialIndex?: number }
  | { name: 'course'; coursePath: string; initialIndex?: number }
  | { name: 'module'; coursePath: string; courseData: CourseData; moduleId: string; initialIndex?: number }
  | { name: 'video'; coursePath: string; courseData: CourseData; moduleId: string; lesson: Lesson; filePath: string }
  | { name: 'text'; coursePath: string; courseData: CourseData; moduleId: string; lesson: Lesson; filePath: string }
  | { name: 'pdf'; coursePath: string; courseData: CourseData; moduleId: string; lesson: Lesson; filePath: string }
  | { name: 'formats'; initialIndex?: number };
