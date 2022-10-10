// Always execute in strict mode (less bug)
'use strict';

// These variables must be global variables.
// Some callback functions may need to access them.
var gl = null;
var canvas = null;
var ctm_location;
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


// intialize positions/colors arrays
let positions = [];
let colors = [];
// start index / end for cone
let coneStart;
let coneEnd;
// start index / end for cube
let cubeStart;
let cubeEnd;
// start index / end for cylinder
let cylinderStart;
let cylinderEnd;
// start / end index for sphere
let sphereStart;
let sphereEnd;

// transformation matrix for rotate
let ctms = [];

// keep track of the current object drawn
let currObj = 'Cone';

// for rotate and animation
let isAnimating = false;
let x = 1;
let y = 1;
let z = 1;
let degree = 0;
let currAxis = 'z';

function keyDownCallback(event) {
    //console.log(event.keyCode);
    if (event.keyCode == 32) {
        ctm_index += 1;
        if (ctm_index == 4)
            ctm_index = 0;
        console.log("Tilting backward " + degs[ctm_index] + " degrees")
        ctms = [[[1.0, 0.0, 0.0, 0.0],
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
        ctms = ctms[ctm_index];
    }

    // animation

    // rotate z axis
    if (event.keyCode == 90) {
        if (isAnimating) {
            isAnimating = false;
        }
        else {
            isAnimating = true;
            currAxis = 'z';
            requestAnimationFrame(animate);
        }
    }

    // rotate x axis
    if (event.keyCode == 88) {
        if (isAnimating) {
            isAnimating = false;
        }
        else {
            isAnimating = true;
            currAxis = 'x';
            requestAnimationFrame(animate);
        }
    }

    // rotate y axis
    if (event.keyCode == 89) {
        if (isAnimating) {
            isAnimating = false;
        }
        else {
            isAnimating = true;
            currAxis = 'y';
            requestAnimationFrame(animate);
        }
    }

    // scaling
    // zoom in w - 87
    if (event.keyCode == 87) {
        x = x + .1;
        y = y + .1;
        z = z + .1;
        ctms = scaling(x, y, z);
    }
    // zoom out s - 83
    if (event.keyCode == 83) {
        x = x - .1;
        y = y - .1;
        z = z - .1;
        ctms = scaling(x, y, z);
    }

    // custom animation
    if (event.keyCode == 71) {
        if (isAnimating) {
            isAnimating = false;
        }
        else {
            isAnimating = true;
            currAxis = 'custom';
            requestAnimationFrame(animate);
        }
    }

    // change shape being displayed
    // new shape means translate to origin
    // cube
    if (event.keyCode == 67 || currObj == 'Cube') {
        currObj = 'Cube';
        display(cubeStart, cubeEnd);
    }
    // cone
    if (event.keyCode == 79 || currObj == 'Cone') {
        currObj = 'Cone';
        display(coneStart, coneEnd);
    }
    // cylinder
    if (event.keyCode == 76 || currObj == 'Cylinder') {
        currObj = 'Cylinder';
        display(cylinderStart, cylinderEnd);
    }

    // sphere
    if (event.keyCode == 72 || currObj == 'Sphere') {
        currObj = 'Sphere';
        display(sphereStart, sphereEnd);
    }

}

// main driver
function main() {
    canvas = document.getElementById("gl-canvas");
    if (initGL(canvas) == -1)
        return -1;
    document.onkeydown = keyDownCallback;

    // genCone({ degrees: 10 });
    // genCube({ degrees: 90 });
    //genCylinder({ degrees: 10 });
    genSphere();
    currObj = 'Sphere';
    console.log(positions);
    ctms = createIdentity();
    init(positions, colors);
    display(sphereStart, sphereEnd);
}

// generate cone vertices/colors
function genCone(arg) {
    // figure out start index - end index to know length of what to draw for cone
    coneStart = positions.length;
    generateConeVertices(positions, arg.degrees);
    coneEnd = positions.length;
    generateColors(colors, coneEnd - coneStart);
}

// generate cube vertices/colors
function genCube(arg) {
    cubeStart = positions.length;
    generateCubeVertices(positions);
    cubeEnd = positions.length;
    generateCubeColors(colors, cubeEnd - cubeStart);
}

// generate cylinder vertices/colors
function genCylinder(arg) {
    cylinderStart = positions.length;
    generateCylinderVertices(positions, arg.degrees);
    cylinderEnd = positions.length;
    generateColors(colors, cylinderEnd - cylinderStart);
}

// generate sphere vertices/colors
function genSphere(arg) {
    sphereStart = positions.length;
    generateSphereVertices(positions);
    sphereEnd = positions.length;
    generateColors(colors, sphereEnd - sphereStart);
}

// calls draw arrays to draw cone
function display(start, end) {
    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Set the ctm
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctms));
    // draw triangles
    gl.drawArrays(gl.TRIANGLES, start, end - start);
}


let translates = [
    [0, .5, 0],
    [.5, .5, 0],
    [.5, 0, 0],
    [.5, -.5, 0],
    [0, -.5, 0],
    [-.5, -.5, 0],
    [-.5, 0, 0,],
    [-.5, .5, 0]
]
let currTranslate = 0;

function animate() {
    degree += .5;
    if (degree > 360) {
        degree = 0;

        currTranslate++
        if (currTranslate > translates.length - 1) currTranslate = 0;

    }

    if (currAxis === 'z') ctms = rotateZ(degree);
    else if (currAxis === 'y') ctms = rotateY(degree);
    else if (currAxis === 'x') ctms = rotateX(degree);
    else if (currAxis === 'custom') ctms = matrixMatrixMult(rotateX(degree), matrixMatrixMult(rotateZ(degree), matrixMatrixMult(rotateY(degree), scaling(.5, .5, .5))));
    else ctms = null;


    //let curr = translates[currTranslate];
    //ctms = matrixMatrixMult(translate(curr[0], curr[1], curr[2]), ctms);


    if (currObj === 'Cube') display(cubeStart, cubeEnd);
    else if (currObj === 'Cone') display(coneStart, coneEnd);
    else if (currObj === 'Cylinder') display(cylinderStart, cylinderEnd);
    else if (currObj === 'Sphere') display(sphereStart, sphereEnd);
    else console.log('incorrect shape / no shape loaded');

    if (isAnimating) requestAnimationFrame(animate);

}

function debug() {
    console.log(`positions length - ${positions.length}`);
    console.log(`colors length - ${colors.length}`);
}