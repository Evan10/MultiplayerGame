

class partical{

    constructor(x,y,spd,angle,color,size,lifespan,fade){
this.x=x;
this.y=y;
this.spd=spd;
this.angle=angle;
this.color=color;
this.size=size;
this.lifespan=lifespan;
this.maxlifespan=lifespan;
this.fade=fade;
this.alpha = 1;
    }

    tick(){
        this.x += Math.cos(this.angle)*this.spd;
        this.y += Math.sin(this.angle)*this.spd;
        this.lifespan--;
        this.alpha = (this.lifespan/this.maxlifespan);
    }
    render(cxt){
        cxt.beginPath();  
        cxt.fillStyle = this.color+`${this.alpha})`;
        cxt.arc(this.x,this.y,this.size,0,Math.PI*2,false);
        cxt.fill();
    }


}




class particals{

    constructor(x, y, number, colors, lifespan,maxsize,minsize,maxspd,minspd,startangle,endangle,fade){
    this.particallist = [];
    this.x=x;
    this.y=y;    
    this.lifespan=lifespan;   
    this.fade=fade;
    this.colors=colors;// "rgba(x,y,z" + `${this.alpha})`
    this.finished = false;
    for(let i = 0 ; i < number ; i ++){
        let pspd= getRandomNumber(maxspd,minspd);
        let pangle = getRandomNumber(startangle,endangle);
        let pcolor = this.colors[getRandomInt(this.colors.length-1,0)]
        let psize = getRandomNumber(maxsize,minsize);
        let p = new partical(this.x, this.y, pspd, pangle, pcolor,psize,this.lifespan,this.fade);
        this.particallist.push(p);
    }

    }

    tick(){
       if(this.particallist.length <= 0){
        this.finished= true;
       }
        for(let i = this.particallist.length-1 ; i >= 0 ; i --){
            this.particallist[i].tick();
            if(this.particallist[i].lifespan<=0){
                this.particallist.pop(i);
            } 
        }
    }

    render(cxt){
        for(let i = this.particallist.length-1 ; i >= 0 ; i --){
          this.particallist[i].render(cxt);
        }
    }


}


function getRandomInt(max,min) {
    return min+Math.round(Math.random() * (max-min));
  }
function getRandomNumber(max,min){
    return min+(Math.random() * (max-min))
}