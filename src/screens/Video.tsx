/**
 * Screen: Video — Lesson sidebar + video panel.
 * Enter/→ opens video. Auto-focuses content on mount.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import fs from 'node:fs';
import path from 'node:path';
import { Layout } from '../components/Layout.js';
import { List, type ListItem } from '../components/List.js';
import { Ghost } from '../components/Ghost.js';
import { useNavigation } from '../context/navigation.js';
import { THEME } from '../context/theme.js';
import { isComplete, markComplete } from '../engines/progress.js';
import { openVideo, type VideoProcess } from '../engines/launcher.js';
import type { CourseData, Lesson } from '../types/course.js';

interface Props {
  coursePath: string;
  courseData: CourseData;
  moduleId: string;
  lesson: Lesson;
  filePath: string;
}

export function Video({ coursePath, courseData, moduleId, lesson, filePath }: Props): React.ReactElement {
  const nav = useNavigation();
  const moduleData = courseData.modules.find(m => m.id === moduleId)!;
  const [playerName, setPlayerName] = useState('--');
  const [playing, setPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const videoProc = useRef<VideoProcess | null>(null);
  const [focus, setFocus] = useState<'sidebar' | 'content'>('content');

  const key = `${moduleId}/${lesson.id}`;
  const done = isComplete(coursePath, key);
  const fileExists = fs.existsSync(filePath);
  const currentLessonIdx = moduleData.lessons.findIndex(l => l.id === lesson.id);

  useEffect(() => {
    return () => { if (videoProc.current?.process) videoProc.current.process.removeAllListeners(); };
  }, []);

  const doPlay = () => {
    if (!fileExists || playing) return;
    const vp = openVideo(filePath);
    videoProc.current = vp;
    setPlayerName(vp.playerName);
    setPlaying(true);
    setPlayCount(c => c + 1);
    vp.process.on('exit', () => setPlaying(false));
    vp.process.on('error', () => setPlaying(false));
  };

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

  // Content-specific input: Enter/→ opens video, m marks
  useInput((input, keyInfo) => {
    if (focus !== 'content') return;
    if ((keyInfo.return || keyInfo.rightArrow) && fileExists && !playing) doPlay();
    if (input === 'r' && fileExists) doPlay();
    if (input === 'm') { markComplete(coursePath, key); nav.pop(); }
  }, { isActive: focus === 'content' });

  return (
    <Layout
      breadcrumb={['Library', courseData.name, moduleData.name, lesson.name]}
      footer="Enter/→: play  m: mark  r: replay  Tab: switch  ←/Esc: back"
      hasSidebar
      sidebar={<List items={sidebarItems} onSelect={handleSidebarSelect} initialIndex={currentLessonIdx} isActive={focus === 'sidebar'} maxVisible={16} />}
      sidebarTitle="LESSONS"
      focusedPanel={focus}
      onFocusChange={setFocus}
      onBack={() => nav.pop()}
    >
      <Box flexDirection="column" paddingX={2} paddingY={1} alignItems="center">
        <Text color={THEME.accent} bold>{'>> VIDEO'}</Text>
        <Text> </Text>
        <Ghost />
        <Text> </Text>
        <Text color={THEME.text} bold>{lesson.name.slice(0, 35)}</Text>
        <Text> </Text>
        <Text color={THEME.textMuted}>Player:   <Text color={THEME.text}>{playerName}</Text></Text>
        <Text color={THEME.textMuted}>Duration: <Text color={THEME.text}>{lesson.duration || '--'}</Text></Text>
        <Text color={THEME.textMuted}>Status:   <Text color={done ? THEME.success : THEME.warning}>{done ? '[x] Done' : '[ ] Pending'}</Text></Text>
        {playCount > 0 && <Text color={THEME.textHint}>Played:   {playCount}x</Text>}
        <Text> </Text>
        {playing ? (
          <Text color={THEME.success}>▶ Playing... <Text color={THEME.textHint}>[r] replay</Text></Text>
        ) : fileExists ? (
          <Text color={THEME.accent} bold>Press Enter or → to play</Text>
        ) : (
          <Text color={THEME.error}>FILE NOT FOUND</Text>
        )}
      </Box>
    </Layout>
  );
}
