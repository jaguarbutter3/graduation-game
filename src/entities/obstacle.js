// ============================================================
//  entities/obstacle.js  ─ 卒業メッセージカード障害物
//
//  ・MESSAGES配列からランダムにメッセージを選んでカードを生成
//  ・カード高さはメッセージ行数で自動計算
//  ・短いカード（低）→ 上ジャンプで避ける
//  ・高いカード（高）→ 下をくぐる（2段ジャンプ）
//  ・画像不要・Canvas描画のみ
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
} from '../config.js';
import { ctx } from '../canvas.js';

export const obstacles = [];

let obsTimer = 0;
let obsInterval = 2.2;

// メッセージインデックスを順番に出す（ランダムではなく順番でメッセージを見せる）
let msgIndex = 0;

function nextMessage() {
  const msg = MESSAGES[msgIndex % MESSAGES.length];
  msgIndex++;
  return msg;
}

export function updateObstacles(dt) {
  obsTimer += dt;
  if (obsTimer >= obsInterval) {
    obsTimer = 0;

    const msg = nextMessage();
    const h = calcCardH(msg);

    // 高さを 0:低, 1:中, 2:高 の3パターンにする
    const level = Math.floor(Math.random() * 3);
    // 高い位置(level 2)なら、プレイヤーが下をくぐれるように y を小さくする
    const yPos = GROUND_Y - h - level * 85;

    obstacles.push({
      x: GAME_W + 60,
      y: yPos,
      w: MSG_CARD_W,
      h,
      msg,
      age: 0,
    });
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.x -= SCROLL_SPD * dt;
    o.age += dt;
    if (o.x < -MSG_CARD_W - 20) obstacles.splice(i, 1);
  }
}

export function drawObstacle(o) {
  const { x, y, w, h, msg } = o;

  ctx.save();

  const drawY = y;

  // --- カード背景 ---
  // 影
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  // グラデーション背景
  const grad = ctx.createLinearGradient(x, drawY, x, drawY + h);
  grad.addColorStop(0, '#fffde8');
  grad.addColorStop(1, '#fff8cc');
  ctx.fillStyle = grad;
  _roundRect(ctx, x, drawY, w, h, MSG_CORNER_R);
  ctx.fill();

  // 枠線
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = '#f0c040';
  ctx.lineWidth = 2.5;
  _roundRect(ctx, x, drawY, w, h, MSG_CORNER_R);
  ctx.stroke();

  // --- fromヘッダー ---
  if (msg.from) {
    // ヘッダー帯
    const hGrad = ctx.createLinearGradient(x, drawY, x, drawY + MSG_HEADER_H);
    hGrad.addColorStop(0, '#f0c040');
    hGrad.addColorStop(1, '#e0a020');
    ctx.fillStyle = hGrad;
    _roundRectTop(ctx, x, drawY, w, MSG_HEADER_H, MSG_CORNER_R);
    ctx.fill();

    // from テキスト
    ctx.font = '900 12px "Noto Sans JP",sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 3;
    ctx.fillText(msg.from, x + w / 2, drawY + MSG_HEADER_H / 2);
    ctx.shadowBlur = 0;
  }

  // --- メッセージ本文 ---
  const headerH = msg.from ? MSG_HEADER_H : 0;
  const textStartY = drawY + headerH + MSG_PAD_Y + MSG_LINE_H / 2;

  ctx.font = `900 ${_fontSize(msg.lines.length)}px "Noto Sans JP",sans-serif`;
  ctx.fillStyle = '#443300';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  msg.lines.forEach((line, i) => {
    ctx.fillText(
      line,
      x + w / 2,
      textStartY + i * MSG_LINE_H,
      w - 16, // 最大幅でクリップ
    );
  });

  ctx.restore();
}

/** 当たり判定矩形を返す（カードより一回り小さい） */
export function getObstacleHitRect(o) {
  const inset = 8;
  return {
    x: o.x + inset,
    y: o.y + inset,
    w: o.w - inset * 2,
    h: o.h - inset * 2,
  };
}

export function resetObstacles() {
  obstacles.length = 0;
  obsTimer = 0;
  obsInterval = 2.2;
  msgIndex = 0;
}

// ------------------------------------------------------------
//  内部ヘルパー
// ------------------------------------------------------------
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

// 上部だけ角丸（ヘッダー用）
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
