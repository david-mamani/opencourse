# 👻 OpenCourse

**Offline Course Player for the Terminal.**

Play your downloaded courses directly from the terminal — with progress tracking, video thumbnails, quizzes, and a friendly ghost mascot.

> ⚠️ **Early Development Notice**: This project is in early development. Features may change or be incomplete. Contributions welcome!

## Features

- 🎬 **Auto-scan** course folders — detects videos, PDFs, markdown, quizzes, and more
- 📊 **Progress tracking** — per-lesson completion status saved locally
- 🖼️ **Video thumbnails** — ANSI half-block art rendered in the terminal (requires ffmpeg)
- 📝 **Markdown viewer** — with mermaid diagram support and highlight syntax
- 🧪 **Interactive quizzes** — `.quiz.md` files with scoring and attempt history
- 👻 **Ghost mascot** — animated with expressions (blink, think, wink, sleepy, skull)
- 🗂️ **Recommended Formats** — built-in guide for organizing course folders
- ⌨️ **Keyboard-driven** — vim-inspired navigation, no mouse needed

## Installation

### Using npm (recommended)

```bash
npm install -g opencourse
```

Then run:

```bash
opencourse
```

### From source

```bash
git clone https://github.com/david-mamani/opencourse.git
cd opencourse
npm install
npm run build
npm start
```

## Quick Start

1. **Install**: `npm install -g opencourse`
2. **Run**: `opencourse`
3. **Point to your courses folder** — any directory containing course subfolders
4. **Navigate** and learn!

Your course folders should look something like this:

```
My Courses/
├── Python Basics/
│   ├── 01 - Introduction/
│   │   ├── 01 - Welcome.mp4
│   │   ├── 02 - Setup.pdf
│   │   └── 03 - First Steps.md
│   └── 02 - Variables/
│       ├── 01 - Types.mp4
│       └── 02 - Quiz.quiz.md
└── Web Development/
    ├── 01 - HTML/
    │   └── 01 - Basics.mp4
    └── 02 - CSS/
        └── 01 - Selectors.mp4
```

OpenCourse automatically detects the structure and creates a navigable interface.

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `↑` `↓` | Navigate lists |
| `Enter` / `→` | Select / Open |
| `Esc` / `←` | Go back |
| `Tab` | Switch between sidebar and content |
| `m` | Mark lesson as complete |
| `e` | Open file in system editor |
| `d` | Open mermaid diagram in browser |
| `q` | Quit |

## Supported File Types

| Type | Extensions | Viewer |
|---|---|---|
| Video | `.mp4` `.mkv` `.avi` `.webm` `.mov` `.m4v` | VLC / System default |
| PDF | `.pdf` | System PDF viewer |
| Text | `.md` | Built-in markdown viewer |
| Quiz | `.quiz.md` | Built-in interactive quiz |
| Web | `.html` `.htm` | System browser |
| Office | `.docx` `.pptx` `.xlsx` | System default |

## Optional Dependencies

| Tool | Purpose | Required? |
|---|---|---|
| [VLC](https://www.videolan.org/) | Video playback | No (falls back to system default) |
| [ffmpeg](https://ffmpeg.org/) | Video thumbnail generation | No (shows placeholder) |
| [sharp](https://sharp.pixelplumbing.com/) | Image processing for thumbnails | Bundled |

## Configuration

OpenCourse stores its config at `~/.opencourse/config.json`:

```json
{
  "courses_dir": "/path/to/your/courses"
}
```

Progress is saved per-course in `.progress.json` files within each course folder.

## Development

```bash
# Install dependencies
npm install

# Run in development mode (hot reload)
npm run dev

# Run tests
npm test

# Type check
npx tsc --noEmit

# Build for production
npm run build
```

## Known Limitations

- **Course depth**: The scanner supports arbitrary folder depth, but flattens all files within a module into a single lesson list. Very deep folder hierarchies (20+ levels) may produce long flat lists.
- **Windows-focused**: External player launching uses `cmd` and `start`. Cross-platform support planned for a future release.
- **No streaming**: This is an offline player for downloaded content only.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

## Author

**David A. Mamani C.**

- GitHub: [david-mamani](https://github.com/david-mamani)
- LinkedIn: [david-a-mamani-c](https://www.linkedin.com/in/david-a-mamani-c/)
- X: [@DavidAbdielMCh](https://x.com/DavidAbdielMCh)
- Email: david.abdiel.oficial@gmail.com
