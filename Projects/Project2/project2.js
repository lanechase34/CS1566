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

// start of maze
let start = [1, 1];
// what direction you enter maze from
let direction = 4;
// exit of maze
let end = [(colsDim * 2) - 1, (rowsDim * 2 - 1)];



// current direction person is facing
// player starts facing east
let playerDirection = 2;
// direction person wants to move
let currMoveDirection = 5;
// current position of person in maze
let eye, at, up;
// for looking at map
let lookingAtMap = false;

let isAnimating = false;

// key down call back
function keyDownCallback(event) {
    switch (event.keyCode) {
        // generate maze
        case 71:
            // generate maze and 3D maze and send to graphics
            maze = generateMaze({ cols: colsDim, rows: rowsDim });
            positions = [];
            colors = [];
            generate3DMaze(maze, positions, colors);
            init(positions, colors);
            initPlayer();
            display();
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
            console.log('looking left');
            rotate("left");
            break;
        // look right
        case 68:
            console.log('looking right');
            rotate("right");
            break;
        // map view
        case 32:
            mapView();
            break;
    }
}

// function to move camera in direction?
// ** need animation from start - new eye **
function moveForward(direction) {
    if (!isAnimating) {
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
    if (!isAnimating) {
        // determine direction player will be facing after rotate
        let rotate;
        if (direction == "left") {
            playerDirection -= 1;
            if (playerDirection < 1) playerDirection = 4;
            rotate = 90;
        }
        else if (direction == "right") {
            playerDirection += 1;
            if (playerDirection > 4) playerDirection = 1;
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
        // if already looking at map, go back to player view
        if (lookingAtMap) {
            model_view = model_player_view;
            projection = projection_player;
            display();
            lookingAtMap = false;
        } else {
            // how high the final point should be above the map, scales with the size of maze
            let scale = colsDim / 2 + 2;
            isAnimating = true;
            lookingAtMap = true;
            // animate from player position to top of map
            animate([eye[0], 0, eye[2], 1], [0, scale, 0, 1], "map");
        }
    }
}


function animateSolveMaze() {
    // create the solution matrix
    solution = createMatrix(maze.length, maze[0].length);
    solved = false;
    solutionLength = 1;
    direction = 5;

    // convert current player position openGL coordinates to maze coordinates
    let curr = [((at[0] * 2) + colsDim), ((at[2] * 2) + rowsDim)];
    let currDirection = 5;

    // if at the entrance of maze, move into the first cell
    if (curr[0] == -1 && curr[1] == 1) {
        console.log('entering maze');
        moveForward(playerDirection);
        curr = [((at[0] * 2) + colsDim), ((at[2] * 2) + rowsDim)];
    }
    // solve the maze
    solveMaze(maze, curr, end, direction, solution);
    printMaze(maze, true, solution);

    solutionLength -= 2;
    // now with solution matrix, animate the steps
    //while (curr[0] != end[0] || curr[1] != end[1]) {
    if (curr[0] != end[0] || curr[1] != end[1]) {




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

        console.log(`${nextMove} - move in direction ${directions[currDirection - 1]}`);


        // now we have the direction we need to move and the next move

        // lets align our current rotation to the direction we need
        // adjust playerDirection to the currDirection
        console.log(`player direction - ${playerDirection}, currDirection - ${currDirection}`);

        // how to rotate once animation is done??

        // apply rotations until right direction??
        let i = 0;
        while (playerDirection != currDirection && i < 1000) {
            console.log(isAnimating);
            if (!isAnimating) {
                console.log('rotating right');
                rotate("right");
            }
            i++;
        }

        if (playerDirection == currDirection) {
            moveForward(playerDirection);
            curr = nextMove;
            solutionLength--;
        }


    } else {
        if (playerDirection != 2) {
            rotate("right");
        } else {
            moveForward(playerDirection);
        }

    }


    //console.log(isAnimating);


    // // now lets move
    // console.log(`moving forward in direction - ${directions[playerDirection - 1]}`);
    // let completedMove = false;
    // while (!completedMove) {
    //     if (!isAnimating) {
    //         moveForward(playerDirection);
    //         completedMove = true;
    //         console.log('move completed');
    //     }
    // }

    //}
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
    }
    if (isAnimating) {
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
    }
    if (isAnimating) {
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

// main driver
function main() {
    canvas = document.getElementById("gl-canvas");
    if (initGL(canvas) == -1)
        return -1;
    document.onkeydown = keyDownCallback;

    maze = generateMaze({ cols: colsDim, rows: rowsDim });
    generate3DMaze(maze, positions, colors);

    // init ctm, model_view & projection matrix
    ctm = createIdentity();
    model_view = createIdentity();
    projection = createIdentity();

    init(positions, colors);

    initPlayer();
    display();
}

// Start the player outside the entrance of the maze
function initPlayer() {
    // want player to start 1 cell outside maze
    // at defines the cell the player is currently in
    // eye is outside cell for frustrum to view entire cell

    eye = [-((colsDim - 1) / 2) - 2, .6, -((rowsDim - 1) / 2), 1];
    at = [-((colsDim - 1) / 2) - 1, .6, -((rowsDim - 1) / 2), 1];
    up = [0, 1, 0, 0];

    // define the initial starting point of the player
    model_player_view = look_at(eye, at, up);
    model_view = model_player_view;

    // define the player frustrum 
    projection_player = frustrum(-.4, .4, -.4, .4, -1, -20);
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