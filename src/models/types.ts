export type SportId =
  | "soccer"
  | "futsal"
  | "beach_soccer"
  | "basketball"
  | "volleyball";

/** 協会サッカー派生（記号・ツール流用） */
export function isSoccerFamily(sport: SportId): boolean {
  return sport === "soccer" || sport === "futsal" || sport === "beach_soccer";
}

/** 利き足表示・編集（バスケ／バレーでは使わない） */
export function usesPreferredFoot(sport: SportId): boolean {
  return isSoccerFamily(sport);
}

/** 身長（バスケ・バレーのマッチアップ説明） */
export function usesHeight(sport: SportId): boolean {
  return sport === "basketball" || sport === "volleyball";
}

/** 体重（バスケ向け。バレー公式プロフィールでは身長が主） */
export function usesWeight(sport: SportId): boolean {
  return sport === "basketball";
}
export type LineKind = "pass" | "run" | "dribble" | "screen";
export type PitchView = "full" | "half";
/** ボード単位の向き。局面スイッチでは変わらない。欠落セーブは landscape。 */
export type PitchOrientation = "landscape" | "portrait";
export type ToolId =
  | "select"
  | "piece-home"
  | "piece-away"
  | "ball"
  | "pass"
  | "run"
  | "dribble"
  | "screen"
  | "zone"
  | "pen"
  | "link"
  | "text";

export interface BallState {
  x: number;
  y: number;
  /**
   * くっつけた駒 id。
   * 駒を動かすとボールも一緒に動く（マルチ選択不要・学習コスト最小）。
   * ボールだけドラッグして離すと解除。
   */
  attachedTo?: string | null;
}

/** 事前登録メンバー（ベンチ入り名簿）— Pro 選手セットと同じカラム */
export interface RosterPlayer {
  number: string;
  label: string;
  /** 利き足（任意）L / R / B — サカ系 */
  preferredFoot?: "L" | "R" | "B" | null;
  /** 身長 cm（任意・バスケ） */
  heightCm?: number | null;
  /** 体重 kg（任意・バスケ） */
  weightKg?: number | null;
}

export interface TeamRoster {
  players: RosterPlayer[];
  /** スタメン背番号。発表後にセットして一括配置 */
  starterNumbers: string[];
}

export interface MatchRoster {
  home: TeamRoster;
  away: TeamRoster;
}

/** 得点記録（スコアは goals から自動集計） */
export type GoalKind = "normal" | "penalty";

export interface GoalEntry {
  id: string;
  team: "home" | "away";
  /** 得点者（背番号 or 名前） */
  scorer: string;
  /** 通常得点 or PK 得点 */
  kind: GoalKind;
  /** 例: "23" / "45+2" */
  minute?: string;
  /** Later: アシスト（UI 非表示） */
  assist?: string;
}

export type CardKind = "YC" | "RC" | "Y2C";

/** 出場状態（Broadcast 交代 / 負傷）。docs/BROADCAST_SUBS.md */
export type MatchStatus = "on" | "in" | "out" | "injured";

/** 交代記録（履歴・駒状態用。駒の matchStatus と併用） */
export interface SubEntry {
  id: string;
  team: "home" | "away";
  /** 降りた背番号 */
  outNumber: string;
  /** 入った背番号 */
  inNumber: string;
  minute?: string;
  /** 負傷交代 */
  injured?: boolean;
}

/** PK 1本（docs/BROADCAST_PK.md）。result 未設定 = 未キック */
export type PkKickResult = "scored" | "missed";

export interface PkKickSlot {
  id: string;
  /** キック直前の背番号（任意） */
  number?: string;
  result?: PkKickResult;
}

/** ペナルティシュートアウト。行ラベルは homeTeam/awayTeam を使う */
export interface PkShootout {
  active: boolean;
  home: PkKickSlot[];
  away: PkKickSlot[];
}

/** 警告・退場（チーム累計は cards から自動集計） */
export interface CardEntry {
  id: string;
  team: "home" | "away";
  /** 背番号 or 名前 */
  player: string;
  minute?: string;
  kind: CardKind;
}

