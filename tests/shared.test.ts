/**
 * OpenCourse — Shared Components Tests
 * Tests for progressBar utility and other shared functions.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { progressBar } from '../src/components/Shared.js';

describe('Shared Components', () => {

  describe('progressBar()', () => {
    it('should show 0% for no progress', () => {
      const result = progressBar(0, 10);
      assert.ok(result.includes('0%'));
      assert.ok(result.includes('░'));
    });

    it('should show 100% for complete', () => {
      const result = progressBar(10, 10);
      assert.ok(result.includes('100%'));
      assert.ok(result.includes('█'));
    });

    it('should show 50% for half complete', () => {
      const result = progressBar(5, 10, 20);
      assert.ok(result.includes('50%'));
    });

    it('should handle 0/0 (empty course)', () => {
      const result = progressBar(0, 0);
      assert.ok(result.includes('0%'));
      // Should not crash
    });

    it('should respect custom width', () => {
      const r10 = progressBar(5, 10, 10);
      const r30 = progressBar(5, 10, 30);
      // Longer bar should have more block chars
      const blocks10 = (r10.match(/[█░]/g) || []).length;
      const blocks30 = (r30.match(/[█░]/g) || []).length;
      assert.ok(blocks30 > blocks10);
    });

    it('should handle more completed than total (edge case)', () => {
      // Should not crash
      const result = progressBar(15, 10);
      assert.ok(result.includes('%'));
    });
  });
});
