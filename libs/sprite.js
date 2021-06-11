export default class Sprite {
  constructor(config) {
    this.config = config;
  }
  load() {
    return new Promise(
      resolve => {
        this.img = new Image();
        this.img.addEventListener('load', resolve, false);
        this.img.src = this.config.src;
      }
    )
  }

  draw(ctx, spriteId, x, y, rotation = 0, scale = [1, 1], opacity = 1) {
    const sprite = this.config.sprites[spriteId];

    if (!sprite) return;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x + sprite.w / 2 * scale[0], y + sprite.h / 2 * scale[1]);
    ctx.rotate(rotation);
    ctx.translate(-x - sprite.w / 2 * scale[0], -y - sprite.h / 2 * scale[1]);
    
    const dx = scale[0] >= 0 ? x : (x - sprite.w) * scale[0];
    const dy = scale[1] >= 0 ? y : (-y - sprite.h) * scale[1];    

    ctx.drawImage(this.img, sprite.x, sprite.y, sprite.w, sprite.h, dx, dy, sprite.w * scale[0], sprite.h * scale[1]);
    ctx.scale(scale[0], scale[1]);
    ctx.restore();
  }
}