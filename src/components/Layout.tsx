/**
 * OpenCourse — Layout Component
 * Global frame with sidebar + responsive sizing.
 * Tab: switch panels | ←: back | →/Enter: forward | Esc: back
 */

import React from 'react';
import { Box, Text, useInput, useStdout } from 'ink';
import { Header, Breadcrumb, Divider, Footer } from './Shared.js';
import { THEME } from '../context/theme.js';

interface LayoutProps {
  breadcrumb: string[];
  footer: string;
  sidebar?: React.ReactNode;
  sidebarTitle?: string;
  children: React.ReactNode;
  onBack?: () => void;
  hasSidebar?: boolean;
  focusedPanel?: 'sidebar' | 'content';
  onFocusChange?: (panel: 'sidebar' | 'content') => void;
  /** When true, suppresses q-to-quit and ← back (e.g. during text input) */
  inputActive?: boolean;
}

export function Layout({
  breadcrumb,
  footer,
  sidebar,
  sidebarTitle,
  children,
  onBack,
  hasSidebar = false,
  focusedPanel = 'sidebar',
  onFocusChange,
  inputActive = false,
}: LayoutProps): React.ReactElement {
  const { stdout } = useStdout();
  const termWidth = stdout.columns || 80;
  const termHeight = stdout.rows || 24;

  // Responsive sidebar width: ~30% of terminal, min 22, max 34
  const sidebarWidth = Math.min(34, Math.max(22, Math.floor(termWidth * 0.3)));

  useInput((input, key) => {
    // When a text input is active, only allow Escape (never q or ←)
    if (inputActive) {
      if (key.escape && onBack) onBack();
      return;
    }

    if (key.escape && onBack) { onBack(); return; }
    if (input === 'q') process.exit(0);

    // Tab switches focus between sidebar and content
    if (key.tab && hasSidebar && onFocusChange) {
      onFocusChange(focusedPanel === 'sidebar' ? 'content' : 'sidebar');
    }

    // Left arrow always goes back (same as Esc)
    if (key.leftArrow && onBack) {
      onBack();
      return;
    }
  });

  return (
    <Box
      borderStyle="round"
      borderColor={THEME.border}
      flexDirection="column"
      width={termWidth}
      height={Math.floor(termHeight * 0.9)}
    >
      <Header />
      <Breadcrumb parts={breadcrumb} />
      <Divider />

      <Box flexDirection="row" flexGrow={1}>
        {hasSidebar && sidebar && (
          <Box
            flexDirection="column"
            width={sidebarWidth}
            minWidth={sidebarWidth}
            flexShrink={0}
            borderStyle="single"
            borderRight
            borderTop={false}
            borderBottom={false}
            borderLeft={false}
            borderColor={focusedPanel === 'sidebar' ? THEME.accent : THEME.border}
          >
            {sidebarTitle && (
              <Box paddingX={1}>
                <Text color={focusedPanel === 'sidebar' ? THEME.accent : THEME.textMuted} bold>
                  {sidebarTitle}
                </Text>
              </Box>
            )}
            {sidebar}
          </Box>
        )}

        <Box flexDirection="column" flexGrow={1}>
          {children}
        </Box>
      </Box>

      <Divider />
      <Footer hints={footer} />
    </Box>
  );
}
