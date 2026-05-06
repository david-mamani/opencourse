#!/usr/bin/env node
/**
 * OpenCourse — Offline Course Player
 * Terminal UI built with Ink/React.
 *
 * Usage: opencourse [options]
 */

const args = process.argv.slice(2);

if (args.includes('--version') || args.includes('-v')) {
  console.log('opencourse v0.1.0');
  process.exit(0);
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  opencourse — Offline Course Player for the Terminal

  Usage:
    opencourse            Launch the TUI
    opencourse --version  Show version
    opencourse --help     Show this help

  Keyboard Shortcuts:
    ↑/↓       Navigate lists
    Enter/→   Select / Open
    Esc/←     Go back
    Tab       Switch sidebar/content
    m         Mark lesson complete
    e         Open in editor
    q         Quit

  https://github.com/david-mamani/opencourse
`);
  process.exit(0);
}

import React from 'react';
import { render } from 'ink';
import { NavigationProvider } from './context/navigation.js';
import { App } from './app.js';
import type { ScreenType } from './types/course.js';

// Always start at folder-select (welcome screen)
function getInitialScreen(): ScreenType {
  return { name: 'folder-select' };
}

const initial = getInitialScreen();

render(
  <NavigationProvider initial={initial}>
    <App />
  </NavigationProvider>
);
