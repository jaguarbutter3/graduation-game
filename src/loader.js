// loader.js
import { ASSET_PATH } from './config.js';

export const IMG = {};
export const SFX = {};
export let BGM_BINARY = null; // デコード前の生データ

let loadCount = 0;
let loadTotal = 0;

export function loadAll(cb) {
  const imgKeys = ['imgCharacters', 'imgTiles', 'imgBg'];
  const sfxKeys = ['sfxJump', 'sfxJump2', 'sfxClap', 'sfxHurt', 'sfxMagic', 'sfxSelect'];

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

  // 効果音ロード (スマホ対策: canplaythroughを待たずにsrcセットだけでdoneにする)
  sfxKeys.forEach((k) => {
    const a = new Audio();
    a.src = ASSET_PATH[k];
    // スマホだとロード完了イベントが来ないことがあるので、
    // エラー以外は即座に次へ進めるか、preloadをnoneにする
    a.preload = 'auto';
    SFX[k] = a;
    done();
  });

  // BGMロード (fetchして生データだけ確保)
  fetch(ASSET_PATH.bgm)
    .then((res) => res.arrayBuffer())
    .then((buf) => {
      BGM_BINARY = buf;
      done();
    })
    .catch(() => {
      console.warn('BGM load failed');
      done();
    });
}

export function getProgress() {
  return loadTotal === 0 ? 0 : loadCount / loadTotal;
}
