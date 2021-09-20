const canvas = document.getElementById("canvas");
const cxt = canvas.getContext("2d");
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

window.onbeforeunload = function() {
  socket.onclose = function () {}; // disable onclose handler first
  socket.close();
};

document.querySelector(".start").addEventListener("click", () => {
  socket.emit("join-game");
  document.querySelector(".start-screen").classList.toggle("hidden");
});

document.addEventListener("mousemove", (e) => {
  socket.emit("mousepos", { x: e.offsetX, y: e.offsetY });
});
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});
function isBitOn(number, index) {
  return Boolean(number & (1 << index));
}
document.onmousedown = function (e) {
  let pressed = e.buttons;
  socket.emit("mousebutton", [isBitOn(pressed, 0), isBitOn(pressed, 1)]);
};
document.onmouseup = function (e) {
  let pressed = e.buttons;
  socket.emit("mousebutton", [isBitOn(pressed, 0), isBitOn(pressed, 1)]);
};

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
      keys[0] = true;
      socket.emit("keys", keys);
      break;
    case "a":
      keys[1] = true;
      socket.emit("keys", keys);
      break;
    case "s":
      keys[2] = true;
      socket.emit("keys", keys);
      break;
    case "d":
      keys[3] = true;
      socket.emit("keys", keys);
      break;
    case " ":
      keys[4] = true;
      socket.emit("keys", keys);
      break;
  }
});
document.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w":
      keys[0] = false;
      socket.emit("keys", keys);
      break;
    case "a":
      keys[1] = false;
      socket.emit("keys", keys);
      break;
    case "s":
      keys[2] = false;
      socket.emit("keys", keys);
      break;
    case "d":
      keys[3] = false;
      socket.emit("keys", keys);
      break;
    case " ":
      keys[4] = false;
      socket.emit("keys", keys);
      break;
  }
});

const keys = [false, false, false, false, false];
const particalspawners = [];

function getkeys() {
  return keys;
}

let mousePosistion = {
  x: 0,
  y: 0,
};
let mouseButtons = [false, false];

var socket = io();
const players = {};
const Bullets = {};
let client_player;

//tempbullet.angle=info[i].angle;

socket.on("new_bullet", (info) => {
  Bullets[info.id] = new bullet(info.id, info.x, info.y, info.angle);
  addparticalSpawner(
    info.x,
    info.y,
    4,
    ["rgba(70,70,70,", "rgba(110,110,110,"],
    30,
    7,
    4,
    3,
    2,
    info.angle + Math.PI / 10,
    info.angle - Math.PI / 10,
    true
  );
});

socket.on("removebullet", (id) => {
  delete Bullets[id];
});

socket.on("bulletInfo", (info) => {
  for (let i = info.length - 1; i >= 0; i--) {
    let tempid = info[i].id;
    let tempbullet = Bullets[tempid];
    if (tempbullet != null) {
      tempbullet.x = info[i].x;
      tempbullet.y = info[i].y;
    }
  }
});

socket.on("Teleport", (info) => {});

socket.on("shieldup", (id) => {
  players[id].turnonshield();
});

socket.on("shielddown", (id) => {
  players[id].turnoffshield();
});

socket.on("playerInfo", (info) => {
  for (let i = info.length - 1; i >= 0; i--) {
    let tempid = info[i].id;
    let tempplayer = players[tempid];
    if (tempplayer != null) {
      tempplayer.setposition(info[i].x, info[i].y);
      tempplayer.hp = info[i].hp;
      tempplayer.energy = info[i].energy;
      tempplayer.mouseAngle = info[i].mouseAngle;
    }
  }
});
socket.on("new_player", (info) => {
  players[info.id] = new player(info.id, info.x, info.y, false, this);
  console.log("new Player");
  console.log(info);
});

socket.on("player_left", (id) => {
  delete players[id];
});

socket.on("deadPlayer", (id) => {
  let p = players[id];
  p.dead = true;
  addparticalSpawner(
    p.x,
    p.y,
    30,
    ["rgba(255,10,10,", "rgba(200,0,0,"],
    30,
    11,
    7,
    2,
    1,
    0,
    Math.PI * 2,
    true
  );
});

socket.on("initClient", (info) => {
  client_player = new player(info.id, info.x, info.y, true, this);
  players[info.id] = client_player;
  clientInfo();
});

function clientInfo() {
  socket.emit("canvasSize", { w: canvas.width, h: canvas.height });
}

function addparticalSpawner(
  x,
  y,
  number,
  colors,
  lifespan,
  maxsize,
  minsize,
  maxspd,
  minspd,
  startangle,
  endangle,
  fade
) {
  let ps = new particals(
    x,
    y,
    number,
    colors,
    lifespan,
    maxsize,
    minsize,
    maxspd,
    minspd,
    startangle,
    endangle,
    fade
  );
  particalspawners.push(ps);
}

function tick() {
  for (let i = particalspawners.length - 1; i >= 0; i--) {
    particalspawners[i].tick();
  }

  Object.keys(players).forEach((key) => {
    players[key].tick();
  });
}

function render() {
  cxt.fillStyle = "rgba(200,200,200,1)";
  console.log(cxt);
  cxt.fillRect(0, 0, canvas.width, canvas.height);

  let ty = 0,
    tx = 0;
  if (client_player != null) {
    drawHUD(client_player);
    (tx = -client_player.x + canvas.width / 2),
      (ty = -client_player.y + canvas.height / 2);
  }
  drawbackground(tx, ty, cxt);

  cxt.save();
  cxt.translate(tx, ty);

  for (let i = particalspawners.length - 1; i >= 0; i--) {
    let ps = particalspawners[i];
    ps.tick();
    ps.render(cxt);
  }
  Object.keys(Bullets).forEach((key) => {
    Bullets[key].render(cxt);
    Bullets[key].tick();
  });
  Object.keys(players).forEach((key) => {
    players[key].render(cxt);
  });

  cxt.restore();
}

function drawbackground(x, y, cxt) {
  let rectwidth = canvas.width / 10;
  let rectheight = canvas.height / 10;

  for (let i = 0; i <= 10; i++) {
    for (let j = 0; j <= 10; j++) {
      cxt.fillRect = "white";     
      cxt.fillRect(i*rectwidth+(i%rectwidth),j*rectheight+(j%rectheight),rectwidth,rectheight);

    }
  }
}

let frameID;
let start, laststamp;
let ticks_per_frame = 1000 / 60;
let lastsecond = 0;
let ticks = 0;

function gameloop(timestamp) {
  frameID = requestAnimationFrame(gameloop);

  if (start === undefined) {
    start = timestamp;
    laststamp = timestamp;
  }
  let elapsed = timestamp - laststamp;

  while (elapsed >= ticks_per_frame) {
    tick();
    render();
    ticks++;
    elapsed -= ticks_per_frame;
    laststamp = performance.now();
  }

  if (timestamp - lastsecond > 1000) {
    //console.log(ticks);
    ticks = 0;
    lastsecond = timestamp;
  }
}

function drawHUD(player) {}

requestAnimationFrame(gameloop);
