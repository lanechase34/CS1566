// Always execute in strict mode (less bug)
'use strict';

// These variables must be global variables.
// Some callback functions may need to access them.
var gl = null;
var canvas = null;
var ctm_location;
var model_view_location;
var projection_location;

function initGL(canvas) {
    gl = canvas.getContext("webgl");
    if (!gl) {
        alert("WebGL is not available...");
        return -1;
    }

    // Set the clear screen color to black (R, G, B, A)
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Enable hidden surface removal
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    return 0;
}

function init(positions, colors) {
    // Load and compile shader programs
    var shaderProgram = initShaders(gl, "vertex-shader", "fragment-shader");
    if (shaderProgram == -1)
        return -1;
    gl.useProgram(shaderProgram)
    // Allocate memory in a graphics card
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, 4 * 4 * (positions.length + colors.length), gl.STATIC_DRAW);
    // Transfer positions and put it at the beginning of the buffer
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, to1DF32Array(positions));
    // Transfer colors and put it right after positions
    gl.bufferSubData(gl.ARRAY_BUFFER, 4 * 4 * positions.length, to1DF32Array(colors));

    // Vertex Position - locate and enable "vPosition"
    var vPosition_location = gl.getAttribLocation(shaderProgram, "vPosition");
    if (vPosition_location == -1) {
        alert("Unable to locate vPosition");
        return -1;
    }
    gl.enableVertexAttribArray(vPosition_location);
    // vPosition starts at offset 0
    gl.vertexAttribPointer(vPosition_location, 4, gl.FLOAT, false, 0, 0);

    // Vertex Color - locate and enable vColor
    var vColor_location = gl.getAttribLocation(shaderProgram, "vColor");
    if (vColor_location == -1) {
        alert("Unable to locate vColor");
        return -1;
    }
    gl.enableVertexAttribArray(vColor_location);
    // vColor starts at the end of positions
    gl.vertexAttribPointer(vColor_location, 4, gl.FLOAT, false, 0, 4 * 4 * positions.length);

    // Current Transformation Matrix - locate and enable "ctm"
    ctm_location = gl.getUniformLocation(shaderProgram, "ctm");
    if (ctm_location == null) {
        alert("Unable to locate ctm");
        return -1;
    }

    // Model View Matrix - Locate and enable "model_view"
    model_view_location = gl.getUniformLocation(shaderProgram, "model_view");
    if (model_view_location == null) {
        alert("Unable to locate model view");
        return -1;
    }

    // Project Matrix - Locate and enable "projection"
    projection_location = gl.getUniformLocation(shaderProgram, "projection");
    if (projection_location == null) {
        alert("Unable to locate projection");
        return -1;
    }

    return 0;
}


// intialize positions/colors arrays
let positions = [];
let colors = [];

// current transformation matrix
let ctm = [];
// model view matrix
let model_view = [];

// keep track of different views
let model_map_view = [];
let model_player_view = [];

// projection matrix
let projection = [];

// keep track of different projections
let projection_map = [];
let projection_player = [];

// store maze
let maze;
// store maze solution
let solution;
// maze dimensions
let colsDim = 8;
let rowsDim = 8;

// maze dimensions in openGL canvas

// top left cell @ 1,1 
// bottom right cell @ 15,15 (cols * 2 - 1),(rows * 2 - 1)
// 8x8 maze represented as 17x17 array
// indices 0-16, so 15,15 is the last cell in bottom right

// start of maze (top-left)
let start = [1, 1];
// what direction you enter maze from
let direction = 4;
// exit of maze (bottom - right)
let end = [(colsDim * 2) - 1, (rowsDim * 2 - 1)];

// current direction player is facing
let playerDirection;
// direction person wants to move
let currMoveDirection = 5;
// current position of person in maze (at denotes current cell)
let eye, at, up;
// for looking at map
let lookingAtMap = false;
// for animation
let isAnimating = false;

