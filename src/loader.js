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

  loadTotal = imgKeys.length + 1;

  function done() {
    loadCount++;
    if (loadCount >= loadTotal) {
      cb();
    }
  }

  imgKeys.forEach((k) => {
    const img = new Image();
    img.onload = done;
    img.onerror = done;
    img.src = ASSET_PATH[k];
    IMG[k] = img;
  });

  sfxKeys.forEach((k) => {
    const a = new Audio();
    a.src = ASSET_PATH[k];
    a.preload = 'auto';
    SFX[k] = a;
  });

  fetch(ASSET_PATH.bgm)
    .then((res) => res.arrayBuffer())
    .then((buf) => {
      BGM_BINARY = new Uint8Array(buf);
      done();
    })
    .catch(() => {
      done();
    });
}

export function getProgress() {
  return loadTotal === 0 ? 0 : Math.min(loadCount / loadTotal, 1.0);
}
