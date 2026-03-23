// ============================================================
//  main.js  ─ メインループ・入力ハンドラ・起動
// ============================================================
import { GAME_W, GAME_H, CHAR_LIST } from './config.js';
import { canvas, ctx, DPR, resetCtx } from './canvas.js';
import { loadAll, getProgress } from './loader.js';
import { getActx, playSfx } from './audio.js';
import * as State from './state.js';

import { player } from './entities/player.js';
import { obstacles, updateObstacles, drawObstacle } from './entities/obstacle.js';
import { claps, updateClaps, drawClap } from './entities/clap.js';

import { drawBackground, drawGround } from './render/background.js';
import { updateEffects, drawEffects, updateClearPtcls } from './render/effects.js';
import { drawHUD, drawFlash, drawTitle, drawGameOver, drawClear } from './render/ui.js';

import { startGame, retry, checkCollisions, stopCountdown } from './game.js';

// ============================================================
//  入力
// ============================================================
function getCanvasXY(e) {
  const r = canvas.getBoundingClientRect();
  const sx = GAME_W / r.width,
    sy = GAME_H / r.height;
  const cx = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
  const cy = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
  return [(cx - r.left) * sx, (cy - r.top) * sy];
}

canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  try {
    getActx().resume();
  } catch (err) {}
  if (State.gState === 'title') {
    startGame();
    return;
  }
  if (State.gState === 'playing') {
    player.jump();
    return;
  }
  if (State.gState === 'gameover' || State.gState === 'clear') {
    retry();
  }
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    try {
      getActx().resume();
    } catch (err) {}
    if (State.gState === 'title') {
      startGame();
      return;
    }
    if (State.gState === 'playing') {
      player.jump();
      return;
    }
    if (State.gState === 'gameover' || State.gState === 'clear') {
      retry();
    }
  }
  if (State.gState === 'title') {
    if (e.code === 'ArrowLeft') {
      State.set('selectedChar', (State.selectedChar - 1 + CHAR_LIST.length) % CHAR_LIST.length);
      playSfx('sfxSelect', 0.4);
    }
    if (e.code === 'ArrowRight') {
      State.set('selectedChar', (State.selectedChar + 1) % CHAR_LIST.length);
      playSfx('sfxSelect', 0.4);
    }
  }
});

// ============================================================
//  メインループ
// ============================================================
function loop(now) {
  requestAnimationFrame(loop);

  // ローディング画面
  if (State.gState === 'loading') {
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    ctx.font = 'bold 22px Orbitron,sans-serif';
    ctx.fillStyle = '#88ff44';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LOADING  ' + Math.round(getProgress() * 100) + '%', GAME_W / 2, GAME_H / 2);
    return;
  }

  const dt = Math.min((now - (State.lastTime || now)) / 1000, 0.05);
  State.set('lastTime', now);

  // ---- update ----
  if (State.gState === 'playing') {
    player.update(dt);
    updateObstacles(dt);
    updateClaps(dt);
    updateEffects(dt);
    if (State.comboTime > 0) State.set('comboTime', Math.max(0, State.comboTime - dt));
    checkCollisions();
  }
  if (State.gState === 'clear') updateClearPtcls(dt);

  // ---- draw ----
  resetCtx(); // フレーム先頭で ctx ステートをリセット（残像防止）

  drawBackground(dt);
  drawGround(dt);

  if (State.gState === 'title') {
    player.animKey = 'idle';
    player.draw();
    drawTitle();
    return;
  }

  claps.forEach((c) => drawClap(c));
  obstacles.forEach((o) => drawObstacle(o));
  player.draw();
  drawEffects();
  drawHUD();
  drawFlash();

  if (State.gState === 'gameover') drawGameOver();
  if (State.gState === 'clear') drawClear();
}

// ============================================================
//  起動
// ============================================================
requestAnimationFrame(loop); // ローディング画面を即表示

loadAll(() => {
  console.log('アセットロード完了');
  setTimeout(() => {
    State.set('gState', 'title');
  }, 200);
});
