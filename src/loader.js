// loader.js
import { ASSET_PATH } from './config.js';
import { getActx } from './audio.js'; // AudioContext取得用

export const IMG = {};
export const SFX = {};
export let BGM_BUFFER = null; // BGMデータを保持する変数

let loadCount = 0;
let loadTotal = 0;

export function loadAll(cb) {
  const imgKeys = ['imgCharacters', 'imgTiles', 'imgBg'];
  const sfxKeys = ['sfxJump', 'sfxJump2', 'sfxClap', 'sfxHurt', 'sfxMagic', 'sfxSelect'];

  // BGMを含めてカウント (もしBGMを使わないなら +0 にする)
  loadTotal = imgKeys.length + sfxKeys.length + 1;

  function done() {
    loadCount++;
    if (loadCount >= loadTotal) cb();
  }

  // 画像ロード
  imgKeys.forEach((k) => {
    const img = new Image();
    img.onload = done;
    img.onerror = () => {
      alert('画像ロード失敗: ' + k + '\nパス: ' + ASSET_PATH[k]);
      done();
    };
    img.src = ASSET_PATH[k];
    IMG[k] = img;
  });

  // 効果音ロード (これまで通り)
  sfxKeys.forEach((k) => {
    const a = new Audio();
    a.src = ASSET_PATH[k];
    a.oncanplaythrough = done;
    a.onerror = () => {
      console.warn('音声ロード失敗:', k);
      done();
    };
    SFX[k] = a;
  });

  // ★ BGMロード (fetch 方式)
  loadBGM(ASSET_PATH.bgm, done);
}

async function loadBGM(path, done) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const arrayBuffer = await response.arrayBuffer();
    // audio.js の Context を使ってデコード
    BGM_BUFFER = await getActx().decodeAudioData(arrayBuffer);
    done();
  } catch (e) {
    alert('BGMロード失敗!\nパス: ' + path + '\nエラー: ' + e.message);
    // 失敗してもゲームが止まらないように done だけは呼ぶ
    done();
  }
}

export function getProgress() {
  return loadTotal === 0 ? 0 : loadCount / loadTotal;
}
