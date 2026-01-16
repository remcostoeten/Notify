# Setup Guide

Complete guide for setting up the notifier monorepo locally.

## Prerequisites

- Bun 1.2.0 or higher
- Node.js 18+ (for compatibility testing)
- Git
- npm account (for publishing)

## Initial Setup

1. Clone the repository:
```bash
git clone https://github.com/remcostoeten/notifier.git
cd notifier
```

2. Install all dependencies:
```bash
bun install
```

3. Setup git hooks (Husky):
```bash
bun run prepare
```

4. Build all packages:
```bash
bun run build
```

## Project Structure

```
.
├── packages/
│   ├── notifier/          # Main notification library
│   └── release-cli/       # Release automation tool
├── app/                   # Demo/documentation site
├── components/            # Demo UI components
└── module/               # Local package alias for demo
```

## Development Workflow

### Running the Demo Site

The demo site showcases the notifier package with interactive examples:

```bash
bun run dev
```

Open http://localhost:3000 to view the demo.

### Working on the Notifier Package

```bash
cd packages/notifier

# Run tests
bun test

# Run tests in watch mode
bun test --watch

# Build the package
bun run build

# Type check
bun run typecheck
```

### Testing Local Changes in Demo

The demo automatically uses the local notifier package via the `module/notify` alias. Changes to `packages/notifier/src` require a rebuild:

```bash
cd packages/notifier
bun run build
# Return to root and refresh demo
cd ../..
```

## Publishing to npm

### First Time Setup

1. Login to npm:
```bash
npm login
```

2. Verify your account has access to the `@remcostoeten` scope.

### Manual Publishing

```bash
cd packages/notifier

# Ensure tests pass
bun test

# Build the package
bun run build

# Publish to npm
npm publish --access public
```

### Automated Publishing (Recommended)

Use the release CLI for automated versioning and changelog generation.

## Release CLI Setup

The release CLI automates version bumping, changelog generation, git tagging, and npm publishing using AI-generated changelogs.

### Installation

```bash
cd packages/release-cli
bun install
bun run build
bun link
```

This makes the `release` command available globally.

### Configuration

Initialize the CLI with your preferred LLM provider:

```bash
release init
```

You'll be prompted to select:
- **Provider**: gemini (free), anthropic, openai, openrouter, or ollama
- **API Key**: Your provider's API key
- **Model**: Recommended defaults are provided

For Gemini (free tier):
1. Get API key from https://aistudio.google.com/apikey
2. Select "gemini" as provider
3. Use default model: `gemini-2.0-flash`

Configuration is saved to `.release-cli.json` in your home directory.

### Using the Release CLI

Navigate to the package you want to release:

```bash
cd packages/notifier
```

#### Full Release Workflow

Run the complete release pipeline:

```bash
release run
```

This will:
1. Analyze git commits since last version
2. Generate changelog using AI
3. Determine version bump (major/minor/patch)
4. Update package.json version
5. Update CHANGELOG.md
6. Run tests
7. Build the package
8. Create git tag
9. Push to GitHub
10. Publish to npm

#### Preview Changes (Dry Run)

See what would happen without executing:

```bash
release run --dry-run
```

#### Generate Changelog Only

```bash
release changelog
```

#### Check Git Status

```bash
release status
```

## Environment Variables

Alternative to `.release-cli.json`, set environment variables:

```bash
export GEMINI_API_KEY=your-api-key
export ANTHROPIC_API_KEY=your-api-key
export OPENAI_API_KEY=your-api-key
export OPENROUTER_API_KEY=your-api-key
```

## CI/CD

### GitHub Actions

The repository includes automated workflows:

- **CI**: Runs tests on all push/PR (Node 18, 20, 22)
- **Publish**: Automated npm publish on release tag creation

### Required Secrets

Add to GitHub repository settings:

- `NPM_TOKEN`: npm automation token for publishing
- `CODECOV_TOKEN`: (optional) for coverage reports

## Common Tasks

### Adding Dependencies

```bash
# To root workspace
bun add -d <package>

# To specific package
cd packages/notifier
bun add <package>
```

### Running Linter

```bash
bun run lint        # Check for issues
bun run lint:fix    # Auto-fix issues
```

### Formatting Code

```bash
bun run format      # Check formatting
bun run format:fix  # Auto-fix formatting
```

### Pre-commit Hooks

Husky automatically runs on `git commit`:
- ESLint on staged files
- Prettier formatting
- Type checking

## Troubleshooting

### Build Fails

```bash
# Clean and rebuild
rm -rf packages/*/dist
bun run build
```

### Tests Fail After Changes

```bash
# Rebuild before testing
cd packages/notifier
bun run build
bun test
```

### Demo Not Showing Changes

The demo uses the built version. After changing source:

```bash
cd packages/notifier
bun run build
```

### Husky Hooks Not Running

```bash
bun run prepare
chmod +x .husky/pre-commit
```

### Release CLI Not Found

```bash
cd packages/release-cli
bun run build
bun link
```

### npm Publish Permission Denied

Ensure you're logged in and have access to the `@remcostoeten` scope:

```bash
npm login
npm owner add $(npm whoami) @remcostoeten/notifier
```

## Development Tips

1. Always run tests before committing
2. Use `--dry-run` with release CLI to preview changes
3. Keep changelog updated manually for clarity
4. Test in demo app before publishing
5. Use semantic versioning for releases

## Getting Help

- Issues: https://github.com/remcostoeten/notifier/issues
- Discussions: https://github.com/remcostoeten/notifier/discussions
- Email: remcostoeten@example.com
