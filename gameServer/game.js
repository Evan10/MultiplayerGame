

const Player = require("./player.js");
const Bullet = require("./bullet.js");
const Collision = require("./collision");
const { createID } = require("../id.js");

module.exports = class GameInstance{

constructor(ID, io){
this.ID = ID;
this.io=io;

this.start=-1;
this.laststamp=-1;
this.tickrate =60;
this.ticks_per_frame = 1000/this.tickrate;
this.ticks_per_client_update = this.tickrate/20;
this.ticks_last_client_update = 0;
this.lastsecond = 0;
this.ticks = 0;
this.MaxPlayers = 5;
this.players = [];
this.deadPlayers = [];
this.bullets = [];
this.playerInfo = [];
this.bulletInfo = [];
this.closeGame =false;
this.collision = new Collision(this.players,this.bullets); 

this.gameloop();
}

tick(){
  this.collision.tick();

   for(let i = this.players.length - 1 ; i >= 0 ; i --){
    let player = this.players[i];
    if( player != null){
      player.tick();
      if(player.hp <= 0){
        this.playerdead(player, i);
      }
    }
   }
   for(let i = this.bullets.length - 1 ; i >= 0 ; i --){
    let bullet = this.bullets[i];
    if( bullet != null){
      bullet.tick();
      if(bullet.removeBullet){
        this.removeBullet(bullet.ID,i);
      }
    }
   }

   if(this.ticks_last_client_update > this.ticks_per_client_update){
    this.client_tick();
    this.ticks_last_client_update=0;
  }
 
}


client_tick(){
  for(let i = this.players.length - 1 ; i >= 0 ; i --){
    let player = this.players[i];
    if( player != null){
      this.playerInfo[i] = ({id:player.ID, x : player.x, y : player.y,
         hp : player.hp, energy:player.energy, shield:player.shieldUp,
         mouseAngle: player.mouseAngle
      });
    }
   }
   this.bulletInfo = [];
   for(let i = this.bullets.length - 1 ; i >= 0 ; i --){
    
    let bullet = this.bullets[i];
    if( bullet != null){
      this.bulletInfo[i] = ({id:bullet.ID, x : bullet.x, y : bullet.y,
        angle: bullet.bulletAngle
     });
    }
   }

this.io.sockets.in(this.ID).emit("playerInfo",this.playerInfo);
this.io.sockets.in(this.ID).emit("bulletInfo",this.bulletInfo);
}

removeBullet(id, index){
  this.bullets.splice(index,1);
  this.io.sockets.in(this.ID).emit("removebullet", id);
}

addBullet(parentid, x, y, angle){
  let id = createID();
  let newbullet = new Bullet(parentid,id,x,y,angle);
  this.bullets.push(newbullet);
  this.io.to(this.ID).emit("new_bullet",{id:id,x:x,y:y,angle:angle});
  
}


playerdead(player, i){
  this.deadPlayers.push(player);
  this.players.splice(i,1);
  this.io.sockets.in(this.ID).emit("deadPlayer",player.ID);
}

addPlayer(id, socket){

  for(let i = this.players.length - 1 ; i >= 0 ; i --){
    let playerinfo =  {id:this.players[i].ID,x:this.players[i].x,y:this.players[i].y};
    console.log(playerinfo);
   socket.emit("new_player", playerinfo);
  }
  let x=0,y=0;
  this.players.push(new Player(id, x, y, socket,this));
  socket.emit("initClient",{id:id, x:x, y:y});
  socket.to(this.ID).emit("new_player",{id:id, x:x, y:y});

 

}

gamefull(){
  return this.players.length >= this.MaxPlayers;
}


closeGame(){
  this.closeGame=true;
}

gameloop(){

   if(this.closeGame){
     return;
   }

  this.timestamp = Date.now();
 
  if (this.start == -1){
    this.start =  this.timestamp;
    this.laststamp =  this.timestamp;
  }

  let elapsed =  this.timestamp -  this.laststamp;
  while (elapsed >=  this.ticks_per_frame){
    this.tick();
    this.ticks++;
    this.ticks_last_client_update++;
      elapsed -=  this.ticks_per_frame;
      this.laststamp =  Date.now();
  }

  if( this.timestamp -  this.lastsecond > 1000){
     // console.log(this.ticks);
      this.ticks=0;
      this.lastsecond= this.timestamp;
  }
 
  setTimeout (() => {this.gameloop();},this.ticks_per_frame);
  
}

};






