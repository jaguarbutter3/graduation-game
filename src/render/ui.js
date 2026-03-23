// ============================================================
//  render/ui.js  ─ HUD・タイトル・ゲームオーバー・クリア画面
// ============================================================
import { GAME_W, GAME_H, CHAR_LIST, CHAR_LABELS, CHR_FRAMES } from '../config.js';
import { ctx, roundRect, drawSprite } from '../canvas.js';
import * as State from '../state.js';
import { drawClearPtcls } from './effects.js';

// ============================================================
//  共通ボタン
// ============================================================
export function drawButton(cx, cy, label, color) {
  const bw = 210,
    bh = 44,
    bx = cx - bw / 2,
    by = cy - bh / 2;
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = color;
  roundRect(ctx, bx, by, bw, bh, 8);
  ctx.fill();

  ctx.font = 'bold 19px Orbitron,sans-serif';
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('▶  ' + label, cx, cy);

  // 点滅オーバーレイ
  const blink = 0.5 + 0.3 * Math.sin(Date.now() * 0.007);
  ctx.globalAlpha = 1 - blink;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  roundRect(ctx, bx, by, bw, bh, 8);
  ctx.fill();
  ctx.restore();
}

// ============================================================
//  HUD（スコア・タイム・コンボ）
// ============================================================
export function drawHUD() {
  ctx.save();
  ctx.font = 'bold 21px Orbitron,sans-serif';
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 6;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff';
  ctx.fillText('SCORE  ' + String(State.score).padStart(5, '0'), 16, 12);

  ctx.textAlign = 'right';
  ctx.fillStyle = State.timeLeft <= 10 ? '#ff5555' : '#fff';
  ctx.fillText('TIME  ' + State.timeLeft, GAME_W - 16, 12);
  ctx.restore();

  if (State.combo >= 2 && State.comboTime > 0) {
    const t = Math.min(1, (State.comboTime / 1.2) * 3);
    ctx.save();
    ctx.globalAlpha = t;
    ctx.font = '900 27px Orbitron,sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#ffe600';
    ctx.fillText(State.combo + ' COMBO!!', GAME_W / 2, 46);
    ctx.restore();
  }
}

// ============================================================
//  赤フラッシュ
// ============================================================
export function drawFlash() {
  if (State.flashAlpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = State.flashAlpha;
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(0, 0, GAME_W, GAME_H);
  ctx.restore();
  State.set('flashAlpha', Math.max(0, State.flashAlpha - 0.06));
}

// ============================================================
//  タイトル画面
// ============================================================
export function drawTitle() {
  ctx.fillStyle = 'rgba(0,0,0,0.52)';
  ctx.fillRect(0, 0, GAME_W, GAME_H);
  ctx.save();
  ctx.textAlign = 'center';

  ctx.font = '900 52px "Noto Sans JP",sans-serif';
  ctx.fillStyle = '#ffe600';
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 22;
  ctx.fillText('卒業ランナー', GAME_W / 2, 82);

  ctx.font = 'bold 17px Orbitron,sans-serif';
  ctx.fillStyle = '#fff';
  ctx.shadowBlur = 0;
  ctx.fillText('Graduation Run', GAME_W / 2, 120);

  // キャラ選択
  ctx.font = '900 15px "Noto Sans JP",sans-serif';
  ctx.fillStyle = '#eee';
  ctx.fillText('── キャラクターを選んでね ──', GAME_W / 2, 158);

  const iconSz = 56,
    gap = 14;
  const totalW = CHAR_LIST.length * (iconSz + gap) - gap;
  const sx = (GAME_W - totalW) / 2;

  CHAR_LIST.forEach((col, i) => {
    const ix = sx + i * (iconSz + gap);
    const iy = 170;
    const isSelected = i === State.selectedChar;

    if (isSelected) {
      ctx.save();
      ctx.strokeStyle = '#ffe600';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ffe600';
      ctx.shadowBlur = 12;
      roundRect(ctx, ix - 3, iy - 3, iconSz + 6, iconSz + 6, 8);
      ctx.stroke();
      ctx.restore();
    }

    drawSprite('imgCharacters', CHR_FRAMES[col]['idle'], ix, iy, iconSz, iconSz);

    ctx.save();
    ctx.font = '900 11px "Noto Sans JP",sans-serif';
    ctx.fillStyle = isSelected ? '#ffe600' : '#ccc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(CHAR_LABELS[i], ix + iconSz / 2, iy + iconSz + 4);
    ctx.restore();
  });

  ctx.font = '900 14px "Noto Sans JP",sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('← → キーでキャラ変更', GAME_W / 2, 258);
  ctx.fillText('スペース・タップ → ゲーム開始', GAME_W / 2, 280);
  ctx.fillText('コインに触れるとクラップ！60秒走りきれば卒業！', GAME_W / 2, 305);
  ctx.restore();

  drawButton(GAME_W / 2, GAME_H - 52, 'GAME START', '#44ee88');
}

// ============================================================
//  ゲームオーバー画面
// ============================================================
export function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.80)';
  ctx.fillRect(0, 0, GAME_W, GAME_H);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '900 54px Orbitron,sans-serif';
  ctx.fillStyle = '#ff3333';
  ctx.shadowColor = '#ff0000';
  ctx.shadowBlur = 28;
  ctx.fillText('GAME OVER', GAME_W / 2, GAME_H / 2 - 58);

  ctx.font = '900 26px "Noto Sans JP",sans-serif';
  ctx.fillStyle = '#ffaaaa';
  ctx.shadowColor = '#ff0000';
  ctx.shadowBlur = 10;
  ctx.fillText('落単決定...', GAME_W / 2, GAME_H / 2 + 4);

  ctx.font = 'bold 20px Orbitron,sans-serif';
  ctx.fillStyle = '#aaa';
  ctx.shadowBlur = 0;
  ctx.fillText('SCORE  ' + String(State.score).padStart(5, '0'), GAME_W / 2, GAME_H / 2 + 50);
  ctx.restore();

  drawButton(GAME_W / 2, GAME_H / 2 + 104, 'RETRY', '#ff44aa');
}

// ============================================================
//  クリア画面
// ============================================================
export function drawClear() {
  ctx.fillStyle = 'rgba(0,0,0,0.74)';
  ctx.fillRect(0, 0, GAME_W, GAME_H);
  drawClearPtcls();
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '900 58px "Noto Sans JP",sans-serif';
  ctx.fillStyle = '#ffe600';
  ctx.shadowColor = '#ff9900';
  ctx.shadowBlur = 30;
  ctx.fillText('祝・卒業！', GAME_W / 2, GAME_H / 2 - 70);

  ctx.font = '900 26px "Noto Sans JP",sans-serif';
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#00dd88';
  ctx.shadowBlur = 14;
  ctx.fillText('完走おめでとう！', GAME_W / 2, GAME_H / 2 - 8);

  ctx.font = 'bold 21px Orbitron,sans-serif';
  ctx.fillStyle = '#88ffcc';
  ctx.shadowColor = '#00ffaa';
  ctx.shadowBlur = 8;
  ctx.fillText('FINAL SCORE  ' + State.score, GAME_W / 2, GAME_H / 2 + 44);
  ctx.restore();

  drawButton(GAME_W / 2, GAME_H / 2 + 102, 'PLAY AGAIN', '#44ffaa');
}
