import {
  GAME_W,
  GROUND_Y,
  SCROLL_SPD,
  ITEM_DRAW,
  ITEM_INT,
  ITEM_YS,
  INSTRUMENTS,
  INSTRUMENT_COLORS,
} from '../config.js';
import { ctx } from '../canvas.js';
import { obstacles } from './obstacle.js'; // 障害物との被りチェック用

export const claps = [];
const instrumentImages = {};
const labels = ['guitar', 'bass', 'keyboard', 'drums', 'mic', 'default'];

// 画像の事前ロード
labels.forEach((label) => {
  const img = new Image();
  img.src = `assets/${label}.png`; // 拡張子が .png であることを確認してください
  instrumentImages[label] = img;
});

let clapTimer = 0;
const ITEM_HIT_SIZE = 34;

// --- 更新ロジック ---
export function updateClaps(dt) {
  clapTimer += dt;
  if (clapTimer >= ITEM_INT) {
    clapTimer = 0;

    // 1. 出現候補の高さをランダムに決める
    let y = ITEM_YS[Math.floor(Math.random() * ITEM_YS.length)];

    // 2. 安全チェック：今出そうとしている右端に障害物(カード)がいないか？
    const isSafe = !obstacles.some((o) => o.x > GAME_W - 150 && Math.abs(o.y - y) < 80);

    // 3. 被っていたら高さを強制的にずらす
    if (!isSafe) {
      y = y > GROUND_Y - 150 ? y - 100 : y + 100;
    }

    // 4. 楽器の種類をランダムに選んで追加
    const inst = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
    claps.push({
      x: GAME_W + 40,
      baseY: y,
      cy: y,
      phase: Math.random() * Math.PI * 2,
      inst: inst.label,
    });
  }

  // 移動とふわふわアニメーション
  const t = performance.now() / 1000;
  for (let i = claps.length - 1; i >= 0; i--) {
    const c = claps[i];
    c.x -= SCROLL_SPD * dt; // config.js の爆速スピード(580)で動く
    c.cy = c.baseY + Math.sin(t * 3.5 + c.phase) * 12; // 上下にふわふわ
    if (c.x < -60) claps.splice(i, 1);
  }
}

// --- 描画ロジック ---
export function drawClap(c) {
  const col = INSTRUMENT_COLORS[c.inst] ?? { body: '#ffffff', glow: '#ffffff' };
  const radius = ITEM_DRAW / 2;
  const cx = c.x + radius;
  const cy = c.cy + radius;

  ctx.save();
  ctx.translate(cx, cy);
  // 左右に少し揺らす（リズム感）
  ctx.rotate(Math.sin(performance.now() * 0.005 + c.phase) * 0.1);

  // 外側の光
  ctx.shadowColor = col.glow;
  ctx.shadowBlur = 15;

  // 円形バッジ
  ctx.beginPath();
  ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
  ctx.fillStyle = col.body;
  ctx.fill();

  // アイコン描画
  const img = instrumentImages[c.inst] || instrumentImages['default'];
  if (img && img.complete) {
    const iconSize = ITEM_DRAW * 0.7;
    ctx.drawImage(img, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
  }

  ctx.restore();
}

export function getClapHitRect(c) {
  const offset = (ITEM_DRAW - ITEM_HIT_SIZE) / 2;
  return {
    x: c.x + offset,
    y: c.cy + offset,
    w: ITEM_HIT_SIZE,
    h: ITEM_HIT_SIZE,
  };
}

export function resetClaps() {
  claps.length = 0;
  clapTimer = 0;
}
