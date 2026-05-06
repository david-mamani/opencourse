/**
 * OpenCourse — Navigation Context
 * Screen stack with position memory on push/pop.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ScreenType } from '../types/course.js';

interface NavigationContextType {
  stack: ScreenType[];
  current: ScreenType;
  push: (screen: ScreenType, currentIndex?: number) => void;
  pop: () => void;
  replace: (screen: ScreenType) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function useNavigation(): NavigationContextType {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}

interface Props {
  initial: ScreenType;
  children: React.ReactNode;
}

export function NavigationProvider({ initial, children }: Props): React.ReactElement {
  const [stack, setStack] = useState<ScreenType[]>([initial]);

  const push = useCallback((screen: ScreenType, currentIndex?: number) => {
    setStack(s => {
      const newStack = [...s];
      // Store highlighted index on current screen before pushing
      if (currentIndex !== undefined && newStack.length > 0) {
        const top = newStack[newStack.length - 1]!;
        if ('initialIndex' in top || top.name === 'library' || top.name === 'course' || top.name === 'module') {
          newStack[newStack.length - 1] = { ...top, initialIndex: currentIndex } as ScreenType;
        }
      }
      return [...newStack, screen];
    });
  }, []);

  const pop = useCallback(() => {
    setStack(s => s.length > 1 ? s.slice(0, -1) : s);
  }, []);

  const replace = useCallback((screen: ScreenType) => {
    setStack(s => [...s.slice(0, -1), screen]);
  }, []);

  const current = stack[stack.length - 1]!;

  return React.createElement(NavigationContext.Provider, {
    value: { stack, current, push, pop, replace },
    children,
  });
}
