# Contributing to @remcostoeten/notifier

Thank you for considering contributing to this project!

## Development Setup

1. Clone the repository
2. Install dependencies: `bun install`
3. Start development: `bun run dev`
4. Build: `bun run build`

## Project Structure

```
packages/notifier/
├── src/
│   ├── components/     # React components
│   ├── constants.ts    # Configuration constants
│   ├── store.ts        # State management
│   ├── notify.ts       # Main API
│   ├── types.ts        # TypeScript types
│   └── utils.ts        # Helper functions
├── package.json
├── tsconfig.json
└── tsup.config.js
```

## Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Use JSDoc comments for public APIs
- Keep functions small and focused

### Commits

- Use conventional commit messages
- Format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore

### Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a PR with a clear description

### Testing

- Test on latest React versions
- Test both CJS and ESM builds
- Test in different browsers
- Verify TypeScript types

## Reporting Issues

When reporting issues, please include:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (React version, browser, etc.)
- Code example if possible

## Feature Requests

Feature requests are welcome! Please:

- Check if it already exists
- Explain the use case
- Provide examples of how it would work
- Consider if it fits the library's scope

## Questions

For questions, please use GitHub Discussions rather than issues.

Thank you for contributing!
