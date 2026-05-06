/**
 * Screen: Text Viewer — Lesson sidebar + markdown scroll.
 * Auto-focuses content. Up/down scrolls when content focused.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import fs from 'node:fs';
import path from 'node:path';
import { Layout } from '../components/Layout.js';
import { List, type ListItem } from '../components/List.js';
import { useNavigation } from '../context/navigation.js';
import { THEME } from '../context/theme.js';
import { markComplete, isComplete } from '../engines/progress.js';
import { openInEditor, openMermaidLive } from '../engines/launcher.js';
import { preprocessMarkdown, extractMermaidCode } from '../engines/renderer.js';
import type { CourseData, Lesson } from '../types/course.js';

interface Props {
  coursePath: string;
  courseData: CourseData;
  moduleId: string;
  lesson: Lesson;
  filePath: string;
}

export function TextViewer({ coursePath, courseData, moduleId, lesson, filePath }: Props): React.ReactElement {
  const nav = useNavigation();
  const moduleData = courseData.modules.find(m => m.id === moduleId)!;
  const [content, setContent] = useState('Loading...');
  const [rawText, setRawText] = useState('');
  const [scrollOffset, setScrollOffset] = useState(0);
  const [focus, setFocus] = useState<'sidebar' | 'content'>('content');

  const currentLessonIdx = moduleData.lessons.findIndex(l => l.id === lesson.id);

  useEffect(() => {
    if (fs.existsSync(filePath)) {
      try {
        const text = fs.readFileSync(filePath, 'utf-8');
        setRawText(text);
        setContent(preprocessMarkdown(text));
      } catch (e) { setContent(`Error: ${e}`); }
    } else { setContent(`File not found: ${filePath}`); }
  }, [filePath]);

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

  const lines = content.split('\n');
  const maxScroll = Math.max(0, lines.length - 5);

  useInput((input, key) => {
    if (focus !== 'content') return;
    if (input === 'm') { markComplete(coursePath, `${moduleId}/${lesson.id}`); nav.pop(); }
    if (input === 'e' && fs.existsSync(filePath)) openInEditor(filePath);
    if (input === 'd') {
      const mermaid = extractMermaidCode(rawText);
      if (mermaid) openMermaidLive(mermaid);
    }
    if (key.upArrow) setScrollOffset(s => Math.max(0, s - 1));
    if (key.downArrow) setScrollOffset(s => Math.min(s + 1, maxScroll));
    if (key.pageUp) setScrollOffset(s => Math.max(0, s - 10));
    if (key.pageDown) setScrollOffset(s => Math.min(s + 10, maxScroll));
  }, { isActive: focus === 'content' });

  const visibleLines = lines.slice(scrollOffset, scrollOffset + 25);

  return (
    <Layout
      breadcrumb={['Library', courseData.name, moduleData.name, lesson.name]}
      footer="↑↓: scroll  m: mark  e: editor  d: diagram  Tab: switch  ←/Esc: back"
      hasSidebar
      sidebar={<List items={sidebarItems} onSelect={handleSidebarSelect} initialIndex={currentLessonIdx} isActive={focus === 'sidebar'} maxVisible={16} />}
      sidebarTitle="LESSONS"
      focusedPanel={focus}
      onFocusChange={setFocus}
      onBack={() => nav.pop()}
    >
      <Box flexDirection="column" paddingX={2} paddingY={1}>
        {visibleLines.map((line, i) => (
          <Text key={scrollOffset + i} color={THEME.text} wrap="truncate">{line}</Text>
        ))}
        {lines.length > 25 && (
          <Text color={THEME.textHint}>── {scrollOffset + 1}-{Math.min(scrollOffset + 25, lines.length)} of {lines.length} ──</Text>
        )}
      </Box>
    </Layout>
  );
}
