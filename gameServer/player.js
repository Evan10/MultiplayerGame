
const Bullet = require("./bullet.js");
module.exports = class player {
    constructor(id, x, y, socket, game,playerName,bot) {
    this.game = game;
    this.bot = bot ||false;
    if(!bot){
    this.socket=socket;
    this.socket.on("keys", (keys) => {
        this.keys=keys;
    });

    this.socket.on("mousepos", (mousePos) => {
        this.mousePosistion=mousePos;
    });
    this.socket.on("mousebutton", (mouse) => {
        this.mouseButtons=mouse;

        this.mouseButtonsHeld[1]=mouse[1]?this.mouseButtonsHeld[1]:false;
        this.mouseButtonsHeld[0]=mouse[0]?this.mouseButtonsHeld[0]:false;
    });
    socket.on('disconnect', () => {
        let idx = game.players.indexOf(this);
        this.playerKills=0;
        game.players.splice(idx, 1);
        game.setMapSize();
        game.io.to(game.ID).emit("player_left",socket.userID);
    });
    socket.on("canvasSize", (size)=>{ this.canvasSize = size; })
    }
    this.ID = id;
    this.x = x;
    this.y = y;
    this.canvasSize = {};
    this.playerRadius = 30;
    this.playerName=playerName;

    this.playerKills = 0;

    this.shieldUp = false;
    this.shieldstart=0;
    this.hp = 3;
    this.maxhp = 3;
    this.dead = false;
    this.energy = 5;
    this.lastEnergyUseTime = Date.now()+1000;
    this.energyRegenRate = 750;//.75s per energy
    this.maxEnergy=10;

    this.playerSpeed=3;
    this.playerAngle = 0;
    this.botWanderTimer=0;

    this.bulletCooldown = 0;

    this.tp_distance = 200;
    this.tp_cooldown = 0;

    this.mouseButtons = [false, false];
    this.mouseButtonsHeld = [false, false]; //true after first use of buttons
    this.mousePosistion = {
      x: 0,
      y: 0,
    };
    this.mouseAngle = 0;//radians
    this.keys = [false,false,false,false,false];

    if(this.bot){
    this.messageIntervalID = setInterval(()=>{
      let insults = ["UR BAD","Trash","NOOOOOOOB","FIGHT ME NOOB","IM BETTER THAN YOU","STOP PLAYING THIS GAME","U UGLY","MY GRANDMA IS BETTER THAN YOU"];
      this.sendChat(insults[Math.floor(Math.random()*insults.length)])
    },2000)
  }
  }

  tick() {
    if(!this.bot){
      this.calculateMouseAngle();
    }
      this.regenerateEnergy();
      this.shield();
      this.move();
      this.teleport();
      this.shootBullet();
      if(this.bot){
        this.botAI();
      }
  }

  move(){
    let xchange=0;
    let ychange=0;
    let move = false;
  if(this.keys[0]){ychange-=1;move=true;}
  if(this.keys[1]){xchange-=1;move=true;}
  if(this.keys[2]){ychange+=1;move=true;}
  if(this.keys[3]){xchange+=1;move=true;}

   if(move){
    this.playerAngle = Math.atan2(ychange,xchange);
    this.x+=Math.cos(this.playerAngle)*this.playerSpeed;
     this.y+=Math.sin(this.playerAngle)*this.playerSpeed;
   }
   this.stayInMap();
  }

  stayInMap(){
    this.x = this.x > this.game.gameMapSize.w ? this.game.gameMapSize.w : this.x < 0 ? 0 : this.x; 
    this.y = this.y > this.game.gameMapSize.h ? this.game.gameMapSize.h : this.y < 0 ? 0 : this.y; 
  }

  teleport(){
    if(!this.shieldUp && this.energy >= 3 && this.tp_cooldown - Date.now() <= 0 ){

    if(this.keys[4]){
    let lastx=this.x ,lasty=this.y;
    this.tp_cooldown = Date.now() +500;//4 second cooldown   
    this.x+= Math.cos(this.mouseAngle)*this.tp_distance;
    this.y+= Math.sin(this.mouseAngle)*this.tp_distance;
    this.energy-=3;
    this.game.io.to(this.game.ID).emit("Teleport",{id:this.ID,lastx:lastx,lasty:lasty,x:this.x,y:this.y,angle:this.mouseAngle});
    this.setEnergyRegenTime(2000);
    }
   }
  }

  setEnergyRegenTime(ms) {
    // works in milliseconds
    this.lastEnergyUseTime = Date.now() + ms;
  }

  regenerateEnergy() {
    if (this.lastEnergyUseTime <  Date.now()) {//ms

        this.setEnergyRegenTime(this.energyRegenRate); //1 second delay when regening energy
      if(this.energy<this.maxEnergy)this.energy++;
    }
  }

  shootBullet() {
    if (this.energy >= 1 && !this.shieldUp && this.mouseButtons[0] && this.bulletCooldown <= Date.now()) {
    
        this.game.addBullet(this.ID,this.x,this.y,this.mouseAngle,this);
        this.mouseButtonsHeld[0]=true;
        this.bulletCooldown=Date.now()+400;//.4 seconds between shots
    this.energy--;
    this.setEnergyRegenTime(2000);
    }
  }

  shield() {
    
    if (Date.now() - this.shieldstart >= 1000) {
        this.shieldUp = false;
        if(this.energy >= 1 && this.mouseButtons[1]){
            this.mouseButtonsHeld[1] = true;
            this.useShield();
          }else{
              this.game.io.to(this.game.ID).emit("shielddown",this.ID);
          }
    }
    

  }

  useShield() {
    if (this.energy >= 1 && !this.shieldUp) {
      this.game.io.to(this.game.ID).emit("shieldup",this.ID);

      this.shieldstart = Date.now();
      this.shieldUp = true;
    this.energy--;
    this.setEnergyRegenTime(2000);
    }
  
  }


  calculateMouseAngle(){
   if(this.canvasSize != null){
  this.mouseAngle = Math.atan2(  this.mousePosistion.y-this.canvasSize.h/2 , this.mousePosistion.x-this.canvasSize.w/2) ;
   }
}

mostKills(){
  this.maxhp = 4;
  this.hp=this.maxhp;
  this.maxEnergy = 15;
  this.energy+=5;
  this.energy=this.energy>this.maxEnergy?this.maxEnergy:this.energy;
  this.energyRegenRate=500;
  this.game.io.to(this.game.ID).emit("new-king",this.ID);
}
notMostKills(){
  this.maxhp = 3;
  this.hp = this.hp>3?3:this.hp;
  this.maxEnergy = 10;
  this.energyRegenRate=750;
}
  
   collision(){
    if(this.hp>0){
    this.hp--;
    }

  }

  setPostion(x,y){
    this.x=x;
    this.y=y;
  }


  resetPlayer(){
    this.hp = 3;
    this.energy = 10;
    this.dead = false;
    this.playerKills = 0;
  }

  botAI(){
    this.resetInputs();
    let mode;//chase  run  wander evade
    let playerNearBy = this.getClosestPlayerNearBy(this.getPlayers());
    if(playerNearBy==null){mode="wander";}
    if(playerNearBy instanceof player) {
      if(this.hp >= playerNearBy.hp||this.energy-2>=playerNearBy.energy||this.energy>=6){mode="chase";}
    if(((this.energy+3<playerNearBy.energy&&playerNearBy.energy>4&&this.energy<6)||this.energy<3)){
      mode="run";
    }
    
  }
    if(this.bulletsClose(this.getBullets())){
      mode = "evade";
    }
 
    

   //this.sendChat(mode);
    
    if(mode=="chase"){
      if(this.angleToEnemy(playerNearBy)!=null){
      this.mouseAngle=this.angleToEnemy(playerNearBy);
      }
      if(this.dist(playerNearBy.x,playerNearBy.y,this.x,this.y)>200) {
        this.angleToKeyInputs(this.angleToEnemy(playerNearBy));
      }else if(this.dist(playerNearBy.x,playerNearBy.y,this.x,this.y)<100){
        this.angleToKeyInputs(-this.angleToEnemy(playerNearBy));
      }
      if(this.dist(playerNearBy.x,playerNearBy.y,this.x,this.y)<250){
        this.mouseButtons[0]=true;
      }
      this.botWanderTimer=0;
    }else if (mode == "run"){
      this. angleToKeyInputs(this.angleToEnemy(playerNearBy)+Math.PI); 
      this.botWanderTimer=0;
    }else if (mode == "wander"){
   
    if(this.botWanderTimer<=0){ 
      this.playerAngle = Math.random()*(2*Math.PI);
      this.mouseAngle=this.playerAngle;
      this.botWanderTimer=50;
   }else{
    this.botWanderTimer--;
   }
   this.angleToKeyInputs(this.playerAngle); 

    }else if (mode == "evade"){
      
      let numNearbyBullets = this.bulletsClose(this.getBullets());
      let nearestBullet = this.getClosestBullet(this.getBullets());
      let distFromBullet = this.dist(nearestBullet.x,nearestBullet.y,this.x,this.y);
      let angleToBullet = Math.atan2(nearestBullet.y-this.y,nearestBullet.x-this.x); 
      if(numNearbyBullets>=2&& this.energy>=3){
        this.mouseAngle=angleToBullet+Math.PI/2;
        this.keys[4]=true;
      }else  if(numNearbyBullets>=1&&this.energy>=1&& distFromBullet<70){
        this.mouseAngle = angleToBullet;
        this.mouseButtons[1]=true;
      }
      if(numNearbyBullets>0){
        this.angleToKeyInputs(angleToBullet+(Math.PI/2));  

      }
      
      this.botWanderTimer=0;

    }
    
   
  }

  sendChat(message){
    this.game.io.sockets
        .in(this.game.ID)
        .emit("message", { playerID: this.ID, message: message });
  }


  resetInputs(){
    this.keys = [false,false,false,false,false];
    this.mouseButtons = [false, false];
  }

  angleToKeyInputs(angle){
    angle=this.angle_1to360(angle)
   
    if(angle>Math.PI/6&&angle<Math.PI*5/6){this.keys[2]=true;}
    if(angle>Math.PI*4/6&&angle<Math.PI*8/6){this.keys[1]=true;}
    if(angle>Math.PI*7/6&&angle<Math.PI*11/6){this.keys[0]=true;}
    if((angle>Math.PI*10/6&&angle<Math.PI*2)||(angle>0&&angle<Math.PI*2/6)){this.keys[3]=true;}
  }

toDegrees(radians)
{
  var pi = Math.PI;
  return radians * (180/pi);
}
toRadians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}
  angle_1to360(angle) {
    angle=this.toDegrees(angle)
    angle = (angle % 360) + (angle - Math.trunc(angle));
    if (angle > 0.0) return this.toRadians(angle);
    else return this.toRadians(angle + 360.0);
  }

  getClosestPlayerNearBy(players){
      let closestPlayer = null; 
      let dist=Infinity;
      let maxVisableDist = 400;
      for(let i = players.length-1;i >= 0 ; i--){
        let p = players[i];
        if(p.ID == this.ID || p.dead){continue;}
        let tempdist = this.dist(p.x,p.y,this.x,this.y);
        if(tempdist < maxVisableDist){
         if(tempdist < dist){
          closestPlayer = p;
          dist = tempdist;
         }
        }
      }
     return closestPlayer;
  }

  getBullets(){
     return this.game.bullets;
  }
  
  getPlayers(){
    return this.game.players;
 }

  bulletsClose(bullets){
    if(bullets.length<=0){return 0;}
    let bulletsClose = 0;
    for(let i = bullets.length-1;i>=0;i--){
      let b = bullets[i];
      if(b.parentid==this.ID){continue;}
      if(this.dist(b.x,b.y,this.x,this.y)< this.playerRadius+b.bulletRadius+70){
        bulletsClose++;
      }
    }
   return bulletsClose;
  }

  angleToEnemy(enemy){
    return Math.atan2(enemy.y-this.y,enemy.x-this.x);
  }

  getClosestBullet(bullets){
    let closestBullet = null; 
      let dist=Infinity;
      let maxVisableDist = 300;
    for(let i = bullets.length-1;i>=0;i--){
      let b = bullets[i];
      if(b.parentid==this.ID){continue;}
      let tempdist = this.dist(b.x,b.y,this.x,this.y);
      if(tempdist < maxVisableDist){
        if(tempdist < dist){
          closestBullet = b;
         dist = tempdist;
        }
       }
       
      }
    
   return closestBullet;
  }

  dist(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

}
