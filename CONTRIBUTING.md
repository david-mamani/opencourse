# Contributing to OpenCourse

Thank you for your interest in contributing to OpenCourse! This guide will help you get started.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- npm (comes with Node.js)
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/opencourse.git
   cd opencourse
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run in development mode:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming

- `feat/description` — new features
- `fix/description` — bug fixes
- `docs/description` — documentation changes
- `refactor/description` — code refactoring

### Making Changes

1. Create a branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```
2. Make your changes
3. Run tests:
   ```bash
   npm test
   ```
4. Run type check:
   ```bash
   npx tsc --noEmit
   ```
5. Commit with a descriptive message:
   ```bash
   git commit -m "feat: add subtitle support for video player"
   ```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation
- `refactor:` — code restructuring
- `test:` — adding or updating tests
- `chore:` — maintenance tasks

### Pull Requests

1. Push your branch to your fork
2. Open a PR against `main`
3. Fill in the PR template
4. Ensure all CI checks pass
5. Wait for review

## Project Structure

```
opencourse/
├── src/
│   ├── index.tsx          # Entry point
│   ├── app.tsx            # Screen router
│   ├── components/        # Reusable UI components
│   │   ├── Ghost.tsx      # Mascot animations
│   │   ├── Layout.tsx     # Global frame with sidebar
│   │   ├── List.tsx       # Scrollable list
│   │   ├── Shared.tsx     # Header, Footer, Breadcrumb
│   │   └── Thumbnail.tsx  # ANSI art thumbnails
│   ├── context/           # React contexts
│   │   ├── navigation.tsx # Navigation stack
│   │   └── theme.ts       # Color theme
│   ├── engines/           # Core logic (no UI)
│   │   ├── launcher.ts    # External process spawning
│   │   ├── progress.ts    # Progress tracking I/O
│   │   ├── renderer.ts    # Markdown preprocessing
│   │   ├── scanner.ts     # Course folder scanning
│   │   └── thumbnail.ts   # Image processing
│   ├── screens/           # Full-screen views
│   │   ├── FolderSelect.tsx
│   │   ├── Library.tsx
│   │   ├── Course.tsx
│   │   ├── Module.tsx
│   │   ├── Video.tsx
│   │   ├── TextViewer.tsx
│   │   ├── PdfViewer.tsx
│   │   └── Formats.tsx
│   └── types/             # TypeScript definitions
│       └── course.ts
├── tests/                 # Test suite
├── formats/               # Course format documentation
├── package.json
└── tsconfig.json
```

## Testing

Tests use Node.js built-in test runner (`node:test`) via `tsx`:

```bash
# Run all tests
npm test

# Run a specific test file
npx tsx --test tests/scanner.test.ts
```

### Writing Tests

- Place test files in `tests/` with `.test.ts` extension
- Use `describe` and `it` from `node:test`
- Use `assert` from `node:assert/strict`
- Test engines independently (they don't depend on React/Ink)

## Code Style

- TypeScript strict mode enabled
- Use `const` over `let` where possible
- Prefer named exports
- Components are functional React with hooks
- Engines are pure functions (no React dependency)

## Reporting Bugs

Open an [issue](https://github.com/david-mamani/opencourse/issues) with:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Your OS and Node.js version

## Feature Requests

Open a [discussion](https://github.com/david-mamani/opencourse/discussions) or [issue](https://github.com/david-mamani/opencourse/issues) describing:

1. The problem you're trying to solve
2. Your proposed solution
3. Alternatives you've considered

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
