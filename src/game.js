// ============================================================
//  game.js  ─ ゲーム進行・衝突判定ロジック
// ============================================================
import { PLR_W, PLR_H, CHAR_LIST } from './config.js';
import { playSfx, setupAudio, playBgm, stopBgm } from './audio.js';
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

  playSfx('sfxHurt', 0.8);
  playSfx('sfxDisappear', 1.0);

  State.set('flashAlpha', 0.8);
  player.hitTimer = 0.6;
  spawnHitFX(player.x + PLR_W / 2, player.y + PLR_H / 2);
  stopBgm();
}

export function triggerClear() {
  if (State.gState !== 'playing') return;
  State.set('gState', 'clear');
  playSfx('sfxMagic', 1.0);
  spawnClearPtcls();
  stopBgm();
}

export async function startGame() {
  State.set('score', 0);
  State.set('combo', 0);
  State.set('comboTime', 0);
  State.set('flashAlpha', 0);
  State.set('lastTime', performance.now());
  State.set('invincibleTime', 0);
  State.set('bgFar', 0);
  State.set('bgNear', 0);
  State.set('bgGround', 0);

  resetObstacles();
  resetClaps();
  resetEffects();

  const charData = CHAR_LIST[State.selectedChar];
  player.reset(charData || CHAR_LIST[0]);

  State.set('gState', 'playing');

  // ★ スマホBGM修正：
  //    setupAudio() でコンテキスト解除 + デコードを完全に待ってから
  //    同期の playBgm() を呼ぶ。これが動いていた版と同じ構造。
  try {
    await setupAudio();
    playBgm();
  } catch (e) {}
}

export async function retry() {
  playSfx('sfxSelect', 0.5);
  setTimeout(async () => {
    stopBgm();
    State.set('gState', 'title');
    State.set('lastTime', performance.now());
  }, 100);
}

export function checkCollisions() {
  if (State.gState !== 'playing') return;
  const pr = player.rect();

  for (let i = claps.length - 1; i >= 0; i--) {
    const hr = getClapHitRect(claps[i]);
    if (rectsOverlap(pr.x, pr.y, pr.w, pr.h, hr.x, hr.y, hr.w, hr.h)) {
      claps.splice(i, 1);
      State.set('score', State.score + 100);
      State.set('combo', State.combo + 1);
      State.set('comboTime', 1.3);
      State.set('invincibleTime', 0.4);
      playSfx('sfxClap', 0.85);
      spawnClapFX(player.x + PLR_W / 2, player.y + PLR_H / 2);
      return;
    }
  }

  if (State.messagesLeft === 0 && obstacles.length === 0) {
    triggerClear();
    return;
  }

  if (State.invincibleTime > 0) return;
  for (const o of obstacles) {
    const hr = getObstacleHitRect(o);
    if (rectsOverlap(pr.x, pr.y, pr.w, pr.h, hr.x, hr.y, hr.w, hr.h)) {
      triggerGameOver();
      return;
    }
  }
}
