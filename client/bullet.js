class bullet {
    constructor(id, x, y,bulletAngle) {
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
    this.move();
    
  }
  render(){
    cxt.beginPath();  
    cxt.fillStyle="rgb(0,0,0,1)"; 
    cxt.arc(this.x,this.y,this.bulletRadius,0,360,false);
    cxt.fill();
  }

  move(){
    this.x += Math.cos(this.bulletAngle)*this.bulletSpeed;
    this.y += Math.sin(this.bulletAngle)*this.bulletSpeed;
  }

}