// for animated solve
let isSolving = false;
// the moves to reach exit
let solveMoves = [];
let currMove = 0;

// key down call back
function keyDownCallback(event) {
    switch (event.keyCode) {
        // generate maze
        case 71:
            createWorld();
            break;
        // solve maze
        case 86:
            animateSolveMaze();
            break;
        // move forward
        case 87:
            moveForward(playerDirection);
            break;
        // move backward
        case 83:
            moveBackward(playerDirection);
            break;
        // look left
        case 65:
            rotate("left");
            break;
        // look right
        case 68:
            rotate("right");
            break;
        // map view
        case 32:
            mapView();
            break;

        // to modify frustrum
        // leftArrow
        case 37:
            // expand L/R
            leftF -= frustrumModifier;
            rightF += frustrumModifier;
            updateFrustrum();
            break;
        // rightArrow
        case 39:
            // shrink L/R
            leftF += frustrumModifier;
            rightF -= frustrumModifier;
            updateFrustrum();
            break;
        // upArrow
        case 38:
            // expand T/B
            topF += frustrumModifier;
            bottomF -= frustrumModifier;
            updateFrustrum();
            break;
        // downArrow
        case 40:
            // shrink T/B
            topF -= frustrumModifier;
            bottomF += frustrumModifier;
            updateFrustrum();
            break;
        // home
        case 36:
            //expand N/F
            nearF += frustrumModifier;
            farF += frustrumModifier;
            updateFrustrum();
            break;
        // end
        case 35:
            // shrink N/F
            nearF -= frustrumModifier;
            farF -= frustrumModifier;
            updateFrustrum();
            break;
    }
}

function updateFrustrum() {
    projection_player = frustrum(leftF, rightF, bottomF, topF, nearF, farF);
    projection = projection_player;
    display();
}

// function to create the world, initialize the player, and initialize variables
function createWorld() {
    if (!isAnimating) {
        // generate maze and 3D maze and send to graphics
        maze = generateMaze({ cols: colsDim, rows: rowsDim });
        positions = [];
        colors = [];
        generate3DMaze(maze, positions, colors);
        // init ctm, model_view & projection matrix
        ctm = createIdentity();
        model_view = createIdentity();
        projection = createIdentity();

        init(positions, colors);
        initPlayer();
        if (lookingAtMap) {
            model_view = model_map_view;
            projection = projection_map;
        }
        display();
    }
}

// function to move camera in direction?
// ** need animation from start - new eye **
function moveForward(direction) {
    if (!isAnimating && !lookingAtMap) {
        // determine which direction we are facing and move that way
        let adjustX = 0;
        let adjustZ = 0;
        switch (direction) {

            // north corresponds with -z axis, east corresponds with +x axis
            // facing north
            case 1:
                // move in negative z direction
                adjustX = 0;
                adjustZ = -1;
                break;
            // facing east
            case 2:
                // move in positive x direction
                adjustX = 1;
                adjustZ = 0;
                break;
            // facing south
            case 3:
                // move in positive z direction
                adjustX = 0;
                adjustZ = 1;
                break;
            // facing west
            case 4:
                // move in negative x direction
                adjustX = -1;
                adjustZ = 0;
                break;
        }
        let newEye = [eye[0] + adjustX, eye[1], eye[2] + adjustZ, 1];
        isAnimating = true;
        at = [at[0] + adjustX, eye[1], at[2] + adjustZ, 1];
        animate(eye, newEye, "move");
        eye = newEye;
    }
}

// moveBackward -> inverse of forward
function moveBackward(direction) {
    // determine inverse call to 'moveForward'
    switch (direction) {
        case 1:
            moveForward(3);
            break;
        case 2:
            moveForward(4);
            break;
        case 3:
            moveForward(1);
            break;
        case 4:
            moveForward(2);
            break;
    }
}

