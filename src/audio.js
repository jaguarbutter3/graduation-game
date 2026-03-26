// ============================================================
//  audio.js  ─ Web Audio API 管理 & 再生
// ============================================================
import { BGM_BINARY, SFX } from './loader.js';

let _actx = null;
export let BGM_BUFFER = null; // デコード済みのBGMデータ

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
 * ★ ユーザー操作後に呼び出す初期化処理
 * スマホのオーディオ制限を解除し、BGMをデコードする
 */
export async function setupAudio() {
  const ctx = getActx();

  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  if (BGM_BINARY && !BGM_BUFFER) {
    try {
      // slice(0) でコピーを渡す
      BGM_BUFFER = await ctx.decodeAudioData(BGM_BINARY.slice(0));
      console.log('BGM decoded and ready.');
    } catch (e) {
      console.error('BGM decode failed:', e);
    }
  }
}

/**
 * 効果音の再生
 * 特定のSEに対する音量モディファイアを適用して再生
 */
export function playSfx(key, vol = 0.2) {
  const a = SFX[key];
  if (!a) return; // 指定されたSEがなければ無視

  try {
    // Audio要素を複製して再生（連続再生に対応）
    const c = a.cloneNode();
    let modifier = 1.0;

    // 特定の音源がうるさすぎないように調整
    if (key === 'sfxClap') {
      modifier = 0.1;
    }
    if (key === 'sfxSelect') {
      modifier = 0.1;
    }

    // 最終的な音量を計算 (0.0 〜 1.0 の範囲に収める)
    c.volume = Math.min(1, Math.max(0, vol * modifier));

    c.play().catch(() => {
      /* 自動再生制限などで失敗しても無視 */
    });
  } catch (e) {
    console.warn('SFX play error:', e);
  }
}

/**
 * BGMの再生 (Web Audio API を使用)
 */
let bgmSource = null;
export function playBgm() {
  if (!BGM_BUFFER) return;
  const ctx = getActx();

  // 既に再生中なら止める
  stopBgm();

  bgmSource = ctx.createBufferSource();
  bgmSource.buffer = BGM_BUFFER;
  bgmSource.loop = true;

  const gainNode = ctx.createGain();
  gainNode.gain.value = 0.4; // 全体的なBGM音量

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
    } catch (e) {
      // 無視
    }
    bgmSource = null;
  }
}
