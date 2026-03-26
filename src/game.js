// ============================================================
//  game.js  ─ ゲームロジック・衝突判定・状態遷移
// ============================================================
import { GAME_SEC, PLR_W, PLR_H, CHAR_LIST } from './config.js';
import { playSfx, startBGM, stopBGM } from './audio.js';
import * as State from './state.js';
import { player } from './entities/player.js';
import { obstacles, resetObstacles, getObstacleHitRect } from './entities/obstacle.js';
import { claps, resetClaps, getClapHitRect } from './entities/clap.js';
import { spawnHitFX, spawnClearPtcls, spawnClapFX, resetEffects } from './render/effects.js';

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

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

export function triggerClear() {
  if (State.gState !== 'playing') return;
  State.set('gState', 'clear');
  playSfx('sfxMagic');
  spawnClearPtcls();
  stopCountdown();
  stopBGM();
}

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

export function startGame() {
  State.set('score', 0);
  State.set('timeLeft', GAME_SEC);
  State.set('combo', 0);
  State.set('comboTime', 0);
  State.set('flashAlpha', 0);
  State.set('lastTime', 0);
  State.set('invincibleTime', 0); // リセット
  State.set('bgFar', 0);
  State.set('bgNear', 0);
  State.set('bgGround', 0);

  resetObstacles();
  resetClaps();
  resetEffects();

  const charData = CHAR_LIST[State.selectedChar];
  player.reset(charData || CHAR_LIST[0]);

  State.set('gState', 'playing');
  startCountdown();
  startBGM();
}

export function retry() {
  playSfx('sfxSelect');
  setTimeout(() => startGame(), 80);
}

// game.js の checkCollisions を修正
export function checkCollisions() {
  if (State.gState !== 'playing') return;
  const pr = player.rect();

  // 1. 楽器アイテム（判定を優先）
  for (let i = claps.length - 1; i >= 0; i--) {
    const hr = getClapHitRect(claps[i]);
    if (rectsOverlap(pr.x, pr.y, pr.w, pr.h, hr.x, hr.y, hr.w, hr.h)) {
      claps.splice(i, 1);
      State.set('score', State.score + 100);
      State.set('combo', State.combo + 1);
      State.set('comboTime', 1.3);

      // 無敵をセット
      State.set('invincibleTime', 0.4);

      playSfx('sfxClap', 0.85);
      spawnClapFX(player.x + PLR_W / 2, player.y + PLR_H / 2);

      // ★重要：アイテムを取った瞬間にこの関数の処理を終了させる
      // これを入れないと、下の障害物判定がそのまま動いて死んでしまいます！
      return;
    }
  }

  // 2. メッセージカード（無敵中は無視）
  if (State.invincibleTime > 0) return; // ここでもガード

  for (const o of obstacles) {
    const hr = getObstacleHitRect(o);
    if (rectsOverlap(pr.x, pr.y, pr.w, pr.h, hr.x, hr.y, hr.w, hr.h)) {
      triggerGameOver();
      return;
    }
  }
}
