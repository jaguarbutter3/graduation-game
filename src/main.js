// ============================================================
//  main.js  ─ メインループ・入力ハンドラ・起動
// ============================================================
import { GAME_W, GAME_H, CHAR_LIST } from './config.js';
import { canvas, ctx, resetCtx } from './canvas.js';
import { loadAll, getProgress } from './loader.js';
import { getActx, setupAudio, playSfx } from './audio.js';
import * as State from './state.js';

import { player } from './entities/player.js';
import { obstacles, updateObstacles, drawObstacle } from './entities/obstacle.js';
import { claps, updateClaps, drawClap } from './entities/clap.js';

import { drawBackground, drawGround } from './render/background.js';
import { updateEffects, drawEffects, updateClearPtcls } from './render/effects.js';
import { drawHUD, drawFlash, drawTitle, drawGameOver, drawClear } from './render/ui.js';

import { startGame, retry, checkCollisions } from './game.js';

/**
 * ★ スマホ・ブラウザ制限解除用の初期化関数
 * ユーザーが最初に画面を触った瞬間に実行される
 */
const initAudio = async () => {
  // AudioContextの再開とBGMのデコードを並行して実行
  await setupAudio();

  // 一度実行したらイベントリスナーを削除して負荷を減らす
  window.removeEventListener('pointerdown', initAudio);
  window.removeEventListener('touchstart', initAudio);
  window.removeEventListener('keydown', initAudio);
  console.log('Audio Initialized via User Gesture');
};

// あらゆる入力操作をオーディオ起動のトリガーにする
window.addEventListener('pointerdown', initAudio);
window.addEventListener('touchstart', initAudio);
window.addEventListener('keydown', initAudio);

// 入力：クリック・タップ判定
canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();

  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (GAME_W / rect.width);
  const my = (e.clientY - rect.top) * (GAME_H / rect.height);

  // --- タイトル画面の処理 ---
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

  // --- プレイ中・リトライの処理 ---
  if (State.gState === 'playing') {
    player.jump();
  } else if (State.gState === 'gameover' || State.gState === 'clear') {
    retry();
  }
});

// 入力：キーボード操作
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

/**
 * メインループ
 */
function loop(now) {
  requestAnimationFrame(loop);

  // --- ロード画面 ---
  if (State.gState === 'loading') {
    resetCtx();
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    ctx.font = 'bold 22px Orbitron,sans-serif';
    ctx.fillStyle = '#88ff44';
    ctx.textAlign = 'center';
    const progress = Math.round(getProgress() * 100);
    ctx.fillText('LOADING  ' + progress + '%', GAME_W / 2, GAME_H / 2);

    // スマホユーザー向けガイド表示
    if (progress >= 100) {
      ctx.font = '12px sans-serif';
      ctx.fillText('Tap to Start', GAME_W / 2, GAME_H / 2 + 40);
    }
    return;
  }

  const dt = Math.min((now - (State.lastTime || now)) / 1000, 0.05);
  State.set('lastTime', now);

  // --- 更新ロジック ---
  if (State.gState === 'playing') {
    player.update(dt);
    updateObstacles(dt);
    updateClaps(dt);
    updateEffects(dt);

    // コンボ・無敵時間の減衰
    if (State.comboTime > 0) State.set('comboTime', Math.max(0, State.comboTime - dt));
    if (State.invincibleTime > 0)
      State.set('invincibleTime', Math.max(0, State.invincibleTime - dt));

    checkCollisions();
  }

  if (State.gState === 'clear') updateClearPtcls(dt);

  // --- 描画ロジック ---
  resetCtx();
  drawBackground(dt);
  drawGround(dt);

  if (State.gState === 'title') {
    player.animKey = 'idle';
    player.draw();
    drawTitle();
  } else {
    // プレイ中のエンティティ描画
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

// ループ開始
requestAnimationFrame(loop);

// アセット読み込み開始
loadAll(() => {
  // ロード完了後、少し待ってタイトルへ
  setTimeout(() => State.set('gState', 'title'), 200);
});
