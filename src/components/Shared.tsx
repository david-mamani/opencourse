/**
 * OpenCourse — Shared UI Components
 */

import React from 'react';
import { Box, Text } from 'ink';
import { THEME } from '../context/theme.js';

const APP_NAME = 'OPENCOURSE';
const VERSION = 'v0.1.0';

// ─── Header ───
export function Header(): React.ReactElement {
  return (
    <Box paddingX={1}>
      <Text bold color={THEME.accent}>{APP_NAME}</Text>
      <Text color={THEME.textMuted}> ──── </Text>
      <Text color={THEME.ghostBody}>👻</Text>
      <Text color={THEME.textMuted}> ──── </Text>
      <Text color={THEME.textHint}>{VERSION}</Text>
    </Box>
  );
}

// ─── Breadcrumb ───
export function Breadcrumb({ parts }: { parts: string[] }): React.ReactElement {
  return (
    <Box paddingX={1}>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Text color={THEME.textHint}> › </Text>}
          <Text color={i === parts.length - 1 ? THEME.accent : THEME.textMuted}>{part}</Text>
        </React.Fragment>
      ))}
    </Box>
  );
}

// ─── Divider ───
export function Divider(): React.ReactElement {
  return (
    <Box>
      <Text color={THEME.border} wrap="truncate">
        {'─'.repeat(200)}
      </Text>
    </Box>
  );
}

// ─── Footer ───
export function Footer({ hints }: { hints: string }): React.ReactElement {
  return (
    <Box paddingX={1}>
      <Text color={THEME.textHint}>{hints}</Text>
    </Box>
  );
}

// ─── Progress Bar ───
export function progressBar(completed: number, total: number, width: number = 20): string {
  if (total === 0) return '░'.repeat(width) + '   0%';
  const pct = Math.min(completed / total, 1);
  const filled = Math.min(Math.round(pct * width), width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const pctText = `${Math.round(pct * 100)}%`;
  return `${bar} ${pctText.padStart(4)}`;
}
