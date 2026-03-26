// ============================================================
//  config.js  ─ 定数・アセットパス・スプライト座標・ゲームコンテンツ
//  ★ここを編集すれば見た目・難易度・メッセージ内容を一括変更できます
// ============================================================

// ------------------------------------------------------------
//  アセットパス
// ------------------------------------------------------------
export const ASSET_PATH = {
  imgCharacters: 'assets/spritesheet-characters-default.png',
  imgTiles: 'assets/spritesheet-tiles-default.png',
  imgBg: 'assets/spritesheet-backgrounds-default.png',
  sfxJump: 'assets/sfx_jump.ogg',
  sfxJump2: 'assets/sfx_jump-high.ogg',
  sfxClap: 'assets/clap.wav',
  sfxHurt: 'assets/sfx_hurt.ogg',
  sfxMagic: 'assets/sfx_magic.ogg',
  sfxSelect: 'assets/sfx_select.ogg',
  bgm: 'assets/bgm.mp3',
};

// ------------------------------------------------------------
//  画面サイズ
// ------------------------------------------------------------
export const GAME_W = 800;
export const GAME_H = 400;

// ------------------------------------------------------------
//  ゲームプレイ定数
// ------------------------------------------------------------
export const GAME_SEC = 60;
export const SCROLL_SPD = 480;
export const GROUND_Y = 336;
export const TILE_SZ = 64;
export const GRAVITY = 2100;
export const JUMP_VY = -780;

// ------------------------------------------------------------
//  プレイヤー
// ------------------------------------------------------------
export const PLR_W = 46;
export const PLR_H = 50;
export const PLR_DRAW = 72;

// ------------------------------------------------------------
//  楽器アイテム（旧：クラップコイン）
// ------------------------------------------------------------
export const ITEM_DRAW = 48;
export const ITEM_HIT = 34;
export const ITEM_INT = 0.95;
export const ITEM_YS = [GROUND_Y - 34 - 8, GROUND_Y - 108, GROUND_Y - 190];

export const INSTRUMENTS = [
  { label: 'guitar' },
  { label: 'bass' },
  { label: 'keyboard' },
  { label: 'drums' },
  { label: 'mic' },
];

export const INSTRUMENT_COLORS = {
  guitar: { body: '#e05c1a', glow: '#ff8844' },
  bass: { body: '#1a6be0', glow: '#4499ff' },
  keyboard: { body: '#cc44cc', glow: '#ff88ff' },
  drums: { body: '#cc8800', glow: '#ffcc00' },
  mic: { body: '#22bb88', glow: '#44ffbb' },
};

// ------------------------------------------------------------
//  卒業メッセージ一覧
//  ★ここを書き換えてメッセージを追加・変更してください
//
//  形式:
//  { from: '送り主', lines: ['1行目', '2行目', ...] }
//  ・linesは最大4行推奨（それ以上は文字が小さくなります）
//  ・fromは省略可（省略するとヘッダーなしになります）
// ------------------------------------------------------------
export const MESSAGES = [
  {
    from: '〇〇より',
    lines: ['ここにメッセージを', '入れてください'],
  },
  {
    from: '△△より',
    lines: ['プレースホルダー', '2つ目のメッセージ', '3行目も入ります'],
  },
  {
    from: '□□より',
    lines: ['短いメッセージ'],
  },
  {
    from: '◇◇より',
    lines: ['4行メッセージの', 'テスト用です', '長いカードほど', '避けにくくなります'],
  },
  {
    from: '★★より',
    lines: ['プレースホルダー', 'その5'],
  },
];

// カードデザイン定数
export const MSG_CARD_W = 180;
export const MSG_LINE_H = 22;
export const MSG_PAD_Y = 12;
export const MSG_HEADER_H = 28;
export const MSG_CORNER_R = 10;
export const MSG_HIT_INSET = 8;

export function calcCardH(msg) {
  const headerH = msg.from ? MSG_HEADER_H : 0;
  return headerH + msg.lines.length * MSG_LINE_H + MSG_PAD_Y * 2;
}

// ------------------------------------------------------------
//  スプライト座標
// ------------------------------------------------------------
export const CHR_FRAMES = {
  beige: {
    idle: { x: 645, y: 0, w: 128, h: 128 },
    jump: { x: 774, y: 0, w: 128, h: 128 },
    walk_a: { x: 0, y: 129, w: 128, h: 128 },
    walk_b: { x: 129, y: 129, w: 128, h: 128 },
    hit: { x: 516, y: 0, w: 128, h: 128 },
  },
  green: {
    idle: { x: 645, y: 129, w: 128, h: 128 },
    jump: { x: 0, y: 258, w: 128, h: 128 },
    walk_a: { x: 258, y: 258, w: 128, h: 128 },
    walk_b: { x: 387, y: 258, w: 128, h: 128 },
    hit: { x: 774, y: 129, w: 128, h: 128 },
  },
  pink: {
    idle: { x: 258, y: 387, w: 128, h: 128 },
    jump: { x: 387, y: 387, w: 128, h: 128 },
    walk_a: { x: 516, y: 387, w: 128, h: 128 },
    walk_b: { x: 645, y: 387, w: 128, h: 128 },
    hit: { x: 129, y: 387, w: 128, h: 128 },
  },
  purple: {
    idle: { x: 516, y: 516, w: 128, h: 128 },
    jump: { x: 645, y: 516, w: 128, h: 128 },
    walk_a: { x: 774, y: 516, w: 128, h: 128 },
    walk_b: { x: 0, y: 645, w: 128, h: 128 },
    hit: { x: 387, y: 516, w: 128, h: 128 },
  },
  yellow: {
    idle: { x: 774, y: 645, w: 128, h: 128 },
    jump: { x: 0, y: 774, w: 128, h: 128 },
    walk_a: { x: 129, y: 774, w: 128, h: 128 },
    walk_b: { x: 258, y: 774, w: 128, h: 128 },
    hit: { x: 645, y: 645, w: 128, h: 128 },
  },
};
export const CHAR_LIST = [
  { label: 'ベージュ', CHR: CHR_FRAMES.beige },
  { label: 'グリーン', CHR: CHR_FRAMES.green },
  { label: 'ピンク', CHR: CHR_FRAMES.pink },
  { label: 'パープル', CHR: CHR_FRAMES.purple },
  { label: 'イエロー', CHR: CHR_FRAMES.yellow },
];

export const TILE = {
  top: { x: 715, y: 585, w: 64, h: 64 },
  mid: { x: 780, y: 520, w: 64, h: 64 },
};

export const BG = {
  sky: { x: 257, y: 771, w: 256, h: 256 },
  far: { x: 514, y: 0, w: 256, h: 256 },
  near: { x: 0, y: 257, w: 256, h: 256 },
};
