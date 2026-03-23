// ============================================================
//  render/background.js  ─ 背景・地面の描画
// ============================================================
import { GAME_W, GAME_H, GROUND_Y, TILE_SZ, SCROLL_SPD, BG, TILE } from '../config.js';
import { ctx } from '../canvas.js';
import { IMG } from '../loader.js';
import * as State from '../state.js';

/** パララックス背景を描画 */
export function drawBackground(dt) {
  const skyImg = IMG['imgBg'];

  if (skyImg && skyImg.complete && skyImg.naturalWidth) {
    // 最奥：ソリッドスカイで全面を隙間なくカバー
    for (let x = 0; x < GAME_W + 256; x += 256) {
      for (let y = 0; y < GAME_H + 256; y += 256) {
        ctx.drawImage(skyImg, BG.sky.x, BG.sky.y, BG.sky.w, BG.sky.h, x, y, 256, 256);
      }
    }

    // 遠景（0.15倍速）
    State.set('bgFar', (State.bgFar + SCROLL_SPD * 0.15 * dt) % 256);
    for (let x = -State.bgFar; x < GAME_W + 256; x += 256) {
      ctx.globalAlpha = 0.7;
      ctx.drawImage(skyImg, BG.far.x, BG.far.y, BG.far.w, BG.far.h,
        x, GAME_H - 256 - TILE_SZ, 256, 256);
      ctx.globalAlpha = 1;
    }

    // 近景（0.45倍速）
    State.set('bgNear', (State.bgNear + SCROLL_SPD * 0.45 * dt) % 256);
    for (let x = -State.bgNear; x < GAME_W + 256; x += 256) {
      ctx.globalAlpha = 0.85;
      ctx.drawImage(skyImg, BG.near.x, BG.near.y, BG.near.w, BG.near.h,
        x, GAME_H - 256 - TILE_SZ, 256, 256);
      ctx.globalAlpha = 1;
    }
  } else {
    // 画像未ロード時フォールバック
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, GAME_W, GAME_H);
  }
}

/** 地面タイルを描画 */
export function drawGround(dt) {
  const img = IMG['imgTiles'];
  State.set('bgGround', (State.bgGround + SCROLL_SPD * dt) % TILE_SZ);

  if (img && img.complete && img.naturalWidth) {
    // 上端タイル
    for (let x = -State.bgGround; x < GAME_W + TILE_SZ; x += TILE_SZ) {
      ctx.drawImage(img, TILE.top.x, TILE.top.y, TILE.top.w, TILE.top.h,
        x, GROUND_Y, TILE_SZ, TILE_SZ);
    }
    // 中段タイル（地面の厚み）
    for (let x = -State.bgGround; x < GAME_W + TILE_SZ; x += TILE_SZ) {
      ctx.drawImage(img, TILE.mid.x, TILE.mid.y, TILE.mid.w, TILE.mid.h,
        x, GROUND_Y + TILE_SZ, TILE_SZ, TILE_SZ);
    }
  } else {
    // フォールバック
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(0, GROUND_Y, GAME_W, GAME_H - GROUND_Y);
  }
}