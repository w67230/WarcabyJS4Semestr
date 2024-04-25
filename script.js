var d = document;

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
        for(let i = 0; i < BOARD.length; i++){
            for(let j = 0; j < BOARD[i].length; j++){
                if(BOARD[i][j].getTdField() == tdField){
                    return BOARD[i][j];
                }
            }
        }
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
        this.getCurrentField().setFigura(null);
        this.x = left ? this.x-xAddition : this.x+xAddition;
        this.y = this.red ? this.y+yAddition : this.y-yAddition;
        field.setFigura(this);
        removeMoves();
        if(this.shouldTransform()){
            field.setFigura(new Queen(this));
            draw();
            addMoves();
        }
        else if(this.hasKilledRecently){
            draw();
            if(this.checkMoves()){
                this.getCurrentField().getTdField().addEventListener("click", () => {
                    removeMoves();
                    addMoves();
                    draw();
                });
            }
            else {
                removeMoves();
                addMoves();
                draw();
            }
            this.hasKilledRecently = false;
        }
        else {
            addMoves();
            draw();
        }
    }

    kill(figureToKillField, left, field, xAddition = 2, yAddition = 2){
        figureToKillField.setFigura(null);
        this.hasKilledRecently = true;
        this.move(left, field, xAddition, yAddition);
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
        this.getCurrentField().setFigura(null);
        this.x += xAddition;
        this.y += yAddition;
        field.setFigura(this);
        removeMoves();
        if(this.hasKilledRecently){
            draw();
            if(this.checkMoves()){
                this.getCurrentField().getTdField().addEventListener("click", () => {
                    removeMoves();
                    addMoves();
                    draw();
                });
            }
            else {
                removeMoves();
                addMoves();
                draw();
            }
            this.hasKilledRecently = false;
            this.lastMove = "";
        }
        else {
            addMoves();
            draw();
        }
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


function addMoves(){
    BOARD.forEach(arrays => {
        arrays.forEach(field => {
            if(field.getFigura() != null){
                //if(!field.getFigura().red){
                    field.getTdField().addEventListener("click", () => {
                        removeMoves();
                        field.getTdField().addEventListener("click", () => {
                            removeMoves();
                            addMoves();
                            draw();
                        });

                        field.getFigura().checkMoves();
                    });
                //}
            }
        });
    });
}

function removeMoves(){
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
                field.getTdField().style.backgroundColor="white";
            }
            else if(field.getFigura() != null){
                if(field.getFigura().red){
                    field.getTdField().style.backgroundColor="red";
                }
                else {
                    field.getTdField().style.backgroundColor="blue";
                }
            }
            else {
                field.getTdField().style.backgroundColor="black";
            }
        });
    });

    
}

function drawMoveBorder(field){
    let image = d.createElement("img");
    image.src="kolo.png";
    image.alt="kolo";
    field.getTdField().appendChild(image);
}

function drawSelectionBorder(){
    
}

draw();
addMoves();