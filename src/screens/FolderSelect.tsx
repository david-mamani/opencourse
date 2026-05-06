/**
 * Screen: Welcome — Block Art Logo with natural horizontal glitch
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import fs from 'node:fs';
import path from 'node:path';
import { Layout } from '../components/Layout.js';
import { Ghost } from '../components/Ghost.js';
import { useNavigation } from '../context/navigation.js';
import { THEME } from '../context/theme.js';
import { openInBrowser } from '../engines/launcher.js';

interface ConfigData { courses_dir: string }

function configPath(): string {
  const home = process.env['USERPROFILE'] || process.env['HOME'] || '';
  return path.join(home, '.opencourse', 'config.json');
}

export function loadConfig(): ConfigData {
  const fp = configPath();
  if (fs.existsSync(fp)) {
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); }
    catch { /* ignore */ }
  }
  return { courses_dir: '' };
}

export function saveConfig(config: ConfigData): void {
  const fp = configPath();
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, JSON.stringify(config, null, 2), 'utf-8');
}

// ─── Block Art Logo ───
const LOGO_LINES = [
  '█▀▀█ █▀▀█ █▀▀█ █▀▀▄  █▀▀▀ █▀▀█ █  █ █▀▀█ █▀▀▀ █▀▀▀',
  '█  █ █▀▀▀ █▀▀  █  █  █    █  █ █  █ █▀▀▄ ▀▀▀█ █▀▀ ',
  '▀▀▀▀ ▀    ▀▀▀▀ ▀  ▀  ▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀  ▀ ▀▀▀▀ ▀▀▀▀',
];

// ─── Natural Horizontal Glitch ───
function GlitchLogo(): React.ReactElement {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 120);
    return () => clearInterval(interval);
  }, []);

  // Glitch triggers every ~5s for ~0.4s (about 3-4 frames)
  const cycle = tick % 40;  // 40 frames × 120ms = 4.8s cycle
  const isGlitching = cycle >= 37; // last 3 frames = 360ms glitch

  const colors = [THEME.accent, THEME.text, THEME.textMuted];

  return (
    <Box flexDirection="column" alignItems="center">
      {LOGO_LINES.map((line, i) => {
        if (!isGlitching) {
          return <Text key={i} color={colors[i]}>{line}</Text>;
        }

        // Natural horizontal glitch: shift the line left or right by 1-2 chars
        const frame = cycle - 37; // 0, 1, or 2
        let offset = 0;
        if (i === 1 && frame === 0) offset = 2;
        if (i === 0 && frame === 1) offset = -1;
        if (i === 2 && frame === 2) offset = 1;

        const shifted = offset > 0
          ? ' '.repeat(offset) + line
          : offset < 0
            ? line.slice(Math.abs(offset))
            : line;

        // Occasional color flash on the shifted line
        const flashColor = offset !== 0
          ? (frame === 0 ? THEME.error : THEME.success)
          : colors[i];

        return <Text key={i} color={flashColor as string}>{shifted}</Text>;
      })}
    </Box>
  );
}

// ─── Menu ───
interface MenuItem {
  id: string;
  label: string;
  hint?: string;
  disabled?: boolean;
  separator?: boolean;
}

function buildMenu(hasLastPath: boolean): MenuItem[] {
  return [
    { id: 'continue', label: 'Continue last session', disabled: !hasLastPath },
    { id: 'new', label: 'Open a new directory' },
    { id: 'sep1', label: '', separator: true },
    { id: 'store', label: 'Course Store', hint: 'coming soon', disabled: true },
    { id: 'formats', label: 'Recommended Formats' },
    { id: 'sep2', label: '', separator: true },
    { id: 'credits', label: 'Credits & Contact' },
    { id: 'github', label: 'GitHub Repository', hint: 'for contributions and suggestions' },
  ];
}

type Mode = 'menu' | 'input' | 'credits';

