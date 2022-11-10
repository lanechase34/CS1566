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

let model_view = [];
let projection = [];

let twinCubeLocation = [0, .5, 0, 1]; // center of mass between the top two cubes
let leftCubeLocation = [-.5, -.5, 0, 1];
let rightCubeLocation = [.5, -.5, 0, 1];

let twinCubeCtm = createIdentity();
let leftCubeCtm = createIdentity();
let rightCubeCtm = createIdentity();

let cubeLength = 36;

let isAnimating = true;

function keyDownCallback(event) {
    switch (event.keyCode) {
        case 32:
            if (isAnimating) {
                isAnimating = false;
            } else {
                isAnimating = true;
                requestAnimationFrame(animate);
            }
    }

}
function main() {
    canvas = document.getElementById("gl-canvas");
    if (initGL(canvas) == -1)
        return -1;
    document.onkeydown = keyDownCallback;

    // create cubes
    let cubeCtm = scaling(0.5, 0.5, 0.5);

    // Cube 1 centered at (-.5, .5, 0)
    generatePiece(positions, colors, cubeCtm, translate(-0.5, 0.5, 0));

    // Cube 2 centered at (.5, .5, 0)
    generatePiece(positions, colors, cubeCtm, translate(0.5, 0.5, 0));

    // Cube 3 & 4 share the same vertices
    generatePiece(positions, colors, cubeCtm, createIdentity());

    model_view = createIdentity();
    projection = createIdentity();

    init(positions, colors);

    requestAnimationFrame(animate);
}

// Display the current positions array and apply our transformation matricess
function display() {
    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw each cube individually
    // Set the matrices
    gl.uniformMatrix4fv(model_view_location, false, to1DF32Array(model_view));
    gl.uniformMatrix4fv(projection_location, false, to1DF32Array(projection));

    // top two cubes are drawn together
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(twinCubeCtm));
    gl.drawArrays(gl.TRIANGLES, 0, 2 * cubeLength);

    // left and right cube use the same set of vertices but are drawn differently due to their ctms
    // left cube
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(leftCubeCtm));
    gl.drawArrays(gl.TRIANGLES, 2 * cubeLength, cubeLength);

    // right cube
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(rightCubeCtm));
    gl.drawArrays(gl.TRIANGLES, 2 * cubeLength, cubeLength);
}

let twinCubeDegree = 0;
let leftCubeDegree = 0;
let rightCubeDegree = 0;
function animate() {
    // twin cube first
    twinCubeDegree += 1;
    if (twinCubeDegree > 360) twinCubeDegree = 1;
    twinCubeCtm = mmMult(translate(twinCubeLocation[0], twinCubeLocation[1], twinCubeLocation[2]), mmMult(rotateY(twinCubeDegree), translate(-twinCubeLocation[0], -twinCubeLocation[1], -twinCubeLocation[2])));

    // left cube
    leftCubeDegree += 1;
    if (leftCubeDegree > 360) leftCubeDegree = 1;
    leftCubeCtm = mmMult(translate(leftCubeLocation[0], leftCubeLocation[1], leftCubeLocation[2]), rotateZ(leftCubeDegree));

    // right cube
    rightCubeDegree += 1;
    if (rightCubeDegree > 360) rightCubeDegree = 1;
    rightCubeCtm = mmMult(translate(rightCubeLocation[0], rightCubeLocation[1], rightCubeLocation[2]), rotateX(rightCubeDegree));

    display();

    if (isAnimating) {
        requestAnimationFrame(animate);
    }

}