// function to rotate in direction
function rotate(direction) {
    if (!isAnimating && !lookingAtMap) {
        // determine direction player will be facing after rotate
        let rotate;
        if (direction == "left") {
            solveRotate("L")
            rotate = 90;
        }
        else if (direction == "right") {
            solveRotate("R");
            rotate = -90;
        }
        // calculate new at by translating eye, at to origin, apply rotate, translate back
        // request animation
        let newEye = matrixVectorMult(mmMult(translate(at[0], at[1], at[2]), mmMult(rotateY(rotate), translate(-at[0], -at[1], -at[2]))), eye);
        isAnimating = true;
        // animate from current at point to newAt
        animate(eye, newEye, "move");
        eye = newEye;
    }
}

// View the map from top of world using look At origin
function mapView() {
    if (!isAnimating) {
        // how high the final point should be above the map, scales with the size of maze
        let scale = colsDim / 2 + 2;

        // if already looking at map, go back to player view
        if (lookingAtMap) {
            isAnimating = true;
            lookingAtMap = false;
            animate([0, scale, 0, 1], [at[0], 0, at[2], 1], "map")
        } else {
            isAnimating = true;
            lookingAtMap = true;
            // animate from player position to top of map
            animate([at[0], 0, at[2], 1], [0, scale, 0, 1], "map");
        }
    }
}

// to calculate the direction after rotating
// 1,2,3,4 compass respective to N,E,S,W
function solveRotate(direction) {
    if (direction === "L") {
        playerDirection -= 1;
        if (playerDirection < 1) playerDirection = 4;
    }
    if (direction === "R") {
        playerDirection += 1;
        if (playerDirection > 4) playerDirection = 1;
    }
}

// create the necessary moves to the exit of maze from the current position
// creates the solution matrix and iterates over it to determine the direction to rotate and move forward
// once the moves are determined, initialize call to animation function and iterate of the moves until the end
function animateSolveMaze() {

    // create the solution matrix
    solution = createMatrix(maze.length, maze[0].length);
    solved = false;
    solutionLength = 1;
    direction = 5;

    // reset our moves
    solveMoves = [];

    // once we are done 'solving' the moves, reset the player direction back to the original direction
    let tempDirection = playerDirection;

    // convert current player position openGL coordinates -> maze coordinates
    let curr = [((at[0] * 2) + colsDim), ((at[2] * 2) + rowsDim)];
    let currDirection = 5;

    // if at the entrance of maze, move into the first cell
    if (curr[0] == -1 && curr[1] == 1) {
        solveMoves.push("F");
        curr = [curr[0] + 2, curr[1]];
        direction = 4;
        currDirection = 2;
        playerDirection = 2;
    }

    // solve the maze
    solveMaze(maze, curr, end, direction, solution);
    // print our solution to see shortest path on console screen
    printMaze(maze, true, solution);

    // skip the first step which accounts for the current cell
    solutionLength -= 2;

    // now with solution matrix, build the steps we need
    while (solutionLength > 0) {
        // let's look at current position and see where to head
        // remember, only [odd, odd] in the matrix are cells so only check those locations to see where to go next
        // look at adjacent [odd, odd] cells to find next move
        // column defined curr[0] - col, curr[1] - row, solution[curr[0]][curr[1]] - curr cell
        let foundMove = false;
        let nextMove;

        // look north 
        if (currDirection != 3 && !foundMove && curr[1] - 2 > 0) {
            if (solution[curr[0]][curr[1] - 2] == solutionLength) {
                foundMove = true;
                nextMove = [curr[0], curr[1] - 2];
                currDirection = 1;
            }
        }
        // look east
        if (currDirection != 4 && !foundMove && curr[0] + 2 < solution.length) {
            if (solution[curr[0] + 2][curr[1]] == solutionLength) {
                foundMove = true;
                nextMove = [curr[0] + 2, curr[1]];
                currDirection = 2;
            }
        }
        // look south
        if (currDirection != 1 && !foundMove && curr[1] + 2 < solution[0].length) {
            if (solution[curr[0]][curr[1] + 2] == solutionLength) {
                foundMove = true;
                nextMove = [curr[0], curr[1] + 2];
                currDirection = 3;
            }
        }
        // look west
        if (currDirection != 2 && !foundMove && curr[0] - 2 > 0) {
            if (solution[curr[0] - 2][curr[1]] == solutionLength) {
                foundMove = true;
                nextMove = [curr[0] - 2, curr[1]];
                currDirection = 4;
            }
        }

        // now we have the direction we need to move and the next move
        // lets align our current rotation to the direction we need
        // adjust playerDirection to the currDirection

        while (playerDirection != currDirection) {
            if (playerDirection == 4 || playerDirection == 1) {
                // handle case 4
                if (playerDirection == 4) {
                    if (currDirection == 1) {
                        solveMoves.push("R");
                        solveRotate("R");
                    }
                    else {
                        solveMoves.push("L");
                        solveRotate("L");
                    }
                }
                // handle case 1
                else {
                    if (currDirection == 4) {
                        solveMoves.push("L");
                        solveRotate("L");
                    }
                    else {
                        solveMoves.push("R");
                        solveRotate("R");
                    }
                }
            }
            else {
                // if the direction we need to move is to our left
                if (currDirection < playerDirection) {
                    solveMoves.push("L");
                    solveRotate("L");
                }
                // else we need to rotate right
                else {
                    solveMoves.push("R");
                    solveRotate("R");
                }
            }

        }


        // now that we are facing the current direction towards the next move, move forward
        solveMoves.push("F");

        curr = nextMove;
        solutionLength--;
    }

    // now we are in the last cell of the maze
    // orient our direction so we face the exit, then move outside the maze

    while (playerDirection != 2) {
        if (2 < playerDirection) {
            solveMoves.push("L");
            solveRotate("L");
        }
        else {
            solveMoves.push("R");
            solveRotate("R");
        }
    }

    // exit the maze
    solveMoves.push("F");

    playerDirection = tempDirection;

    currMove = 0;
    isSolving = true;
    if (solveMoves[currMove] == "F") {
        moveForward(playerDirection)
    }
    else if (solveMoves[currMove] == "L") {
        rotate("left");
    }
    else if (solveMoves[currMove] == "R") {
        rotate("right")
    }
}

