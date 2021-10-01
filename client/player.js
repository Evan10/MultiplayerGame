
class player {
 

    constructor(id, x, y,player,client,playerName,dead) {
    this.ID = id;
    this.x = x;
    this.y = y;
    this.lastx=x;
    this.lasty=y;
    this.playerAngle;
    this.client=client;
    this.playerRadius = 30;

    this.clientPlayer = player;
    this.playerName = playerName;
    this.PlayerImage=null;

    this.hp = 3;
    this.maxhp = 3;
    this.dead = dead || false;
    this.energy = 5;
    this.maxEnergy =10;
    this.playerspeed=3;
    this.shieldup=false;
    this.shieldLifespan = 0;
    this.mouseAngle = 0;
    this.king=false;

  }

  tick() {
    if(this.dead){return;}
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
   this.stayInMap();
  } 
  stayInMap(){
    this.x = this.x > this.client.gameMapSize.w ? this.client.gameMapSize.w : this.x < 0 ? 0 : this.x; 
    this.y = this.y > this.client.gameMapSize.h ? this.client.gameMapSize.h : this.y < 0 ? 0 : this.y; 
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

 
    this.drawPlayer(cxt);
    this.drawPlayerName(cxt);
    this.drawhealthbar(cxt);
    this.drawenergybar(cxt);
    if(this.shieldup){
    this.drawshield(cxt);
    }
  }
  drawPlayer(cxt){

    if(this.PlayerImage!=null){
      cxt.save();
      cxt.translate(this.x,this.y);
      cxt.rotate(this.mouseAngle)
      cxt.drawImage(this.PlayerImage,0,this.king?20:0,20,20,-this.playerRadius-10,-this.playerRadius-5,12+this.playerRadius*2,11+this.playerRadius*2);
      cxt.restore();
  }else{
    cxt.beginPath();  
    cxt.fillStyle=this.king?"rgb(255, 215, 0, 1)":`rgb(100,100,100,1)`;
    cxt.arc(this.x,this.y,this.playerRadius,0,Math.PI*2,false);
    cxt.stroke();
    cxt.fill();
    }
  }

drawshield(cxt){
let startangle = this.mouseAngle-(Math.PI/3);
let endangle = this.mouseAngle+(Math.PI/3);
cxt.beginPath();
cxt.fillStyle=this.king?"rgb(255, 215, 0, 1)":`rgb(100,100,100,1)`; 
cxt.arc(this.x, this.y,this.playerRadius+10,startangle,endangle,false);
cxt.arc(this.x, this.y,this.playerRadius+5,endangle,startangle,true);
cxt.closePath();
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
    let boxwidth = (this.playerRadius*2/this.maxEnergy);
    let energySpacing = 3;
    let bx = this.x-this.playerRadius-(this.maxEnergy*energySpacing/2);
    let by = this.y+this.playerRadius+10;
    
    for(let i = 0 ; i < this.energy ; i++){
        cxt.fillStyle="rgba(0,0,255,1)"
        cxt.fillRect(bx+(i*boxwidth)+(i*energySpacing),by,boxwidth,(this.playerRadius/3));
    }

}
drawhealthbar(cxt){
  let boxwidth = (this.playerRadius*2/this.maxhp);
  let healthbarSpacing = 3;
  let bx = this.x-this.playerRadius-(this.maxhp*healthbarSpacing/2);
  let by = this.y-this.playerRadius-20;
 
  for(let i = 0 ; i < this.hp ; i++){
      cxt.fillStyle="rgba(200,0,0,1)"
      cxt.fillRect(bx+(i*boxwidth)+(i*healthbarSpacing),by,boxwidth,(this.playerRadius/3));
  }

}

drawPlayerName(cxt){
  cxt.save();
  let nx = this.x;
  let ny = this.y-this.playerRadius-35;
  cxt.textAlign = 'center';
  cxt.fillStyle = "black";
  cxt.font = '17px serif';
  cxt.fillText(this.playerName,nx,ny);
  cxt.restore();
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

mostKills(){
  this.maxhp = 4;
  this.maxEnergy = 15;
  this.king=true;
}
notMostKills(){
  this.maxhp = 3;
  this.maxEnergy = 10;
  this.king=false;
}

loadPlayerImage(image){
  this.PlayerImage=image;
}

}
