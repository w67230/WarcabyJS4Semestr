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

// dla gry
var currentlySelectedField = null;
var redTurn = false;
var multiMove = false;
var isSelectingFigureToRemove = false;
var someoneWon = false;
var startsNewGame = false;

class Field {
    #tdField;
    #figure;
    #whiteField;

    constructor(tdField, figure, whiteField){
        this.#tdField = tdField;
        this.#figure = figure;
        this.#whiteField = whiteField;
    }

    getTdField(){
        return this.#tdField;
    }

    setTdField(tdField){
        this.#tdField = tdField;
    }

    getFigura(){
        return this.#figure
    }

    setFigura(figure){
        if(!this.#whiteField){
            this.#figure = figure;
        }
    }

    isWhiteField(){
        return this.#whiteField;
    }

    static getFieldByTdField(tdField){
        BOARD.forEach(arrays => {
            arrays.forEach(field => {
                if(field == tdField){
                    return field;
                }
            });
        });
        return null;
    }

    static getField(y, x){
        if(y > -1 && y < BOARD.length){
            let arr = BOARD[y];
            if(x > -1 && x < arr.length){
                return arr[x];
            }
        }
        return null;
    }

    static getFieldPosition(field){
        for(let i = 0; i < BOARD.length; i++){
            if(BOARD[i].includes(field)){
                return [i, BOARD[i].indexOf(field)];
            }
        }
        return null;
    }
}

class Figure {
    x;
    y;
    red;
    hasKilledRecently = false;

    constructor(y, x, red){
        this.x = x;
        this.y = y;
        this.red = red;
    }

    isItsTurn(){
        return (this.red && redTurn) || (!this.red && !redTurn);
    }

    isOnTopEndOfBoard(){
        return this.y < 1;
    }

    isOnBottomEndOfBoard(){
        return this.y > 6;
    }

    isOnLeftEdge(){
        return this.x < 1;
    }

    isOnRightEdge(){
        return this.x > 6;
    }

    shouldTransform(){
        if(this.red){
            return this.isOnBottomEndOfBoard();
        }
        return this.isOnTopEndOfBoard();
    }

    isEnemyOnField(field){
        if(field.getFigura() != null){
            if(field.getFigura().red != this.red){
                return true;
            }
        }
        return false;
    }

    checkMoves(){
        let canMove = false;
        let self = this;
        let leftMove = this.red ? this.getBottomField(true) : this.getTopField(true);
        let rightMove = this.red ? this.getBottomField(false) : this.getTopField(false);
        if(leftMove != null){
            if(leftMove.getFigura() == null){
                if(!this.hasKilledRecently){
                    leftMove.getTdField().addEventListener("click", () => {
                        self.move(true, leftMove);
                    });
                    drawMoveBorder(leftMove);

                    canMove = true;
                }
            }
            else if(this.isEnemyOnField(leftMove)){
                let leftKillField = this.red ? leftMove.getFigura().getBottomField(true) : leftMove.getFigura().getTopField(true);
                if(leftKillField != null){
                    if(leftKillField.getFigura() == null){
                        leftKillField.getTdField().addEventListener("click", () => {
                            self.kill(leftMove, true, leftKillField);
                        });
                        drawMoveBorder(leftKillField);

                        canMove = true;
                    }
                }
            }
        }

        if(rightMove != null){
            if(rightMove.getFigura() == null){
                if(!this.hasKilledRecently){
                    rightMove.getTdField().addEventListener("click", () => {
                        self.move(false, rightMove);
                    });
                    drawMoveBorder(rightMove);

                    canMove = true;
                }
            }
            else if(this.isEnemyOnField(rightMove)){
                let rightKillField = this.red ? rightMove.getFigura().getBottomField(false) : rightMove.getFigura().getTopField(false);
                if(rightKillField != null){
                    if(rightKillField.getFigura() == null){
                        rightKillField.getTdField().addEventListener("click", () => {
                            self.kill(rightMove, false, rightKillField);
                        });
                        drawMoveBorder(rightKillField);

                        canMove = true;
                    }
                }
            }
        }

        return canMove;
    }

