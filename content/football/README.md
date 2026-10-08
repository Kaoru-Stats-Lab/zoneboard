# Football Content (source of truth)

Markdown editions under `content/football/{translationGroup}/{locale}.md`.

**Publish:** edit MD → `git commit` → `git push`. Cloudflare Pages runs `npm run build`, which generates HTML. Do **not** commit generated files under `public/**/football/`.

**Required frontmatter:**

```yaml
---
translationGroup: example-slug   # must match folder name
locale: pl                       # must match filename (pl.md)
title: "..."
description: "..."               # ≥10 chars
slug: example-slug               # kebab-case URL segment
publishedAt: 2026-10-08          # YYYY-MM-DD
updatedAt: 2026-10-08
---
```

Optional: `series`, `originalLocale`, `sourceUrl` (https Substack), `ogImage` (root-relative).

Invalid / incomplete frontmatter **fails the build** (no deploy).
