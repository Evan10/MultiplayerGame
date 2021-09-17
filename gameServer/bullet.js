module.exports = class bullet {
    constructor(parentid,id, x, y,bulletAngle) {
    this.parentid=parentid;
    this.ID = id;
    this.x = x;
    this.y = y;
    this.bulletRadius = 5;
 
    this.bulletLifespan = 200;

    this.removeBullet = false;
    this.bulletAngle = bulletAngle;
    this.bulletSpeed = 5;
  }

  tick() {
    if(this.bulletLifespan<=0){this.removeBullet=true;}
    this.move();
    this.bulletLifespan--;

  }

  move(){
    this.x += Math.cos(this.bulletAngle)*this.bulletSpeed;
    this.y += Math.sin(this.bulletAngle)*this.bulletSpeed;
  }

  collision(){
    this.removeBullet=true;
  }



}