export function FolderSelect(): React.ReactElement {
  const nav = useNavigation();
  const config = loadConfig();
  const hasLastPath = !!(config.courses_dir && fs.existsSync(config.courses_dir));

  const allItems = buildMenu(hasLastPath);
  const selectableItems = allItems.filter(i => !i.separator && !i.disabled);

  const [mode, setMode] = useState<Mode>('menu');
  const [selected, setSelected] = useState(0);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const goToLibrary = (dir: string) => {
    saveConfig({ courses_dir: dir });
    nav.replace({ name: 'library' });
  };

  const handleSubmit = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) { setError('Please enter a path'); return; }
    if (!fs.existsSync(trimmed)) { setError(`Not found: ${trimmed}`); return; }
    if (!fs.statSync(trimmed).isDirectory()) { setError(`Not a dir: ${trimmed}`); return; }
    goToLibrary(trimmed);
  };

  useInput((_input, key) => {
    if (mode === 'menu') {
      if (key.upArrow) setSelected(s => Math.max(0, s - 1));
      if (key.downArrow) setSelected(s => Math.min(selectableItems.length - 1, s + 1));
      if (key.return || key.rightArrow) {
        const item = selectableItems[selected];
        if (!item || item.disabled) return;
        if (item.id === 'continue') goToLibrary(config.courses_dir);
        else if (item.id === 'new') setMode('input');
        else if (item.id === 'credits') setMode('credits');
        else if (item.id === 'formats') nav.push({ name: 'formats' });
        else if (item.id === 'github') { openInBrowser('https://github.com/david-mamani/opencourse'); }
      }
    }
    if (mode === 'input') {
      if (key.escape || key.leftArrow) { setMode('menu'); setError(''); setValue(''); }
    }
    if (mode === 'credits') {
      if (key.escape || key.leftArrow || key.return) setMode('menu');
    }
  });

  const footerText = mode === 'menu'
    ? '↑↓: select  Enter/→: open  q: quit'
    : mode === 'input'
      ? 'Type path + Enter  |  ←/Esc: back'
      : '←/Esc: back';

  return (
    <Layout breadcrumb={[]} footer={footerText} inputActive={mode === 'input'}>
      <Box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>

        {/* Logo */}
        <Box marginTop={1}>
          <GlitchLogo />
        </Box>

        {/* Ghost */}
        <Box marginTop={1}>
          <Ghost />
        </Box>

        {/* Content */}
        <Box flexDirection="column" alignItems="center" marginTop={1}>
          {mode === 'menu' && (
            <>
              {allItems.map((item) => {
                if (item.separator) {
                  return (
                    <Box key={item.id} marginTop={0}>
                      <Text color={THEME.border}>{'─'.repeat(36)}</Text>
                    </Box>
                  );
                }

                // Find index in selectableItems
                const selectableIdx = selectableItems.indexOf(item);
                const isSelected = selectableIdx === selected;
                const isDisabled = item.disabled;

                let color: string = THEME.textMuted;
                if (isDisabled) color = THEME.textHint;
                else if (isSelected) color = THEME.text;

                return (
                  <Box key={item.id}>
                    <Text
                      backgroundColor={isSelected && !isDisabled ? THEME.accentDim : undefined}
                      color={color}
                      bold={isSelected && !isDisabled}
                      dimColor={isDisabled}
                    >
                      {isSelected && !isDisabled ? '  ▸ ' : '    '}
                      {item.label}
                      {item.hint ? ` (${item.hint})` : ''}
                      {'  '}
                    </Text>
                  </Box>
                );
              })}
            </>
          )}

          {mode === 'input' && (
            <>
              <Text color={THEME.text}>Enter the path to your courses folder:</Text>
              <Text color={THEME.textHint}>(Folder that contains course subfolders)</Text>
              <Box marginTop={1}>
                <Box borderStyle="round" borderColor={THEME.accent} paddingX={1}>
                  <Text color={THEME.accent}>❯ </Text>
                  <TextInput value={value} onChange={setValue} onSubmit={handleSubmit} />
                </Box>
              </Box>
              {error && <Box marginTop={1}><Text color={THEME.error}>[!] {error}</Text></Box>}
            </>
          )}

          {mode === 'credits' && (
            <Box borderStyle="round" borderColor={THEME.accent} paddingX={3} paddingY={1} flexDirection="column" alignItems="center">
              <Text color={THEME.accent} bold>OPENCOURSE</Text>
              <Text color={THEME.textMuted}>Offline Course Player</Text>
              <Text> </Text>
              <Text color={THEME.text}>Developed by <Text color={THEME.accent} bold>David A. Mamani C.</Text></Text>
              <Text> </Text>
              <Text color={THEME.textMuted}>GitHub:   <Text color={THEME.text}>github.com/david-mamani</Text></Text>
              <Text color={THEME.textMuted}>LinkedIn: <Text color={THEME.text}>linkedin.com/in/david-a-mamani-c</Text></Text>
              <Text color={THEME.textMuted}>X:        <Text color={THEME.text}>x.com/DavidAbdielMCh</Text></Text>
              <Text color={THEME.textMuted}>Email:    <Text color={THEME.text}>david.abdiel.oficial@gmail.com</Text></Text>
              <Text> </Text>
              <Text color={THEME.textHint} dimColor>v0.1.0</Text>
            </Box>
          )}
        </Box>

        {/* Version */}
        <Box marginTop={1}>
          <Text color={THEME.textHint} dimColor>v0.1.0</Text>
        </Box>
      </Box>
    </Layout>
  );
}
