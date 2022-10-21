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

// start/end index for cone
let coneStart;
let coneEnd;
// start/end index for cube
let cubeStart;
let cubeEnd;
// start/end index for cylinder
let cylinderStart;
let cylinderEnd;
// start/end index for sphere
let sphereStart;
let sphereEnd;
// start/end index for torus
let torusStart;
let torusEnd;

// current transformation matrix
let ctms = [];
// trackball ctm
let trackBallCtm = [];
// scaling ctm
let scalingCtm = [];

// track time for frictionless spinning animation
let isAnimating = false;
let timeStart;
let timeEnd;

// keep track of the current object drawn
let currObj;

function keyDownCallback(event) {
    // determine key press and update current drawn shape
    switch (event.keyCode) {
        case 67:
            currObj = 'Cube';
            break;
        case 79:
            currObj = 'Cone';
            break;
        case 76:
            currObj = 'Cylinder';
            break;
        case 72:
            currObj = 'Sphere';
            break;
        case 84:
            currObj = 'Torus';
            break;
    }
    display();
}

// vectors to generate arbitrary about axis
let vStart;
let vEnd;
let mouseDown;

function mouseMoveCallback(event) {
    if (mouseDown) {
        vEnd = createVector(4);
        let webCoord = convertCoord(event);
        // if z = NaN, we are clicking outside object so ignore
        if (webCoord.webZ > 0) {
            vEnd[0] = webCoord.webX;
            vEnd[1] = webCoord.webY;
            vEnd[2] = webCoord.webZ;

            // make sure the mouse release at location different than starting vector
            if (verifyAboutVector()) {
                // with starting point vector and end point vector, create the trackball ctm
                getTrackBallCtm();
                display();
            }
        }
    }
}

// verify about vector is valid
function verifyAboutVector() {
    // make sure vectors are declared
    if (vStart != null && vEnd != null && vStart.length === 4 && vEnd.length === 4) {
        // check that they aren't the same
        if (vStart[0] != vEnd[0] || vStart[1] != vEnd[1] || vStart[2] != vEnd[2]) {
            return true;
        }
    }
    return false;
}

// capture initial starting point and convert to starting vector
function mouseDownCallback(event) {
    // if spinning animation, stop
    if (isAnimating) {
        isAnimating = false;
        mouseDown = false;
    }
    else {
        // capture start time when mouse pressed
        timeStart = new Date();

        mouseDown = true;
        // capture coordinates and convert to webGL canonical
        vStart = createVector(4);
        let webCoord = convertCoord(event);
        // if z = NaN, we are clicking outside object so ignore
        if (webCoord.webZ > 0) {
            vStart[0] = webCoord.webX;
            vStart[1] = webCoord.webY;
            vStart[2] = webCoord.webZ;
        }
    }
}

// capture release ending point and convert to ending vector
function mouseUpCallback(event) {
    // capture time (seconds) when mouse released
    timeEnd = new Date();
    mouseDown = false;

    // make sure the mouse release at location different than starting vector
    if (verifyAboutVector()) {
        trackBallAnimate();
    }
}

// convert canvas coordinates to webGL canonical coordinates
function convertCoord(event) {
    // capture canvas mouse down coordinates
    let canvasX = event.clientX - canvas.offsetLeft;
    let canvasY = event.clientY - canvas.offsetTop;

    // convert to webGL coordinates (origin at 0,0)
    let webX = (canvasX - (canvas.width / 2)) / (canvas.width / 2);
    let webY = (-canvasY + (canvas.width / 2)) / (canvas.width / 2);

    // get z using vector length = 1
    // z = sqrt(1 - x^2 - y^2)
    let webZ = Math.sqrt(1 - webX ** 2 - webY ** 2);

    return { 'webX': webX, 'webY': webY, 'webZ': webZ };
}

