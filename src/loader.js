// ============================================================
//  loader.js  ─ アセットの非同期ロード管理
// ============================================================
import { ASSET_PATH } from './config.js';

export const IMG = {};
export const SFX = {};
export let BGM_BINARY = null;

let loadCount = 0;
let loadTotal = 0;

export function loadAll(cb) {
  const imgKeys = ['imgCharacters', 'imgTiles', 'imgBg'];
  const sfxKeys = [
    'sfxDisappear',
    'sfxJump',
    'sfxJump2',
    'sfxClap',
    'sfxHurt',
    'sfxMagic',
    'sfxSelect',
  ];

  // 画像3 + SFX7 + BGM1 = 11 すべてカウント
  loadTotal = imgKeys.length + sfxKeys.length + 1;

  function done() {
    loadCount++;
    if (loadCount >= loadTotal) {
      cb();
    }
  }

  // 画像ロード
  imgKeys.forEach((k) => {
    const img = new Image();
    img.onload = done;
    img.onerror = done; // 失敗しても進める
    img.src = ASSET_PATH[k];
    IMG[k] = img;
  });

  // SFX ロード（canplaythrough で完了とみなす）
  sfxKeys.forEach((k) => {
    const a = new Audio();
    a.preload = 'auto';

    const onReady = () => {
      a.removeEventListener('canplaythrough', onReady);
      a.removeEventListener('error', onReady);
      done();
    };
    a.addEventListener('canplaythrough', onReady, { once: true });
    a.addEventListener('error', onReady, { once: true }); // 失敗しても進める

    a.src = ASSET_PATH[k];
    SFX[k] = a;
  });

  // BGM バイナリ取得
  fetch(ASSET_PATH.bgm)
    .then((res) => res.arrayBuffer())
    .then((buf) => {
      BGM_BINARY = buf; // ArrayBuffer のまま保持
      done();
    })
    .catch(() => {
      done();
    });
}

export function getProgress() {
  return loadTotal === 0 ? 0 : Math.min(loadCount / loadTotal, 1.0);
}
