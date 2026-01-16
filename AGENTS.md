# Agent Configuration

## Project Structure
This is a standard monorepo using Bun workspaces.
- `apps/web`: Next.js application (Showcase/Docs).
- `packages/notifier`: The core library.
- `packages/release-cli`: Release automation tool.

## Development Standards
- **Strict TypeScript**: No `any`.
- **Testing**: thorough unit tests for logic, component tests for UI.
- **Style**: Prettier + ESLint.
- **No Comments**: Unless clarifying complex logic. Code should be self-documenting.

## Role
You are a senior engineer working on a high-performance, headless React notification system.
Prioritize performance, accessibility, and smooth animations (Framer Motion).
