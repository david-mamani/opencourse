/**
 * Screen: Recommended Formats — Course-style navigator for format docs.
 * Sidebar: sections. Content: scrollable markdown. AI prompt at the end.
 */

import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { execSync } from 'node:child_process';
import { Layout } from '../components/Layout.js';
import { List, type ListItem } from '../components/List.js';
import { useNavigation } from '../context/navigation.js';
import { THEME } from '../context/theme.js';
import type { ScreenType } from '../types/course.js';

// ─── Section Content ───

const SECTIONS: { id: string; title: string; content: string[] }[] = [
  {
    id: 'structure',
    title: 'Folder Structure',
    content: [
      '# Recommended Folder Structure',
      '',
      'OpenCourse automatically detects your course structure.',
      'Organize your files like this:',
      '',
      '  MY_COURSES/              ← Select this folder',
      '  ├── Course Name/         ← Each subfolder = COURSE',
      '  │   ├── 01 - Module/     ← Subfolders = MODULES',
      '  │   │   ├── 01 - Lesson.mp4',
      '  │   │   ├── 02 - Notes.md',
      '  │   │   └── 03 - Quiz.quiz.md',
      '  │   ├── 02 - Module 2/',
      '  │   │   └── ...',
      '  │   └── Intro.md         ← Root files = "General" module',
      '  └── Another Course/',
      '',
      'RULES:',
      '  • Number prefixes set the order (01, 02, 03...)',
      '  • Files without numbers go to the end',
      '  • Names are cleaned: "01_my-lesson" → "My Lesson"',
      '  • Subdirectories within modules are flattened',
    ],
  },
  {
    id: 'naming',
    title: 'Naming & Ordering',
    content: [
      '# Naming Conventions',
      '',
      'OpenCourse orders and cleans file names automatically.',
      '',
      'VALID PREFIXES:',
      '  01 - Lesson Name.mp4    ✓',
      '  01_lesson_name.mp4      ✓',
      '  01.lesson.mp4           ✓',
      '  1-lesson.mp4            ✓',
      '  001 - Lesson.mp4        ✓',
      '',
      'AUTO-CLEANING:',
      '  01 - my_first_lesson.mp4  →  "My First Lesson"',
      '  02_conceptos-basicos.mp4  →  "Conceptos Basicos"',
      '  TODO 03 - pending.mp4     →  "Pending" (TODO removed)',
      '',
      'TIPS:',
      '  • Use consistent numbering (01, 02 not 1, 2)',
      '  • Accented characters are preserved (á, é, ñ)',
      '  • Underscores and hyphens become spaces',
    ],
  },
  {
    id: 'video',
    title: 'Video Files',
    content: [
      '# Video Format',
      '',
      'Supported extensions:',
      '  .mp4  .mkv  .avi  .webm  .mov  .m4v',
      '',
      'Videos are played with your system player (VLC recommended).',
      '',
      'FEATURES:',
      '  • Thumbnail preview in module browser',
      '  • Play count tracking',
      '  • Mark as complete',
      '',
      'RECOMMENDED:',
      '  • Use .mp4 (H.264) for best compatibility',
      '  • Name: "01 - Lesson Title.mp4"',
      '  • Keep consistent resolution across a course',
    ],
  },
  {
    id: 'pdf',
    title: 'PDF Files',
    content: [
      '# PDF Format',
      '',
      'Extension: .pdf',
      '',
      'PDFs are opened with your system PDF viewer.',
      '',
      'FEATURES:',
      '  • Text-preview thumbnail in module browser',
      '  • File size display',
      '  • Mark as complete',
      '',
      'RECOMMENDED:',
      '  • Use for slides, reference material, exercises',
      '  • Name: "03 - Course Notes.pdf"',
    ],
  },
  {
    id: 'markdown',
    title: 'Markdown Files',
    content: [
      '# Markdown (.md) Files',
      '',
      'Extension: .md',
      '',
      'Markdown files are rendered directly in the TUI.',
      '',
      'SUPPORTED ELEMENTS:',
      '  • Headings (# ## ### ####)',
      '  • **Bold**, *italic*, ~~strikethrough~~',
      '  • Bullet and numbered lists',
      '  • Tables (GitHub Flavored Markdown)',
      '  • Code blocks with syntax highlighting',
      '  • Blockquotes',
      '  • Horizontal rules',
      '  • Task lists [ ] [x]',
      '',
      'KEYBOARD SHORTCUTS IN VIEWER:',
      '  ↑↓       Scroll line by line',
      '  PgUp/Dn  Scroll 10 lines',
      '  e        Open in external editor',
      '  d        Open Mermaid diagram (if present)',
      '  m        Mark as complete',
    ],
  },
  {
    id: 'quiz',
    title: 'Quiz Files',
    content: [
      '# Quiz Format (.quiz.md)',
      '',
      'Extension: .quiz.md  (NOT just .md)',
      '',
      'Each question starts with ## (heading level 2).',
      'Options use checkboxes:',
      '',
      '  ## What is BIM?',
      '  - [ ] Building Interior Management',
      '  - [x] Building Information Modeling    ← correct',
      '  - [ ] Basic Infrastructure Model',
      '',
      'RULES:',
      '  • [x] = correct answer',
      '  • [ ] = wrong answer',
      '  • Multiple [x] allowed per question',
      '  • Text before first ## = instructions',
      '  • Questions are auto-counted',
      '',
      'EXAMPLE FILE NAME:',
      '  05 - Final Exam.quiz.md',
    ],
  },
  {
    id: 'ai-prompt',
    title: '★ AI Folder Organizer',
    content: [
      '# ★ AI Folder Organizer',
      '',
      'Use this prompt to have an AI organize your',
      'messy course folder into OpenCourse format.',
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '  Copy the prompt below and paste it into',
      '  any AI assistant (ChatGPT, Claude, etc.)',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      '  Press [c] to copy prompt to clipboard',
      '  Press [e] to edit the folder path',
      '',
    ],
  },
];

