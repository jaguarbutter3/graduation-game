// ============================================================
//  audio.js  ─ MP3/WAV BGM再生 + 効果音
// ============================================================
import { BGM_BUFFER, SFX } from './loader.js';

let _actx = null;
let bgmNode = null;

/** AudioContext を取得（ブラウザ互換性を考慮） */
export function getActx() {
  if (!_actx) _actx = new AudioContext();
  if (_actx.state === 'suspended') _actx.resume();
  return _actx;
}

/**
 * 効果音を再生する
 */
export function playSfx(key, vol = 0.8) {
  const a = SFX[key];
  if (!a) return; // 指定されたSEがなければ無視
  try {
    // Audio要素を複製して再生（連続再生に対応）
    const c = a.cloneNode();
    c.volume = vol;
    c.play().catch(() => {
      /* 自動再生制限などで失敗しても無視 */
    });
  } catch {
    // エラー対策
  }
}

/**
 * BGM を開始する（読み込んだ BGM_BUFFER を使用）
 */
export function startBGM() {
  stopBGM();
  if (!BGM_BUFFER) return;

  const a = getActx();
  const src = a.createBufferSource();
  src.buffer = BGM_BUFFER;
  src.loop = true;

  const gain = a.createGain();
  gain.gain.value = 0.4; // BGMの音量（0.0 ～ 1.0）

  src.connect(gain).connect(a.destination);
  src.start(0);
  bgmNode = src;
}

/**
 * BGM を停止する
 */
export function stopBGM() {
  if (bgmNode) {
    try {
      bgmNode.stop();
    } catch {
      // すでに止まっている場合などのエラー回避
    }
    bgmNode = null;
  }
}
