<h1 align="center">notifier-docs</h1>

<p align="center">Documentation for <a href="https://github.com/remcostoeten/Notify">@remcostoeten/notifier</a>, forked from docs-boilerplate.</p>

Pages are MDX files in `content/docs`: concepts, guides, one page per component and a reference for every prop, function, type and token. The sidebar is built from the folder structure.

- Toasts on these pages are live. `<ToastPreview />` renders a real `Toast` with a button that opens it through `notify`, and `<ToastButton />` is the button alone. Both take the content props of `notify` or an `example` name from `src/modules/notifier/examples.tsx`.
- `Notifier` is mounted once in `src/app/layout.tsx` through `SiteNotifier`, which follows the site theme.
- Search, the Markdown view of every page, `/llms.txt`, Open Graph images and the sidebar come from the boilerplate. Its README describes them.

The site name, URL and repository are in `src/shared/config/site.ts`.

## Development

Requires [Bun](https://bun.sh) and [Vite+](https://viteplus.dev) (`vp`). Run the commands from `apps/docs`.

```bash
bun install        # install dependencies and generate .source
bun dev            # start the dev server
bun run check      # format and lint through vp
bun run typecheck  # regenerate .source and route types, then tsc
bun run build      # check internal links, then build for production
```

The docs are not part of the root Bun workspace. They have their own `bun.lock` and install `@remcostoeten/notifier` from npm, so the pages show the published release rather than `packages/notifier` on `master`. Bump the version in `package.json` after each release. Root `oxlint` and `oxfmt` skip this folder, and `vp` formats and lints it with the settings in `vite.config.ts`.

<br/>

xxx,<br/>
[Remco Stoeten](https://remcostoeten.com)<br/>
<small>MIT</small>
