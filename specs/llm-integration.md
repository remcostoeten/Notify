# LLM Integration Documentation Specification

**Goal:** Create a specialized documentation file (`llm.txt` or `PROMPT.md`) that gives LLMs (Cursor, Windsurf, Copilot) perfectly formatted context to "one-shot" the installation and usage of `@remcostoeten/notifier`.

## 1. File Location & Format

- **Path:** `/llm.txt` (served at root of docs site) and `/PROMPT.md` (in repo root)
- **Format:** Optimized Markdown for minimal token usage but maximum context.

## 2. Content Sections

### A. Context & Role
Define what the library is (Headless, chainable, animated, React).

### B. Full API Surface (Condensed)
```typescript
notify(msg).success().loading().promise().confirm()
<Notifier position="..." />
```

### C. "One-Shot" Installation Instructions
Provide a single copy-paste block that an LLM can execute to fully install and setup the library.

**Example Block:**
1. Install: `npm install @remcostoeten/notifier framer-motion`
2. Create `components/ui/notifier.tsx`: (Provide fully working wrapper code)
3. Add to `app/layout.tsx`: (Provide exact placement code)

### D. Migration Patterns
Examples of translating common patterns from other libs.

**User Prompt Example:**
"I am using shadcn/ui toast. Replace it with @remcostoeten/notifier."

**LLM Response Strategy:**
- Detect usage of `useToast`.
- Replace with `notify` imports.
- Replace `<Toaster />` in layout.

## 3. Requirements

1. **Self-Contained:** The file must contain *everything* needed. No "see docs" links.
2. **Token Efficient:** Avoid fluff. Use concise code blocks.
3. **Provider Agnostic:** Works for Claude, GPT-4, etc.

## 4. Maintenance

- Add a CI check to ensure `llm.txt` stays in sync with `src/types.ts`.
- If types change, this file MUST be updated.
