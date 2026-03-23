// ============================================================
//  state.js  ─ ゲーム全体で共有する可変状態
//
//  import して直接読み書きする（シンプルな共有オブジェクト）
//  例: import * as State from '../state.js';
//      State.score += 100;
// ============================================================
import { GAME_SEC, CHAR_LIST, CHR_FRAMES } from './config.js';

// ゲーム進行
export let gState = 'loading'; // loading | title | playing | gameover | clear
export let score = 0;
export let timeLeft = GAME_SEC;
export let combo = 0;
export let comboTime = 0;
export let flashAlpha = 0;
export let lastTime = 0;

// 背景スクロールオフセット
export let bgFar = 0;
export let bgNear = 0;
export let bgGround = 0;

// キャラ選択
export let selectedChar = 1; // green
export let CHR = CHR_FRAMES[CHAR_LIST[1]];

// タイマー
export let countdownId = null;

// ------ セッター（ESモジュールはプリミティブの直接代入ができないため） ------
export function set(key, value) {
  switch (key) {
    case 'gState':
      gState = value;
      break;
    case 'score':
      score = value;
      break;
    case 'timeLeft':
      timeLeft = value;
      break;
    case 'combo':
      combo = value;
      break;
    case 'comboTime':
      comboTime = value;
      break;
    case 'flashAlpha':
      flashAlpha = value;
      break;
    case 'lastTime':
      lastTime = value;
      break;
    case 'bgFar':
      bgFar = value;
      break;
    case 'bgNear':
      bgNear = value;
      break;
    case 'bgGround':
      bgGround = value;
      break;
    case 'selectedChar':
      selectedChar = value;
      CHR = CHR_FRAMES[CHAR_LIST[value]];
      break;
    case 'countdownId':
      countdownId = value;
      break;
    default:
      console.warn('state.set: unknown key', key);
  }
}