function generatePrompt(folderPath: string): string {
  return `# Task: Organize Course Folder for OpenCourse

## Context
I have a messy folder with course content that I need organized into a structure compatible with **OpenCourse**, an offline course player for the terminal.

## Source Folder
\`\`\`
${folderPath || '<PASTE YOUR FOLDER PATH HERE>'}
\`\`\`

## Required Output Structure
\`\`\`
Course Name/
├── 01 - Module Name/
│   ├── 01 - Lesson Title.mp4
│   ├── 02 - Lesson Title.mp4
│   ├── 03 - Notes.md
│   ├── 04 - Quiz.quiz.md
│   └── 05 - Reference.pdf
├── 02 - Module Name/
│   └── ...
└── README.md
\`\`\`

## Rules
1. **Number prefixes**: Every file and folder must have a numeric prefix for ordering: \`01 - Name\`, \`02 - Name\`, etc.
2. **Modules**: Group related lessons into module folders. Each module folder is a top-level subdirectory.
3. **File types**: Keep original extensions. Supported: .mp4, .mkv, .avi, .webm, .mov, .pdf, .md, .quiz.md, .html, .docx, .pptx
4. **Quiz files**: If you find quiz/exam content, format as \`.quiz.md\` with this structure:
   \`\`\`markdown
   ## Question text
   - [ ] Wrong answer
   - [x] Correct answer
   - [ ] Wrong answer
   \`\`\`
5. **Clean names**: Remove special characters, use spaces and hyphens. Keep accented characters.
6. **Logical order**: Order modules and lessons in a logical learning sequence.
7. **Don't delete**: Move all files, don't delete anything. If unsure where a file goes, create a "Resources" module.

## Instructions
1. Analyze the contents of the source folder
2. Propose the new organized structure
3. Provide the exact commands (PowerShell or bash) to rename and move the files
4. Ask me to confirm before executing`;
}

