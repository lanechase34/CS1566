// Always execute in strict mode (less bug)
'use strict';

// These variables must be global variables.
// Some callback functions may need to access them.
var gl = null;
var canvas = null;
var ctm_location;
var ctms = [[[1.0, 0.0, 0.0, 0.0],
[0.0, 1.0, 0.0, 0.0],
[0.0, 0.0, 1.0, 0.0],
[0.0, 0.0, 0.0, 1.0]],
[[1.0, 0.0, 0.0, 0.0],
[0.0, 0.87, -0.50, 0.0],
[0.0, 0.50, 0.87, 0.0],
[0.0, 0.0, 0.0, 1.0]],
[[1.0, 0.0, 0.0, 0.0],
[0.0, 0.50, -0.87, 0.0],
[0.0, 0.87, 0.50, 0.0],
[0.0, 0.0, 0.0, 1.0]],
[[1.0, 0.0, 0.0, 0.0],
[0.0, 0.0, -1.0, 0.0],
[0.0, 1.0, 0.0, 0.0],
[0.0, 0.0, 0.0, 1.0]]];
var ctm_index = 0;
var degs = [0, 30, 60, 90];

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


// intialize positions/colors arrays to store object
let positions = [];
let colors = [];
// start index / end index for cone in positions/colors array
let coneStart;
let coneEnd;

function keyDownCallback(event) {
    if (event.keyCode == 32) {
        ctm_index += 1;
        if (ctm_index == 4)
            ctm_index = 0;
        console.log("Tilting backward " + degs[ctm_index] + " degrees")
        drawCone();
    }
}

// main driver
function main() {
    canvas = document.getElementById("gl-canvas");
    if (initGL(canvas) == -1)
        return -1;
    document.onkeydown = keyDownCallback;
    initCone();
    drawCone();
}

// generate cone vertices and send to graphics card
function initCone() {
    // cone information
    let coneDegrees = 10;
    // figure out start index - end index to know length of what to draw for cone
    coneStart = positions.length;
    generateConeVertices(positions, coneDegrees);
    coneEnd = positions.length;
    generateColors(colors, coneEnd - coneStart);
    init(positions, colors);
}

// calls draw arrays to draw cone
function drawCone() {
    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Set the ctm
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctms[ctm_index]));
    // draw triangles
    gl.drawArrays(gl.TRIANGLES, coneStart, coneEnd - coneStart);
}