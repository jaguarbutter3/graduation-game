// ============================================================
//  entities/obstacle.js  ─ 障害物（スライム）の管理
// ============================================================
import { GAME_W, GROUND_Y, SCROLL_SPD, OBS_DRAW, ENM } from '../config.js';
import { ctx, drawSprite } from '../canvas.js';

export const obstacles = [];

let obsTimer = 0;
let obsInterval = 2.1; // スポーン間隔（秒）。徐々に短くなる
let animTimer = 0;
let animFlip = false;

/** 障害物のスポーン・移動・画面外削除 */
export function updateObstacles(dt) {
  obsTimer += dt;
  if (obsTimer >= obsInterval) {
    obsTimer = 0;
    obsInterval = Math.max(1.0, obsInterval - 0.015);
    obstacles.push({ x: GAME_W + 60, y: GROUND_Y - OBS_DRAW });
  }

  // アニメ切り替え（5fps）
  animTimer += dt;
  if (animTimer >= 1 / 5) {
    animTimer = 0;
    animFlip = !animFlip;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= SCROLL_SPD * dt;
    if (obstacles[i].x < -100) obstacles.splice(i, 1);
  }
}

/** 障害物を1体描画 */
export function drawObstacle(o) {
  const src = animFlip ? ENM.walk_b : ENM.walk_a;
  drawSprite('imgEnemies', src, o.x, o.y, OBS_DRAW, OBS_DRAW, true);

  // 「落単」テキスト重ね描き
  ctx.save();
  ctx.font = '900 12px "Noto Sans JP",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff0000';
  ctx.shadowBlur = 6;
  ctx.fillStyle = '#fff';
  ctx.fillText('落単', o.x + OBS_DRAW / 2, o.y + OBS_DRAW / 2);
  ctx.restore();
}

/** リセット（ゲーム再スタート時） */
export function resetObstacles() {
  obstacles.length = 0;
  obsTimer = 0;
  obsInterval = 2.1;
  animTimer = 0;
  animFlip = false;
}
