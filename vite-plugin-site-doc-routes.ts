import type { Connect, Plugin } from "vite";
import { SITE_NAV } from "./src/site/publisher";

/**
 * Vite SPA html-fallback wins over `public/<slug>/index.html` for `/guide/`
 * (and siblings). Production uses `_redirects` 200 rewrites; this mirrors
 * that in `vite` / `vite preview` so How-to → public guide works locally.
 */
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
