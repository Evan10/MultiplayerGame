class bullet {
  constructor(id, x, y, bulletAngle, bulletImages) {
    this.ID = id;

    this.x = x;
    this.y = y;
    this.bulletRadius = 5;

    this.bulletLifespan = 200;

    this.removeBullet = false;
    this.bulletAngle = bulletAngle;
    this.bulletSpeed = 5;
    this.animationFrame = 0;
    this.frameUpdateRate = 0;
    this.bulletImage = bulletImages;
  }

  tick() {
    this.move();
    if (this.frameUpdateRate >= 2) {
      this.frameUpdateRate = 0;
      this.animationFrame=this.animationFrame>=3?0:this.animationFrame+1;
    } else {
      this.frameUpdateRate++;
    }
  }
  render(cxt) {
   
    if (this.bulletImage != null) {
      cxt.save();
      cxt.translate(this.x, this.y);
      cxt.rotate(this.bulletAngle - Math.PI / 2);
      cxt.drawImage(
        this.bulletImage,
        Math.floor(this.animationFrame / 2)* 18,
        (this.animationFrame % 2) * 18,
        18,
        18,
        -8 - this.bulletRadius * 2,
        -16 - this.bulletRadius * 2,
        this.bulletRadius * 8,
        this.bulletRadius * 8
      );
      cxt.restore();
    } else {
      cxt.beginPath();
      cxt.fillStyle = "rgb(0,0,0,1)";
      cxt.arc(this.x, this.y, this.bulletRadius, 0, 360, false);
      cxt.fill();
    }
  }

  move() {
    this.x += Math.cos(this.bulletAngle) * this.bulletSpeed;
    this.y += Math.sin(this.bulletAngle) * this.bulletSpeed;
  }
}