/**
 * Pro 用選手セット（v1 は UI 未実装。カラムだけ先に定義）
 * 作成はユーザ任せ。公式ライブ取込はしない。
 */
export interface PlayerSet {
  id: string;
  name: string;
  sport: SportId;
  players: RosterPlayer[];
  defaultColor?: string;
  updatedAt: string;
}

/** 駒サイズ: 戦術デフォルメ(大) 〜 ポジション精密(小) */
export type PieceSizePreset = "tactics" | "balanced" | "position";

/**
 * 局面（シーン）
 * UNIQUE は id。label は表示用（重複可）。
 * 試合前に複数セットし、配信中に切り替える。
 */
export type ScenePhase = "pre" | "live" | "post" | "setpiece" | "custom";

/** セットプレー等: 指定ハーフのピッチ内駒を隠す（ベンチ帯は残す） */
export type HideHalf = "none" | "left" | "right";

/** 試合前・試合後の準備用。所属チームの表示フィルタ（駒は消さない） */
export type TeamFocus = "both" | "home" | "away";

export interface Piece {
  id: string;
  x: number;
  y: number;
  number: string;
  label: string;
  color: string;
  team: "home" | "away";
  facing: number;
  /**
   * starter = 試合に出ている駒（ピッチ内＋タッチライン際・ゴール裏もフルサイズ）
   * bench = ベンチ帯のみ小サイズ（y がピッチから十分離れた帯）
   */
  role: "starter" | "bench";
  /**
   * 試合上の出場状態（座標・role とは独立。OUT でも芝に置いて解説してよい）。
   * 未指定はマークなし（starter≈出場、bench≈未使用として扱う）。
   */
  matchStatus?: MatchStatus;
  /**
   * キット枠。サカ系だけ意味がある。
   * outfield = フィールドユニ、gk = GKユニ（IFAB: 他と区別できる色）。
   * 未指定は outfield。背番号では推定しない。
   */
  kit?: "outfield" | "gk";
  /** 個別に隠す（局面の hideHalf より優先して隠す場合に false） */
  visible?: boolean;
  /**
   * 利き足（任意）。解説・VTuber 同時視聴向け。
   * L / R / B（両利き）。未設定なら表示しない。サカ系のみ。
   */
  preferredFoot?: "L" | "R" | "B" | null;
  /** 身長 cm（任意・バスケのマッチアップ説明向け） */
  heightCm?: number | null;
  /** 体重 kg（任意・バスケのマッチアップ説明向け） */
  weightKg?: number | null;
}

export interface LineObject {
  id: string;
  type: "line";
  kind: LineKind;
  /**
   * 自由曲線の点列（ドラッグで自然に弧を描く）。
   * 2点なら直線、3点以上なら弧。制御点操作は不要。
   */
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
}

export interface ZoneObject {
  id: string;
  type: "zone";
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  strokeColor: string;
}

export interface PenObject {
  id: string;
  type: "pen";
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
}

/**
 * Piece-anchored structure polyline (line shape / back four, etc.).
 * Drawn through current piece centres; follows any linked piece on move.
 */
export interface LinkObject {
  id: string;
  type: "link";
  pieceIds: string[];
  color: string;
  strokeWidth: number;
}

export type TextFontId = "system" | "display" | "serif" | "mono";

export interface TextObject {
  id: string;
  type: "text";
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  fontFamily?: TextFontId;
}

export type DrawObject =
  | LineObject
  | ZoneObject
  | PenObject
  | LinkObject
  | TextObject;

export interface Scene {
  id: string;
  /** 表示名「CK右」「前半キックオフ」など。UNIQUE ではない */
  label: string;
  phase: ScenePhase;
  pieces: Piece[];
  ball: BallState;
  objects: DrawObject[];
  /**
   * セットプレー用の駒非表示（レガシー）。
   * 推奨は viewport ズームで画角だけ変える（駒は全部残す）。
   */
  hideHalf: HideHalf;
  /**
   * 試合前・試合後の準備用。Home / Away / Both。
   * 実況 chrome 本線ではない。未指定は both。
   */
  teamFocus?: TeamFocus;
  /** 局面ごとのカメラ。未指定は board.viewport（移行用）→ DEFAULT */
  viewport?: Viewport;
  /** 振り返り用メモ。配信（B）・PNG Export には出さない */
  notes?: string;
}

