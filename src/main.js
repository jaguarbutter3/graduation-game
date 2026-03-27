// ============================================================
//  main.js  ─ メインループ・入力ハンドラ・起動
// ============================================================
import { GAME_W, GAME_H, CHAR_LIST } from './config.js';
import { canvas, ctx, resetCtx } from './canvas.js';
import { loadAll, getProgress } from './loader.js';
import { getActx, playSfx } from './audio.js';
import * as State from './state.js';

import { player } from './entities/player.js';
import { obstacles, updateObstacles, drawObstacle } from './entities/obstacle.js';
import { claps, updateClaps, drawClap } from './entities/clap.js';

import { drawBackground, drawGround } from './render/background.js';
import { updateEffects, drawEffects, updateClearPtcls } from './render/effects.js';
import { drawHUD, drawFlash, drawTitle, drawGameOver, drawClear } from './render/ui.js';

import { startGame, retry, checkCollisions } from './game.js';

// ============================================================
//  内部ヘルパー：ユーザー操作コンテキスト内で AudioContext を確実に起動
//  （iOS は操作の同期コンテキスト外だと resume が無効になるため、
//    await を挟む前に resume + ダミー再生を済ませておく）
// ============================================================
async function unlockAudio() {
  const actx = getActx();
  if (actx.state === 'suspended') {
    await actx.resume();
  }
  // iOS / Android のオーディオロックを解除するダミー再生
  const dummy = actx.createBufferSource();
  dummy.buffer = actx.createBuffer(1, 1, 22050);
  dummy.connect(actx.destination);
  dummy.start(0);
}

// ============================================================
//  Canvas タップ／クリック
// ============================================================
canvas.addEventListener('pointerdown', async (e) => {
  e.preventDefault();

  // ユーザー操作の同期コンテキスト内で AudioContext を解除
  await unlockAudio();

  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (GAME_W / rect.width);
  const my = (e.clientY - rect.top) * (GAME_H / rect.height);

  if (State.gState === 'title') {
    const iconSz = 56,
      gap = 14;
    const totalW = CHAR_LIST.length * (iconSz + gap) - gap;
    const sx = (GAME_W - totalW) / 2;
    const iy = 170;

    for (let i = 0; i < CHAR_LIST.length; i++) {
      const ix = sx + i * (iconSz + gap);
      if (mx >= ix && mx <= ix + iconSz && my >= iy && my <= iy + iconSz) {
        State.set('selectedChar', i);
        playSfx('sfxSelect', 0.6);
        return;
      }
    }

    const btnW = 210,
      btnH = 44;
    if (
      mx >= GAME_W / 2 - btnW / 2 &&
      mx <= GAME_W / 2 + btnW / 2 &&
      my >= GAME_H - 52 - btnH / 2 &&
      my <= GAME_H - 52 + btnH / 2
    ) {
      playSfx('sfxSelect');
      await startGame();
    }
    return;
  }

  if (State.gState === 'playing') {
    player.jump();
  } else if (State.gState === 'gameover' || State.gState === 'clear') {
    await retry();
  }
});

// ============================================================
//  キーボード入力
// ============================================================
window.addEventListener('keydown', async (e) => {
  if (State.gState === 'title') {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
      State.set(
        'selectedChar',
        (State.selectedChar + (e.code === 'ArrowLeft' ? -1 : 1) + CHAR_LIST.length) %
          CHAR_LIST.length,
      );
      playSfx('sfxSelect', 0.4);
    } else if (e.code === 'Space' || e.code === 'Enter') {
      await unlockAudio();
      playSfx('sfxSelect', 1.0);
      await startGame();
    }
  } else if (State.gState === 'playing') {
    if (e.code === 'Space' || e.code === 'ArrowUp') player.jump();
  } else {
    if (e.code === 'Space' || e.code === 'Enter') {
      await retry();
    }
  }
});

// ============================================================
//  メインループ
// ============================================================
function loop(now) {
  requestAnimationFrame(loop);

  if (State.gState === 'loading') {
    resetCtx();
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    ctx.font = 'bold 22px Orbitron,sans-serif';
    ctx.fillStyle = '#88ff44';
    ctx.textAlign = 'center';
    const progress = Math.round(getProgress() * 100);
    ctx.fillText('LOADING  ' + progress + '%', GAME_W / 2, GAME_H / 2);

    if (progress >= 100) {
      ctx.font = '12px sans-serif';
      ctx.fillText('Tap to Start', GAME_W / 2, GAME_H / 2 + 40);
    }
    return;
  }

  const dt = Math.min((now - (State.lastTime || now)) / 1000, 0.05);
  State.set('lastTime', now);

  if (State.gState === 'playing') {
    player.update(dt);
    updateObstacles(dt);
    updateClaps(dt);
    updateEffects(dt);
    if (State.comboTime > 0) State.set('comboTime', Math.max(0, State.comboTime - dt));
    if (State.invincibleTime > 0)
      State.set('invincibleTime', Math.max(0, State.invincibleTime - dt));
    checkCollisions();
  }

  if (State.gState === 'clear') updateClearPtcls(dt);

  resetCtx();
  drawBackground(dt);
  drawGround(dt);

  if (State.gState === 'title') {
    player.animKey = 'idle';
    player.draw();
    drawTitle();
  } else {
    claps.forEach(drawClap);
    obstacles.forEach(drawObstacle);
    player.draw();
    drawEffects();
    drawHUD();
    drawFlash();

    if (State.gState === 'gameover') drawGameOver();
    if (State.gState === 'clear') drawClear();
  }
}

requestAnimationFrame(loop);
loadAll(() => {
  setTimeout(() => State.set('gState', 'title'), 200);
});
