/**
 * OpenCourse — Thumbnail Component
 * Displays video/PDF thumbnails as half-block ANSI art.
 * Video: ffmpeg → sharp. PDF: pdfjs-dist → SVG → sharp.
 */

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { THEME } from '../context/theme.js';
import {
  generateVideoThumbnail,
  generatePdfThumbnail,
  imageToAnsi,
  placeholderArt,
  hasFFmpeg,
} from '../engines/thumbnail.js';

interface ThumbnailProps {
  filePath: string;
  type: 'video' | 'pdf';
  width?: number;
  height?: number;
}

export function Thumbnail({ filePath, type, width = 36, height = 16 }: ThumbnailProps): React.ReactElement {
  const placeholderType = type === 'video' ? 'VIDEO' : 'PDF';
  const [art, setArt] = useState<string>(placeholderArt(placeholderType as 'VIDEO' | 'PDF', width, height));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let thumbPath: string | null = null;

      try {
        if (type === 'video') {
          if (hasFFmpeg()) {
            thumbPath = generateVideoThumbnail(filePath);
          }
        } else if (type === 'pdf') {
          // PDF thumbnail is async (uses pdfjs-dist)
          thumbPath = await generatePdfThumbnail(filePath);
        }
      } catch {
        // Fallback to placeholder
      }

      if (cancelled) return;

      if (thumbPath) {
        try {
          const ansi = await imageToAnsi(thumbPath, width, height);
          if (!cancelled) setArt(ansi);
        } catch {
          // Keep placeholder
        }
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [filePath, type, width, height]);

  return (
    <Box flexDirection="column" alignItems="center">
      {art.split('\n').map((line, i) => (
        <Text key={i}>{line}</Text>
      ))}
      {loading && (
        <Text color={THEME.textHint} dimColor>Loading...</Text>
      )}
    </Box>
  );
}
