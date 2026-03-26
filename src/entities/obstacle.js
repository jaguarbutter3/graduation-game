// ============================================================
//  obstacle.js  ─ 障害物（メッセージカード）＆ リズム生成管理
// ============================================================
import {
  GAME_W,
  GROUND_Y,
  SCROLL_SPD,
  MESSAGES,
  MSG_CARD_W,
  MSG_LINE_H,
  MSG_PAD_Y,
  MSG_HEADER_H,
  MSG_CORNER_R,
  calcCardH,
  BEAT_SEC, // config.js で定義した 60/125 (0.48s)
} from '../config.js';
import { ctx } from '../canvas.js';
import * as State from '../state.js';
import { spawnClap } from './clap.js';

export const obstacles = [];

// タイマー類
let beatTimer = 0; // アイテム（BPM）用
let totalBeats = 0;
let obsTimer = 0; // 障害物（2.2秒間隔）用
let obsInterval = 2.2;
let msgIndex = 0;

/**
 * 更新ロジック
 */
export function updateObstacles(dt) {
  // --- 1. リズム管理（アイテム生成：4拍に1回） ---
  beatTimer += dt;
  if (beatTimer >= BEAT_SEC) {
    beatTimer -= BEAT_SEC;
    totalBeats++;

    // 4つ打ちの「1拍目」のタイミングで楽器を出す
    const beatInBar = ((totalBeats - 1) % 4) + 1;
    if (beatInBar === 1) {
      spawnClap();
    }
  }

  // --- 2. 障害物管理（以前の「2.2秒」の間隔を優先） ---
  obsTimer += dt;
  if (obsTimer >= obsInterval) {
    obsTimer = 0;

    // メッセージが残っている場合のみ生成
    if (msgIndex < MESSAGES.length) {
      const msg = MESSAGES[msgIndex];
      const h = calcCardH(msg);

      // 以前の感覚に近い「3段階の高さ」
      const level = Math.floor(Math.random() * 3);
      const yPos = GROUND_Y - h - level * 85;

      obstacles.push({
        x: GAME_W + 60,
        y: yPos,
        w: MSG_CARD_W,
        h,
        msg,
        age: 0,
      });

      msgIndex++;
      // 残り数をUI用に更新
      State.set('messagesLeft', MESSAGES.length - msgIndex);
    }
  }

  // --- 3. 移動・削除ロジック（共通） ---
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.x -= SCROLL_SPD * dt;
    o.age += dt;

    // 画面左端から完全に消えたら削除
    if (o.x < -MSG_CARD_W - 50) {
      obstacles.splice(i, 1);
    }
  }
}

/**
 * 描画ロジック
 */
export function drawObstacle(o) {
  const { x, y, w, h, msg } = o;
  ctx.save();
  const drawY = y;

  // カードの影
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  // カード本体のグラデーション
  const grad = ctx.createLinearGradient(x, drawY, x, drawY + h);
  grad.addColorStop(0, '#fffde8');
  grad.addColorStop(1, '#fff8cc');
  ctx.fillStyle = grad;
  _roundRect(ctx, x, drawY, w, h, MSG_CORNER_R);
  ctx.fill();

  // 影をリセットして枠線を描画
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = '#f0c040';
  ctx.lineWidth = 2.5;
  _roundRect(ctx, x, drawY, w, h, MSG_CORNER_R);
  ctx.stroke();

  // ヘッダーがある場合（差出人など）
  if (msg.from) {
    const hGrad = ctx.createLinearGradient(x, drawY, x, drawY + MSG_HEADER_H);
    hGrad.addColorStop(0, '#f0c040');
    hGrad.addColorStop(1, '#e0a020');
    ctx.fillStyle = hGrad;
    _roundRectTop(ctx, x, drawY, w, MSG_HEADER_H, MSG_CORNER_R);
    ctx.fill();

    ctx.font = '900 12px "Noto Sans JP",sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 3;
    ctx.fillText(msg.from, x + w / 2, drawY + MSG_HEADER_H / 2);
    ctx.shadowBlur = 0;
  }

  // メッセージ本文
  const headerH = msg.from ? MSG_HEADER_H : 0;
  const textStartY = drawY + headerH + MSG_PAD_Y + MSG_LINE_H / 2;
  ctx.font = `900 ${_fontSize(msg.lines.length)}px "Noto Sans JP",sans-serif`;
  ctx.fillStyle = '#443300';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  msg.lines.forEach((line, i) => {
    ctx.fillText(line, x + w / 2, textStartY + i * MSG_LINE_H, w - 16);
  });
  ctx.restore();
}

/**
 * 当たり判定用の矩形を返す（少し甘めに設定）
 */
export function getObstacleHitRect(o) {
  const inset = 8;
  return {
    x: o.x + inset,
    y: o.y + inset,
    w: o.w - inset * 2,
    h: o.h - inset * 2,
  };
}

/**
 * リセット（ゲームリスタート時）
 */
export function resetObstacles() {
  obstacles.length = 0;
  beatTimer = 0;
  totalBeats = 0;
  obsTimer = 0;
  msgIndex = 0;
  State.set('messagesLeft', MESSAGES.length);
}

// --- 内部ヘルパー関数 ---

function _fontSize(lineCount) {
  if (lineCount <= 1) return 14;
  if (lineCount <= 2) return 13;
  if (lineCount <= 3) return 12;
  return 11;
}

function _roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function _roundRectTop(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