let counter = 0;
let alpha = 15;
let v;
let startP;
/**
 * Animate the move from end to start
 * @param start - starting point
 * @param end - ending point
 */
function animate(start, end, type) {
    // reset counter
    counter = 0;
    // our starting point, P
    startP = start;
    // the vector between ending point and starting point
    v = vectorSub(end, start);

    if (type == "rotate") {
        requestAnimationFrame(animateFrameRotate);
    }
    else if (type == "map") {
        requestAnimationFrame(animateFrameMap);
    }
    else if (type == "move") {
        requestAnimationFrame(animateFrameMove);
    }
}

// animates from startEye - newEye
function animateFrameMove() {
    counter += 1;
    if (counter > alpha) {
        isAnimating = false;

        if (isSolving) {
            currMove++;
            if (currMove > solveMoves.length) {
                isSolving = false;
            } else {
                if (solveMoves[currMove] == "F") {
                    moveForward(playerDirection)
                }
                else if (solveMoves[currMove] == "L") {
                    rotate("left");
                }
                else if (solveMoves[currMove] == "R") {
                    rotate("right")
                }
            }
        }
    }
    else {
        // create look at moving eye along vector
        let QPrime = vectorAdd(startP, scalarVectorMult(counter / alpha, v));

        // create new look at
        model_player_view = look_at(QPrime, at, up);
        model_view = model_player_view;

        display();
        requestAnimationFrame(animateFrameMove);
    }
}

