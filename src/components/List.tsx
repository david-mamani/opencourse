/**
 * OpenCourse — Scrollable List
 * Enter OR → selects. isActive for focus. onHighlightChange for preview.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import { THEME } from '../context/theme.js';

export interface ListItem {
  id: string;
  label: string;
  disabled?: boolean;
}

interface ListProps {
  items: ListItem[];
  onSelect: (item: ListItem, index: number) => void;
  onMark?: (item: ListItem, index: number) => void;
  onHighlightChange?: (item: ListItem, index: number) => void;
  initialIndex?: number;
  maxVisible?: number;
  isActive?: boolean;
}

export function List({
  items, onSelect, onMark, onHighlightChange, initialIndex, maxVisible = 15, isActive = true,
}: ListProps): React.ReactElement {
  const [highlighted, setHighlighted] = useState(() => {
    if (initialIndex !== undefined && initialIndex >= 0 && initialIndex < items.length && !items[initialIndex]?.disabled) {
      return initialIndex;
    }
    const first = items.findIndex(item => !item.disabled);
    return first >= 0 ? first : 0;
  });

  const prevHighlighted = useRef(highlighted);

  useEffect(() => {
    if (highlighted !== prevHighlighted.current) {
      prevHighlighted.current = highlighted;
      const item = items[highlighted];
      if (item && onHighlightChange) onHighlightChange(item, highlighted);
    }
  }, [highlighted, items, onHighlightChange]);

  useEffect(() => {
    const item = items[highlighted];
    if (item && onHighlightChange) onHighlightChange(item, highlighted);
  }, []); // eslint-disable-line

  useInput((input, key) => {
    if (key.upArrow) {
      setHighlighted(h => {
        let next = h - 1;
        while (next >= 0 && items[next]?.disabled) next--;
        return next >= 0 ? next : h;
      });
    }
    if (key.downArrow) {
      setHighlighted(h => {
        let next = h + 1;
        while (next < items.length && items[next]?.disabled) next++;
        return next < items.length ? next : h;
      });
    }
    if (key.return || key.rightArrow) {
      const item = items[highlighted];
      if (item && !item.disabled) onSelect(item, highlighted);
    }
    if (input === 'm' && onMark) {
      const item = items[highlighted];
      if (item && !item.disabled) onMark(item, highlighted);
    }
  }, { isActive });

  const scrollStart = Math.max(0, Math.min(highlighted - Math.floor(maxVisible / 2), items.length - maxVisible));
  const visibleItems = items.slice(Math.max(0, scrollStart), scrollStart + maxVisible);

  return (
    <Box flexDirection="column" paddingX={1}>
      {visibleItems.map((item, i) => {
        const realIndex = Math.max(0, scrollStart) + i;
        const isHighlighted = realIndex === highlighted;
        const isDisabled = item.disabled;

        return (
          <Box key={item.id + '-' + realIndex}>
            {isHighlighted && !isDisabled ? (
              <Text backgroundColor={isActive ? THEME.accentDim : THEME.border} color={THEME.text} bold={isActive}>
                {'▸ '}{item.label}
              </Text>
            ) : (
              <Text color={isDisabled ? THEME.textHint : THEME.text}>
                {'  '}{item.label}
              </Text>
            )}
          </Box>
        );
      })}
      {items.length > maxVisible && (
        <Text color={THEME.textHint}>{`  ── ${highlighted + 1}/${items.length} ──`}</Text>
      )}
    </Box>
  );
}
