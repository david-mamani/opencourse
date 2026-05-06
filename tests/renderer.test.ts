/**
 * OpenCourse — Renderer Engine Tests
 * Tests for markdown preprocessing, mermaid extraction, highlight conversion.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { convertHighlights, formatMermaidBlocks, preprocessMarkdown, extractMermaidCode } from '../src/engines/renderer.js';

describe('Renderer Engine', () => {

  // ─── convertHighlights ───

  describe('convertHighlights()', () => {
    it('should convert ==text== to **text**', () => {
      assert.equal(convertHighlights('This is ==highlighted== text'), 'This is **highlighted** text');
    });

    it('should handle multiple highlights', () => {
      assert.equal(convertHighlights('==one== and ==two=='), '**one** and **two**');
    });

    it('should not touch single =', () => {
      assert.equal(convertHighlights('a = b'), 'a = b');
    });

    it('should handle empty highlights', () => {
      assert.equal(convertHighlights('==== empty'), '==== empty');
    });

    it('should handle highlights with special chars', () => {
      assert.equal(convertHighlights('==hello world!=='), '**hello world!**');
    });
  });

  // ─── formatMermaidBlocks ───

  describe('formatMermaidBlocks()', () => {
    it('should wrap mermaid code in a display block', () => {
      const input = '```mermaid\ngraph TD\nA-->B\n```';
      const result = formatMermaidBlocks(input);
      assert.ok(result.includes('diagram (mermaid)'));
      assert.ok(result.includes('Press [d]'));
    });

    it('should preserve non-mermaid code blocks', () => {
      const input = '```javascript\nconsole.log("hi")\n```';
      const result = formatMermaidBlocks(input);
      assert.equal(result, input);
    });

    it('should handle multiple mermaid blocks', () => {
      const input = '```mermaid\nA\n```\ntext\n```mermaid\nB\n```';
      const result = formatMermaidBlocks(input);
      assert.equal((result.match(/diagram \(mermaid\)/g) || []).length, 2);
    });
  });

  // ─── extractMermaidCode ───

  describe('extractMermaidCode()', () => {
    it('should extract mermaid code from markdown', () => {
      const input = 'Some text\n```mermaid\ngraph TD\nA-->B\n```\nMore text';
      const result = extractMermaidCode(input);
      assert.equal(result, 'graph TD\nA-->B');
    });

    it('should return null when no mermaid block', () => {
      const input = 'No mermaid here';
      assert.equal(extractMermaidCode(input), null);
    });

    it('should extract first mermaid block only', () => {
      const input = '```mermaid\nfirst\n```\n```mermaid\nsecond\n```';
      const result = extractMermaidCode(input);
      assert.equal(result, 'first');
    });
  });

  // ─── preprocessMarkdown ───

  describe('preprocessMarkdown()', () => {
    it('should apply both highlights and mermaid formatting', () => {
      const input = '==highlight==\n```mermaid\nA\n```';
      const result = preprocessMarkdown(input);
      assert.ok(result.includes('**highlight**'));
      assert.ok(result.includes('diagram (mermaid)'));
    });

    it('should handle plain text unchanged', () => {
      const input = 'Just regular text with no special syntax.';
      assert.equal(preprocessMarkdown(input), input);
    });
  });
});
