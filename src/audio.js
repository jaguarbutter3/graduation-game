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

/**
 * スマホのオーディオ制限を解除 + BGMデコード
 * ユーザー操作のタイミングで必ず呼ぶこと
 */
export async function setupAudio() {
  const ctx = getActx();

  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  // iOS/Android対策：無音バッファで再生許可を確定
  const dummy = ctx.createBufferSource();
  dummy.buffer = ctx.createBuffer(1, 1, 22050);
  dummy.connect(ctx.destination);
  dummy.start(0);

  // BGMデコード（未実施の場合のみ）
  if (BGM_BINARY && !BGM_BUFFER) {
    try {
      BGM_BUFFER = await ctx.decodeAudioData(BGM_BINARY.slice(0));
      console.log('BGM decoded successfully');
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

export function playBgm() {
  if (!BGM_BUFFER) {
    console.warn('BGM_BUFFER not ready.');
    return;
  }
  const ctx = getActx();

  if (ctx.state === 'suspended') {
    ctx.resume().then(() => _startBgmSource(ctx));
  } else {
    _startBgmSource(ctx);
  }
}

function _startBgmSource(ctx) {
  stopBgm();
  bgmSource = ctx.createBufferSource();
  bgmSource.buffer = BGM_BUFFER;
  bgmSource.loop = true;
  const gain = ctx.createGain();
  gain.gain.value = 0.4;
  bgmSource.connect(gain).connect(ctx.destination);
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
