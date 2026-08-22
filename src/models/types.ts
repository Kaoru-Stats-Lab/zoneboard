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
export interface GoalEntry {
  id: string;
  team: "home" | "away";
  /** 得点者（背番号 or 名前） */
  scorer: string;
  /** 例: "23" / "45+2" */
  minute?: string;
  /** Later: アシスト（UI 非表示） */
  assist?: string;
}

export type CardKind = "YC" | "RC" | "Y2C";

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

export interface TextObject {
  id: string;
  type: "text";
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

export type DrawObject = LineObject | ZoneObject | PenObject | TextObject;

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
}

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
  /** 得点一覧（スコア = 件数） */
  goals: GoalEntry[];
  /** イエロー / レッド（累計は cards から自動集計） */
  cards: CardEntry[];
  /** 画面上部の試合帯（配信・編集プレビュー） */
  showMatchBanner: boolean;
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
  pieceScale: number;
  /** 控え人数（片チーム）。大会カテゴリではなく人数そのもの */
  benchCount: number;
  scenes: Scene[];
  activeSceneId: string;
  /** ライブカメラ。局面切替とは独立（同じ配置のまま CK 等に寄れる） */
  viewport: Viewport;
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

export interface Prefs {
  locale?: "ja" | "en";
  lastSport?: SportId;
  selectionColor?: string;
}

export const DEFAULT_SELECTION_COLOR = "#111111";

export const MAX_BOARDS = 3;
export const MAX_SCENES = 8;
export const HOME_COLOR = "#e74c3c";
export const AWAY_COLOR = "#3498db";

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
