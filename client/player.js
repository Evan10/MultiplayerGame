
class player {
    constructor(id, x, y,player,client) {
    this.ID = id;
    this.x = x;
    this.y = y;
    this.lastx=x;
    this.lasty=y;
    this.playerAngle;
    this.client=client;
    this.playerRadius = 30;

    this.clientPlayer = player;

    this.hp = 3;
    this.dead = false;
    this.energy = 10;
    this.maxEnergy =10;
    this.playerspeed=3;
    this.shieldup=false;
    this.shieldLifespan = 0;
    this.mouseAngle = 0;
  }

  tick() {
    if(this.clientPlayer){
      this.clientmovement();
    }else{
      this.playermovement();
    }
  }

  clientmovement(){
    let xchange=0;
    let ychange=0;
    let move = false;
  if(this.client.getkeys()[0]){ychange-=1;move=true;}
  if(this.client.getkeys()[1]){xchange-=1;move=true;}
  if(this.client.getkeys()[2]){ychange+=1;move=true;}
  if(this.client.getkeys()[3]){xchange+=1;move=true;}
   if(move){ 
    this.playerAngle = Math.atan2(ychange,xchange);
    this.x+=Math.cos(this.playerAngle)*this.playerspeed;
    this.y+=Math.sin(this.playerAngle)*this.playerspeed;
   }
  } 

  playermovement(){
    this.playerAngle= Math.atan2(this.y-this.lasty,this.x-this.lastx);
    if(this.y != this.lasty || this.x != this.lastx){
    this.x+=Math.cos(this.playerAngle)*this.playerspeed;
    this.y+=Math.sin(this.playerAngle)*this.playerspeed;
    }
  }

  render(cxt){
    if(this.dead){return;}
    cxt.beginPath();  
    cxt.fillStyle=`rgb(100,100,100,1)`;
    cxt.strokeStyle = "rgba(0,0,0,0)"; 
    cxt.arc(this.x,this.y,this.playerRadius,0,Math.PI*2,false);
    cxt.fill();
    this.drawhealthbar(cxt);
    this.drawenergybar(cxt);
    if(this.shieldup){
    this.drawshield(cxt);
    }
  }
  
drawshield(cxt){
let startangle = this.mouseAngle-(Math.PI/3);
let endangle = this.mouseAngle+(Math.PI/3);
cxt.beginPath();
cxt.fillStyle="rgb(100,100,100,1)"; 
cxt.arc(this.x, this.y,this.playerRadius+10,startangle,endangle,false);
cxt.arc(this.x, this.y,this.playerRadius+5,endangle,startangle,true);
cxt.stroke();
cxt.fill();
this.drawshieldlifespan(cxt);
}
drawshieldlifespan(cxt){
  let timeleft = this.shieldLifespan - Date.now();
  timeleft = timeleft <=0 ? 0: timeleft;
  let radian = (2*Math.PI)*(timeleft/1000);

  cxt.beginPath();  
  cxt.fillStyle="rgb(200,200,200,1)"; 
  cxt.moveTo(this.x,this.y);
  cxt.arc(this.x,this.y,this.playerRadius/2,0,radian,false);
  cxt.moveTo(this.x,this.y);
  cxt.fill();
}

drawenergybar(cxt){
    let bx = this.x-this.playerRadius-this.maxEnergy*1.5;
    let by = this.y+this.playerRadius+10;
    let boxwidth = this.playerRadius/5;
    for(let i = 0 ; i < this.energy ; i++){
        cxt.fillStyle="rgba(0,0,255,1)"
        cxt.fillRect(bx+(i*boxwidth)+((i+1)*3),by,boxwidth,(this.playerRadius/3));
    }

}
drawhealthbar(cxt){
  let bx = this.x-this.playerRadius-5;
  let by = this.y-this.playerRadius-20;
  let boxwidth = this.playerRadius/1.5;
  for(let i = 0 ; i < this.hp ; i++){
      cxt.fillStyle="rgba(200,0,0,1)"
      cxt.fillRect(bx+(i*boxwidth)+((i+1)*3),by,boxwidth,(this.playerRadius/3));
  }

}

setposition(x,y){
this.lastx=x;
this.lasty=y;
this.x=x;
this.y=y;
}

turnonshield(){
  this.shieldLifespan = Date.now()+1000;//1second
  this.shieldup=true;
}


turnoffshield(){
  this.shieldLifespan = 0;
  this.shieldup=false;
}


}
