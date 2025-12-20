let level="easy", lang="en";
let score=0, total=0;

function show(id){
 document.querySelectorAll('.game').forEach(g=>g.classList.add('hidden'));
 document.getElementById(id).classList.remove('hidden');
}

function setLevel(){ generateAll(); }

function updateScore(c){
 total++;
 if(c) score++;
 document.getElementById("scoreBox").innerText=`Score: ${score} / ${total}`;
}

/* Math */
function genMath(){
 let a=Math.floor(Math.random()*(level=="easy"?10:level=="medium"?50:100));
 let b=Math.floor(Math.random()*(level=="easy"?10:level=="medium"?50:100));
 window.mathAns=a+b;
 document.getElementById("mathQ").innerText=`${a} + ${b} = ?`;
}
function checkMath(){
 let c=document.getElementById("mathAns").value==window.mathAns;
 updateScore(c);
 document.getElementById("mathMsg").innerText=c?"Correct":"Wrong";
 genMath();
}

/* Compare */
let x,y,cmp;
function genCmp(){
 x=Math.floor(Math.random()*20);
 y=Math.floor(Math.random()*20);
 cmp=x>y?">":x<y?"<":"=";
 document.getElementById("cmpQ").innerText=`${x} ? ${y}`;
}
function checkCmp(a){
 let c=a==cmp;
 updateScore(c);
 document.getElementById("cmpMsg").innerText=c?"Correct":"Wrong";
 genCmp();
}

/* Word */
const words=["SCHOOL","TEACHER","STUDENT","COMPUTER"];
function genWord(){
 let w=words[Math.floor(Math.random()*words.length)];
 window.wordAns=w;
 document.getElementById("scrambled").innerText=w.split('').sort(()=>0.5-Math.random()).join('');
}
function checkWord(){
 let c=document.getElementById("wordAns").value.toUpperCase()==window.wordAns;
 updateScore(c);
 document.getElementById("wordMsg").innerText=c?"Correct":"Wrong";
 genWord();
}

/* Spell */
const spell=[["COMPUTR","COMPUTER"],["SCHOOOL","SCHOOL"]];
function genSpell(){
 let s=spell[Math.floor(Math.random()*spell.length)];
 window.spellAns=s[1];
 document.getElementById("spellQ").innerText="Correct spelling of: "+s[0];
}
function checkSpell(){
 let c=document.getElementById("spellAns").value.toUpperCase()==window.spellAns;
 updateScore(c);
 document.getElementById("spellMsg").innerText=c?"Correct":"Wrong";
 genSpell();
}

/* Table */
function genTable(){
 let x=level=="easy"?2:level=="medium"?6:12;
 let y=Math.floor(Math.random()*10);
 window.tableAns=x*y;
 document.getElementById("tableQ").innerText=`${x} × ${y} = ?`;
}
function checkTable(){
 let c=document.getElementById("tableAns").value==window.tableAns;
 updateScore(c);
 document.getElementById("tableMsg").innerText=c?"Correct":"Wrong";
 genTable();
}

/* GK */
const gk=[{q:"Capital of India?",o:["Delhi","Mumbai"],a:"Delhi"}];
function genGK(){
 let g=gk[0];
 window.gkAns=g.a;
 document.getElementById("gkQ").innerText=g.q;
 document.getElementById("gkOpt").innerHTML=
 g.o.map(o=>`<button onclick="checkGK('${o}')">${o}</button>`).join('');
}
function checkGK(a){
 let c=a==window.gkAns;
 updateScore(c);
 document.getElementById("gkMsg").innerText=c?"Correct":"Wrong";
}

/* CS */
const cs=[{q:"CPU stands for?",o:["Central Processing Unit","Control Program Unit"],a:"Central Processing Unit"}];
function genCS(){
 let c=cs[0];
 window.csAns=c.a;
 document.getElementById("csQ").innerText=c.q;
 document.getElementById("csOpt").innerHTML=
 c.o.map(o=>`<button onclick="checkCS('${o}')">${o}</button>`).join('');
}
function checkCS(a){
 let c=a==window.csAns;
 updateScore(c);
 document.getElementById("csMsg").innerText=c?"Correct":"Wrong";
}

/* Logic */
function genLogic(){
 let q=level=="easy"?"2,4,6, ?":level=="medium"?"2,4,8,16, ?":"3,9,27, ?";
 window.logicAns=level=="easy"?8:level=="medium"?32:81;
 document.getElementById("logicQ").innerText=q;
}
function checkLogic(){
 let c=document.getElementById("logicAns").value==window.logicAns;
 updateScore(c);
 document.getElementById("logicMsg").innerText=c?"Correct":"Wrong";
 genLogic();
}

/* Odd */
function genOdd(){
 let o=["Apple","Banana","Car","Mango"];
 window.oddAns="Car";
 document.getElementById("oddQ").innerText="Find odd one out:";
 document.getElementById("oddOpt").innerHTML=
 o.map(i=>`<button onclick="checkOdd('${i}')">${i}</button>`).join('');
}
function checkOdd(a){
 let c=a==window.oddAns;
 updateScore(c);
 document.getElementById("oddMsg").innerText=c?"Correct":"Wrong";
}

/* Report */
function showReport(){
 let p=total?Math.round(score/total*100):0;
 document.getElementById("report").innerText=
 `Total: ${total} | Correct: ${score} | Percentage: ${p}%`;
}

function generateAll(){
 genMath(); genCmp(); genWord(); genSpell();
 genTable(); genGK(); genCS(); genLogic(); genOdd();
}

generateAll();