    move(left, field, xAddition=1, yAddition=1){
        if(!multiMove){
            saveLastMoveToLocalStorage();
            multiMove = true;
            disableUndoMoveButton()
        }
        this.getCurrentField().setFigura(null);
        this.x = left ? this.x-xAddition : this.x+xAddition;
        this.y = this.red ? this.y+yAddition : this.y-yAddition;
        field.setFigura(this);
        removeMoves(true);
        if(this.shouldTransform()){
            field.setFigura(new Queen(this));
            currentlySelectedField = null;
            draw();
            addMoves(true);
        }
        else if(this.hasKilledRecently){
            draw();
            if(this.checkMoves()){
                this.getCurrentField().getTdField().addEventListener("click", () => {
                    removeMoves();
                    addMoves(true);
                    draw();
                });
            }
            else {
                currentlySelectedField = null;
                removeMoves();
                addMoves(true);
                draw();
            }
            this.hasKilledRecently = false;
        }
        else {
            currentlySelectedField = null;
            addMoves(true);
            draw();
        }
    }

    kill(figureToKillField, left, field, xAddition = 2, yAddition = 2){
        if(!multiMove){
            saveLastMoveToLocalStorage();
            multiMove = true;
            disableUndoMoveButton()
        }
        figureToKillField.setFigura(null);
        this.hasKilledRecently = true;
        currentlySelectedField = field;
        this.move(left, field, xAddition, yAddition);
        drawSelectionBackground();
    }

    getTopField(left){
        if(!this.isOnTopEndOfBoard()){
            if(left){
                if(!this.isOnLeftEdge()){
                    return Field.getField(this.y-1, this.x-1);
                }
            }
            else {
                if(!this.isOnRightEdge()){
                    return Field.getField(this.y-1, this.x+1);
                }
            }

        }
        return null;
    }

    getBottomField(left){
        if(!this.isOnBottomEndOfBoard()){
            if(left){
                if(!this.isOnLeftEdge()){
                    return Field.getField(this.y+1, this.x-1);
                }
            }
            else {
                if(!this.isOnRightEdge()){
                    return Field.getField(this.y+1, this.x+1);
                }
            }

        }
        return null;
    }

    getCurrentField(){
        return Field.getField(this.y, this.x);
    }

}

class Queen extends Figure {
    lastMove;

    constructor(figure){
        super(figure.y, figure.x, figure.red);
        this.hasKilledRecently = false;
        this.lastMove = "";
    }

    checkQueenMoves(left, top){
        let canMove = false;
        let self = this;

        let field = top ? this.getTopField(left) : this.getBottomField(left);
        let yTemp = top ? this.y-1 : this.y+1;
        let xTemp = left ? this.x-1 : this.x+1;
                                
        
        while(field != null){
            let pos = Field.getFieldPosition(field);
            if(field.getFigura() == null){
                if(this.hasKilledRecently){
                    yTemp = top ? yTemp-1 : yTemp+1;
                    xTemp = left ? xTemp-1 : xTemp+1;
                    field = Field.getField(yTemp, xTemp);
                    continue;
                }
                field.getTdField().addEventListener("click", () => {
                    if(pos != null){
                        self.move(left, Field.getField(pos[0], pos[1]), pos[1]-self.x, pos[0]-self.y);
                    }
                });
                drawMoveBorder(field);
                canMove = true;
            }
            else if(this.isEnemyOnField(field)){
                let killField = top ? field.getFigura().getTopField(left) : field.getFigura().getBottomField(left);
                yTemp = top ? yTemp-1 : yTemp+1;
                xTemp = left ? xTemp-1 : xTemp+1;
                while(killField != null){
                    let killPos = Field.getFieldPosition(killField);
                    if(killField.getFigura() == null){
                        killField.getTdField().addEventListener("click", () => {
                            if(pos != null && killPos != null){
                                self.lastMove = "" + left + top;
                                self.kill(Field.getField(
                                    pos[0], pos[1]), 
                                    left, 
                                    Field.getField(killPos[0], killPos[1]), killPos[1]-self.x, killPos[0]-self.y
                                );
                            }
                        }); 
                        drawMoveBorder(killField);
                        canMove = true;
                    }
                    else {
                        break;
                    }

                    yTemp = top ? yTemp-1 : yTemp+1;
                    xTemp = left ? xTemp-1 : xTemp+1;
                    killField = Field.getField(yTemp, xTemp);
                }
                break;
            }
            else{
                break;
            }

            yTemp = top ? yTemp-1 : yTemp+1;
            xTemp = left ? xTemp-1 : xTemp+1;
            field = Field.getField(yTemp, xTemp);
        }

        return canMove;
    }

