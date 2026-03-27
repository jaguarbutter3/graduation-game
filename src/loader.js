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

  // 画像3 + SFX7 + BGM1 = 11
  loadTotal = imgKeys.length + sfxKeys.length + 1;

  function done() {
    loadCount++;
    if (loadCount >= loadTotal) cb();
  }

  // 画像ロード
  imgKeys.forEach((k) => {
    const img = new Image();
    img.onload = done;
    img.onerror = done;
    img.src = ASSET_PATH[k];
    IMG[k] = img;
  });

  // SFX ロード
  // canplaythrough はスマホで発火しないことがあるため
  // 2秒のタイムアウトを設けてどちらか早い方で done() を呼ぶ
  sfxKeys.forEach((k) => {
    const a = new Audio();
    a.preload = 'auto';
    SFX[k] = a;

    let fired = false;
    const advance = () => {
      if (fired) return;
      fired = true;
      done();
    };

    a.addEventListener('canplaythrough', advance, { once: true });
    a.addEventListener('error', advance, { once: true });
    setTimeout(advance, 2000); // 2秒待っても来なければスキップ

    a.src = ASSET_PATH[k];
  });

  // BGM バイナリ取得
  fetch(ASSET_PATH.bgm)
    .then((res) => res.arrayBuffer())
    .then((buf) => {
      BGM_BINARY = buf;
      done();
    })
    .catch(() => done());
}

export function getProgress() {
  return loadTotal === 0 ? 0 : Math.min(loadCount / loadTotal, 1.0);
}
