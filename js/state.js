let selecting=0, picks=[[],[]], selected=[], teams=[],active=[0,0],turn=0,over=false,gameMode=null,aiBusy=false,aiDifficulty=1,playerTeam=0,aiTeam=1;
let turnDice=[[null,null,null],[null,null,null]];
let turnKept=[[false,false,false],[false,false,false]];
let turnRolled=[false,false];
function diceNow(){return turnDice[turn]}
function keptNow(){return turnKept[turn]}
function rolledNow(){return turnRolled[turn]}
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];


