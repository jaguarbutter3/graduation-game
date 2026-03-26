// ============================================================
//  audio.js  ─ Web Audio API 管理 & 再生
// ============================================================
import { BGM_BINARY, SFX } from './loader.js';

let _actx = null;
export let BGM_BUFFER = null;

export function getActx() {
  if (!_actx) {
    _actx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _actx;
}

export async function setupAudio() {
  const ctx = getActx();
  if (ctx.state === 'suspended') await ctx.resume();
  if (BGM_BINARY && !BGM_BUFFER) {
    try {
      BGM_BUFFER = await ctx.decodeAudioData(BGM_BINARY.slice(0));
    } catch (e) {
      console.error('BGM decode error:', e);
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
    let masterSfxVol = 0.2;

    let relativeVol = 1.0;
    if (key === 'sfxClap' || key === 'sfxSelect' || key === 'sfxDisappear') {
      relativeVol = 0.5;
    }

    c.volume = Math.min(1, Math.max(0, vol * masterSfxVol * relativeVol));

    c.play().catch(() => {});
  } catch (e) {
    console.warn('SFX play error:', e);
  }
}

let bgmSource = null;
export async function playBgm() {
  const ctx = getActx();
  if (ctx.state === 'suspended') await ctx.resume();
  if (!BGM_BUFFER && BGM_BINARY) {
    try {
      BGM_BUFFER = await ctx.decodeAudioData(BGM_BINARY.slice(0));
    } catch (e) {
      return;
    }
  }
  if (!BGM_BUFFER) return;

  stopBgm();
  bgmSource = ctx.createBufferSource();
  bgmSource.buffer = BGM_BUFFER;
  bgmSource.loop = true;

  const gainNode = ctx.createGain();
  gainNode.gain.value = 0.4; // BGMの音量

  bgmSource.connect(gainNode);
  gainNode.connect(ctx.destination);
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
