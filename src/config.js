// ============================================================
//  config.js  ─ 定数・アセットパス・スプライト座標
//  ここを編集すればゲームの見た目・難易度・アセットを一括変更できます
// ============================================================

// ------------------------------------------------------------
//  アセットパス  （assets/ フォルダからの相対パス）
// ------------------------------------------------------------
export const ASSET_PATH = {
  imgCharacters: 'assets/spritesheet-characters-default.png',
  imgEnemies: 'assets/spritesheet-enemies-default.png',
  imgTiles: 'assets/spritesheet-tiles-default.png',
  imgBg: 'assets/spritesheet-backgrounds-default.png',
  sfxJump: 'assets/sfx_jump.ogg',
  sfxJump2: 'assets/sfx_jump-high.ogg',
  sfxClap: 'assets/clap.wav',
  sfxHurt: 'assets/sfx_hurt.ogg',
  sfxMagic: 'assets/sfx_magic.ogg',
  sfxSelect: 'assets/sfx_select.ogg',
};

// ------------------------------------------------------------
//  画面サイズ
// ------------------------------------------------------------
export const GAME_W = 800;
export const GAME_H = 400;

// ------------------------------------------------------------
//  ゲームプレイ定数
// ------------------------------------------------------------
export const GAME_SEC = 60; // 制限時間（秒）
export const SCROLL_SPD = 360; // スクロール速度 px/s（BPM120固定）

export const GROUND_Y = 336; // 地面タイル上端 Y
export const TILE_SZ = 64; // タイル1枚のサイズ

export const GRAVITY = 1900; // 重力加速度 px/s²
export const JUMP_VY = -700; // ジャンプ初速 px/s

// ------------------------------------------------------------
//  プレイヤー
// ------------------------------------------------------------
export const PLR_W = 46; // 当たり判定 幅
export const PLR_H = 50; // 当たり判定 高さ
export const PLR_DRAW = 72; // 描画サイズ（正方形）

// ------------------------------------------------------------
//  クラップアイテム（コイン）
// ------------------------------------------------------------
export const COIN_DRAW = 44; // 描画サイズ
export const COIN_HIT = 30; // 当たり判定サイズ
export const CLAP_INT = 0.9; // スポーン間隔（秒）
export const CLAP_YS = [
  // 出現高さのパターン（地上・中段・上段）
  GROUND_Y - 30 - 8,
  GROUND_Y - 105,
  GROUND_Y - 190,
];

// ------------------------------------------------------------
//  障害物（スライム）
// ------------------------------------------------------------
export const OBS_DRAW = 56; // 描画サイズ
export const OBS_HIT_W = 40; // 当たり判定 幅
export const OBS_HIT_H = 46; // 当たり判定 高さ

// ------------------------------------------------------------
//  スプライト座標定義（XML実測値）
// ------------------------------------------------------------

// キャラクター 128×128  spritesheet-characters-default.png
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
export const CHAR_LIST = ['beige', 'green', 'pink', 'purple', 'yellow'];
export const CHAR_LABELS = ['ベージュ', 'グリーン', 'ピンク', 'パープル', 'イエロー'];

// 敵スライム 64×64  spritesheet-enemies-default.png
export const ENM = {
  walk_a: { x: 260, y: 325, w: 64, h: 64 },
  walk_b: { x: 325, y: 325, w: 64, h: 64 },
};

// タイル 64×64  spritesheet-tiles-default.png
export const TILE = {
  top: { x: 715, y: 585, w: 64, h: 64 }, // terrain_grass_block_top
  mid: { x: 780, y: 520, w: 64, h: 64 }, // 地面中段タイル
  coin: { x: 0, y: 130, w: 64, h: 64 }, // coin_gold
};

// 背景 256×256  spritesheet-backgrounds-default.png
export const BG = {
  sky: { x: 257, y: 771, w: 256, h: 256 }, // background_solid_sky
  far: { x: 514, y: 0, w: 256, h: 256 }, // background_color_hills（遠景）
  near: { x: 0, y: 257, w: 256, h: 256 }, // background_color_trees（近景）
};
