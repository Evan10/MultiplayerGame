


function createID(){
const values = "abcdefghijklmnopqrstuvwxyz0123456789";
const length = 10;
let id = "";
while(id.length < length){
    id += values.charAt(Math.floor(Math.random()*values.length));
}
return id;
}

module.exports = { createID };