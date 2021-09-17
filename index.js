const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const GameInstance = require("./gameServer/game.js");
const { createID } = require("./id.js");

const games = [];

const playersPerGame=10;

app.use(express.static("client"));

server.listen(3000, () => {
  console.log('listening on *:3000');
});

io.on('connection', (socket) => {
  console.log('a user connected');
 
  socket.userID = createID();
  socket.emit("Games",openGames());

  socket.on("join-game",()=>{
    console.log("player joined a Game")
    addPlayerToGame(socket,socket.userID);
  });
  socket.on('disconnect', () => {
    checkforEmptyServer();
    
    console.log('user disconnected');
  });
});

function openGames(){
  let opengames = {};
  for(let i = games.length - 1 ; i >= 0; i--){
    if(games[i].players.length>= playersPerGame){
     

    }
  }
}

function checkforEmptyServer(){
  for(let i = games.length - 1 ; i >= 0; i--){
    console.log("players:"+games[i].players.length);
    if(games[i].players.length<=0){
      games[i].closeserver();
      games.splice(i,1);
    }
  }
}

function createGame(){
 let game = new GameInstance(createID(),io);
 games.push(game);
 return game;
}

function addPlayerToGame(socket){
  let opengame = gameopen();
   if( !opengame ){
    opengame = createGame();
   }
   socket.join(opengame.ID);
   opengame.addPlayer(socket.userID, socket);
}

function gameopen(){
  if( games.length == 0 ){
    return false;
  }
  for(let i = games.length - 1 ; i >= 0; i--){
    if(!games[i].gamefull()){
      return games[i];
    }
  }
   return false;
}


