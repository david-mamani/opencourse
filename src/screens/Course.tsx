/**
 * Screen: Course — Modules in sidebar, details in content.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text } from 'ink';
import { Layout } from '../components/Layout.js';
import { List, type ListItem } from '../components/List.js';
import { Ghost } from '../components/Ghost.js';
import { progressBar } from '../components/Shared.js';
import { useNavigation } from '../context/navigation.js';
import { THEME } from '../context/theme.js';
import { loadCourseJson } from '../engines/scanner.js';
import { getCourseProgress, getModuleProgress } from '../engines/progress.js';
import type { CourseData, Module as ModuleType, ScreenType } from '../types/course.js';

interface Props {
  coursePath: string;
}

export function Course({ coursePath }: Props): React.ReactElement {
  const nav = useNavigation();
  const screen = nav.current as Extract<ScreenType, { name: 'course' }>;
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [highlightedMod, setHighlightedMod] = useState<ModuleType | null>(null);
  const [modProgress, setModProgress] = useState<[number, number]>([0, 0]);
  const [courseProgress, setCourseProgress] = useState<[number, number]>([0, 0]);
  const [focus, setFocus] = useState<'sidebar' | 'content'>('sidebar');

  useEffect(() => {
    const data = loadCourseJson(coursePath);
    setCourseData(data);
    setCourseProgress(getCourseProgress(coursePath, data));

    const listItems: ListItem[] = data.modules.map(mod => {
      const [mc, mt] = getModuleProgress(coursePath, mod.id, data);
      const done = mc === mt && mt > 0 ? ' ✓' : '';
      return { id: mod.id, label: `${mod.name}${done}` };
    });
    setItems(listItems);
  }, [coursePath]);

  const handleHighlight = useCallback((_item: ListItem, index: number) => {
    if (courseData) {
      const mod = courseData.modules[index];
      if (mod) {
        setHighlightedMod(mod);
        setModProgress(getModuleProgress(coursePath, mod.id, courseData));
      }
    }
  }, [courseData, coursePath]);

  const handleSelect = (item: ListItem, index: number) => {
    if (!courseData) return;
    nav.push({ name: 'module', coursePath, courseData, moduleId: item.id }, index);
  };

  const sidebarContent = items.length > 0 ? (
    <List
      items={items}
      onSelect={handleSelect}
      onHighlightChange={handleHighlight}
      initialIndex={screen.initialIndex}
      isActive={focus === 'sidebar'}
      maxVisible={18}
    />
  ) : null;

  return (
    <Layout
      breadcrumb={['Library', courseData?.name || 'Course']}
      footer="↑↓: move  Enter/→: open  ←: back  Tab: switch  Esc: back  q: quit"
      hasSidebar
      sidebar={sidebarContent}
      sidebarTitle={`MODULES (${items.length})`}
      focusedPanel={focus}
      onFocusChange={setFocus}
      onBack={() => nav.pop()}
    >
      <Box flexDirection="column" paddingX={2} paddingY={1} alignItems="center">
        {highlightedMod ? (
          <>
            <Ghost />
            <Text> </Text>
            <Text color={THEME.accent} bold>{highlightedMod.name}</Text>
            <Text> </Text>
            <Text color={THEME.textMuted}>Lessons:  <Text color={THEME.text}>{highlightedMod.lessons.length}</Text></Text>
            <Text color={THEME.textMuted}>Progress: <Text color={THEME.text}>{modProgress[0]}/{modProgress[1]}</Text></Text>
            <Text> </Text>
            <Text color={THEME.text}>{progressBar(modProgress[0], modProgress[1], 25)}</Text>
            <Text> </Text>
            <Text color={THEME.textHint}>Course: {progressBar(courseProgress[0], courseProgress[1], 25)}</Text>
          </>
        ) : (
          <Ghost />
        )}
      </Box>
    </Layout>
  );
}
