// ============================================================
//  game.js  ─ ゲーム進行・衝突判定ロジック
// ============================================================
import { PLR_W, PLR_H, CHAR_LIST } from './config.js';
import { playSfx, playBgm, stopBgm } from './audio.js'; // 関数名を現在の audio.js に合わせました
import * as State from './state.js';
import { player } from './entities/player.js';
import { obstacles, resetObstacles, getObstacleHitRect } from './entities/obstacle.js';
import { claps, resetClaps, getClapHitRect } from './entities/clap.js';
import { spawnHitFX, spawnClearPtcls, spawnClapFX, resetEffects } from './render/effects.js';

/**
 * 矩形の重なり判定ヘルパー
 */
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/**
 * ゲームオーバー処理
 */
export function triggerGameOver() {
  if (State.gState !== 'playing') return;
  State.set('gState', 'gameover');
  playSfx('sfxHurt');
  State.set('flashAlpha', 0.8);
  player.hitTimer = 0.6; // プレイヤー側の被弾アニメーション用
  spawnHitFX(player.x + PLR_W / 2, player.y + PLR_H / 2);
  stopBgm(); // audio.js の名称に合わせました
}

/**
 * クリア処理
 */
export function triggerClear() {
  if (State.gState !== 'playing') return;
  State.set('gState', 'clear');
  playSfx('sfxMagic');
  spawnClearPtcls();
  stopBgm();
}

/**
 * ゲーム開始
 */
export function startGame() {
  // 状態の初期化
  State.set('score', 0);
  State.set('combo', 0);
  State.set('comboTime', 0);
  State.set('flashAlpha', 0);
  State.set('lastTime', performance.now()); // 0ではなく現在時刻
  State.set('invincibleTime', 0);

  // 背景スクロール位置のリセット
  State.set('bgFar', 0);
  State.set('bgNear', 0);
  State.set('bgGround', 0);

  // エンティティとエフェクトのリセット
  resetObstacles();
  resetClaps();
  resetEffects();

  // プレイヤーの初期化（選択されたキャラを適用）
  const charData = CHAR_LIST[State.selectedChar];
  player.reset(charData || CHAR_LIST[0]);

  State.set('gState', 'playing');

  // BGM開始 (audio.js の playBgm を実行)
  playBgm();
}

/**
 * リトライ処理
 */
export function retry() {
  playSfx('sfxSelect');
  // 少しだけ間を置いてから再開（演出上のウェイト）
  setTimeout(() => startGame(), 80);
}

/**
 * 当たり判定チェック
 */
export function checkCollisions() {
  if (State.gState !== 'playing') return;

  // プレイヤーの判定用矩形取得
  const pr = player.rect();

  // 1. アイテム判定
  for (let i = claps.length - 1; i >= 0; i--) {
    const hr = getClapHitRect(claps[i]);
    if (rectsOverlap(pr.x, pr.y, pr.w, pr.h, hr.x, hr.y, hr.w, hr.h)) {
      claps.splice(i, 1);

      // スコア計算
      State.set('score', State.score + 100);
      State.set('combo', State.combo + 1);
      State.set('comboTime', 1.3);

      // 連続で取った時のための短い無敵（任意）
      State.set('invincibleTime', 0.4);

      playSfx('sfxClap', 0.85);
      spawnClapFX(player.x + PLR_W / 2, player.y + PLR_H / 2);

      // アイテム取得時は他の判定をスキップして戻る
      return;
    }
  }

  // 2. クリア判定 (メッセージを出し切り、かつ画面上に障害物がない)
  if (State.messagesLeft === 0 && obstacles.length === 0) {
    triggerClear();
    return;
  }

  // 3. 障害物判定（無敵時間はスルー）
  if (State.invincibleTime > 0) return;

  for (const o of obstacles) {
    const hr = getObstacleHitRect(o);
    if (rectsOverlap(pr.x, pr.y, pr.w, pr.h, hr.x, hr.y, hr.w, hr.h)) {
      triggerGameOver();
      return;
    }
  }
}
