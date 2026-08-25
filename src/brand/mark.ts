/** ZoneBoard mark ink. Contrast is for the graphic at UI size (WCAG 1.4.11, 3:1). */
export const BRAND = {
  studio: "#0c0d0e",
  ivory: "#f3f3f1",
  /** Canonical first-marker. Use on dark / pitch only (7.98:1 on studio, 2.19:1 on ivory). */
  brass: "#c4a24a",
  /** First-marker on light paper. 5.59:1 on ivory. */
  brassDeep: "#7a5c20",
} as const;

export const MARK = {
  viewBoxIcon: "0 0 32 32",
  viewBoxMark: "5.5 5.5 21 21",
  r: 2.45,
  stroke: 2.2,
  first: 5,
  dots: [
    [9, 9],
    [16, 9],
    [23, 9],
    [9, 23],
    [16, 23],
    [23, 23],
  ] as const,
} as const;

export type MarkVariant = "icon" | "mark";
export type MarkScheme = "color" | "mono" | "brass";
/** Ground behind the artwork. For `icon`, this is the tile, not the page. */
export type MarkGround = "dark" | "light" | "brass" | "pitch";

export type MarkPaint = {
  ink: string;
  accent: string;
  plate: string | null;
  ok: boolean;
  note: string;
};

export type MarkSpec = {
  variant: MarkVariant;
  scheme: MarkScheme;
  on: MarkGround;
};

/**
 * Pick fills. Illegal combos still return a safe fallback (`ok: false`)
 * so the component never paints a mark that disappears.
 */
export function resolveMarkPaint({
  variant,
  scheme,
  on,
}: MarkSpec): MarkPaint {
  const darkField = on === "dark" || on === "pitch";
  const brassField = on === "brass";

  if (variant === "icon") {
    if (scheme === "color" && on === "light") {
      return {
        ink: BRAND.studio,
        accent: BRAND.brassDeep,
        plate: BRAND.ivory,
        ok: true,
        note: "Inverse tile — light badge on dark chrome.",
      };
    }
    if (scheme === "color") {
      return {
        ink: BRAND.ivory,
        accent: BRAND.brass,
        plate: BRAND.studio,
        ok: true,
        note: "App icon / favicon. Same on any page colour.",
      };
    }
    if (scheme === "mono" && (on === "light" || brassField)) {
      return {
        ink: BRAND.studio,
        accent: BRAND.studio,
        plate: BRAND.ivory,
        ok: true,
        note: "Mono light tile.",
      };
    }
    if (scheme === "mono") {
      return {
        ink: BRAND.ivory,
        accent: BRAND.ivory,
        plate: BRAND.studio,
        ok: true,
        note: "Mono dark tile.",
      };
    }
    if (on === "light") {
      return {
        ink: BRAND.brassDeep,
        accent: BRAND.brassDeep,
        plate: BRAND.ivory,
        ok: true,
        note: "Single deep brass on a light tile.",
      };
    }
    return {
      ink: BRAND.brass,
      accent: BRAND.brass,
      plate: BRAND.studio,
      ok: true,
      note: "Single brass on a dark tile.",
    };
  }

  if (scheme === "color") {
    if (brassField) {
      return {
        ink: BRAND.studio,
        accent: BRAND.studio,
        plate: null,
        ok: false,
        note: "Colour on brass: the marker vanishes. Use mono black.",
      };
    }
    if (darkField) {
      return {
        ink: BRAND.ivory,
        accent: BRAND.brass,
        plate: null,
        ok: true,
        note: "Canonical colour mark.",
      };
    }
    return {
      ink: BRAND.studio,
      accent: BRAND.brassDeep,
      plate: null,
      ok: true,
      note: "Colour reverse. Deep brass — canonical brass fails 3:1 on paper.",
    };
  }

  if (scheme === "mono") {
    if (darkField) {
      return {
        ink: BRAND.ivory,
        accent: BRAND.ivory,
        plate: null,
        ok: true,
        note: "Mono white. Photos, pitch, studio.",
      };
    }
    return {
      ink: BRAND.studio,
      accent: BRAND.studio,
      plate: null,
      ok: true,
      note: "Mono black. Paper, brass field, light kit.",
    };
  }

  if (!darkField) {
    return {
      ink: BRAND.studio,
      accent: BRAND.studio,
      plate: null,
      ok: false,
      note: "Canonical brass on paper is 2.2:1. Use colour-light or mono black.",
    };
  }
  return {
    ink: BRAND.brass,
    accent: BRAND.brass,
    plate: null,
    ok: true,
    note: "Single brass. Dark studio or pitch only.",
  };
}

export function markInnerSvg(paint: MarkPaint): string {
  const line = `  <line x1="22.5" y1="9.5" x2="9.5" y2="22.5" stroke="${paint.ink}" stroke-width="${MARK.stroke}" stroke-linecap="round"/>`;
  const dots = MARK.dots
    .map(([cx, cy], i) => {
      const fill = i === MARK.first ? paint.accent : paint.ink;
      return `  <circle cx="${cx}" cy="${cy}" r="${MARK.r}" fill="${fill}"/>`;
    })
    .join("\n");
  return `${line}\n${dots}`;
}

export function renderMarkSvg(spec: MarkSpec): string {
  const paint = resolveMarkPaint(spec);
  const isMark = spec.variant === "mark";
  const viewBox = isMark ? MARK.viewBoxMark : MARK.viewBoxIcon;
  const plate = paint.plate
    ? `  <rect width="32" height="32" rx="6" fill="${paint.plate}"/>\n`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">\n${plate}${markInnerSvg(paint)}\n</svg>\n`;
}

export const BRAND_ASSETS: Array<MarkSpec & { file: string; alias?: string }> =
  [
    {
      file: "mark-color-dark.svg",
      variant: "mark",
      scheme: "color",
      on: "dark",
      alias: "logo.svg",
    },
    {
      file: "mark-color-light.svg",
      variant: "mark",
      scheme: "color",
      on: "light",
    },
    {
      file: "mark-mono-white.svg",
      variant: "mark",
      scheme: "mono",
      on: "dark",
    },
    {
      file: "mark-mono-black.svg",
      variant: "mark",
      scheme: "mono",
      on: "light",
    },
    {
      file: "mark-brass.svg",
      variant: "mark",
      scheme: "brass",
      on: "dark",
    },
    {
      file: "icon-color.svg",
      variant: "icon",
      scheme: "color",
      on: "dark",
      alias: "favicon.svg",
    },
    {
      file: "icon-inverse.svg",
      variant: "icon",
      scheme: "color",
      on: "light",
    },
    {
      file: "icon-mono-dark.svg",
      variant: "icon",
      scheme: "mono",
      on: "dark",
    },
    {
      file: "icon-mono-light.svg",
      variant: "icon",
      scheme: "mono",
      on: "light",
    },
  ];
