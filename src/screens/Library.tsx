/**
 * Screen: Library — Courses in sidebar, details in content.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text } from 'ink';
import fs from 'node:fs';
import path from 'node:path';
import { Layout } from '../components/Layout.js';
import { List, type ListItem } from '../components/List.js';
import { Ghost } from '../components/Ghost.js';
import { progressBar } from '../components/Shared.js';
import { useNavigation } from '../context/navigation.js';
import { THEME } from '../context/theme.js';
import { findCourses, loadCourseJson } from '../engines/scanner.js';
import { getCourseProgress } from '../engines/progress.js';
import { loadConfig } from './FolderSelect.js';
import type { CourseData, ScreenType } from '../types/course.js';

interface CourseInfo {
  path: string;
  data: CourseData;
  completed: number;
  total: number;
}

export function Library(): React.ReactElement {
  const nav = useNavigation();
  const screen = nav.current as Extract<ScreenType, { name: 'library' }>;
  const [courseInfos, setCourseInfos] = useState<CourseInfo[]>([]);
  const [items, setItems] = useState<ListItem[]>([]);
  const [highlighted, setHighlighted] = useState<CourseInfo | null>(null);
  const [status, setStatus] = useState('Scanning...');
  const [focus, setFocus] = useState<'sidebar' | 'content'>('sidebar');

  useEffect(() => {
    const config = loadConfig();
    if (!config.courses_dir || !fs.existsSync(config.courses_dir)) {
      setStatus('No directory set. Press [c] to select.');
      return;
    }

    const found = findCourses(config.courses_dir);
    if (found.length === 0) {
      setStatus(`No courses in: ${config.courses_dir}`);
      return;
    }

    setStatus(`${found.length} courses`);

    const infos: CourseInfo[] = found.map(coursePath => {
      const data = loadCourseJson(coursePath);
      const [completed, total] = getCourseProgress(coursePath, data);
      return { path: coursePath, data, completed, total };
    });

    setCourseInfos(infos);

    const listItems: ListItem[] = infos.map(info => {
      const name = info.data.name || path.basename(info.path);
      const done = info.completed === info.total && info.total > 0 ? ' ✓' : '';
      return { id: info.path, label: `${name}${done}` };
    });

    setItems(listItems);
  }, []);

  const handleHighlight = useCallback((_item: ListItem, index: number) => {
    if (courseInfos[index]) setHighlighted(courseInfos[index]!);
  }, [courseInfos]);

  const handleSelect = (_item: ListItem, index: number) => {
    nav.push({ name: 'course', coursePath: _item.id }, index);
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
  ) : (
    <Box paddingX={1}><Text color={THEME.textMuted}>{status}</Text></Box>
  );

  return (
    <Layout
      breadcrumb={['Library']}
      footer="↑↓: move  Enter/→: open  ←: back  Tab: switch  c: folder  q: quit"
      hasSidebar
      sidebar={sidebarContent}
      sidebarTitle={`COURSES (${courseInfos.length})`}
      focusedPanel={focus}
      onFocusChange={setFocus}
      onBack={() => nav.replace({ name: 'folder-select' })}
    >
      {/* Right panel: course details */}
      <Box flexDirection="column" paddingX={2} paddingY={1} alignItems="center">
        {highlighted ? (
          <>
            <Ghost />
            <Text> </Text>
            <Text color={THEME.accent} bold>{highlighted.data.name}</Text>
            <Text> </Text>
            <Text color={THEME.textMuted}>Modules:  <Text color={THEME.text}>{highlighted.data.modules.length}</Text></Text>
            <Text color={THEME.textMuted}>Lessons:  <Text color={THEME.text}>{highlighted.total}</Text></Text>
            <Text color={THEME.textMuted}>Progress: <Text color={THEME.text}>{highlighted.completed}/{highlighted.total}</Text></Text>
            <Text> </Text>
            <Text color={THEME.text}>{progressBar(highlighted.completed, highlighted.total, 25)}</Text>
          </>
        ) : (
          <>
            <Ghost />
            <Text> </Text>
            <Text color={THEME.textMuted}>{status}</Text>
          </>
        )}
      </Box>
    </Layout>
  );
}