// generate trackBallCtm 
function getTrackBallCtm() {
    // check to make sure both vectors are defined and have z initialized > 0
    if (vStart[2] > 0 && vEnd[2] > 0) {
        // create about vector by performing vStart x vEnd
        let vAbout = crossProduct(vStart, vEnd);
        // normalize about vector
        vAbout = vectorNormalize(vAbout);

        // get d
        let d = Math.sqrt(vAbout[1] ** 2 + vAbout[2] ** 2);

        // rotate X thetaX
        let rX = createMatrix(4, 4);
        rX[0][0] = 1;
        rX[3][3] = 1;
        rX[2][2] = vAbout[2] / d;
        rX[1][1] = vAbout[2] / d;
        rX[1][2] = vAbout[1] / d;
        rX[2][1] = -1 * vAbout[1] / d;

        // rotate Y thetaY
        let rY = createMatrix(4, 4);
        rY[1][1] = 1;
        rY[3][3] = 1;
        rY[0][0] = d;
        rY[0][2] = -1 * vAbout[0];
        rY[2][0] = vAbout[0];
        rY[2][2] = d;

        // u dot v = |u||v|cos(theta)
        // since u, v normalized, their maginudes are 1 therefore theta = arccos(u dot v)
        let theta = Math.acos(dotProduct(vStart, vEnd)) * 2.5//* (180 / Math.PI);
        trackBallCtm = mmMult(mmMult(matrixTranspose(rX), mmMult(rY, mmMult(rotateZ(theta), mmMult(matrixTranspose(rY), rX)))), trackBallCtm);
    }
}

// when doing the trackball rotation, if user clicks and drags for a short amount of time,
// object will continue moving in the direction and the desired speed indefinitely =
function trackBallAnimate() {
    // if moving glass ball for .8 seconds or less, use that ctm to spin
    if (timeEnd - timeStart <= 800) {
        // call the animation
        isAnimating = true;
        requestAnimationFrame(spinning);
    }
}

// frictionless spinning animation
function spinning() {
    getTrackBallCtm();
    display();
    if (isAnimating) requestAnimationFrame(spinning);
}


// performs scaling when using mouse scroll wheel
let scaleFactor = 1;
function mouseWheelCallback(event) {
    // scale up
    if (event.wheelDeltaY > 0) {
        scaleFactor += .02;
    }
    // scale down
    else if (event.wheelDeltaY < 0) {
        scaleFactor -= .02;
    }
    scalingCtm = scaling(scaleFactor, scaleFactor, scaleFactor);

    // display
    display(currObj);
}

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

    // generate shapes
    genCone({ degrees: 10 });
    genCube();
    genCylinder({ degrees: 10 });
    genSphere({ x: 10, y: 10 });
    genTorus({ y: 10, z: 10 });

    currObj = 'Sphere';

    // init ctms
    ctms = createIdentity();
    scalingCtm = createIdentity();
    trackBallCtm = createIdentity();

    init(positions, colors);
    display();
}

/**
 * Generate shapes
 */
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
    generateSphereVertices(positions, arg.x, arg.y);
    sphereEnd = positions.length;
    generateColors(colors, sphereEnd - sphereStart);
}

// generate torus vertices/colors
function genTorus(arg) {
    torusStart = positions.length;
    generateTorusVertices(positions, arg.y, arg.z);
    torusEnd = positions.length;
    generateColors(colors, torusEnd - torusStart);
}

// calls draw arrays to draw cone
function display() {
    let start;
    let end;
    switch (currObj) {
        case 'Cone':
            start = coneStart;
            end = coneEnd;
            break;
        case 'Cylinder':
            start = cylinderStart;
            end = cylinderEnd;
            break;
        case 'Cube':
            start = cubeStart;
            end = cubeEnd;
            break;
        case 'Sphere':
            start = sphereStart;
            end = sphereEnd;
            break;
        case 'Torus':
            start = torusStart;
            end = torusEnd;
            break;
        default:
            console.log('incorrect current shape');
            return;
    }

    ctms = mmMult(scalingCtm, trackBallCtm);
    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Set the ctm
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctms));
    // draw triangles
    gl.drawArrays(gl.TRIANGLES, start, end - start);
}

function debug() {
    console.log(`positions length - ${positions.length}`);
    console.log(`colors length - ${colors.length}`);

    console.log(`sphere length - ${sphereEnd - sphereStart}`);
    console.log(`torus length - ${torusEnd - torusStart}`);
}