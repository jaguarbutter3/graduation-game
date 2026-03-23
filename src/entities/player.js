// ============================================================
//  entities/player.js  ─ プレイヤーの状態・更新・描画
// ============================================================
import { GROUND_Y, GRAVITY, JUMP_VY, PLR_W, PLR_H, PLR_DRAW } from '../config.js';
import { drawSprite } from '../canvas.js';
import { playSfx } from '../audio.js';
import * as State from '../state.js';
import { spawnRing } from '../render/effects.js';

export const player = {
  x: 80,
  y: GROUND_Y - PLR_H,
  vy: 0,
  jumpCount: 0,
  onGround: false,
  animKey: 'idle',
  animTimer: 0,
  walkFlip: false,
  sqX: 1,
  sqY: 1,
  sqTimer: 0,
  hitTimer: 0,

  reset() {
    this.x = 80;
    this.y = GROUND_Y - PLR_H;
    this.vy = 0;
    this.jumpCount = 0;
    this.onGround = false;
    this.animKey = 'idle';
    this.animTimer = 0;
    this.walkFlip = false;
    this.sqX = 1;
    this.sqY = 1;
    this.sqTimer = 0;
    this.hitTimer = 0;
  },

  jump() {
    if (this.jumpCount >= 2) return;
    this.vy = JUMP_VY;
    this.jumpCount++;
    this.sqX = 0.72;
    this.sqY = 1.35;
    this.sqTimer = 0.12;
    spawnRing(this.x + PLR_W / 2, this.y + PLR_H, this.jumpCount === 2 ? '#ff44ff' : '#44ffff');
    playSfx(this.jumpCount === 2 ? 'sfxJump2' : 'sfxJump');
  },

  update(dt) {
    // 物理
    if (!this.onGround) this.vy += GRAVITY * dt;
    this.y += this.vy * dt;

    // 着地
    if (this.y >= GROUND_Y - PLR_H) {
      if (this.vy > 400) {
        this.sqX = 1.35;
        this.sqY = 0.72;
        this.sqTimer = 0.09;
      }
      this.y = GROUND_Y - PLR_H;
      this.vy = 0;
      this.jumpCount = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // スクィッシュ復元
    if (this.sqTimer > 0) {
      this.sqTimer -= dt;
      if (this.sqTimer <= 0) {
        this.sqX = 1;
        this.sqY = 1;
      }
    }

    // ヒット演出タイマー
    if (this.hitTimer > 0) this.hitTimer -= dt;

    // アニメキー決定
    if (this.hitTimer > 0) {
      this.animKey = 'hit';
    } else if (!this.onGround) {
      this.animKey = 'jump';
    } else {
      this.animTimer += dt;
      if (this.animTimer >= 1 / 8) {
        this.animTimer = 0;
        this.walkFlip = !this.walkFlip;
      }
      this.animKey = this.walkFlip ? 'walk_b' : 'walk_a';
    }
  },

  draw() {
    // ヒット点滅（偶数フレームは非表示）
    if (this.hitTimer > 0 && Math.floor(this.hitTimer * 12) % 2 === 0) return;
    const src = State.CHR[this.animKey];
    if (!src) return;
    const dw = PLR_DRAW * this.sqX;
    const dh = PLR_DRAW * this.sqY;
    const cx = this.x + PLR_W / 2;
    const cy = this.y + PLR_H / 2;
    drawSprite('imgCharacters', src, cx - dw / 2, cy - dh / 2, dw, dh);
  },

  /** 当たり判定矩形を返す */
  rect() {
    return { x: this.x + 6, y: this.y + 4, w: PLR_W - 12, h: PLR_H - 4 };
  },
};
