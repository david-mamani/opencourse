/**
 * OpenCourse — Ghost Mascot
 * Eyes: ██ (black). Blink: ── (black on body bg).
 * Random expressions: thinking, surprised, wink, sleepy.
 * 80% blink, 20% random expression.
 */

import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import { THEME } from '../context/theme.js';

const EYE_COLOR = '#000000';

type Expression = 'idle' | 'blink' | 'thinking-left' | 'thinking-right' | 'wink' | 'sleepy' | 'skull' | 'skull-glitch';

const SKULL_COLOR = '#ea6962';

export function Ghost({ small = false }: { small?: boolean }): React.ReactElement {
  const [expression, setExpression] = useState<Expression>('idle');
  const [feetFrame, setFeetFrame] = useState(0);
  const [sleepyZzz, setSleepyZzz] = useState(0);

  // Feet animation (stops during sleepy)
  useEffect(() => {
    const interval = setInterval(() => {
      setFeetFrame(f => (f + 1) % 2);
    }, 1250);
    return () => clearInterval(interval);
  }, []);

  // Expression cycle — random
  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const intervals = new Set<ReturnType<typeof setInterval>>();
    let alive = true;

    const safeTimeout = (fn: () => void, ms: number) => {
      const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms);
      timers.add(id);
    };

    const scheduleNext = () => {
      const delay = 2500 + Math.random() * 2500;
      safeTimeout(() => {
        const roll = Math.random();

        if (roll < 0.80) {
          setExpression('blink');
          safeTimeout(() => { setExpression('idle'); scheduleNext(); }, 200);
        } else {
          const expressions: Expression[] = ['thinking-left', 'wink', 'sleepy', 'skull'];
          const picked = expressions[Math.floor(Math.random() * expressions.length)]!;

          if (picked === 'thinking-left') {
            setExpression('thinking-left');
            safeTimeout(() => {
              setExpression('thinking-right');
              safeTimeout(() => {
                setExpression('thinking-left');
                safeTimeout(() => { setExpression('idle'); scheduleNext(); }, 400);
              }, 400);
            }, 400);
          } else if (picked === 'wink') {
            setExpression('wink');
            safeTimeout(() => { setExpression('idle'); scheduleNext(); }, 600);
          } else if (picked === 'sleepy') {
            setExpression('sleepy');
            setSleepyZzz(0);
            let zPhase = 0;
            const zInt = setInterval(() => {
              if (!alive) return;
              zPhase = (zPhase + 1) % 3;
              setSleepyZzz(zPhase);
            }, 800);
            intervals.add(zInt);
            safeTimeout(() => {
              clearInterval(zInt);
              intervals.delete(zInt);
              setSleepyZzz(0);
              setExpression('idle');
              scheduleNext();
            }, 6000);
          } else if (picked === 'skull') {
            setExpression('skull-glitch');
            safeTimeout(() => {
              setExpression('skull');
              safeTimeout(() => {
                setExpression('skull-glitch');
                safeTimeout(() => { setExpression('idle'); scheduleNext(); }, 200);
              }, 1500);
            }, 200);
          }
        }
      }, delay);
    };

    scheduleNext();
    return () => {
      alive = false;
      for (const t of timers) clearTimeout(t);
      for (const i of intervals) clearInterval(i);
    };
  }, []);

  // ─── Eye rendering based on expression ───
  const renderEye = (side: 'left' | 'right', _wide: boolean) => {

    switch (expression) {
      case 'idle':
        return <Text color={EYE_COLOR}>{'██'}</Text>;

      case 'blink':
      case 'sleepy':
        return <Text color={EYE_COLOR} backgroundColor={THEME.ghostBody}>{'──'}</Text>;

      case 'thinking-left':
        return <Text color={EYE_COLOR}>{side === 'left' ? '██' : ' █'}</Text>;

      case 'thinking-right':
        return <Text color={EYE_COLOR}>{side === 'left' ? '█ ' : '██'}</Text>;

      case 'wink':
        return side === 'left'
          ? <Text color={EYE_COLOR}>{'██'}</Text>
          : <Text color={EYE_COLOR} backgroundColor={THEME.ghostBody}>{'──'}</Text>;

      default:
        return <Text color={EYE_COLOR}>{'██'}</Text>;
    }
  };

  const isSleepy = expression === 'sleepy';
  const isSkull = expression === 'skull';
  const isGlitch = expression === 'skull-glitch';
  const feetSmall = isSleepy ? '▀▀▀▀▀▀▀' : (feetFrame === 0 ? '▀█▀█▀█▀' : '█▀█▀█▀█');
  const feetBig = isSleepy ? '▀▀▀▀▀▀▀▀▀' : (feetFrame === 0 ? '▀█▀█▀█▀█▀' : '█▀█▀█▀█▀█');
  const zzzText = isSleepy ? ['z  ', 'zz ', 'zzz'][sleepyZzz]! : '';

  // ─── Skull-glitch: garbled transition ───
  if (isGlitch) {
    const g = () => {
      const chars = '░▒▓█▄▀▐▌▖▗▘▙';
      return chars[Math.floor(Math.random() * chars.length)]!;
    };
    const line = () => Array.from({ length: 11 }, g).join('');
    const c = feetFrame % 2 === 0 ? SKULL_COLOR : THEME.ghostBody;
    return (
      <Box flexDirection="column" alignItems="center">
        <Text> </Text>
        <Text color={c}>{line()}</Text>
        <Text color={c}>{line()}</Text>
        <Text color={c}>{line()}</Text>
        <Text color={c}>{line()}</Text>
        <Text color={c}>{line()}</Text>
        <Text color={c}>{line()}</Text>
      </Box>
    );
  }

  // ─── Skull: full body replacement ───
  if (isSkull && !small) {
    return (
      <Box flexDirection="column" alignItems="center">
        <Text> </Text>
        <Text color={SKULL_COLOR}>{'  ▄█████▄  '}</Text>
        <Box>
          <Text color={SKULL_COLOR}>{' █'}</Text>
          <Text color={EYE_COLOR}>{'███'}</Text>
          <Text color={SKULL_COLOR}>{'█'}</Text>
          <Text color={EYE_COLOR}>{'███'}</Text>
          <Text color={SKULL_COLOR}>{'█ '}</Text>
        </Box>
        <Box>
          <Text color={SKULL_COLOR}>{' █'}</Text>
          <Text color={EYE_COLOR}>{'███'}</Text>
          <Text color={SKULL_COLOR}>{'█'}</Text>
          <Text color={EYE_COLOR}>{'███'}</Text>
          <Text color={SKULL_COLOR}>{'█ '}</Text>
        </Box>
        <Box>
          <Text color={SKULL_COLOR}>{' ████'}</Text>
          <Text color={EYE_COLOR}>{'▀'}</Text>
          <Text color={SKULL_COLOR}>{'████ '}</Text>
        </Box>
        <Text color={SKULL_COLOR}>{' █▀█▀█▀█▀█ '}</Text>
        <Text color={SKULL_COLOR}>{'  ▀ ▀ ▀ ▀  '}</Text>
      </Box>
    );
  }
  if (isSkull && small) {
    return (
      <Box flexDirection="column" alignItems="center">
        <Text> </Text>
        <Text color={SKULL_COLOR}>{'  ▄████▄  '}</Text>
        <Box>
          <Text color={SKULL_COLOR}>{' █'}</Text>
          <Text color={EYE_COLOR}>{'██'}</Text>
          <Text color={SKULL_COLOR}>{'█'}</Text>
          <Text color={EYE_COLOR}>{'██'}</Text>
          <Text color={SKULL_COLOR}>{'█ '}</Text>
        </Box>
        <Box>
          <Text color={SKULL_COLOR}>{' ███'}</Text>
          <Text color={EYE_COLOR}>{'▀'}</Text>
          <Text color={SKULL_COLOR}>{'███ '}</Text>
        </Box>
        <Text color={SKULL_COLOR}>{'  █▀█▀█▀  '}</Text>
        <Text color={SKULL_COLOR}>{'   ▀ ▀ ▀   '}</Text>
      </Box>
    );
  }

  if (small) {
    return (
      <Box flexDirection="column" alignItems="center">
        <Text color={THEME.textHint}>{zzzText || '   '}</Text>
        <Text color={THEME.ghostBody}>{'  ▄████▄  '}</Text>
        <Text color={THEME.ghostBody}>{'  ██████  '}</Text>
        <Box>
          <Text color={THEME.ghostBody}>{' █'}</Text>
          {renderEye('left', false)}
          <Text color={THEME.ghostBody}>{'█'}</Text>
          {renderEye('right', false)}
          <Text color={THEME.ghostBody}>{'█ '}</Text>
        </Box>
        <Text color={THEME.ghostBody}>{'  ██████  '}</Text>
        <Text color={THEME.ghostBody}>{'  ' + feetSmall + '  '}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" alignItems="center">
      <Text color={THEME.textHint}>{zzzText || '   '}</Text>
      <Text color={THEME.ghostBody}>{'  ▄█████▄  '}</Text>
      <Text color={THEME.ghostBody}>{' █████████ '}</Text>
      <Box>
        <Text color={THEME.ghostBody}>{' ██'}</Text>
        {renderEye('left', true)}
        <Text color={THEME.ghostBody}>{'█'}</Text>
        {renderEye('right', true)}
        <Text color={THEME.ghostBody}>{'██ '}</Text>
      </Box>
      <Text color={THEME.ghostBody}>{' █████████ '}</Text>
      <Text color={THEME.ghostBody}>{' █████████ '}</Text>
      <Text color={THEME.ghostBody}>{' ' + feetBig + ' '}</Text>
    </Box>
  );
}