    checkMoves(){
        let canMove = false;
        let self = this;
        //console.log("jestem krolowka");
        //console.log(this.lastMove);
        
        //left top (- -)
        if(this.lastMove != "falsefalse"){
            if(this.checkQueenMoves(true, true)){
                canMove = true;
            }
        }

        //right top (+ -)
        if(this.lastMove != "truefalse"){
            if(this.checkQueenMoves(false, true)){
                canMove = true;
            }
        }

        //left bottom (- +)
        if(this.lastMove != "falsetrue"){
            if(this.checkQueenMoves(true, false)){
                canMove = true;
            }
        }

        //right bottom (+ +)
        if(this.lastMove != "truetrue"){
            if(this.checkQueenMoves(false, false)){
                canMove = true;
            }
        }

        return canMove;
    }

    checkMoveForField(field){
        if(field.getFigura() == null){
            return true;
        }
        return false;
    }

    move(left, field, xAddition=1, yAddition=1){
        if(!multiMove){
            saveLastMoveToLocalStorage();
            multiMove = true;
            disableUndoMoveButton()
        }
        this.getCurrentField().setFigura(null);
        this.x += xAddition;
        this.y += yAddition;
        field.setFigura(this);
        removeMoves(true);
        if(this.hasKilledRecently){
            draw();
            if(this.checkMoves()){
                this.getCurrentField().getTdField().addEventListener("click", () => {
                    removeMoves();
                    addMoves(true);
                    draw();
                });
            }
            else {
                currentlySelectedField = null;
                removeMoves();
                addMoves(true);
                draw();
            }
            this.hasKilledRecently = false;
            this.lastMove = "";
        }
        else {
            currentlySelectedField = null;
            addMoves(true);
            draw();
        }
    }

    shouldTransform(){
        return false;
    }

}


