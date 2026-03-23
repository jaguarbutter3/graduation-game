// ============================================================
//  entities/clap.js  ─ クラップアイテム（コイン）の管理
// ============================================================
import { GAME_W, SCROLL_SPD, COIN_DRAW, CLAP_INT, CLAP_YS, TILE } from '../config.js';
import { ctx } from '../canvas.js';
import { IMG } from '../loader.js';

export const claps = [];

let clapTimer = 0;
let coinAngle = 0; // 全コイン共通の揺れ角度

/** クラップアイテムのスポーン・移動・浮遊・画面外削除 */
export function updateClaps(dt) {
  clapTimer += dt;
  if (clapTimer >= CLAP_INT) {
    clapTimer = 0;
    const y = CLAP_YS[Math.floor(Math.random() * CLAP_YS.length)];
    claps.push({
      x: GAME_W + 30,
      baseY: y,
      cy: y,
      phase: Math.random() * Math.PI * 2,
      angle: 0,
    });
  }

  coinAngle += dt * 3.5;
  const t = performance.now() / 1000;
  for (let i = claps.length - 1; i >= 0; i--) {
    const c = claps[i];
    c.x -= SCROLL_SPD * dt;
    c.cy = c.baseY + Math.sin(t * 2.8 + c.phase) * 7;
    if (c.x < -60) claps.splice(i, 1);
  }
}

/** クラップアイテムを1個描画 */
export function drawClap(c) {
  ctx.save();
  ctx.translate(c.x + COIN_DRAW / 2, c.cy + COIN_DRAW / 2);
  ctx.rotate(Math.sin(coinAngle) * 0.22);
  ctx.shadowColor = '#ffe600';
  ctx.shadowBlur = 16;
  const img = IMG['imgTiles'];
  if (img && img.complete && img.naturalWidth) {
    ctx.drawImage(
      img,
      TILE.coin.x,
      TILE.coin.y,
      TILE.coin.w,
      TILE.coin.h,
      -COIN_DRAW / 2,
      -COIN_DRAW / 2,
      COIN_DRAW,
      COIN_DRAW,
    );
  }
  ctx.restore();
}

/** リセット（ゲーム再スタート時） */
export function resetClaps() {
  claps.length = 0;
  clapTimer = 0;
  coinAngle = 0;
}
