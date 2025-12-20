// test button
function test(){
  document.getElementById("output").innerText = "Test button working ✔";
}

// game loader
function loadGame(game){
  if(game === "math"){
    document.getElementById("output").innerText = "Math game loaded ✔";
  }

  if(game === "word"){
    document.getElementById("output").innerText = "Word game loaded ✔";
  }
}