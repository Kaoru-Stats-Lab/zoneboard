import type { Connect, Plugin } from "vite";
import { SITE_NAV } from "./src/site/publisher";

/**
 * Vite SPA html-fallback wins over `public/<slug>/index.html` for `/guide/`
 * (and siblings). Production uses `_redirects` 200 rewrites; this mirrors
 * that in `vite` / `vite preview` so How-to → public guide works locally.
 */
const LOCALE_PREFIX = "ja|es|pt|pl|de|fr|tr|it";

function rewriteSiteDocUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  const q = url.indexOf("?");
  const path = q === -1 ? url : url.slice(0, q);
  const search = q === -1 ? "" : url.slice(q);
  for (const { slug } of SITE_NAV) {
    if (path === `/${slug}` || path === `/${slug}/`) {
      return `/${slug}/index.html${search}`;
    }
  }
  // Football hub + localized editions (SPA fallback would otherwise win)
  if (path === "/football" || path === "/football/") {
    return `/football/index.html${search}`;
  }
  const enArticle = path.match(/^\/football\/([^/]+)\/?$/);
  if (enArticle) {
    return `/football/${enArticle[1]}/index.html${search}`;
  }
  const locArticle = path.match(
    new RegExp(`^/(${LOCALE_PREFIX})/football/([^/]+)/?$`),
  );
  if (locArticle) {
    return `/${locArticle[1]}/football/${locArticle[2]}/index.html${search}`;
  }
  return url;
}

function siteDocMiddleware(): Connect.NextHandleFunction {
  return (req, _res, next) => {
    const nextUrl = rewriteSiteDocUrl(req.url);
    if (nextUrl && nextUrl !== req.url) req.url = nextUrl;
    next();
  };
}

export function siteDocRoutesPlugin(): Plugin {
  return {
    name: "site-doc-routes",
    configureServer(server) {
      server.middlewares.use(siteDocMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(siteDocMiddleware());
    },
  };
}
