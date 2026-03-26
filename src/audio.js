// ============================================================
//  audio.js  ─ 軽量化・パフォーマンス優先版
// ============================================================
import { BGM_BINARY, SFX } from './loader.js';

let _actx = null;
export let BGM_BUFFER = null;

// 再生中のBGMソースを保持
let bgmSource = null;
let bgmGainNode = null;

export function getActx() {
  if (!_actx) {
    _actx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _actx;
}

/**
 * 初期化：デコードを1回だけ行い、その後は再利用する
 */
export async function setupAudio() {
  const ctx = getActx();
  if (ctx.state === 'suspended') await ctx.resume();

  // 無音再生でiOSの制限解除（これ自体は軽量）
  const buf = ctx.createBuffer(1, 1, 22050);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(ctx.destination);
  src.start(0);

  // BGMのデコード（一度きり）
  if (BGM_BINARY && !BGM_BUFFER) {
    try {
      // slice(0) をやめて、メモリを直接渡す（一度きりなので安全）
      BGM_BUFFER = await ctx.decodeAudioData(BGM_BINARY);
      console.log('BGM Ready (Optimized)');
    } catch (e) {
      console.error('BGM Decode Error:', e);
    }
  }
}

/**
 * 効果音再生：高負荷な cloneNode を最小限にする
 */
export function playSfx(key, vol = 1.0) {
  const a = SFX[key];
  if (!a) return;

  // スマホの負荷軽減のため、再生中なら先頭に戻すだけにする（連打対策）
  // cloneNode はメモリを食うため、重い場合はこちらが有利
  try {
    const masterSfxVol = 0.15; // 全体的にさらに少し下げる
    let relativeVol = 1.0;

    if (key === 'sfxClap' || key === 'sfxSelect' || key === 'sfxDisappear') {
      relativeVol = 0.5;
    }

    // 再生中なら止めて最初から（高速化）
    if (!a.paused) {
      a.currentTime = 0;
    }

    a.volume = Math.min(1, Math.max(0, vol * masterSfxVol * relativeVol));
    a.play().catch(() => {});
  } catch (e) {
    // 失敗してもゲームを止めない
  }
}

/**
 * BGM再生：GainNode を使い回して負荷を減らす
 */
export function playBgm() {
  if (!BGM_BUFFER) return;
  const ctx = getActx();

  stopBgm();

  bgmSource = ctx.createBufferSource();
  bgmSource.buffer = BGM_BUFFER;
  bgmSource.loop = true;

  bgmGainNode = ctx.createGain();
  bgmGainNode.gain.value = 0.35; // 少し控えめに

  bgmSource.connect(bgmGainNode);
  bgmGainNode.connect(ctx.destination);

  bgmSource.start(0);
}

export function stopBgm() {
  if (bgmSource) {
    try {
      bgmSource.stop();
    } catch (e) {}
    bgmSource = null;
  }
}
