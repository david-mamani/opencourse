/**
 * OpenCourse — Renderer Engine
 * Pre-processes Markdown with LaTeX and highlight support.
 * Ported from Python renderer.py
 */

export function convertHighlights(text: string): string {
  return text.replace(/==(.+?)==/g, '**$1**');
}

export function formatMermaidBlocks(text: string): string {
  return text.replace(/```mermaid\s*\n([\s\S]+?)```/g, (_match, code: string) => {
    return `\n\`\`\`\n--- diagram (mermaid) ---\n${code.trim()}\nPress [d] to view rendered diagram\n\`\`\`\n`;
  });
}

export function preprocessMarkdown(text: string): string {
  text = convertHighlights(text);
  text = formatMermaidBlocks(text);
  return text;
}

export function extractMermaidCode(text: string): string | null {
  const match = text.match(/```mermaid\s*\n([\s\S]+?)```/);
  return match ? match[1]!.trim() : null;
}
