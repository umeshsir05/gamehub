let correctAnswer="";
let score=0, attempt=0;

function loadGame(type){
  document.getElementById("feedback").innerText="";
  document.getElementById("answer").value="";
  document.getElementById("options").innerHTML="";

  if(type==="math"){
    let a=Math.floor(Math.random()*10);
    let b=Math.floor(Math.random()*10);
    correctAnswer=(a+b).toString();
    document.getElementById("question").innerText=`${a} + ${b} = ?`;
  }

  if(type==="compare"){
    let a=Math.floor(Math.random()*10);
    let b=Math.floor(Math.random()*10);
    correctAnswer=a>b?">":a<b?"<":"=";
    document.getElementById("question").innerText=`${a} ? ${b}`;
    document.getElementById("options").innerHTML=
      ['>','<','=']
      .map(x=>`<button onclick="selectAns('${x}')">${x}</button>`)
      .join("");
  }

  if(type==="word"){
    let words=["SCHOOL","STUDENT","COMPUTER"];
    let w=words[Math.floor(Math.random()*words.length)];
    correctAnswer=w;
    document.getElementById("question").innerText=
      w.split('').sort(()=>0.5-Math.random()).join('');
  }

  if(type==="logic"){
    correctAnswer="32";
    document.getElementById("question").innerText="2, 4, 8, 16, ?";
  }

  if(type==="odd"){
    correctAnswer="Car";
    document.getElementById("question").innerText="Find odd one out";
    document.getElementById("options").innerHTML=
      ["Apple","Banana","Car","Mango"]
      .map(x=>`<button onclick="selectAns('${x}')">${x}</button>`)
      .join("");
  }
}

function selectAns(v){
  document.getElementById("answer").value=v;
}

function submitAnswer(){
  let ans=document.getElementById("answer").value.trim();
  attempt++;

  if(ans===correctAnswer){
    score++;
    document.getElementById("feedback").innerText="Correct ✅";
  }else{
    document.getElementById("feedback").innerText="Wrong ❌";
  }

  document.getElementById("score").innerText=score;
  document.getElementById("attempt").innerText=attempt;
}

function showReport(){
  let percent=attempt?Math.round(score/attempt*100):0;
  document.getElementById("report").innerText=
    `Attempt: ${attempt}, Score: ${score}, Percentage: ${percent}%`;
}