const BOARD = [
    [
        new Field(d.querySelector("#f00"), new Figure(0, 0, true), false), 
        new Field(d.querySelector("#f01"), null, true), 
        new Field(d.querySelector("#f02"), new Figure(0, 2, true), false), 
        new Field(d.querySelector("#f03"), null, true), 
        new Field(d.querySelector("#f04"), new Figure(0, 4, true), false), 
        new Field(d.querySelector("#f05"), null, true), 
        new Field(d.querySelector("#f06"), new Figure(0, 6, true), false), 
        new Field(d.querySelector("#f07"), null, true)
    ],
    [
        new Field(d.querySelector("#f10"), null, true), 
        new Field(d.querySelector("#f11"), new Figure(1, 1, true), false), 
        new Field(d.querySelector("#f12"), null, true), 
        new Field(d.querySelector("#f13"), new Figure(1, 3, true), false), 
        new Field(d.querySelector("#f14"), null, true), 
        new Field(d.querySelector("#f15"), new Figure(1, 5, true), false), 
        new Field(d.querySelector("#f16"), null, true), 
        new Field(d.querySelector("#f17"), new Figure(1, 7, true), false)
    ],
    [
        new Field(d.querySelector("#f20"), null, false), 
        new Field(d.querySelector("#f21"), null, true), 
        new Field(d.querySelector("#f22"), null, false), 
        new Field(d.querySelector("#f23"), null, true), 
        new Field(d.querySelector("#f24"), null, false), 
        new Field(d.querySelector("#f25"), null, true), 
        new Field(d.querySelector("#f26"), null, false), 
        new Field(d.querySelector("#f27"), null, true)
    ],
    [
        new Field(d.querySelector("#f30"), null, true), 
        new Field(d.querySelector("#f31"), null, false), 
        new Field(d.querySelector("#f32"), null, true), 
        new Field(d.querySelector("#f33"), null, false), 
        new Field(d.querySelector("#f34"), null, true), 
        new Field(d.querySelector("#f35"), null, false), 
        new Field(d.querySelector("#f36"), null, true), 
        new Field(d.querySelector("#f37"), null, false)
    ],
    [
        new Field(d.querySelector("#f40"), null, false), 
        new Field(d.querySelector("#f41"), null, true), 
        new Field(d.querySelector("#f42"), null, false), 
        new Field(d.querySelector("#f43"), null, true), 
        new Field(d.querySelector("#f44"), null, false), 
        new Field(d.querySelector("#f45"), null, true), 
        new Field(d.querySelector("#f46"), null, false), 
        new Field(d.querySelector("#f47"), null, true)
    ],
    [
        new Field(d.querySelector("#f50"), null, true), 
        new Field(d.querySelector("#f51"), null, false), 
        new Field(d.querySelector("#f52"), null, true), 
        new Field(d.querySelector("#f53"), null, false), 
        new Field(d.querySelector("#f54"), null, true), 
        new Field(d.querySelector("#f55"), null, false), 
        new Field(d.querySelector("#f56"), null, true), 
        new Field(d.querySelector("#f57"), null, false)
    ],
    [
        new Field(d.querySelector("#f60"), new Figure(6, 0, false), false), 
        new Field(d.querySelector("#f61"), null, true), 
        new Field(d.querySelector("#f62"), new Figure(6, 2, false), false), 
        new Field(d.querySelector("#f63"), null, true), 
        new Field(d.querySelector("#f64"), new Figure(6, 4, false), false), 
        new Field(d.querySelector("#f65"), null, true), 
        new Field(d.querySelector("#f66"), new Figure(6, 6, false), false), 
        new Field(d.querySelector("#f67"), null, true)
    ],
    [
        new Field(d.querySelector("#f70"), null, true), 
        new Field(d.querySelector("#f71"), new Figure(7, 1, false), false), 
        new Field(d.querySelector("#f72"), null, true), 
        new Field(d.querySelector("#f73"), new Figure(7, 3, false), false), 
        new Field(d.querySelector("#f74"), null, true), 
        new Field(d.querySelector("#f75"), new Figure(7, 5, false), false), 
        new Field(d.querySelector("#f76"), null, true), 
        new Field(d.querySelector("#f77"), new Figure(7, 7, false), false)
    ]
];

function checkWin(){
    let isWin = true;
    BOARD.forEach(arrays => {
        if(isWin){
            arrays.forEach(field => {
                if(isWin){
                    if(field.getFigura() != null){
                        if(!field.getFigura().isItsTurn()){
                            if(field.getFigura().checkMoves()){
                                isWin = false; // smieszne, nie mozna breakowac forEacha
                            }
                        }
                    }
                }
            });
        }
    });


    if(isWin){
        d.querySelector("#infoTura").style.display="none";
        d.querySelector("#tura").style.display="none";
        if(!redTurn){
            d.querySelector("#wygrana").innerHTML="Zwyciężył " + niebieski;
            if(darkMode){
                d.querySelector("#wygrana").style.color="lightblue";
            }
            else {
                d.querySelector("#wygrana").style.color="blue";
            }
        }
        else {
            d.querySelector("#wygrana").innerHTML="Zwyciężył " + czerwony;
            d.querySelector("#wygrana").style.color="red";
        }
        someoneWon = true;
    }


}

function switchTurn(){
    redTurn = !redTurn;
    multiMove = false;
    updateTurnInfo();
    
    d.querySelector("#cofnij").disabled = false;
    d.querySelector("#cofnij").style.textDecoration="none";
}

