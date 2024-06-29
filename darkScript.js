var d = document;

//dla wygladu
const czerwony = "Czerwony";
const niebieski = "Niebieski";

if(localStorage.getItem("darkMode") == null){
    localStorage.setItem("darkMode", "true");
    d.querySelector("#checkDark").checked=true;
}
else {
    d.querySelector("#checkDark").checked=localStorage.getItem("darkMode") == "true";
}
var darkMode = localStorage.getItem("darkMode") == "true";

var kolorNapisow = darkMode ? "white" : "black";
var kolorBialychPol = darkMode ? "antiquewhite" : "white";
var kolorCzarnychPol = darkMode ? "chocolate" : "black";

function switchDarkMode(){
    darkMode = !darkMode;
    localStorage.setItem("darkMode", darkMode.toString());
    setSelectedMode();
    location.reload();
}

function setSelectedMode(){
    if(darkMode){
        d.querySelector("body").classList.replace("lightModeOn", "darkModeOn");
        kolorBialychPol = "antiquewhite";
        kolorCzarnychPol = "chocolate";
        kolorNapisow = "white";
        d.querySelector("#gigaNapis").style.color="white";
        d.querySelectorAll(".buttonDarkMode").forEach(element => {
            element.style.color=kolorNapisow;
            element.style.backgroundColor="gray";
        });
        d.querySelectorAll(".menuA").forEach(element => {
            element.style.color="aliceblue";
        });
        d.querySelectorAll(".boczny").forEach(element => {
            element.style.backgroundImage="linear-gradient(rgb(40, 40, 40), rgb(17, 17, 17))";
        });
    }
    else {
        d.querySelector("body").classList.replace("darkModeOn", "lightModeOn");
        kolorBialychPol = "white";
        kolorCzarnychPol = "black";
        kolorNapisow = "black";
        
    }
}

d.querySelector("#guzikDarkModa").addEventListener("click", switchDarkMode);
setSelectedMode();