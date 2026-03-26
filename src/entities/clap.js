// ============================================================
//  clap.js  ─ 楽器アイテム（旧：クラップ）の管理
// ============================================================
import {
  GAME_W,
  GROUND_Y,
  SCROLL_SPD,
  ITEM_DRAW,
  ITEM_YS,
  INSTRUMENTS,
  INSTRUMENT_COLORS,
} from '../config.js';
import { ctx } from '../canvas.js';
import { obstacles } from './obstacle.js';

export const claps = [];
const instrumentImages = {};
const labels = ['guitar', 'bass', 'keyboard', 'drums', 'mic', 'default'];

// --- 1. 画像の事前ロード ---
labels.forEach((label) => {
  const img = new Image();
  img.src = `assets/${label}.png`;
  instrumentImages[label] = img;
});

const ITEM_HIT_SIZE = 34;

export function spawnClap() {
  let y = ITEM_YS[Math.floor(Math.random() * ITEM_YS.length)];

  const isSafe = !obstacles.some((o) => o.x > GAME_W - 150 && Math.abs(o.y - y) < 80);

  if (!isSafe) {
    y = y > GROUND_Y - 150 ? y - 100 : y + 100;
  }

  const inst = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];

  claps.push({
    x: GAME_W + 40,
    baseY: y,
    cy: y,
    phase: Math.random() * Math.PI * 2,
    inst: inst.label,
  });
}

/**
 * 更新ロジック（移動とアニメーション）
 */
export function updateClaps(dt) {
  const t = performance.now() / 1000;

  for (let i = claps.length - 1; i >= 0; i--) {
    const c = claps[i];

    // 移動
    c.x -= SCROLL_SPD * dt;

    // 上下にふわふわ揺れるアニメーション
    c.cy = c.baseY + Math.sin(t * 3.5 + c.phase) * 12;

    // 画面外（左端）に出たら削除
    if (c.x < -60) {
      claps.splice(i, 1);
    }
  }
}

/**
 * 描画ロジック
 */
export function drawClap(c) {
  const col = INSTRUMENT_COLORS[c.inst] ?? { body: '#ffffff', glow: '#ffffff' };
  const radius = ITEM_DRAW / 2;
  const cx = c.x + radius;
  const cy = c.cy + radius;

  ctx.save();
  ctx.translate(cx, cy);

  // リズム感を出すために少し回転させる
  ctx.rotate(Math.sin(performance.now() * 0.005 + c.phase) * 0.1);

  // 外側の光（グローエフェクト）
  ctx.shadowColor = col.glow;
  ctx.shadowBlur = 15;

  // 円形の土台
  ctx.beginPath();
  ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
  ctx.fillStyle = col.body;
  ctx.fill();

  // 楽器アイコンの描画
  const img = instrumentImages[c.inst] || instrumentImages['default'];
  if (img && img.complete) {
    const iconSize = ITEM_DRAW * 0.7;
    ctx.drawImage(img, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
  }

  ctx.restore();
}

/**
 * 当たり判定用の矩形を返す
 */
export function getClapHitRect(c) {
  const offset = (ITEM_DRAW - ITEM_HIT_SIZE) / 2;
  return {
    x: c.x + offset,
    y: c.cy + offset,
    w: ITEM_HIT_SIZE,
    h: ITEM_HIT_SIZE,
  };
}

/**
 * 状態リセット（ゲームオーバー/リトライ時）
 */
export function resetClaps() {
  claps.length = 0;
}