function updateTurnInfo(){
    if(redTurn){
        d.querySelector("#tura").innerHTML=czerwony;
        d.querySelector("#tura").style.color="red";
    }
    else {
        d.querySelector("#tura").innerHTML=niebieski;
        if(darkMode){
            d.querySelector("#tura").style.color="lightblue";
        }
        else {
            d.querySelector("#tura").style.color="blue";
        }
    }
}

function addMoves(shouldSwitchTurn = false){
    if(someoneWon){
        return;
    }
    if(shouldSwitchTurn){
        switchTurn();
    }
    BOARD.forEach(arrays => {
        arrays.forEach(field => {
            if(field.getFigura() != null){
                if(field.getFigura().isItsTurn()){
                    field.getTdField().addEventListener("click", () => {
                        removeMoves();
                        draw();
                        field.getTdField().addEventListener("click", () => {
                            removeMoves();
                            addMoves();
                            draw();
                        });

                        field.getFigura().checkMoves();
                        currentlySelectedField = field;
                        drawSelectionBackground();
                    });
                }
            }
        });
    });
}

function removeMoves(shouldCheckWin = false){
    if(shouldCheckWin){
        checkWin();
    }
    BOARD.forEach(arrays => {
        arrays.forEach(field => {
            let identifier = field.getTdField().id;
            field.getTdField().replaceWith(field.getTdField().cloneNode(false));
            field.setTdField(d.querySelector("#"+identifier));
        });
    });
}

function draw(){
    BOARD.forEach(arrays => {
        arrays.forEach(field => {
            if(field.isWhiteField()){
                field.getTdField().style.backgroundColor=kolorBialychPol;
            }
            else {
                field.getTdField().style.backgroundColor=kolorCzarnychPol;
            }
            if(field.getFigura() != null){
                drawFigure(field);
            }
        });
    });
}

function drawMoveBorder(field){
    let image = d.createElement("img");
    image.src="zaznaczenie_ruchu.png";
    image.alt="kolo";
    field.getTdField().appendChild(image);
}

function drawFigure(field){
    let image = d.createElement("img");
    let firstPart = field.getFigura().red ? "red_" : "blue_";
    let secondPart = field.getFigura() instanceof Queen ? "queen.png" : "figure.png";
    image.src=firstPart+secondPart;
    image.alt="figure";
    field.getTdField().appendChild(image);
}

function drawSelectionBackground(){
    if(currentlySelectedField != null){
        currentlySelectedField.getTdField().style.backgroundColor="gray";
    }
}

function loadGame(local = false){
    BOARD.forEach(arrays => {
        arrays.forEach(field => {
            field.setFigura(null);
        });
    });

    if(local){
        var item = localStorage.getItem("lastMoveFigures");
        var json = JSON.parse(item);
        var newObject = null;
        json.forEach(figure => {
            newObject = new Figure(figure.y, figure.x, figure.red);
            newObject.getCurrentField().setFigura(newObject);
        });

        item = localStorage.getItem("lastMoveQueens");
        json = JSON.parse(item);
        json.forEach(figure => {
            newObject = new Queen(new Figure(figure.y, figure.x, figure.red));
            newObject.getCurrentField().setFigura(newObject);
        });
        redTurn = localStorage.getItem("redTurn") == "true";
        updateTurnInfo();
        

        removeMoves(false);
        addMoves(false);
        draw();
        disableUndoMoveButton();
    }
    else {
        setFiguresFromJsonFile();
    }
}

function loadLastMoveFromLocalStorage(){
    loadGame(true);
}

function loadGameWithJsonFile(){
    if(confirm("Jesteś pewny, że chcesz wczytać partię? Nie będzie można wrócić do obecnej partii, chyba że została zapisana.")){
        loadGame(false);
    }
    else {
        d.querySelector("#wczytajGre").value='';
    }
}