function copyToClipboard(text: string): boolean {
  try {
    if (process.platform === 'win32') {
      execSync('clip', { input: text, windowsHide: true });
    } else if (process.platform === 'darwin') {
      execSync('pbcopy', { input: text, windowsHide: true });
    } else {
      execSync('xclip -selection clipboard', { input: text, windowsHide: true });
    }
    return true;
  } catch {
    return false;
  }
}

import TextInput from 'ink-text-input';

export function Formats(): React.ReactElement {
  const nav = useNavigation();
  const screen = nav.current as Extract<ScreenType, { name: 'formats' }>;
  const [selectedSection, setSelectedSection] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [focus, setFocus] = useState<'sidebar' | 'content'>('sidebar');
  const [copied, setCopied] = useState(false);
  const [folderPath, setFolderPath] = useState('');
  const [editingPath, setEditingPath] = useState(false);

  const currentSection = SECTIONS[selectedSection]!;
  const isAiPrompt = currentSection.id === 'ai-prompt';

  const sidebarItems: ListItem[] = SECTIONS.map(s => ({
    id: s.id,
    label: s.title,
  }));

  const handleSidebarSelect = useCallback((_item: ListItem, index: number) => {
    setSelectedSection(index);
    setScrollOffset(0);
    setCopied(false);
    setEditingPath(false);
    setFocus('content');
  }, []);

  const handleHighlight = useCallback((_item: ListItem, index: number) => {
    setSelectedSection(index);
    setScrollOffset(0);
    setCopied(false);
  }, []);

  // Non-AI content lines
  const contentLines = currentSection.content;
  const promptLines = generatePrompt(folderPath).split('\n');
  const visibleContent = contentLines.slice(scrollOffset, scrollOffset + 22);
  const visiblePrompt = promptLines.slice(scrollOffset, scrollOffset + 14);

  useInput((input, key) => {
    if (focus !== 'content') return;
    if (editingPath) {
      if (key.escape) setEditingPath(false);
      return;
    }

    const maxLines = isAiPrompt ? promptLines.length : contentLines.length;
    const pageSize = isAiPrompt ? 14 : 22;

    if (key.upArrow) setScrollOffset(s => Math.max(0, s - 1));
    if (key.downArrow) setScrollOffset(s => Math.min(Math.max(0, maxLines - pageSize + 2), s + 1));
    if (key.pageUp) setScrollOffset(s => Math.max(0, s - 10));
    if (key.pageDown) setScrollOffset(s => Math.min(Math.max(0, maxLines - pageSize + 2), s + 10));

    if (isAiPrompt) {
      if (input === 'c') {
        const prompt = generatePrompt(folderPath);
        const success = copyToClipboard(prompt);
        setCopied(success);
      }
      if (input === 'e' || key.return) {
        setEditingPath(true);
      }
    }
  }, { isActive: focus === 'content' && !editingPath });

  const footerText = isAiPrompt
    ? (editingPath
      ? 'Type path + Esc: done'
      : '↑↓: scroll  [c] copy  [e] edit path  Tab: sidebar  ←: back')
    : '↑↓: scroll  Tab: switch  ←/Esc: back';

  return (
    <Layout
      breadcrumb={['Home', 'Recommended Formats', currentSection.title]}
      footer={footerText}
      hasSidebar
      sidebar={
        <List
          items={sidebarItems}
          onSelect={handleSidebarSelect}
          onHighlightChange={handleHighlight}
          initialIndex={screen.initialIndex}
          isActive={focus === 'sidebar'}
          maxVisible={12}
        />
      }
      sidebarTitle="SECTIONS"
      focusedPanel={focus}
      onFocusChange={setFocus}
      onBack={() => {
        if (editingPath) { setEditingPath(false); return; }
        nav.pop();
      }}
    >
      {isAiPrompt ? (
        /* ─── AI Folder Organizer: 2-panel layout ─── */
        <Box flexDirection="column" paddingX={2} paddingY={1} flexGrow={1}>
          {/* Title */}
          <Text color={THEME.accent} bold>★ AI Folder Organizer</Text>
          <Text color={THEME.textMuted}>Paste a prompt into any AI to organize your folder.</Text>
          <Text> </Text>

          {/* Part 1: Folder path input */}
          <Box borderStyle="round" borderColor={editingPath ? THEME.accent : THEME.border} paddingX={1} paddingY={0} flexDirection="column">
            <Text color={THEME.textMuted}>Source folder (press <Text color={THEME.accent} bold>e</Text> to edit):</Text>
            {editingPath ? (
              <Box>
                <Text color={THEME.accent}>❯ </Text>
                <TextInput
                  value={folderPath}
                  onChange={setFolderPath}
                  onSubmit={() => setEditingPath(false)}
                />
              </Box>
            ) : (
              <Text color={folderPath ? THEME.text : THEME.textHint}>
                {folderPath || '<click [e] to type your folder path>'}
              </Text>
            )}
          </Box>

          <Text> </Text>

          {/* Part 2: Prompt code block */}
          <Text color={THEME.textMuted}>
            Prompt (<Text color={THEME.accent} bold>c</Text> to copy to clipboard)
            {copied && <Text color={THEME.success} bold>  ✓ Copied!</Text>}
          </Text>
          <Box
            borderStyle="round"
            borderColor={THEME.border}
            paddingX={1}
            flexDirection="column"
            flexGrow={1}
          >
            {visiblePrompt.map((line, i) => {
              let color: string = THEME.textMuted;
              if (line.startsWith('#')) color = THEME.accent;
              else if (line.startsWith('```')) color = THEME.border;
              else if (line.match(/^\d+\./)) color = THEME.text;
              else if (line.startsWith('  -')) color = THEME.text;
              else if (line.includes('**')) color = THEME.text;
              return <Text key={scrollOffset + i} color={color} wrap="truncate">{line || ' '}</Text>;
            })}
            {promptLines.length > 14 && (
              <Text color={THEME.textHint}>
                ── {scrollOffset + 1}-{Math.min(scrollOffset + 14, promptLines.length)} of {promptLines.length} ──
              </Text>
            )}
          </Box>
        </Box>
      ) : (
        /* ─── Normal section: scrollable content ─── */
        <Box flexDirection="column" paddingX={2} paddingY={1}>
          {visibleContent.map((line, i) => {
            const isHeading = line.startsWith('# ');
            const isSubHeading = line.startsWith('RULES:') || line.startsWith('TIPS:') || line.startsWith('FEATURES:')
              || line.startsWith('RECOMMENDED:') || line.startsWith('VALID') || line.startsWith('AUTO-CLEANING:')
              || line.startsWith('SUPPORTED') || line.startsWith('KEYBOARD') || line.startsWith('EXAMPLE')
              || line.startsWith('## ');
            const isStar = line.startsWith('★') || line.startsWith('# ★');
            const isBar = line.startsWith('━');
            const isCheck = line.includes('✓');
            const isArrow = line.includes('→');

            let color: string = THEME.text;
            if (isHeading || isStar) color = THEME.accent;
            else if (isSubHeading) color = THEME.warning;
            else if (isBar) color = THEME.accent;
            else if (isCheck || isArrow) color = THEME.success;

            return <Text key={scrollOffset + i} color={color} wrap="truncate">{line}</Text>;
          })}

          {contentLines.length > 22 && (
            <Text color={THEME.textHint}>
              ── {scrollOffset + 1}-{Math.min(scrollOffset + 22, contentLines.length)} of {contentLines.length} ──
            </Text>
          )}
        </Box>
      )}
    </Layout>
  );
}

