// ============================================================
//  loader.js  ─ 画像・音声アセットのロード管理
// ============================================================
import { ASSET_PATH } from './config.js';

export const IMG = {};
export const SFX = {};

let loadCount = 0;
let loadTotal = 0;

export function loadAll(cb) {
  // imgEnemies は削除（メッセージカードはCanvas描画のため不要）
  const imgKeys = ['imgCharacters', 'imgTiles', 'imgBg'];
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

export function getProgress() {
  return loadTotal === 0 ? 0 : loadCount / loadTotal;
}
