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
            display();
            break;
        // solve maze
        case 86:
            // test random position solution
            // to solve from random position, use direction = 5 and the current coords
            // start = [(Math.floor(Math.random() * (colsDim * 2) / 2) * 2) + 1, (Math.floor(Math.random() * (rowsDim * 2) / 2) * 2) + 1];
            // console.log(`trying solution from ${start} to ${end}`);
            // direction = 5;
            solution = createMatrix(maze.length, maze[0].length);
            solved = false;
            solutionLength = 0;
            // solve the maze
            solveMaze(maze, start, end, direction, solution);
            printMaze(maze, true, solution);

            // animate over solution array?
            // animate()
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
    // determine which direction we are facing and move that way
    switch (direction) {
        // north corresponds with -z axis, east corresponds with +x axis
        // facing north
        case 1:
            // move in negative z direction
            eye = [eye[0], eye[1], eye[2] - 1, 0];
            at = [at[0], eye[1], at[2] - 1, 0];
            break;
        // facing east
        case 2:
            // move in positive x direction
            eye = [eye[0] + 1, eye[1], eye[2], 0];
            at = [at[0] + 1, eye[1], at[2], 0];
            break;
        // facing south
        case 3:
            // move in positive z direction
            eye = [eye[0], eye[1], eye[2] + 1, 0];
            at = [at[0], eye[1], at[2] + 1, 0];
            break;
        // facing west
        case 4:
            // move in negative x direction
            eye = [eye[0] - 1, eye[1], eye[2], 0];
            at = [at[0] - 1, eye[1], at[2], 0];
            break;
    }
    up = [0, 1, 0, 0];

    // define the new player location
    model_player_view = look_at(eye, at, up);
    model_view = model_player_view;

    printVector(eye);
    printVector(at);

    display();
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
    if (direction == "left") {
        playerDirection -= 1;
        if (playerDirection < 1) playerDirection = 4;
    }
    else if (direction == "right") {
        playerDirection += 1;
        if (playerDirection > 4) playerDirection = 0;
    }
}



// ** need to animate from player current position **
function mapView() {
    // if already looking at map, go back to player view
    if (lookingAtMap) {
        model_view = model_player_view;
        projection = projection_player;
        display();
        lookingAtMap = false;
    } else {
        // let scale = colsDim / 2 + 2;
        // // place eye above maze and look at origin
        // // calculate look at and ortho projection
        // model_map_view = look_at([0, scale / 2, 0, 0], [0, 0, 0, 0], [0, 0, -1, 0]);
        // model_view = model_map_view;

        projection_map = ortho(-scale, scale, -scale, scale, scale, -scale);
        projection = projection_map;
        // display();
        isAnimating = true;
        animateMove(at, [0, colsDim / 2 + 2 / 2, 0, 0])
        lookingAtMap = true;
    }
}


// function to animate camera move?
// need start & end position and iterate over this move in small amounts til reach end

let magnitude = 500;
let alpha = 0;
let v;
function animateMove(start, end) {
    v = vectorSub(end - start);
    isAnimating = true;
    requestAnimationFrame(animate);
}

function animate() {
    alpha += 1;
    if (alpha > magnitude) {
        isAnimating = false;
    }
    else {
        model_map_view = look_at()
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

    eye = [-((colsDim - 1) / 2) - 2, .5, -((rowsDim - 1) / 2), 0];
    at = [-((colsDim - 1) / 2) - 1, .5, -((rowsDim - 1) / 2), 0];
    up = [0, 1, 0, 0];

    // define the initial starting point of the player
    model_player_view = look_at(eye, at, up);
    model_view = model_player_view;

    // define the player frustrum 
    projection_player = frustrum(-.5, .5, -.4, .5, -1, -20);
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