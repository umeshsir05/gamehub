let level="easy", lang="en";
let score=0, total=0;

function show(id){
 document.querySelectorAll('.game').forEach(g=>g.classList.add('hidden'));
 document.getElementById(id).classList.remove('hidden');
}

function setLevel(){
 level=document.getElementById("classLevel").value;
 generateMath();
 generateTable();
 generateLogic();
}

function updateScore(correct){
 total++;
 if(correct) score++;
 document.getElementById("scoreBox").innerText=`Score: ${score} / ${total}`;
}

/* Language */
const text={
 en:{title:"Educational Game Hub",correct:"Correct",wrong:"Wrong"},
 hi:{title:"शैक्षणिक गेम हब",correct:"सही",wrong:"गलत"}
};

function setLang(l){
 lang=l;
 document.getElementById("title").innerText=text[l].title;
}

/* Math */
function generateMath(){
 let a,b;
 if(level=="easy"){a=5;b=3;}
 else if(level=="medium"){a=25;b=14;}
 else{a=67;b=28;}
 window.mathAns=a+b;
 document.getElementById("mathQ").innerText=`${a} + ${b} = ?`;
}
function checkMath(){
 let c=document.getElementById("mathAns").value==window.mathAns;
 updateScore(c);
 document.getElementById("mathMsg").innerText=c?text[lang].correct:text[lang].wrong;
}

/* Word */
let word="SCHOOL";
document.getElementById("scrambled").innerText="HCOOLS";
function checkWord(){
 let c=document.getElementById("wordAns").value.toUpperCase()==word;
 updateScore(c);
 document.getElementById("wordMsg").innerText=c?text[lang].correct:text[lang].wrong;
}

/* Table */
function generateTable(){
 let x=level=="easy"?2:level=="medium"?5:12;
 let y=4;
 window.tableAns=x*y;
 document.getElementById("tableQ").innerText=`${x} × ${y} = ?`;
}
function checkTable(){
 let c=document.getElementById("tableAns").value==window.tableAns;
 updateScore(c);
 document.getElementById("tableMsg").innerText=c?text[lang].correct:text[lang].wrong;
}

/* GK */
function checkGK(a){
 let c=a=="Delhi";
 updateScore(c);
 document.getElementById("gkMsg").innerText=c?text[lang].correct:text[lang].wrong;
}

/* Logic */
function generateLogic(){
 let q=level=="easy"?"2,4,6, ?":level=="medium"?"2,4,8,16, ?":"3,9,27, ?";
 window.logicAns=level=="easy"?8:level=="medium"?32:81;
 document.getElementById("logicQ").innerText=q;
}
function checkLogic(){
 let c=document.getElementById("logicAns").value==window.logicAns;
 updateScore(c);
 document.getElementById("logicMsg").innerText=c?text[lang].correct:text[lang].wrong;
}

/* Report */
function showReport(){
 let p=total?Math.round(score/total*100):0;
 document.getElementById("report").innerText=
 `Total: ${total} | Correct: ${score} | Percentage: ${p}%`;
}

generateMath();
generateTable();
generateLogic();