async function setFiguresFromJsonFile(){
    if(d.querySelector("#wczytajGre").files[0].type != "application/json"){
        alert("Save file has to be a JSON file! Loading last move...");
        loadGame(true);
        return;
    }
    const file = await d.querySelector("#wczytajGre").files[0].text();
    const jsonObject = JSON.parse(file);
    redTurn = !jsonObject["redTurn"];
    const figures = jsonObject["figures"];
    const queens = jsonObject["queens"];
    var newObject = null;
    figures.forEach(figure => {
        newObject = new Figure(figure.y, figure.x, figure.red);
        newObject.getCurrentField().setFigura(newObject);
    });

    queens.forEach(figure => {
        newObject = new Queen(new Figure(figure.y, figure.x, figure.red));
        newObject.getCurrentField().setFigura(newObject);
    });

    removeMoves(false);
    addMoves(true);
    draw();

    d.querySelector("#wczytajGre").value='';
    disableUndoMoveButton();
}

function saveGame(local = false){
    const figures = [];
    const queens = [];
    BOARD.forEach(arrays => {
        arrays.forEach(field => {
            if(field.getFigura() != null){
                if(field.getFigura() instanceof Queen){
                    queens.push(field.getFigura());
                }
                else {
                    figures.push(field.getFigura());
                }
            }
            
        });
    });
    const figureJson = JSON.stringify(figures);
    const queenJson = JSON.stringify(queens);
    if(local){
        localStorage.setItem("lastMoveFigures", figureJson);
        localStorage.setItem("lastMoveQueens", queenJson);
        localStorage.setItem("redTurn", redTurn.toString());
    }
    else {
        var obiekcik = JSON.stringify({"figures":figures, "queens":queens, "redTurn":redTurn});
        var file = new Blob([obiekcik], {type: "text/plain"});
        var a = d.createElement("a");
        a.href = URL.createObjectURL(file);
        a.download = "warcaby_zapis.json";
        a.click();
    }
}

function saveLastMoveToLocalStorage(){
    saveGame(true);
}

function saveGameToJsonFile(){
    saveGame(false);
}

function disableUndoMoveButton(){
    d.querySelector("#cofnij").disabled = true;
    d.querySelector("#cofnij").style.textDecoration="line-through";
}

function selectFigureToRemove(){
    if(isSelectingFigureToRemove){
        removeMoves(false);
        addMoves(false);
        draw();
        isSelectingFigureToRemove = false;
        return;
    }
    removeMoves(false);
    draw();
    BOARD.forEach(arrays => {
        arrays.forEach(field => {
            if(field.getFigura() != null){
                field.getTdField().addEventListener("click", () => {
                    isSelectingFigureToRemove = false;
                    field.setFigura(null);
                    removeMoves(true);
                    addMoves(false);
                    draw();
                });
                field.getTdField().style.backgroundColor="crimson";
            }
        });
    });
    isSelectingFigureToRemove = true;
}

function startNewGame(){
    if(confirm("Jesteś pewny, że chcesz rozpocząć nową partię? Nie będzie można wrócić do obecnej partii, chyba że została zapisana.")){
        clearLocalStorage();
        const a = d.createElement("a");
        a.href="index.html";
        a.click();
    }
}

function clearLocalStorage(){
    startsNewGame = true;
    localStorage.clear();
}

if(localStorage.getItem("lastMoveFigures") == null){
    draw();
    addMoves();
    saveLastMoveToLocalStorage();
    disableUndoMoveButton();
}
else {
    loadLastMoveFromLocalStorage();
}


d.querySelector("#cofnij").addEventListener("click", loadLastMoveFromLocalStorage);
d.querySelector("#saveGame").addEventListener("click", saveGameToJsonFile);
d.querySelector("#wczytajGre").addEventListener("change", loadGameWithJsonFile);
d.querySelector("#obowiazekBicia").addEventListener("click", selectFigureToRemove);
d.querySelector("#nowaGra").addEventListener("click", startNewGame);

window.addEventListener("beforeunload", () => {
    if(someoneWon){
        clearLocalStorage();
    }
    else if(!startsNewGame){
        saveGame(true);
    }
});