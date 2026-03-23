// ============================================================
//  render/effects.js  ─ ジャンプリング・パーティクル・テキストポップ
// ============================================================
import { GAME_W, GAME_H } from '../config.js';
import { ctx } from '../canvas.js';

// ゲーム中エフェクト
const effects = [];

// クリア演出パーティクル（別配列で管理）
const clearPtcls = [];

// ============================================================
//  スポーン関数
// ============================================================

/** ジャンプ時の足元リング */
export function spawnRing(x, y, color) {
  effects.push({ type: 'ring', x, y, color, life: 0.22, max: 0.22 });
}

/** クラップアイテム取得時のパーティクル＋テキスト */
export function spawnClapFX(x, y) {
  for (let i = 0; i < 7; i++) {
    const a = ((Math.PI * 2) / 7) * i;
    effects.push({
      type: 'pt',
      x,
      y,
      vx: Math.cos(a) * 95,
      vy: Math.sin(a) * 95 - 55,
      color: ['#ffe600', '#ff8800', '#fff', '#ffcc00'][i % 4],
      life: 0.6,
      max: 0.6,
      r: 4,
    });
  }
  effects.push({
    type: 'txt',
    x,
    y: y - 18,
    text: '+100',
    life: 0.7,
    max: 0.7,
    vy: -52,
    color: '#ffe600',
  });
}

/** 障害物衝突時の爆発パーティクル */
export function spawnHitFX(x, y) {
  for (let i = 0; i < 10; i++) {
    const a = ((Math.PI * 2) / 10) * i;
    effects.push({
      type: 'pt',
      x,
      y,
      vx: Math.cos(a) * 130,
      vy: Math.sin(a) * 130,
      color: '#ff3333',
      life: 0.5,
      max: 0.5,
      r: 5,
    });
  }
}

/** クリア演出の紙吹雪 */
export function spawnClearPtcls() {
  for (let i = 0; i < 90; i++) {
    clearPtcls.push({
      x: Math.random() * GAME_W,
      y: GAME_H + 10,
      vx: (Math.random() - 0.5) * 120,
      vy: -(240 + Math.random() * 480),
      color: ['#ffe600', '#ff88ff', '#88ffff', '#fff', '#88ff44'][i % 5],
      r: 3 + Math.random() * 5,
      life: 1.5 + Math.random(),
      max: 2.5,
    });
  }
}

// ============================================================
//  更新
// ============================================================
export function updateEffects(dt) {
  for (let i = effects.length - 1; i >= 0; i--) {
    const e = effects[i];
    e.life -= dt;
    if (e.life <= 0) {
      effects.splice(i, 1);
      continue;
    }
    if (e.type === 'pt') {
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.vy += 320 * dt;
    }
    if (e.type === 'txt') {
      e.y += e.vy * dt;
    }
  }
}

export function updateClearPtcls(dt) {
  clearPtcls.forEach((p) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 250 * dt;
    p.life -= dt;
  });
}

// ============================================================
//  描画
// ============================================================
export function drawEffects() {
  effects.forEach((e) => {
    const t = e.life / e.max;
    ctx.save();
    ctx.globalAlpha = t;

    if (e.type === 'ring') {
      const sc = 1 + (1 - t) * 2.6;
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 3;
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, 16 * sc, 16 * sc * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (e.type === 'pt') {
      ctx.fillStyle = e.color;
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * t, 0, Math.PI * 2);
      ctx.fill();
    }
    if (e.type === 'txt') {
      ctx.font = '900 18px Orbitron,sans-serif';
      ctx.fillStyle = e.color;
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 12;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.text, e.x, e.y);
    }
    ctx.restore();
  });
}

export function drawClearPtcls() {
  clearPtcls.forEach((p) => {
    if (p.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, (p.life / p.max) * 2);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// ============================================================
//  リセット
// ============================================================
export function resetEffects() {
  effects.length = 0;
  clearPtcls.length = 0;
}
