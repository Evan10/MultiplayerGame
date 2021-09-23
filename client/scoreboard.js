class scoreboard{

constructor(x,y,w,h){
this.x=x;
this.y=y;
this.width=w;
this.height=h;
this.scoreboardInfo = [];

}

render(cxt){
cxt.fillStyle='rgba(140,140,140,0.5)';
cxt.fillRect(this.x,this.y,this.width,this.height);
cxt.fillStyle='black';
cxt.font = "20px serif";
cxt.fillText("ScoreBoard",this.x+10,this.y+20);
cxt.font = "15px serif";
for(let i = 0; i < this.scoreboardInfo.length; i ++ ){
    let tempinfo = this.scoreboardInfo[i];
  cxt.fillText(i+1 +") "+tempinfo.playerName + " : " +tempinfo.Kills,this.x+10,this.y+40+(i*25));

}

}

updatescoreboardinfo(info){
    this.scoreboardInfo=info;
}


}