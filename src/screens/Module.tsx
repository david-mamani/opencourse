/**
 * Screen: Module — Lessons in sidebar, thumbnail preview in content.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text } from 'ink';
import path from 'node:path';
import fs from 'node:fs';
import { Layout } from '../components/Layout.js';
import { List, type ListItem } from '../components/List.js';
import { Ghost } from '../components/Ghost.js';
import { Thumbnail } from '../components/Thumbnail.js';
import { progressBar } from '../components/Shared.js';
import { useNavigation } from '../context/navigation.js';
import { THEME } from '../context/theme.js';
import { getModuleProgress, isComplete, markComplete, markIncomplete } from '../engines/progress.js';
import { openFile } from '../engines/launcher.js';
import type { CourseData, Lesson, ScreenType } from '../types/course.js';

interface Props {
  coursePath: string;
  courseData: CourseData;
  moduleId: string;
}

export function Module({ coursePath, courseData, moduleId }: Props): React.ReactElement {
  const nav = useNavigation();
  const screen = nav.current as Extract<ScreenType, { name: 'module' }>;
  const moduleData = courseData.modules.find(m => m.id === moduleId)!;
  const [items, setItems] = useState<ListItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [highlightedLesson, setHighlightedLesson] = useState<Lesson | null>(null);
  const [highlightedFilePath, setHighlightedFilePath] = useState('');
  const [focus, setFocus] = useState<'sidebar' | 'content'>('sidebar');
  const [modProgress, setModProgress] = useState<[number, number]>([0, 0]);

  const resolveFilePath = useCallback((lesson: Lesson): string => {
    if (moduleId === '__root__') return path.join(coursePath, lesson.file);
    const folder = moduleData.dir || moduleData.id;
    return path.join(coursePath, folder, lesson.file);
  }, [coursePath, moduleId, moduleData]);

  useEffect(() => {
    const [mc, mt] = getModuleProgress(coursePath, moduleId, courseData);
    setModProgress([mc, mt]);

    const listItems: ListItem[] = moduleData.lessons.map((lesson, i) => {
      const key = `${moduleId}/${lesson.id}`;
      const done = isComplete(coursePath, key);
      const status = done ? '✓' : '○';
      const num = `${i + 1}.`;
      const name = lesson.name.slice(0, 22);
      return { id: lesson.id, label: `${status} ${num} ${name}` };
    });

    setItems(listItems);
  }, [coursePath, moduleId, courseData, moduleData, refreshKey]);

  const handleHighlight = useCallback((item: ListItem, _index: number) => {
    const lesson = moduleData.lessons.find(l => l.id === item.id);
    if (lesson) {
      setHighlightedLesson(lesson);
      setHighlightedFilePath(resolveFilePath(lesson));
    }
  }, [moduleData, resolveFilePath]);

  const handleSelect = (item: ListItem, index: number) => {
    const lesson = moduleData.lessons.find(l => l.id === item.id);
    if (!lesson) return;
    const filePath = resolveFilePath(lesson);

    if (lesson.type === 'video') {
      nav.push({ name: 'video', coursePath, courseData, moduleId, lesson, filePath }, index);
    } else if (lesson.type === 'text') {
      nav.push({ name: 'text', coursePath, courseData, moduleId, lesson, filePath }, index);
    } else if (lesson.type === 'pdf') {
      nav.push({ name: 'pdf', coursePath, courseData, moduleId, lesson, filePath }, index);
    } else {
      if (fs.existsSync(filePath)) openFile(filePath);
      markComplete(coursePath, `${moduleId}/${lesson.id}`);
      setRefreshKey(k => k + 1);
    }
  };

  const handleMark = (item: ListItem) => {
    const key = `${moduleId}/${item.id}`;
    if (isComplete(coursePath, key)) markIncomplete(coursePath, key);
    else markComplete(coursePath, key);
    setRefreshKey(k => k + 1);
  };

  const showPreview = highlightedLesson && (highlightedLesson.type === 'video' || highlightedLesson.type === 'pdf');
  const fileExists = highlightedFilePath && fs.existsSync(highlightedFilePath);

  const sidebarContent = (
    <List
      items={items}
      onSelect={handleSelect}
      onMark={handleMark}
      onHighlightChange={handleHighlight}
      initialIndex={screen.initialIndex}
      isActive={focus === 'sidebar'}
      maxVisible={18}
    />
  );

  return (
    <Layout
      breadcrumb={['Library', courseData.name, moduleData.name]}
      footer="↑↓: move  Enter/→: open  m: mark  ←: back  Tab: switch  q: quit"
      hasSidebar
      sidebar={sidebarContent}
      sidebarTitle={`LESSONS (${modProgress[0]}/${modProgress[1]})`}
      focusedPanel={focus}
      onFocusChange={setFocus}
      onBack={() => nav.pop()}
    >
      <Box flexDirection="column" paddingX={2} paddingY={1} alignItems="center">
        <Text color={THEME.accent} bold>{moduleData.name}</Text>
        <Text color={THEME.text}>{progressBar(modProgress[0], modProgress[1], 25)}</Text>
        <Text> </Text>

        {highlightedLesson && (
          <>
            {showPreview && fileExists ? (
              <Thumbnail
                key={highlightedFilePath}
                filePath={highlightedFilePath}
                type={highlightedLesson.type as 'video' | 'pdf'}
                width={40}
                height={12}
              />
            ) : (
              <Ghost small />
            )}
            <Text> </Text>
            <Text color={THEME.text} bold>{highlightedLesson.name.slice(0, 30)}</Text>
            <Text color={THEME.textMuted}>{highlightedLesson.type.toUpperCase()}</Text>
          </>
        )}
      </Box>
    </Layout>
  );
}
