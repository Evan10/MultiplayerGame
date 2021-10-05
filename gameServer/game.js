const Player = require("./player.js");
const Bullet = require("./bullet.js");
const Collision = require("./collision");
const { createID } = require("../id.js");

module.exports = class GameInstance {
  constructor(ID, io) {
    this.ID = ID;
    this.io = io;

    this.start = -1;
    this.laststamp = -1;
    this.tickrate = 60;
    this.ticks_per_frame = 1000 / this.tickrate;
    this.ticks_per_client_update = 50;
    this.ticks_last_client_update = 0;
    this.lastsecond = 0;
    this.ticks = 0;
    this.MaxPlayers = 10;
    this.players = [];
    this.bullets = [];
    this.playerInfo = [];
    this.bulletInfo = [];
    this.closeGame = false;
    this.collision = new Collision(this.players, this.bullets);
    this.playerWithMostKills = null;

    this.gameMapSize = { w: 1000, h: 1000 };


    this.gameloop();
    setInterval(() => {
      let scoreboard = [];
      let tempPlayer = this.playerWithMostKills;
      for (let i = this.players.length - 1; i >= 0; i--) {
        let player = this.players[i];
        if (player != null && !player.dead) {
          if (
            player.playerKills > 0 &&
            (tempPlayer == null || player.playerKills > tempPlayer.playerKills)
          ) {
            tempPlayer = player;
          }
          scoreboard.push({
            playerName: player.playerName,
            Kills: player.playerKills,
          });
        }
      }

      if (this.playerWithMostKills != tempPlayer) {
        if (this.playerWithMostKills != null) {
          this.playerWithMostKills.notMostKills();
        }
        if (tempPlayer != null) {
          this.playerWithMostKills = tempPlayer;
          this.playerWithMostKills.mostKills();
        }
      }
      scoreboard.sort((a, b) => {
        return b.Kills - a.Kills;
      });

      this.io.sockets.in(this.ID).emit("scoreboard", scoreboard);
    }, 1000);
  }

  tick() {
    if(this.players.length<=3){
      this.addPlayer( createID(),null,"BOT_PLAYER",true);
      this.setMapSize();
    }

    this.collision.tick();

    for (let i = this.players.length - 1; i >= 0; i--) {
      let player = this.players[i];
      if (player != null && !player.dead) {
        player.tick();
        if (player.hp <= 0) {
          this.playerdead(player, i);
        }
      }
    }
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      let bullet = this.bullets[i];
      if (bullet != null) {
        bullet.tick();
        if (bullet.removeBullet) {
          this.removeBullet(bullet.ID, i);
        }
      }
    }

    if (
      Date.now() >=
      this.ticks_last_client_update + this.ticks_per_client_update
    ) {
      this.client_tick();
      this.ticks_last_client_update = Date.now();
    }
  }

  client_tick() {
    for (let i = this.players.length - 1; i >= 0; i--) {
      let player = this.players[i];
      if (player != null && !player.dead) {
        this.playerInfo[i] = {
          id: player.ID,
          x: player.x,
          y: player.y,
          hp: player.hp,
          energy: player.energy,
          shield: player.shieldUp,
          mouseAngle: player.mouseAngle,
        };
      }
    }
    this.bulletInfo = [];
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      let bullet = this.bullets[i];
      if (bullet != null) {
        this.bulletInfo[i] = {
          id: bullet.ID,
          x: bullet.x,
          y: bullet.y,
          angle: bullet.bulletAngle,
        };
      }
    }

    this.io.sockets.in(this.ID).emit("playerInfo", this.playerInfo);
    this.io.sockets.in(this.ID).emit("bulletInfo", this.bulletInfo);
  }

  removeBullet(id, index) {
    this.bullets.splice(index, 1);
    this.io.sockets.in(this.ID).emit("removebullet", id);
  }

  addBullet(parentid, x, y, angle, player) {
    let id = createID();
    let newbullet = new Bullet(parentid, id, x, y, angle, player);
    this.bullets.push(newbullet);
    this.io
      .to(this.ID)
      .emit("new_bullet", { id: id, x: x, y: y, angle: angle });
  }


  playerdead(player, i) {
    player.dead = true;
    player.playerKills=0;
    this.io.sockets.in(this.ID).emit("deadPlayer", player.ID);
    if(player.bot){
      setTimeout(()=>{
      player.resetPlayer();
      player.setPostion(
        Math.random() * this.gameMapSize.w,
        Math.random() * this.gameMapSize.h
      );
     
      this.io.sockets
        .in(this.ID)
        .emit("playerRespawn", {
          id: player.ID,
          x: player.x,
          y: player.y,
          playerName: player.playerName,
        });
      },2000);
    }
  }


  
  addPlayer(id, socket, playerName,bot) {
    let x = Math.random() * this.gameMapSize.w,
    y = Math.random() * this.gameMapSize.h;
  this.players.push(new Player(id, x, y, socket, this, playerName,bot));

  this.io.sockets.in(this.ID)
  .emit("new_player", { id: id, x: x, y: y, playerName: playerName });


    if(!bot){
      if(this.players.length>5){
     let botplayer = this.players[this.players.findIndex((plyr) => plyr.bot)];//remove a bot when a real player joins
     if(botplayer!=null){ 
     botplayer.playerKills=0;
     clearInterval(botplayer.messageIntervalID);
      this.players.splice(this.players.indexOf(botplayer), 1);
      this.io.to(this.ID).emit("player_left",botplayer.ID);
     }
      }
      this.setMapSize();

    for (let i = this.players.length - 1; i >= 0; i--) {
      let playerinfo = {
        id: this.players[i].ID,
        x: this.players[i].x,
        y: this.players[i].y,
        playerName: this.players[i].playerName,
        dead: this.players[i].dead,
      };
      console.log(playerinfo);
      socket.emit("new_player", playerinfo);
    }

   
    socket.emit("initClient", { id: id, x: x, y: y, playerName: playerName });

    if (this.playerWithMostKills != null) {
      socket.emit("new-king", this.playerWithMostKills.ID);
    }
    
    socket.on("play-again", (playerName) => {
      let player =
        this.players[this.players.findIndex((plyr) => plyr.ID == id)];
      player.resetPlayer();
      player.playerName = playerName;
      player.setPostion(
        Math.random() * this.gameMapSize.w,
        Math.random() * this.gameMapSize.h
      );
     
      this.io.sockets
        .in(this.ID)
        .emit("playerRespawn", {
          id: player.ID,
          x: player.x,
          y: player.y,
          playerName: playerName,
        });
    });

    socket.on("player-message", (message) => {
      if(message.charAt(0)=="@"){
        this.clientCommand(message);
      }
      this.io.sockets
        .in(this.ID)
        .emit("message", { playerID: id, message: message });
    });

   
    }


    
  }
 
  setMapSize(){
  this.gameMapSize = {w:this.players.length*250,h:this.players.length*250};
  this.io.sockets.in(this.ID).emit("world-size",this.gameMapSize);
}

  clientCommand(message){
  

  }
  gamefull() {
    return this.players.length >= this.MaxPlayers;
  }

  closeGame() {
    this.closeGame = true;
  }

  gameloop() {
    if (this.closeGame) {
      return;
    }

    this.timestamp = Date.now();

    if (this.start == -1) {
      this.start = this.timestamp;
      this.laststamp = this.timestamp;
    }

    let elapsed = this.timestamp - this.laststamp;
    while (elapsed >= this.ticks_per_frame) {
      this.tick();
      this.ticks++;
      elapsed -= this.ticks_per_frame;
      this.laststamp = Date.now();
    }

    if (this.timestamp - this.lastsecond > 1000) {
      // console.log(this.ticks);
      this.ticks = 0;
      this.lastsecond = this.timestamp;
    }

    setTimeout(() => {
      this.gameloop();
    }, this.ticks_per_frame);
  }
};
