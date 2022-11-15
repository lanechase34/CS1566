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
let blue = [0, 0, 255];

// intialize positions/colors arrays
let positions = [];
let colors = [];

// model view, projection
let model_view = [];
let projection = [];

let cubeLength = 36;
let sphereLength = 3672;

let isAnimating = true;


let theta = 0;
let phi = 0;
let r = 10;

function keyDownCallback(event) {
    console.log(event.keyCode);

    switch (event.keyCode) {
        // arrow up
        case 38:
            theta += 1;
            if (theta > 89) theta = 89;
            adjustPlayerView();
            break;
        // arrow down
        case 40:
            theta -= 1;
            if (theta < -89) theta = -89;
            adjustPlayerView();
            break;
        // arrow left
        case 37:
            phi -= 1;
            adjustPlayerView();
            break;
        // arrow right
        case 39:
            phi += 1;
            adjustPlayerView();
            break;
        // space bar
        case 32:
            if (isAnimating) {
                isAnimating = false;
            } else {
                isAnimating = true;
                requestAnimationFrame(animate);
            }
    }
}

// by adjusting theta, phi, and r, we modify the player's position (eye)
// player always looks at origin
let at = [0, 0, 0, 1];
let eye;
let up;

function adjustPlayerView() {
    let eyeX = rotateX(theta);
    let eyeY = rotateY(phi);
    let eyeZ = [0, 0, r, 1];
    eye = matrixVectorMult(mmMult(eyeY, eyeX), eyeZ);

    let up = [0, 1, 0, 0];
    model_view = look_at(eye, at, up);

    // adjust lighting effect
}

function main() {
    canvas = document.getElementById("gl-canvas");
    if (initGL(canvas) == -1)
        return -1;
    document.onkeydown = keyDownCallback;

    generateWorld(positions, colors);

    adjustPlayerView();

    projection = frustrum(-1, 1, -1, 1, -1, -20);
    //projection = ortho(-10, 10, -10, 10, 10, -15);

    init(positions, colors);

    requestAnimationFrame(animate);
}

function display() {
    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw each piece individually with separate ctms

    // Set the model view & projection matrices
    gl.uniformMatrix4fv(model_view_location, false, to1DF32Array(model_view));
    gl.uniformMatrix4fv(projection_location, false, to1DF32Array(projection));

    // Draw 4 large platforms
    for (let i = 0; i < 4; i++) {
        gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(pieceCtms[i]));
        gl.drawArrays(gl.TRIANGLES, 0, cubeLength);
    }

    // Draw 16 small platforms
    for (let i = 4; i < 20; i++) {
        gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(pieceCtms[i]));
        gl.drawArrays(gl.TRIANGLES, cubeLength, cubeLength);
    }

    // Draw 4 spheres
    for (let i = 20; i < 24; i++) {
        gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(pieceCtms[i]));
        gl.drawArrays(gl.TRIANGLES, 2 * cubeLength, sphereLength);
    }
}

let alpha = 360;

let bottomStep = [0, -1, 0, 0];

function animate() {
    // just move piece to proper location for now

    // four large platforms
    for (let i = 0; i < 4; i++) {
        pieceCtms[i] = translate(pieceLocations[i][0], pieceLocations[i][1], pieceLocations[i][2]);
    }

    let offset = 4;
    // sixteen small platforms
    for (let i = 4; i < 20; i++) {
        offset = i % offset > 3 ? offset * 2 : offset
        animationCounters[i] += 1 * speedAdjs[i % offset];

        if (animationCounters[i] > 360) animationCounters[i] = 0;
        let QPrime;

        // at bottom of animation
        if (animationCounters[i] < 20) {
            QPrime = bottomStep;
        }
        // move up
        else if (animationCounters[i] >= 20 && animationCounters[i] < 180) {
            QPrime = vectorAdd([0, 0, 0, 0], scalarVectorMult(animationCounters[i] / alpha, bottomStep));
        }
        // move down
        else if (animationCounters[i] >= 180 && animationCounters[i] < 340) {
            QPrime = vectorAdd([0, 0, 0, 0], scalarVectorMult(animationCounters[i] / alpha, bottomStep));
        }
        else {
            QPrime = [0, 0, 0, 0];
        }


        pieceCtms[i] = mmMult(translate(0, QPrime[1], 0), translate(pieceLocations[i][0], pieceLocations[i][1], pieceLocations[i][2]));

    }

    // sphere rotate around origin animation
    for (let i = 20; i < 24; i++) {
        animationCounters[i] += 1.5 * speedAdjs[i % 20];
        if (animationCounters[i] > 360) animationCounters[i] = 0;
        pieceCtms[i] = mmMult(rotateY(animationCounters[i]), translate(pieceLocations[i][0], pieceLocations[i][1], pieceLocations[i][2]));
    }

    display();

    if (isAnimating) {
        requestAnimationFrame(animate)
    }
}