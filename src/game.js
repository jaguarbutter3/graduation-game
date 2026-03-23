// ============================================================
//  game.js  ─ ゲームロジック・衝突判定・状態遷移
// ============================================================
import { GAME_SEC, PLR_W, PLR_H, COIN_DRAW, COIN_HIT, OBS_HIT_W, OBS_HIT_H } from './config.js';
import { playSfx, startBGM, stopBGM } from './audio.js';
import * as State from './state.js';
import { player } from './entities/player.js';
import { obstacles, resetObstacles } from './entities/obstacle.js';
import { claps, resetClaps } from './entities/clap.js';
import { spawnHitFX, spawnClearPtcls, resetEffects } from './render/effects.js';

// ============================================================
//  当たり判定（AABB）
// ============================================================
export function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// ============================================================
//  ゲームオーバー
// ============================================================
export function triggerGameOver() {
  if (State.gState !== 'playing') return;
  State.set('gState', 'gameover');
  playSfx('sfxHurt');
  State.set('flashAlpha', 0.8);
  player.hitTimer = 0.6;
  spawnHitFX(player.x + PLR_W / 2, player.y + PLR_H / 2);
  stopCountdown();
  stopBGM();
}

// ============================================================
//  クリア
// ============================================================
export function triggerClear() {
  if (State.gState !== 'playing') return;
  State.set('gState', 'clear');
  playSfx('sfxMagic');
  spawnClearPtcls();
  stopCountdown();
  stopBGM();
}

// ============================================================
//  カウントダウン
// ============================================================
export function startCountdown() {
  stopCountdown();
  const id = setInterval(() => {
    if (State.gState !== 'playing') return;
    State.set('timeLeft', State.timeLeft - 1);
    if (State.timeLeft <= 0) {
      State.set('timeLeft', 0);
      triggerClear();
    }
  }, 1000);
  State.set('countdownId', id);
}

export function stopCountdown() {
  if (State.countdownId) {
    clearInterval(State.countdownId);
    State.set('countdownId', null);
  }
}

// ============================================================
//  ゲーム開始・リセット
// ============================================================
export function startGame() {
  // 全状態をリセット
  State.set('score', 0);
  State.set('timeLeft', GAME_SEC);
  State.set('combo', 0);
  State.set('comboTime', 0);
  State.set('flashAlpha', 0);
  State.set('lastTime', 0);
  State.set('bgFar', 0);
  State.set('bgNear', 0);
  State.set('bgGround', 0);

  resetObstacles();
  resetClaps();
  resetEffects();
  player.reset();

  State.set('gState', 'playing');
  startCountdown();
  startBGM();
}

export function retry() {
  playSfx('sfxSelect');
  setTimeout(() => startGame(), 80);
}

// ============================================================
//  毎フレームの衝突チェック（main.js の update から呼ぶ）
// ============================================================
export function checkCollisions() {
  const pr = player.rect();

  // 障害物
  for (const o of obstacles) {
    if (rectsOverlap(pr.x, pr.y, pr.w, pr.h, o.x + 7, o.y + 5, OBS_HIT_W, OBS_HIT_H)) {
      triggerGameOver();
      return; // 1フレームに1回だけ判定
    }
  }

  // クラップアイテム
  if (State.gState !== 'playing') return;
  for (let i = claps.length - 1; i >= 0; i--) {
    const c = claps[i];
    const hx = c.x + (COIN_DRAW - COIN_HIT) / 2;
    const hy = c.cy + (COIN_DRAW - COIN_HIT) / 2;
    if (rectsOverlap(pr.x, pr.y, pr.w, pr.h, hx, hy, COIN_HIT, COIN_HIT)) {
      claps.splice(i, 1);
      State.set('score', State.score + 100);
      State.set('combo', State.combo + 1);
      State.set('comboTime', 1.3);
      playSfx('sfxClap', 0.85);

      // エフェクト（循環参照を避けるため動的import）
      import('./render/effects.js').then((m) =>
        m.spawnClapFX(player.x + PLR_W / 2, player.y + PLR_H / 2),
      );
    }
  }
}
