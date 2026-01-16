# @remcostoeten/release-cli

AI-powered release automation CLI with LLM changelog generation.

## Features

- **AI Changelog Generation** - Uses Claude, GPT-4, or local Ollama to generate meaningful changelogs from commits
- **Semantic Versioning** - Interactive version bumping (major, minor, patch, prerelease)
- **Full Release Pipeline** - Version bump → Changelog → Build → Git tag → Push → NPM publish
- **Multiple LLM Providers** - Anthropic, OpenAI, OpenRouter, Ollama (local)
- **Dry Run Mode** - Preview all changes before executing
- **Configurable** - JSON config file or package.json settings

## Installation

```bash
npm install -g @remcostoeten/release-cli
# or
pnpm add -g @remcostoeten/release-cli
```

## Quick Start

```bash
# Initialize configuration
release init

# Set your API key
export ANTHROPIC_API_KEY=your-key

# Run a release
release run

# Or with options
release run --bump patch --dry-run
```

## Commands

### `release run` (default)

Run the full release process.

```bash
release run [options]

Options:
  -b, --bump <type>      Version bump: major, minor, patch, prerelease
  -v, --version <ver>    Explicit version number
  --preid <id>           Pre-release identifier (alpha, beta, rc)
  --dry-run              Preview without executing
  -y, --yes              Skip confirmations
  --no-changelog         Skip changelog generation
  --no-tag               Skip git tag
  --no-push              Skip push to remote
  --no-publish           Skip npm publish
  --otp <code>           NPM 2FA code
```

### `release changelog`

Generate changelog only (no release).

```bash
release changelog [options]

Options:
  -v, --version <ver>    Version for entry
  -o, --output <path>    Output file
  --dry-run              Preview only
  --print                Print to stdout
```

### `release status`

Show current release status.

```bash
release status
```

### `release init`

Interactive setup wizard.

## Configuration

Create `.release-cli.json` in your project root:

```json
{
  "branch": "main",
  "remote": "origin",
  "access": "public",
  "changelog": true,
  "tag": true,
  "push": true,
  "publish": true,
  "llm": {
    "provider": "anthropic",
    "model": "claude-sonnet-4-20250514"
  }
}
```

Or add to `package.json`:

```json
{
  "release-cli": {
    "branch": "main",
    "llm": {
      "provider": "openai",
      "model": "gpt-4o"
    }
  }
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `OPENAI_API_KEY` | OpenAI API key for GPT |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `LLM_PROVIDER` | Override default provider |
| `LLM_BASE_URL` | Custom API endpoint |

## LLM Providers

### Anthropic (Claude)
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

### OpenAI
```bash
export OPENAI_API_KEY=sk-...
```

### OpenRouter
```bash
export OPENROUTER_API_KEY=sk-or-...
```

### Ollama (Local)
No API key needed. Make sure Ollama is running:
```bash
ollama serve
ollama pull llama3.2
```

## Programmatic Usage

```typescript
import { runRelease, loadConfig, generateChangelog } from '@remcostoeten/release-cli';

// Run release programmatically
const config = await loadConfig();
const result = await runRelease(config, {
  bump: 'patch',
  dryRun: true,
});

// Generate changelog only
const entry = await generateChangelog(
  config.llm,
  commits,
  '1.2.0',
  'my-package'
);
```

## License

MIT
