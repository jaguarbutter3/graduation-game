// ============================================================
//  loader.js  ─ 画像・音声アセットのロード管理
// ============================================================
import { ASSET_PATH } from './config.js';

export const IMG = {};
export const SFX = {};

let loadCount = 0;
let loadTotal = 0;

/**
 * 全アセットをロードし、完了したらコールバックを呼ぶ
 * @param {Function} cb - ロード完了時のコールバック
 */
export function loadAll(cb) {
  const imgKeys = ['imgCharacters', 'imgEnemies', 'imgTiles', 'imgBg'];
  const sfxKeys = ['sfxJump', 'sfxJump2', 'sfxClap', 'sfxHurt', 'sfxMagic', 'sfxSelect'];
  loadTotal = imgKeys.length + sfxKeys.length;

  function done() {
    if (++loadCount >= loadTotal) cb();
  }

  imgKeys.forEach((k) => {
    const img = new Image();
    img.onload = done;
    img.onerror = () => {
      console.warn('画像ロード失敗:', k, ASSET_PATH[k]);
      done();
    };
    img.src = ASSET_PATH[k];
    IMG[k] = img;
  });

  sfxKeys.forEach((k) => {
    const a = new Audio();
    a.src = ASSET_PATH[k];
    a.oncanplaythrough = done;
    a.onerror = () => {
      console.warn('音声ロード失敗:', k, ASSET_PATH[k]);
      done();
    };
    SFX[k] = a;
  });
}

/** ロード進捗を 0〜1 で返す */
export function getProgress() {
  return loadTotal === 0 ? 0 : loadCount / loadTotal;
}
