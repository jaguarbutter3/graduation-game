// ============================================================
//  audio.js  ─ Web Audio API 管理 & 再生
// ============================================================
import { BGM_BINARY, SFX } from './loader.js';

let _actx = null;
export let BGM_BUFFER = null;

/**
 * AudioContextの取得 (シングルトン)
 */
export function getActx() {
  if (!_actx) {
    _actx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _actx;
}

/**
 * ★ スマホのオーディオ制限を完全に解除する
 */
export async function setupAudio() {
  const ctx = getActx();

  // 1. Suspended状態なら解除
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  // 2. iOS/Android対策：無音のバッファを一瞬流して「再生許可」を確定させる
  const dummy = ctx.createBufferSource();
  dummy.buffer = ctx.createBuffer(1, 1, 22050);
  dummy.connect(ctx.destination);
  dummy.start(0);

  // 3. BGMのデコードを先行して開始
  if (BGM_BINARY && !BGM_BUFFER) {
    try {
      // slice(0) でデータを保護しつつデコード
      BGM_BUFFER = await ctx.decodeAudioData(BGM_BINARY.slice(0));
      console.log('BGM decoded successfully via setupAudio');
    } catch (e) {
      console.error('BGM decode error in setupAudio:', e);
    }
  }
}

/**
 * 効果音の再生
 */
export function playSfx(key, vol = 1.0) {
  const a = SFX[key];
  if (!a) return;

  try {
    const c = a.cloneNode();
    let masterSfxVol = 0.2; // 全体ベース
    let relativeVol = 1.0;

    // 音量調整
    if (key === 'sfxClap' || key === 'sfxSelect' || key === 'sfxDisappear') {
      relativeVol = 0.5;
    }

    c.volume = Math.min(1, Math.max(0, vol * masterSfxVol * relativeVol));
    c.play().catch(() => {});
  } catch (e) {
    console.warn('SFX play error:', e);
  }
}

/**
 * BGMの再生
 */
let bgmSource = null;
export function playBgm() {
  // BGM_BUFFER がなければ何もしない（準備ができるまで待つ）
  if (!BGM_BUFFER) {
    console.warn('BGM_BUFFER not ready yet.');
    return;
  }

  const ctx = getActx();
  stopBgm();

  bgmSource = ctx.createBufferSource();
  bgmSource.buffer = BGM_BUFFER;
  bgmSource.loop = true;

  const gainNode = ctx.createGain();
  gainNode.gain.value = 0.4; // BGM音量

  bgmSource.connect(gainNode);
  gainNode.connect(ctx.destination);

  bgmSource.start(0);
}

/**
 * BGMの停止
 */
export function stopBgm() {
  if (bgmSource) {
    try {
      bgmSource.stop();
    } catch (e) {}
    bgmSource = null;
  }
}
