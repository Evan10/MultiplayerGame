
const Bullet = require("./bullet.js");
module.exports = class player {
    constructor(id, x, y, socket, game,playerName) {
    this.game = game;
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
        game.players.splice(idx, 1);
        game.io.to(game.ID).emit("player_left",socket.userID);
    });
    socket.on("canvasSize", (size)=>{ this.canvasSize = size; })
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
    this.maxEnergy=10;

    this.playerSpeed=3;
    this.playerAngle = 0;

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
  }

  tick() {
      this.calculateMouseAngle();
      this.regenerateEnergy();
      this.shield();
      this.move();
      this.teleport();
      this.shootBullet();
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

        this.setEnergyRegenTime(1000); //1 second delay when regening energy
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
  this.maxEnergy = 15;
  this.game.io.to(this.game.ID).emit("new-king",this.ID);
}
notMostKills(){
  this.maxhp = 3;
  this.maxEnergy = 10;
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

}
