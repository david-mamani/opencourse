#!/usr/bin/env node
/**
 * OpenCourse — Offline Course Player
 * Terminal UI built with Ink/React.
 *
 * Usage: npm start
 */

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