/** Pro: 試合をまたぐ名前付き画角テンプレ（UI は FEATURE_PRO まで非表示） */
export interface ViewportTemplate {
  id: string;
  label: string;
  viewport: Viewport;
}

export const MAX_VIEWPORT_TEMPLATES = 12;

/** カメラ（駒は消さない。ズーム／パンで見せ場を変える） */
export interface Viewport {
  /** 1 = 全体、大きいほど寄る */
  zoom: number;
  /** 注視点（ピッチ正規化座標） */
  cx: number;
  cy: number;
}

/**
 * ボード = 試合（または作業単位）
 * UNIQUE は id。title / matchLabel は表示用。
 * 中身の配置は scenes[] が持つ。
 */
export interface BoardDocument {
  schemaVersion: 2;
  id: string;
  sport: SportId;
  title: string;
  /** 試合の人間用ラベル（例: Premier League 第1節） */
  matchLabel: string;
  /** ホーム／アウェイ表示名（スコア帯用） */
  homeTeam: string;
  awayTeam: string;
  /** フィールドユニ。未保存データは HOME_COLOR / AWAY_COLOR */
  homeColor: string;
  awayColor: string;
  /** GKユニ。サカ系のみUI表示。PL配信でもキーパーは別色が必須 */
  homeGkColor: string;
  awayGkColor: string;
  /** 得点一覧（スコア = 件数） */
  goals: GoalEntry[];
  /** イエロー / レッド（累計は cards から自動集計） */
  cards: CardEntry[];
  /** 交代一覧（履歴・駒状態用。残数メーターは作らない — 枠は大会差） */
  subs: SubEntry[];
  /**
   * @deprecated 残数 UI は出さない。互換のため残すだけ。
   * 枠規制を製品に埋め込まない（Streamer は知らなくてよい）。
   */
  maxSubs: number;
  /** PK戦ストリップ（○✕）。先行判定エンジンは持たない */
  pk: PkShootout;
  /** 画面上部の試合帯（配信・編集プレビュー） */
  showMatchBanner: boolean;
  /**
   * ピッチの向き。既定 landscape。soccer 以外は landscape のみ有効。
   * 横局面からの写像はしない（向きはボード生成時に固定する運用）。
   */
  pitchOrientation: PitchOrientation;
  pitchView: PitchView;
  pitchFlipped: boolean;
  /** サッカー: 5レーン（ハーフスペース） */
  showLanes5: boolean;
  /** フットサル: 縦3廊下（3 Carriles） */
  showCorridors3: boolean;
  /** フットサル: 横プレス線（1/4・1/2・3/4） */
  showPressLines: boolean;
  /** ビーチ: 射線ガイド（ボール〜両ゴールポスト） */
  showShotCorridor: boolean;
  /** バスケ: ペイント強調 */
  showPaintHighlight: boolean;
  /** バスケ: 3Pライン強調 */
  showThreePointEmphasis: boolean;
  /** バスケ: トップ・ウイング・コーナー・エルボー */
  showSpotMarkers: boolean;
  /** バスケ: ミドルライン（ストロング／ヘルプ） */
  showMiddleLine: boolean;
  /** バスケ: スロット線 */
  showSlotLines: boolean;
  /** バスケ: 木目コート面（白面の代わり） */
  showWoodCourt: boolean;
  /** サッカー: 芝生テクスチャ（白面の代わり） */
  showGrassPitch: boolean;
  /** 芝上スターターに名前ピル（暗チップ）を出す。控えは常にチップ。新規 false · migrate 欠落 true */
  showPlayerNames: boolean;
  pieceScale: number;
  /** 控え人数（片チーム）。大会カテゴリではなく人数そのもの */
  benchCount: number;
  scenes: Scene[];
  activeSceneId: string;
  /** @deprecated 移行用。正本は各 scene.viewport */
  viewport: Viewport;
  /** Pro: 名前付き画角ライブラリ（UI は FEATURE_PRO まで非表示） */
  viewportTemplates?: ViewportTemplate[];
  /** ベンチ入り名簿。スタメン発表後に一括配置 */
  roster: MatchRoster;
  updatedAt: string;
}

