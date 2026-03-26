import { GAME_SEC, CHAR_LIST } from './config.js';

export let gState = 'loading';
export let score = 0;
export let timeLeft = GAME_SEC;
export let messagesLeft = 0; // 追加
export let combo = 0;
export let comboTime = 0;
export let flashAlpha = 0;
export let lastTime = 0;

export let bgFar = 0;
export let bgNear = 0;
export let bgGround = 0;

export let selectedChar = 1; // green
export let CHR = CHAR_LIST[1].CHR;
export let countdownId = null;
export let invincibleTime = 0;

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
    case 'messagesLeft':
      messagesLeft = value;
      break; // 追加
    case 'combo':
      combo = value;
      break;
    case 'comboTime':
      comboTime = value;
      break;
    case 'invincibleTime':
      invincibleTime = value;
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
      if (CHAR_LIST[value]) {
        CHR = CHAR_LIST[value].CHR;
      }
      break;
    case 'countdownId':
      countdownId = value;
      break;
    default:
      console.warn('state.set: unknown key', key);
  }
}
