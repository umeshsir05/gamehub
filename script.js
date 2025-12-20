let level="easy";
let score=0, attempt=0;
let correctAnswer="";
let time=60, timer;

function setLevel(){
  startTimer();
}

function startTimer(){
  clearInterval(timer);
  time=60;
  document.getElementById("time").innerText=time;
  timer=setInterval(()=>{
    time--;
    document.getElementById("time").innerText=time;
    if(time<=0){
      clearInterval(timer);
      showReport();
    }
  },1000);
}

function updateStats(correct){
  attempt++;
  if(correct) score++;
  document.getElementById("score").innerText=score;
  document.getElementById("attempt").innerText=attempt;
  document.getElementById("accuracy").innerText=
    Math.round((score/attempt)*100)+"%";
}

function loadGame(type){
  document.getElementById("feedback").innerText="";
  document.getElementById("answer").value="";
  document.getElementById("options").innerHTML="";
  startTimer();

  if(type=="math"){
    let a=Math.floor(Math.random()*20);
    let b=Math.floor(Math.random()*20);
    correctAnswer=a+b;
    document.getElementById("question").innerText=`${a} + ${b} = ?`;
  }

  if(type=="compare"){
    let a=Math.floor(Math.random()*10);
    let b=Math.floor(Math.random()*10);
    correctAnswer=a>b?">":a<b?"<":"=";
    document.getElementById("question").innerText=`${a} ? ${b}`;
    document.getElementById("options").innerHTML=
      ['>','<','='].map(x=>`<button onclick="select('${x}')">${x}</button>`).join('');
  }

  if(type=="word"){
    let w=["SCHOOL","STUDENT","COMPUTER"];
    correctAnswer=w[Math.floor(Math.random()*w.length)];
    document.getElementById("question").innerText=
      correctAnswer.split('').sort(()=>0.5-Math.random()).join('');
  }

  if(type=="logic"){
    correctAnswer=32;
    document.getElementById("question").innerText="2, 4, 8, 16, ?";
  }

  if(type=="odd"){
    correctAnswer="Car";
    document.getElementById("question").innerText="Odd one out";
    document.getElementById("options").innerHTML=
      ["Apple","Banana","Car","Mango"].map(x=>`<button onclick="select('${x}')">${x}</button>`).join('');
  }
}

function select(val){
  document.getElementById("answer").value=val;
}

function submitAnswer(){
  let ans=document.getElementById("answer").value;
  let correct=ans==correctAnswer;
  updateStats(correct);
  document.getElementById("feedback").innerText=
    correct?"Correct ✅":"Wrong ❌";
}

function showReport(){
  clearInterval(timer);
  let grade=score/attempt>=0.8?"A":score/attempt>=0.5?"B":"C";
  document.getElementById("report").innerText=
    `Attempt: ${attempt}, Score: ${score}, Grade: ${grade}`;
}