export interface BoardStore {
  boards: BoardDocument[];
  activeBoardId: string | null;
}

export interface WatermarkSettings {
  enabled: boolean;
  imageDataUrl: string | null;
  x: number;
  y: number;
  /** ピッチ短辺に対する高さ%（8–55。配信ではセンターサークル超えも可） */
  sizePercent: number;
  opacity: number;
}

/** Normalized tool-rail anchor within the board stage (0–1). */
export interface ToolRailPosition {
  xRatio: number;
  yRatio: number;
}

export const DEFAULT_TOOL_RAIL: ToolRailPosition = { xRatio: 0, yRatio: 0.5 };

export interface Prefs {
  locale?: "ja" | "en" | "es" | "pt" | "pl" | "de";
  lastSport?: SportId;
  selectionColor?: string;
  toolRail?: ToolRailPosition;
}

export const DEFAULT_SELECTION_COLOR = "#111111";

/** Free-tier caps (numbers live in `src/lib/plan.ts` → PLAN_LIMITS). */
import { PLAN_LIMITS } from "../lib/plan";
export { PLAN_LIMITS };
export const MAX_BOARDS = PLAN_LIMITS.free.maxBoards;
export const MAX_SCENES = PLAN_LIMITS.free.maxScenes;
export const HOME_COLOR = "#e74c3c";
export const AWAY_COLOR = "#3498db";
/** 放送図の定番: ホームGKは緑、アウェイGKは黄（フィールドと被らない） */
export const HOME_GK_COLOR = "#2ecc71";
export const AWAY_GK_COLOR = "#f1c40f";

/**
 * ツールレール／描画の意味色。
 * 線種は欧米コーチング図式: Pass=破線、Run=実線、Dribble=波線。
 */
export const LINE_COLORS = {
  pass: "#2563eb",
  run: "#059669",
  dribble: "#ea580c",
  /** スクリーン（T字）。FastDraw 系の図式 */
  screen: "#7c3aed",
} as const;

/** バスケ専用のスクリーン線ツール */
export function usesScreenTool(sport: SportId): boolean {
  return sport === "basketball";
}

export function isLineTool(tool: ToolId): tool is LineKind {
  return (
    tool === "pass" ||
    tool === "run" ||
    tool === "dribble" ||
    tool === "screen"
  );
}

/** ラン／ドリブル: 駒ドラッグで移動＋軌跡。パス／スクリーンは線のみ */
export function lineToolMovesPiece(kind: LineKind): boolean {
  return kind === "run" || kind === "dribble";
}

export const ZONE_COLORS = {
  fill: "rgba(14, 165, 233, 0.22)",
  stroke: "#0284c7",
} as const;

export const TOOL_COLORS: Record<ToolId, string> = {
  select: "#525252",
  "piece-home": HOME_COLOR,
  "piece-away": AWAY_COLOR,
  ball: "#d97706",
  pass: LINE_COLORS.pass,
  run: LINE_COLORS.run,
  dribble: LINE_COLORS.dribble,
  screen: LINE_COLORS.screen,
  zone: ZONE_COLORS.stroke,
  pen: "#404040",
  link: "#404040",
  text: "#404040",
};

export const PIECE_SCALE = {
  min: 0.5,
  max: 1.6,
  tactics: 1.35,
  balanced: 1,
  position: 0.65,
} as const;

export const UI_FONT_STACK =
  '"Segoe UI", "Yu Gothic UI", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", sans-serif';

/**
 * 試合帯・駒キャプション。Canvas は CSS の unicode-range フォールバックをしない。
 * ラテン専用の Noto Sans を先に置くと日本語が欠けて消える。
 */
export const BANNER_FONT_STACK =
  '"Noto Sans JP", "Noto Sans", "Yu Gothic UI", "Hiragino Sans", "Segoe UI", sans-serif';
