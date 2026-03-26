// ============================================================
//  audio.js  ─ 軽量化・パフォーマンス優先版
// ============================================================
import { BGM_BINARY, SFX } from './loader.js';

let _actx = null;
export let BGM_BUFFER = null;

let bgmSource = null;
let bgmGainNode = null;

// setupAudio の呼び出しを1回に抑えるための Promise キャッシュ
let _setupPromise = null;

export function getActx() {
  if (!_actx) {
    _actx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _actx;
}

/**
 * 初期化：AudioContext のアンロック + BGMデコードを1回だけ行う
 * 2回目以降は同じ Promise を返すのでデコードは走らない
 */
export async function setupAudio() {
  if (_setupPromise) return _setupPromise; // ← 2回目以降はキャッシュ済みを返す

  _setupPromise = (async () => {
    const ctx = getActx();
    if (ctx.state === 'suspended') await ctx.resume();

    // 無音再生でiOSの制限解除
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);

    // BGMデコード（一度きり）
    if (BGM_BINARY && !BGM_BUFFER) {
      try {
        BGM_BUFFER = await ctx.decodeAudioData(BGM_BINARY);
        console.log('BGM Ready');
      } catch (e) {
        console.error('BGM Decode Error:', e);
      }
    }
  })();

  return _setupPromise;
}

/**
 * 効果音再生：スマホ負荷軽減のため cloneNode を抑制
 */
export function playSfx(key, vol = 1.0) {
  const a = SFX[key];
  if (!a) return;

  try {
    const masterSfxVol = 0.15;
    let relativeVol = 1.0;
    if (key === 'sfxClap' || key === 'sfxSelect' || key === 'sfxDisappear') {
      relativeVol = 0.5;
    }

    if (!a.paused) {
      a.currentTime = 0;
    }

    a.volume = Math.min(1, Math.max(0, vol * masterSfxVol * relativeVol));
    a.play().catch(() => {});
  } catch (e) {}
}

/**
 * BGM再生
 * ★ async にして setupAudio() のデコード完了を待ってから再生する
 *    これによりスマホの「ユーザー操作後にデコードが間に合わない」問題を解消
 *    2回目以降は _setupPromise のキャッシュがあるので即通過する
 */
export async function playBgm() {
  await setupAudio(); // デコード済みなら即return、未済なら待つ

  if (!BGM_BUFFER) return; // デコード失敗時はサイレントに諦める

  const ctx = getActx();
  stopBgm();

  bgmSource = ctx.createBufferSource();
  bgmSource.buffer = BGM_BUFFER;
  bgmSource.loop = true;

  bgmGainNode = ctx.createGain();
  bgmGainNode.gain.value = 0.35;

  bgmSource.connect(bgmGainNode);
  bgmGainNode.connect(ctx.destination);
  bgmSource.start(0);
}

/**
 * BGM停止
 */
export function stopBgm() {
  if (bgmSource) {
    try {
      bgmSource.stop();
    } catch (e) {}
    bgmSource = null;
  }
}
