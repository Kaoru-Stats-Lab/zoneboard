/**
 * POST /api/feedback — 短文フィードバック → GitHub Issues
 * duo·reader / SUGUDASU と同じ経路。ボード内容は受け取らない。
 *
 * Cloudflare Pages secret:
 *   GITHUB_FEEDBACK_TOKEN — Issues: Read and write
 *   GITHUB_FEEDBACK_OWNER — default Kaoru-Stats-Lab
 *   GITHUB_FEEDBACK_REPO  — default zoneboard
 */

const ALLOWED_ORIGINS = new Set([
  "https://zoneboard.app",
  "https://www.zoneboard.app",
]);

const KINDS = new Set(["bug", "ux", "feature", "other"]);
const SOURCES = new Set(["landing", "settings", "editor", "footer"]);
const MAX_MESSAGE = 500;
const RATE_LIMIT_PER_DAY = 10;

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get("Origin") || "";
  const cors = corsHeaders(origin);

  if (origin && !isAllowedOrigin(origin, request)) {
    return json({ ok: false, error: "origin_not_allowed" }, 403, cors);
  }

  const token = env.GITHUB_FEEDBACK_TOKEN;
  if (!token) {
    return json({ ok: false, error: "feedback_not_configured" }, 503, cors);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400, cors);
  }

  const toolId = sanitizeId(body.tool_id, 64) || "zoneboard";
  const source = SOURCES.has(String(body.source || "")) ? String(body.source) : "footer";
  const kind = KINDS.has(String(body.kind || "")) ? String(body.kind) : "other";
  const message = String(body.message || "")
    .trim()
    .slice(0, MAX_MESSAGE);
  if (message.length < 3) {
    return json({ ok: false, error: "message_too_short" }, 400, cors);
  }

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const rateKey = `fb-rate:${await sha8(ip)}`;
  const allowed = await checkRateLimit(rateKey, RATE_LIMIT_PER_DAY);
  if (!allowed) {
    return json({ ok: false, error: "rate_limited" }, 429, cors);
  }

  const owner = env.GITHUB_FEEDBACK_OWNER || "Kaoru-Stats-Lab";
  const repo = env.GITHUB_FEEDBACK_REPO || "zoneboard";
  const uaShort = sanitizeText(body.ua_short, 120);
  const locale = sanitizeId(body.locale, 16);
  const timezone = sanitizeText(body.timezone, 64);
  const viewport = sanitizeText(body.viewport, 48);
  const colorScheme = sanitizeId(body.color_scheme, 16);
  const pagePath = sanitizeText(body.page_path, 120);
  const referrer = sanitizeText(body.referrer, 200);
  const utm = sanitizeText(body.utm, 120);
  const cf = request.cf || {};
  const country = sanitizeId(cf.country, 8);
  const continent = sanitizeId(cf.continent, 8);
  const colo = sanitizeId(cf.colo, 8);
  const acceptLang = sanitizeText(request.headers.get("Accept-Language"), 80);

  const title = `[feedback] ${toolId} · ${kind}`;
  const md = [
    "> optional product feedback · no reply · do not paste board content",
    "",
    "| field | value |",
    "|------|-----|",
    `| tool_id | \`${toolId}\` |`,
    `| source | \`${source}\` |`,
    `| kind | \`${kind}\` |`,
    uaShort ? `| ua_short | ${uaShort} |` : null,
    locale ? `| locale | \`${locale}\` |` : null,
    timezone ? `| timezone | \`${timezone}\` |` : null,
    viewport ? `| viewport | \`${viewport}\` |` : null,
    colorScheme ? `| color_scheme | \`${colorScheme}\` |` : null,
    pagePath ? `| page_path | \`${pagePath}\` |` : null,
    referrer ? `| referrer | \`${referrer}\` |` : null,
    utm ? `| utm | \`${utm}\` |` : null,
    country ? `| country | \`${country}\` |` : null,
    continent ? `| continent | \`${continent}\` |` : null,
    colo ? `| colo | \`${colo}\` |` : null,
    acceptLang ? `| accept_language | \`${acceptLang}\` |` : null,
    `| received_at | ${new Date().toISOString()} |`,
    "",
    "### message",
    "",
    "```",
    message,
    "```",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const labels = ["feedback-inbox", `feedback-kind-${kind}`];
  let ghRes = await createIssue(owner, repo, token, title, md, labels);
  if (!ghRes.ok && ghRes.status === 422) {
    ghRes = await createIssue(owner, repo, token, title, md, []);
  }

  if (!ghRes.ok) {
    const errText = await ghRes.text().catch(() => "");
    console.error("github_issue_failed", ghRes.status, errText.slice(0, 300));
    return json({ ok: false, error: "github_failed" }, 502, cors);
  }

  const issue = await ghRes.json();
  return json({ ok: true, issue_number: issue.number || null }, 200, cors);
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get("Origin") || "";
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

function createIssue(owner, repo, token, title, body, labels) {
  const payload = { title, body };
  if (labels && labels.length) payload.labels = labels;
  return fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "zoneboard-feedback",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

function isAllowedOrigin(origin, request) {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const host = new URL(request.url).hostname;
    if (host.endsWith(".pages.dev") && origin.includes(".pages.dev")) return true;
    if (host === "localhost" || host === "127.0.0.1") return true;
  } catch {
    /* ignore */
  }
  return false;
}

function corsHeaders(origin) {
  const allow =
    ALLOWED_ORIGINS.has(origin) ||
    (origin && origin.includes("pages.dev")) ||
    (origin && (origin.includes("localhost") || origin.includes("127.0.0.1")));
  return {
    "Access-Control-Allow-Origin": allow ? origin || "https://zoneboard.app" : "https://zoneboard.app",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...cors,
    },
  });
}

function sanitizeId(v, max) {
  return String(v || "")
    .trim()
    .replace(/[^a-zA-Z0-9._\-:/]/g, "")
    .slice(0, max);
}

function sanitizeText(v, max) {
  return String(v || "")
    .replace(/[\u0000-\u001f<>]/g, "")
    .trim()
    .slice(0, max);
}

async function sha8(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .slice(0, 4)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function checkRateLimit(key, maxPerDay) {
  try {
    const cache = caches.default;
    const url = new URL(`https://feedback-rate.internal/${key}`);
    const req = new Request(url.toString());
    const hit = await cache.match(req);
    let count = 0;
    if (hit) count = Number(await hit.text()) || 0;
    if (count >= maxPerDay) return false;
    count += 1;
    await cache.put(
      req,
      new Response(String(count), {
        headers: {
          "Cache-Control": "public, max-age=86400",
          "Content-Type": "text/plain",
        },
      }),
    );
    return true;
  } catch {
    return true;
  }
}