// animates from startAt - newAt
function animateFrameRotate() {
    counter += 1;
    if (counter > alpha) {
        isAnimating = false;
        if (isSolving) {
            currMove++;
            if (currMove > solveMoves.length) {
                isSolving = false;
            } else {
                if (solveMoves[currMove] == "F") {
                    moveForward(playerDirection)
                }
                else if (solveMoves[currMove] == "L") {
                    rotate("left");
                }
                else if (solveMoves[currMove] == "R") {
                    rotate("right")
                }
            }
        }
    }
    else {
        // create look at view for current position along vector
        let QPrime = vectorAdd(startP, scalarVectorMult(counter / alpha, v));

        // create new look at
        model_player_view = look_at(eye, QPrime, up);
        model_view = model_player_view;

        display();
        requestAnimationFrame(animateFrameRotate);
    }
}

let alphaMap = 50;
// animates from currPosition - topOfMap
function animateFrameMap() {
    counter += 1;
    if (counter > alphaMap) {
        isAnimating = false;

        if (!lookingAtMap) {
            model_view = model_player_view;
            projection = projection_player;
            display();
        }
    }
    if (isAnimating) {
        // create look at view for current position along vector
        let QPrime = vectorAdd(startP, scalarVectorMult(counter / alphaMap, v));
        // we want to always look at y = 0 for this view
        model_map_view = look_at(QPrime, [QPrime[0], 0, QPrime[2], 1], [0, 0, -1, 0]);
        model_view = model_map_view;

        // the ortho projection is determined by the height of the vector, y
        // the farther away from the origin, the more map we want to see, so at the top, we see all the map
        let scale = QPrime[1];
        projection_map = ortho(-scale, scale, -scale, scale, scale, -scale);
        projection = projection_map;

        display();
        requestAnimationFrame(animateFrameMap);
    }
}

// verify we can move this direction
function verifyMove() {

}

// colors for world in RGB
let orange = [255, 140, 0];
let darkorange = [220, 88, 42];
let grey = [105, 105, 105];
let black = [0, 0, 0];
let red = [255, 0, 0];
let green = [0, 255, 0];
let white = [255, 255, 255];
let pink = [255, 192, 203];
let yellow = [255, 255, 0];
let purple = [191, 64, 191];
let gold = [255, 215, 0];

// main driver
function main() {
    canvas = document.getElementById("gl-canvas");
    if (initGL(canvas) == -1)
        return -1;
    document.onkeydown = keyDownCallback;

    createWorld();
}

let leftF, rightF, bottomF, topF, nearF, farF;
let frustrumModifier = .01;

// Start the player outside the entrance of the maze
function initPlayer() {
    // want player to start 1 cell outside maze
    // at defines the cell the player is currently in
    // eye is outside cell for frustrum to view entire cell

    // player starts facing east at entrance of the maze
    playerDirection = 2;

    // move eye to top left of maze in openGL coordinate
    eye = [-((colsDim - 1) / 2) - 2, .5, -((rowsDim - 1) / 2), 1];
    at = [-((colsDim - 1) / 2) - 1, .5, -((rowsDim - 1) / 2), 1];
    up = [0, 1, 0, 0];

    // define the initial starting point of the player
    model_player_view = look_at(eye, at, up);
    model_view = model_player_view;

    // define the player frustrum 
    leftF = -.4;
    rightF = .4;
    bottomF = -.4;
    topF = .4;
    nearF = -1;
    farF = -50;

    projection_player = frustrum(leftF, rightF, bottomF, topF, nearF, farF);
    projection = projection_player;
}

// Display the current positions array and apply our transformation matricess
function display() {
    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the matrices
    gl.uniformMatrix4fv(model_view_location, false, to1DF32Array(model_view));
    gl.uniformMatrix4fv(projection_location, false, to1DF32Array(projection));
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));

    // Draw our positions array
    gl.drawArrays(gl.TRIANGLES, 0, positions.length);
}

function debug() {
    console.log(`positions length - ${positions.length} `);
    console.log(`colors length - ${colors.length} `);
}

// print frustrum values to console
function debugFrustrum() {
    console.log(`left-${leftF}, right-${rightF}, top-${topF}, bottom-${bottomF}, near-${nearF}, far-${farF}`);
}