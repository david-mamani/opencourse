# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2025-05-06

### Added
- Terminal UI course player with Ink/React
- Auto-scan course folders and detect file types (video, PDF, markdown, quiz, office, web)
- Progress tracking with per-lesson completion status
- Video player integration (VLC with system default fallback)
- Built-in markdown viewer with mermaid diagram support
- Interactive quiz engine with scoring and attempt history
- ANSI half-block video/PDF thumbnails (via ffmpeg + sharp)
- Ghost mascot with animated expressions (blink, think, wink, sleepy, skull)
- Recommended Formats guide with folder structure conventions
- Keyboard-driven navigation with vim-inspired shortcuts
- Welcome screen with glitch-animated logo
- Session persistence (continue last course)
- Sidebar lesson navigation in all viewer screens
- Test suite with 57 tests covering engines and utilities

### Fixed
- Ghost timer memory leaks (all timers now tracked and cleaned on unmount)
- `q` key no longer kills app during text input
- Progress bar crash when completed exceeds total
- Scroll overflow in text viewer (now clamped to content length)
- Thumbnail colors aligned with Gruvbox theme

### Removed
- Unused dependencies: `fullscreen-ink`, `marked`, `marked-terminal`
