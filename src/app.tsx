/**
 * OpenCourse — Main App Component
 * Routes to the current screen based on navigation context.
 */

import React from 'react';
import { useNavigation } from './context/navigation.js';
import { FolderSelect } from './screens/FolderSelect.js';
import { Library } from './screens/Library.js';
import { Course } from './screens/Course.js';
import { Module } from './screens/Module.js';
import { Video } from './screens/Video.js';
import { TextViewer } from './screens/TextViewer.js';
import { PdfViewer } from './screens/PdfViewer.js';

import { Formats } from './screens/Formats.js';

export function App(): React.ReactElement {
  const { current } = useNavigation();

  switch (current.name) {
    case 'folder-select':
      return <FolderSelect />;
    case 'library':
      return <Library />;
    case 'course':
      return <Course coursePath={current.coursePath} />;
    case 'module':
      return <Module coursePath={current.coursePath} courseData={current.courseData} moduleId={current.moduleId} />;
    case 'video':
      return <Video coursePath={current.coursePath} courseData={current.courseData} moduleId={current.moduleId} lesson={current.lesson} filePath={current.filePath} />;
    case 'text':
      return <TextViewer coursePath={current.coursePath} courseData={current.courseData} moduleId={current.moduleId} lesson={current.lesson} filePath={current.filePath} />;
    case 'pdf':
      return <PdfViewer coursePath={current.coursePath} courseData={current.courseData} moduleId={current.moduleId} lesson={current.lesson} filePath={current.filePath} />;
    case 'formats':
      return <Formats />;
    default:
      return <FolderSelect />;
  }
}
