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

/**
 * ★ 修正ポイント: AudioContext を有効化する関数
 * スマホやブラウザの制限を解除するため、ユーザーの最初の操作で実行する
 */
const initAudio = () => {
  const adx = getActx();
  if (adx && adx.state === 'suspended') {
    adx.resume().then(() => {
      console.log('AudioContext resumed successfully');
    });
  }
  // 一度実行すれば良いのでイベントを解除
  window.removeEventListener('pointerdown', initAudio);
  window.removeEventListener('touchstart', initAudio);
  window.removeEventListener('keydown', initAudio);
};

// 起動時、あらゆる操作をオーディオ有効化のトリガーにする
window.addEventListener('pointerdown', initAudio);
window.addEventListener('touchstart', initAudio);
window.addEventListener('keydown', initAudio);

// 入力：クリック・タップ
canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();

  // マウス/タップ座標の計算
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (GAME_W / rect.width);
  const my = (e.clientY - rect.top) * (GAME_H / rect.height);

  if (State.gState === 'title') {
    // キャラ選択判定
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
    // スタートボタン判定
    const btnW = 210,
      btnH = 44;
    if (
      mx >= GAME_W / 2 - btnW / 2 &&
      mx <= GAME_W / 2 + btnW / 2 &&
      my >= GAME_H - 52 - btnH / 2 &&
      my <= GAME_H - 52 + btnH / 2
    ) {
      startGame();
    }
    return;
  }

  if (State.gState === 'playing') {
    player.jump();
  } else if (State.gState === 'gameover' || State.gState === 'clear') {
    retry();
  }
});

// 入力：キーボード
window.addEventListener('keydown', (e) => {
  if (State.gState === 'title') {
    if (e.code === 'ArrowLeft') {
      State.set('selectedChar', (State.selectedChar - 1 + CHAR_LIST.length) % CHAR_LIST.length);
      playSfx('sfxSelect', 0.4);
    } else if (e.code === 'ArrowRight') {
      State.set('selectedChar', (State.selectedChar + 1) % CHAR_LIST.length);
      playSfx('sfxSelect', 0.4);
    } else if (e.code === 'Space' || e.code === 'Enter') {
      startGame();
    }
  } else if (State.gState === 'playing') {
    if (e.code === 'Space' || e.code === 'ArrowUp') player.jump();
  } else {
    if (e.code === 'Space' || e.code === 'Enter') retry();
  }
});

// メインループ
function loop(now) {
  requestAnimationFrame(loop);

  if (State.gState === 'loading') {
    resetCtx();
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    ctx.font = 'bold 22px Orbitron,sans-serif';
    ctx.fillStyle = '#88ff44';
    ctx.textAlign = 'center';
    ctx.fillText('LOADING  ' + Math.round(getProgress() * 100) + '%', GAME_W / 2, GAME_H / 2);

    // ★ スマホ等で40%で止まっている場合、
    // 「画面をタップしてね」という指示を出すと親切です
    if (getProgress() > 0.35 && getProgress() < 1.0) {
      ctx.font = '12px sans-serif';
      ctx.fillText('Tap to Start Audio', GAME_W / 2, GAME_H / 2 + 40);
    }
    return;
  }

  const dt = Math.min((now - (State.lastTime || now)) / 1000, 0.05);
  State.set('lastTime', now);

  // Update
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

  // Draw
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

// アセット読み込み開始
loadAll(() => {
  setTimeout(() => State.set('gState', 'title'), 200);
});
