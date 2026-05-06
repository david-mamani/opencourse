/**
 * Screen: PDF — Lesson sidebar + PDF panel.
 * Enter/→ opens PDF. Auto-focuses content.
 */

import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import fs from 'node:fs';
import path from 'node:path';
import { Layout } from '../components/Layout.js';
import { List, type ListItem } from '../components/List.js';
import { Ghost } from '../components/Ghost.js';
import { useNavigation } from '../context/navigation.js';
import { THEME } from '../context/theme.js';
import { isComplete, markComplete } from '../engines/progress.js';
import { openPdf } from '../engines/launcher.js';
import type { CourseData, Lesson } from '../types/course.js';

interface Props {
  coursePath: string;
  courseData: CourseData;
  moduleId: string;
  lesson: Lesson;
  filePath: string;
}

export function PdfViewer({ coursePath, courseData, moduleId, lesson, filePath }: Props): React.ReactElement {
  const nav = useNavigation();
  const moduleData = courseData.modules.find(m => m.id === moduleId)!;
  const [opened, setOpened] = useState(false);
  const [focus, setFocus] = useState<'sidebar' | 'content'>('content');

  const key = `${moduleId}/${lesson.id}`;
  const done = isComplete(coursePath, key);
  const fileExists = fs.existsSync(filePath);
  const currentLessonIdx = moduleData.lessons.findIndex(l => l.id === lesson.id);

  let fileSize = '--';
  if (fileExists) {
    const bytes = fs.statSync(filePath).size;
    if (bytes > 1024 * 1024) fileSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    else if (bytes > 1024) fileSize = `${(bytes / 1024).toFixed(0)} KB`;
    else fileSize = `${bytes} B`;
  }

  const resolveFilePath = useCallback((l: Lesson): string => {
    if (moduleId === '__root__') return path.join(coursePath, l.file);
    const folder = moduleData.dir || moduleData.id;
    return path.join(coursePath, folder, l.file);
  }, [coursePath, moduleId, moduleData]);

  const sidebarItems: ListItem[] = moduleData.lessons.map((l, i) => {
    const d = isComplete(coursePath, `${moduleId}/${l.id}`);
    const active = l.id === lesson.id ? '►' : d ? '✓' : '○';
    return { id: l.id, label: `${active} ${i + 1}. ${l.name.slice(0, 18)}` };
  });

  const handleSidebarSelect = (item: ListItem) => {
    const l = moduleData.lessons.find(x => x.id === item.id);
    if (!l) return;
    const fp = resolveFilePath(l);
    if (l.type === 'video') nav.replace({ name: 'video', coursePath, courseData, moduleId, lesson: l, filePath: fp });
    else if (l.type === 'text') nav.replace({ name: 'text', coursePath, courseData, moduleId, lesson: l, filePath: fp });
    else if (l.type === 'pdf') nav.replace({ name: 'pdf', coursePath, courseData, moduleId, lesson: l, filePath: fp });
  };

  useInput((input, keyInfo) => {
    if (focus !== 'content') return;
    if ((keyInfo.return || keyInfo.rightArrow) && fileExists && !opened) { openPdf(filePath); setOpened(true); }
    if (input === 'm') { markComplete(coursePath, key); nav.pop(); }
  }, { isActive: focus === 'content' });

  return (
    <Layout
      breadcrumb={['Library', courseData.name, moduleData.name, lesson.name]}
      footer="Enter/→: open  m: mark  Tab: switch  ←/Esc: back"
      hasSidebar
      sidebar={<List items={sidebarItems} onSelect={handleSidebarSelect} initialIndex={currentLessonIdx} isActive={focus === 'sidebar'} maxVisible={16} />}
      sidebarTitle="LESSONS"
      focusedPanel={focus}
      onFocusChange={setFocus}
      onBack={() => nav.pop()}
    >
      <Box flexDirection="column" paddingX={2} paddingY={1} alignItems="center">
        <Text color={THEME.accent} bold>{'>> PDF DOCUMENT'}</Text>
        <Text> </Text>
        <Ghost />
        <Text> </Text>
        <Text color={THEME.text} bold>{lesson.name.slice(0, 35)}</Text>
        <Text> </Text>
        <Text color={THEME.textMuted}>Size:   <Text color={THEME.text}>{fileSize}</Text></Text>
        <Text color={THEME.textMuted}>Status: <Text color={done ? THEME.success : THEME.warning}>{done ? '[x] Done' : '[ ] Pending'}</Text></Text>
        <Text> </Text>
        {opened ? (
          <Text color={THEME.success}>✓ Opened in viewer</Text>
        ) : fileExists ? (
          <Text color={THEME.accent} bold>Press Enter or → to open</Text>
        ) : (
          <Text color={THEME.error}>FILE NOT FOUND</Text>
        )}
      </Box>
    </Layout>
  );
}
