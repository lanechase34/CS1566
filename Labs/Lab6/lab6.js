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
    if (ctm_location == -1) {
        alert("Unable to locate ctm");
        return -1;
    }

    // Model View Matrix - Locate and enable "model_view"
    model_view_location = gl.getUniformLocation(shaderProgram, "model_view");
    if (model_view_location == -1) {
        alert("Unable to locate model view");
        return -1;
    }

    // Project Matrix - Locate and enable "projection"
    projection_location = gl.getUniformLocation(shaderProgram, "projection");
    if (projection_location == -1) {
        alert("Unable to locate projection");
        return -1;
    }

    return 0;
}


// intialize positions/colors arrays
let positions = [];
let colors = [];

// current transformation matrix
let ctms = [];
// model view matrix
let model_view = [];
// projection matrix
let projection = [];



// colors for world in RGB
let orange = [255, 140, 0];
let darkorange = [220, 88, 42];
let grey = [105, 105, 105];
let black = [0, 0, 0];
let red = [255, 0, 0];
let green = [0, 255, 0];
let white = [255, 255, 255];


let isAnimating = true;
let eyeAdjustX = -.005;
let eyeAdjustY = -.005;
let eyeAdjustZ = -.005;


function lookAtAnimation() {
    if (eye[0] > 1) eyeAdjustX = -.005;
    if (eye[0] < -1) eyeAdjustX = .005;

    if (eye[1] > 1) eyeAdjustY = -.005;
    if (eye[1] < -1) eyeAdjustY = .005;

    if (eye[2] > 1) eyeAdjustZ = -.005;
    if (eye[2] < -1) eyeAdjustZ = .005;


    eye = vectorAdd(eye, [eyeAdjustX, eyeAdjustY, eyeAdjustZ, 0]);

    model_view = look_at(eye, at, up);

    display();
    if (isAnimating) requestAnimationFrame(lookAtAnimation);
}

let eye = [0, 1, 1, 1];
let at = [0, 0, 0, 1];
let up = [0, 1, 0, 1];
let orthoScale = -2;
// main driver
function main() {
    canvas = document.getElementById("gl-canvas");
    if (initGL(canvas) == -1)
        return -1;

    document.onkeydown = keyDownCallback;

    generateCubeVertices(positions);
    generateCubeColors(colors, positions.length);

    // init ctm, model_view & projection matrix
    ctms = createIdentity();

    model_view = look_at(eye, at, up);
    projection = ortho(-orthoScale, orthoScale, -orthoScale, orthoScale, orthoScale, -orthoScale);

    init(positions, colors);
    display();

    requestAnimationFrame(lookAtAnimation);
}


function keyDownCallback(event) {
    switch (event.keyCode) {
        case 32:
            if (isAnimating) {
                isAnimating = false;
            }
            else {
                isAnimating = true;
                requestAnimationFrame(lookAtAnimation);
            }
    }
}
// Display the current positions array and apply our transformation matricess
function display() {
    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the matrices
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctms));
    gl.uniformMatrix4fv(model_view_location, false, to1DF32Array(model_view));
    gl.uniformMatrix4fv(projection_location, false, to1DF32Array(projection));

    // Draw our positions array
    gl.drawArrays(gl.TRIANGLES, 0, positions.length);
}

function debug() {
    console.log(`positions length - ${positions.length}`);
    console.log(`colors length - ${colors.length}`);
}