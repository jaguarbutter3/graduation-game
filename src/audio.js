// ============================================================
//  audio.js  ─ SE再生 / BGM合成（BPM120固定）
// ============================================================
import { SFX } from './loader.js';

let _actx = null;
let bgmNode = null;

/** AudioContext を取得（初回生成・suspended 解除） */
export function getActx() {
  if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
  if (_actx.state === 'suspended') _actx.resume();
  return _actx;
}

/**
 * 効果音を再生する
 * @param {string} key  - SFX のキー名（例: 'sfxJump'）
 * @param {number} vol  - 音量 0〜1
 */
export function playSfx(key, vol = 0.8) {
  const a = SFX[key];
  if (!a || !a.src) return;
  try {
    const c = a.cloneNode();
    c.volume = vol;
    c.play().catch(() => {});
  } catch (e) {}
}

/**
 * BGM を開始する（BPM120固定・ループ）
 * Web Audio API でキック＋スネアを合成して再生
 */
export function startBGM() {
  stopBGM();
  try {
    const a = getActx();
    const bpm = 120;
    const beat = 60 / bpm; // 0.5秒/拍
    const bar = beat * 4; // 2秒/小節
    const sr = a.sampleRate;
    const buf = a.createBuffer(1, sr * bar, sr);
    const d = buf.getChannelData(0);

    // 4拍のキックパルス
    [0, beat, beat * 2, beat * 3].forEach((t) => {
      const s = Math.floor(t * sr);
      for (let i = 0; i < sr * 0.08; i++) {
        const env = Math.pow(1 - i / (sr * 0.08), 3);
        const freq = 80 * Math.pow(0.1, i / (sr * 0.08));
        d[s + i] = Math.sin(2 * Math.PI * freq * (i / sr)) * env * 0.4;
      }
    });

    // 2・4拍のスネアノイズ
    [beat, beat * 3].forEach((t) => {
      const s = Math.floor(t * sr);
      for (let i = 0; i < sr * 0.06; i++) {
        const env = Math.pow(1 - i / (sr * 0.06), 2);
        d[s + i] += (Math.random() * 2 - 1) * env * 0.25;
      }
    });

    const src = a.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const gain = a.createGain();
    gain.gain.value = 0.55;
    src.connect(gain).connect(a.destination);
    src.start();
    bgmNode = src;
  } catch (e) {}
}

/** BGM を停止する */
export function stopBGM() {
  if (bgmNode) {
    try {
      bgmNode.stop();
    } catch (e) {}
    bgmNode = null;
  }
}
