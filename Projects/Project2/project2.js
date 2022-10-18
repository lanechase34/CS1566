// Always execute in strict mode (less bug)
'use strict';

// These variables must be global variables.
// Some callback functions may need to access them.
var gl = null;
var canvas = null;
var ctm_location;

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
    if (ctm_location == -1) {
        alert("Unable to locate ctm");
        return -1;
    }
    return 0;
}





// intialize positions/colors arrays
let positions = [];
let colors = [];


// current transformation matrix
let ctms = [];

// store maze
let maze;
// store maze solution
let solution;

// top left cell @ 1,1 
// bottom right cell @ 15,15
// 8x8 maze represented as 17x17 array
// indices 0-16, so 15,15 is the last cell in bottom right
// start of maze
let start = [1, 1];
// what direction you enter maze from
let direction = 4;
// exit of maze
let end = [15, 15];

// key down call back
function keyDownCallback(event) {
    switch (event.keyCode) {
        case 71:
            maze = generateMaze({ cols: 8, rows: 8 });
            break;
    }
    switch (event.keyCode) {
        case 83:
            solution = createMatrix(maze.length, maze[0].length);
            solved = false;
            // solve the maze
            solveMaze(maze, start, end, direction, solution);
            printMaze(maze, true, solution);
            break;
    }
}

let orange = [255, 140, 0];
let grey = [105, 105, 105];
let black = [0, 0, 0];


// main driver
function main() {
    canvas = document.getElementById("gl-canvas");
    if (initGL(canvas) == -1)
        return -1;
    document.onkeydown = keyDownCallback;
    // to capture mouse events in canvas
    canvas.onmousedown = mouseDownCallback;
    canvas.onmouseup = mouseUpCallback;
    canvas.onmousemove = mouseMoveCallback;
    canvas.onwheel = mouseWheelCallback;

    generateWorld(positions, colors, orange);
    generatePillar(positions, colors, grey, createIdentity());

    // init ctms
    ctms = createIdentity();
    scalingCtm = createIdentity();
    trackBallCtm = createIdentity();
    init(positions, colors);
    display();

}


// calls draw arrays to draw cone
function display() {
    ctms = mmMult(scalingCtm, trackBallCtm);
    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Set the ctm
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctms));
    // draw triangles
    gl.drawArrays(gl.TRIANGLES, 0, positions.length);
}

function debug() {
    console.log(`positions length - ${positions.length}`);
    console.log(`colors length - ${colors.length}`);
}