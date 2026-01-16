# CLI Migration Tool Specification

**Goal:** A CLI command that automatically scans a codebase and refactors imports and usage from other toast libraries to `@remcostoeten/notifier`.

## 1. Command Interface

```bash
npx @remcostoeten/notifier migrate [options]
```

**Options:**
- `--from <library>`: `sonner`, `react-hot-toast`, `react-toastify`
- `--dry-run`: Show changes without writing
- `--path`: Target directory (default: `.`)

## 2. Implementation Logic

### Phase 1: Dependency Check
1. Detect `package.json` for target libraries.
2. Prompt to install `@remcostoeten/notifier`.
3. Prompt to uninstall old library.

### Phase 2: AST Codemod (using `jscodeshift` or `ts-morph`)

**Tasks:**
1. **Find Imports:**
   - Find `import { toast } from 'sonner'`
   - Replace with `import { toast } from '@remcostoeten/notifier/compat/sonner'`
   - OR replace with `import { notify } from '@remcostoeten/notifier'` (Native Migration)

2. **Find Components:**
   - Locate `<Toaster />` in `layout.tsx` / `App.tsx`.
   - Replace with `<Notifier />` (or `<Toaster />` from compat).

3. **Handle Hooks:**
   - If migrating from `useToast` (shadcn/ui), replace hook usage with direct `notify` imports (since notifier is headless/hookless).

## 3. Requirements

1. **Safety:** Must not break the build. If a pattern is too complex, log a warning and skip.
2. **Interactive:** Use `enquirer` prompts to confirm steps.
3. **Backup:** Check for uncommitted changes before running (git status check).

## 4. Testing

- Create fixture projects (one for sonner, one for RHT).
- Run migration tool against fixtures.
- Verify component snapshots match expectations.
