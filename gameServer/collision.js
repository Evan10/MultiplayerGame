

const Player = require("./player.js");
const Bullet = require("./bullet.js");

module.exports = class collision{

constructor(playerlist,bulletlist){
this.playerlist=playerlist;
this.bulletlist=bulletlist;
}

tick(){
    
for(let i = this.bulletlist.length-1; i >= 0 ; i --){
    let b = this.bulletlist[i];
    for(let j = this.playerlist.length-1; j >= 0 ; j --){
    let p = this.playerlist[j];
    if(!b.removeBullet && b.parentid!=p.ID && this.circleCollision(b.x,b.y,b.bulletRadius,p.x,p.y,p.playerRadius)){
     b.collision();
    if(!p.shieldUp){
        p.collision();
    }else{
        let angle = Math.atan2(b.y-p.y,b.x-p.x);
        let shieldstartangle=p.mouseAngle-Math.PI/3;
        let shieldendangle=p.mouseAngle+Math.PI/3;   
        if(!this.angle_is_between_angles(this.toDegrees(angle),this.toDegrees(shieldstartangle),this.toDegrees(shieldendangle))){
            p.collision();

        }
    }
    }
    }
}
}

circleCollision(x1,y1,r1,x2,y2,r2){
   return this.dist(x1,y1,x2,y2) < r1 + r2;
}

dist(x1,y1,x2,y2){
return Math.sqrt(Math.pow((x2-x1),2)+Math.pow((y2-y1),2));
}

angle_1to360(angle){

    angle=(angle % 360) + (angle-Math.trunc(angle));
    if(angle>0.0)
    return angle;
    else
    return angle + 360.0;
    }

angle_is_between_angles(N, a, b) {
    N = this.angle_1to360(N);
    a = this.angle_1to360(a);
    b = this.angle_1to360(b);
   
    if (a < b)
    return a <= N && N <= b;
    return a <= N || N <= b;
    }

toDegrees(radians){
    return (radians * 180) / Math.PI;
}

}
