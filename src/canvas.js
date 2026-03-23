// ============================================================
//  canvas.js  ─ Canvas セットアップ・描画ヘルパー
// ============================================================
import { GAME_W, GAME_H } from './config.js';
import { IMG } from './loader.js';

export const canvas = document.getElementById('c');
export const ctx = canvas.getContext('2d');
export const DPR = window.devicePixelRatio || 1;

// devicePixelRatio 対応（Retina 高画質化）
canvas.width = GAME_W * DPR;
canvas.height = GAME_H * DPR;
canvas.style.width = GAME_W + 'px';
canvas.style.height = GAME_H + 'px';
ctx.scale(DPR, DPR);
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';

/** ウィンドウリサイズ時に canvas を FIT スケーリング */
export function resize() {
  const s = Math.min(window.innerWidth / GAME_W, window.innerHeight / GAME_H);
  canvas.style.width = GAME_W * s + 'px';
  canvas.style.height = GAME_H * s + 'px';
}
window.addEventListener('resize', resize);
resize();

/**
 * メインループ先頭で ctx のグローバルステートをリセットする
 * （shadowBlur・globalAlpha 等が前フレームから漏れるのを防ぐ）
 */
export function resetCtx() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.filter = 'none';
}

/**
 * スプライトシートから1フレームを描画する
 * @param {string}  imgKey  - IMG オブジェクトのキー
 * @param {{x,y,w,h}} src   - スプライト座標
 * @param {number}  dx,dy   - 描画先の左上座標
 * @param {number}  dw,dh   - 描画サイズ
 * @param {boolean} flipX   - 左右反転
 */
export function drawSprite(imgKey, src, dx, dy, dw, dh, flipX = false) {
  const img = IMG[imgKey];
  if (!img || !img.complete || !img.naturalWidth) return;
  ctx.save();
  if (flipX) {
    ctx.translate(dx + dw, dy);
    ctx.scale(-1, 1);
    dx = 0;
    dy = 0;
  }
  ctx.drawImage(img, src.x, src.y, src.w, src.h, dx, dy, dw, dh);
  ctx.restore();
}

/**
 * 角丸矩形のパスを作成する（fill/stroke は呼び出し側で行う）
 */
export function roundRect(cx, x, y, w, h, r) {
  cx.beginPath();
  cx.moveTo(x + r, y);
  cx.lineTo(x + w - r, y);
  cx.arcTo(x + w, y, x + w, y + r, r);
  cx.lineTo(x + w, y + h - r);
  cx.arcTo(x + w, y + h, x + w - r, y + h, r);
  cx.lineTo(x + r, y + h);
  cx.arcTo(x, y + h, x, y + h - r, r);
  cx.lineTo(x, y + r);
  cx.arcTo(x, y, x + r, y, r);
  cx.closePath();
}
