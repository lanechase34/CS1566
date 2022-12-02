// Always execute in strict mode (less bug)
'use strict';

// These variables must be global variables.
// Some callback functions may need to access them.
var gl = null;
var canvas = null;
var ctm_location;
var model_view_location;
var projection_location;

var light_position_location;
var shininess_location;
var attenuation_constant_location;
var attenuation_linear_location;
var attenuation_quadratic_location;

let lightSource = {
    "shininess": 30,
    "lightPosition": [],
    "attenuation_constant": 0,
    "attenuation_linear": .2,
    "attenuation_quadratic": 0
}

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

function init(positions, colors, normals) {
    // Load and compile shader programs
    var shaderProgram = initShaders(gl, "vertex-shader", "fragment-shader");
    if (shaderProgram == -1)
        return -1;
    gl.useProgram(shaderProgram);
    // Allocate memory in a graphics card
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, 4 * 4 * (positions.length + colors.length + normals.length), gl.STATIC_DRAW);
    // Transfer positions and put it at the beginning of the buffer
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, to1DF32Array(positions));
    // Transfer colors and put it right after positions
    gl.bufferSubData(gl.ARRAY_BUFFER, 4 * 4 * positions.length, to1DF32Array(colors));
    // Transfer normals and put right after positions and colors
    gl.bufferSubData(gl.ARRAY_BUFFER, 4 * 4 * (positions.length + colors.length), to1DF32Array(normals));

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

    // Normals of each vertex for lighting
    var vNormal_location = gl.getAttribLocation(shaderProgram, "vNormal");
    if (vNormal_location == -1) {
        alert("Unable to locate vNormal");
        return -1;
    }
    gl.enableVertexAttribArray(vNormal_location);
    // vNormal starts at end of positions + colors
    gl.vertexAttribPointer(vNormal_location, 4, gl.FLOAT, false, 0, 4 * 4 * (positions.length + colors.length));

    // Current Transformation Matrix - locate and enable "ctm"
    ctm_location = gl.getUniformLocation(shaderProgram, "ctm");
    if (ctm_location == null) {
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

    // Light source location
    light_position_location = gl.getUniformLocation(shaderProgram, "light_position");
    if (light_position_location == -1) {
        alert("Unable to locate light position");
        return -1;
    }

    // Shininess
    shininess_location = gl.getUniformLocation(shaderProgram, "shininess");
    if (shininess_location == -1) {
        alert("Unable to locate shininess");
        return -1;
    }

    // Attenuation 
    attenuation_constant_location = gl.getUniformLocation(shaderProgram, "attenuation_constant");
    if (attenuation_constant_location == -1) {
        alert("Unable to locate attenuation constant");
        return -1;
    }
    attenuation_linear_location = gl.getUniformLocation(shaderProgram, "attenuation_linear");
    if (attenuation_linear_location == -1) {
        alert("Unable to locate attenuation linear");
        return -1;
    }
    attenuation_quadratic_location = gl.getUniformLocation(shaderProgram, "attenuation_quadratic");
    if (attenuation_quadratic_location == -1) {
        alert("Unable to locate attenuation quadratic");
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
let darkgrey = [90, 90, 90];

// intialize positions/colors arrays
let positions = [];
let colors = [];

// keep track of object normals
let normals = [];

// model view, projection
let model_view = [];
let projection = [];

let cubeLength = 36;
let sphereLength = 3672;

let isAnimating = true;

let theta = 0;
let phi = 0;
let r = 10;

let lightAdjustment = .2;

function keyDownCallback(event) {
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
        // w, a, s, d, q, e - adjust light source location
        // w - -z
        case 87:
            pieceLocations[24][2] -= lightAdjustment;
            adjustLightPosition();
            break;
        // s + z
        case 83:
            pieceLocations[24][2] += lightAdjustment;
            adjustLightPosition();
            break;
        // a - x
        case 65:
            pieceLocations[24][0] -= lightAdjustment;
            adjustLightPosition();
            break;
        // d +x
        case 68:
            pieceLocations[24][0] += lightAdjustment;
            adjustLightPosition();
            break;
        // q -y
        case 81:
            pieceLocations[24][1] -= lightAdjustment;
            adjustLightPosition();
            break;
        // e +y
        case 69:
            pieceLocations[24][1] += lightAdjustment;
            adjustLightPosition();
            break;
        // space bar
        case 32:
            if (isAnimating) {
                isAnimating = false;
            } else {
                isAnimating = true;
                requestAnimationFrame(animate);
            }
            break;
        // o increase attenuation
        case 79:
            lightSource.attenuation_linear += .01;
            display();
            break;
        // l decrease attenuation (intensity)
        case 76:
            lightSource.attenuation_linear -= .01;
            display();
            break;
        // i increase shininess
        case 73:
            lightSource.shininess += 1;
            display();
            break;
        // k decrease shininess
        case 75:
            lightSource.shininess -= 1;
            display();
            break;
        // u increase animation speed
        case 85:
            animationIncrement += .1;
            break;
        // j decrease animation speed
        case 74:
            animationIncrement -= .1;
            break;
    }
}

// Adjust zoom based on scroll effect
function mouseWheelCallback(event) {
    // zoom out -> decrease r
    if (event.wheelDeltaY < 0) {
        r += .5;
    }
    // zoom in -> increase r
    else if (event.wheelDeltaY > 0) {
        r -= .5;
    }
    adjustPlayerView();
}

// by adjusting theta, phi, and r, we modify the player's position (eye)
// player always looks at origin
let at = [0, 0, 0, 1];
let eye;
let up = [0, 1, 0, 0];
/**
 * Adjust our model view based on our current eye, at position will always point at origin
 * @param  - true if we are initializing the world
 */
function adjustPlayerView(initialize = false) {
    let eyeX = rotateX(theta);
    let eyeY = rotateY(phi);
    let eyeZ = [0, 0, r, 1];
    eye = matrixVectorMult(mmMult(eyeY, eyeX), eyeZ);

    model_view = look_at(eye, at, up);

    if (!initialize) display();
}


/**
 * Adjust light source to new position and redraw colors with updated light location
 */
function adjustLightPosition() {
    pieceCtms[24] = translate(pieceLocations[24][0], pieceLocations[24][1], pieceLocations[24][2]);
    lightSource.lightPosition = pieceCtms[24];
    display();
}

/**
 * Create the world (1 cube, 2 sphere)
 * Initialize camera, generate normals, send everything to graphics
 */
function main() {
    canvas = document.getElementById("gl-canvas");
    if (initGL(canvas) == -1)
        return -1;
    document.onkeydown = keyDownCallback;
    canvas.onwheel = mouseWheelCallback;

    generateWorld(positions, colors);

    adjustPlayerView(true);

    projection = frustrum(-1, 1, -1, 1, -1, -20);

    generateNormals(normals);

    init(positions, colors, normals);

    isAnimating = false;
    requestAnimationFrame(animate);
}



let alpha = 170;
let bottomStep = [0, -1.1, 0, 0];
let topStep = [0, 1, 0, 0];
let zeroStep = [0, -.1, 0, 0];
let animationIncrement = 2;
/**
 * Animate 4 rolling balls about the origin
 * Animate 16 platforms raising for ball to pass over and lowering when not in use
 * Each ball / platform combo travels at different speed depending on distance from origin
 */
function animate() {
    // four large platforms
    for (let i = 0; i < 4; i++) {
        pieceCtms[i] = translate(pieceLocations[i][0], pieceLocations[i][1], pieceLocations[i][2]);
    }
    // sixteen small platforms
    for (let i = 4; i < 20; i++) {
        // increment counters accounting for speed adjustment
        animationCounters[i] += animationIncrement * speedAdjs[i];

        // if > 359, reset to 0
        if (animationCounters[i] > 359) animationCounters[i] = 0;
        // need to calculate QPrime (distnance to move platform on y axis)
        let QPrime;

        // 350 - 10, at the top
        // 10 - 180, moving to bottom
        // 180 - 350, moving to top

        let curr = animationCounters[i];

        // move to bottom
        if (10 <= curr && curr < 180) {
            QPrime = vectorAdd(zeroStep, scalarVectorMult((curr - 10) / alpha, bottomStep));
        }
        // move to top
        else if (180 <= curr && curr < 350) {
            QPrime = vectorAdd(bottomStep, scalarVectorMult((curr - 180) / alpha, topStep));
        }
        // we are at the top, waiting for ball remain at this pos
        else {
            QPrime = zeroStep;
        }

        pieceCtms[i] = mmMult(translate(0, QPrime[1], 0), translate(pieceLocations[i][0], pieceLocations[i][1], pieceLocations[i][2]));
    }

    // sphere rotate around origin animation
    // sphere needs to rotate about itself to show rolling effect
    for (let i = 20; i < 24; i++) {
        animationCounters[i] += animationIncrement * speedAdjs[i];
        if (animationCounters[i] > 359) animationCounters[i] = 0;

        // calculate rolling effect
        // calculate about vector from current position
        let aboutV = vectorNormalize([pieceLocations[i][0], pieceLocations[i][1], pieceLocations[i][2], 0]);
        // determine amount of degrees to rotate aboutV based on theta degree counter
        let beta = -animationCounters[i] * 3;
        let rollCtm = createRoll(aboutV, beta);

        pieceCtms[i] = mmMult(rotateY(animationCounters[i]), mmMult(translate(pieceLocations[i][0], pieceLocations[i][1], pieceLocations[i][2]), rollCtm));
    }

    // light source
    pieceCtms[24] = translate(pieceLocations[24][0], pieceLocations[24][1], pieceLocations[24][2]);

    display();
    if (isAnimating) {
        requestAnimationFrame(animate)
    }
}

/**
 * Create rolling effect by rotating object about arbitrary axis
 * @param vector vector to rotate about
 * @param theta degree of rotation
 */
function createRoll(aboutV, theta) {
    // get d
    let d = Math.sqrt((aboutV[1] ** 2) + (aboutV[2] ** 2));

    // rotate X thetaX
    let rX = createMatrix(4, 4);
    rX[0][0] = 1;
    rX[3][3] = 1;
    rX[1][1] = aboutV[2] / d;
    rX[2][2] = aboutV[2] / d;
    rX[1][2] = aboutV[1] / d;
    rX[2][1] = -1 * aboutV[1] / d;

    // rotate Y thetaY
    let rY = createMatrix(4, 4);
    rY[1][1] = 1;
    rY[3][3] = 1;
    rY[0][0] = d;
    rY[2][2] = d;
    rY[0][2] = -1 * aboutV[0];
    rY[2][0] = aboutV[0];

    let trackBallCtm = mmMult(matrixTranspose(rX), mmMult(rY, mmMult(rotateZ(theta), mmMult(matrixTranspose(rY), rX))));
    return trackBallCtm;
}

/**
 * Generate normals for every object in positions array
 * First two objects are cubes, second two are spheres
 * @param normals - array of normals
 */
function generateNormals(normals) {
    // first two objects in positions arrays are cubes
    // to calculate triangle normal, u cross v = normal
    // each triangle will share same normal since flat
    for (let i = 0; i < cubeLength * 2; i += 3) {
        let u = vectorSub(positions[i], positions[i + 1]);
        let v = vectorSub(positions[i], positions[i + 2]);
        let currNormal = vectorNormalize(crossProduct(u, v));
        normals.push(currNormal);
        normals.push(currNormal);
        normals.push(currNormal);
    }

    // generate normal for spheres
    for (let i = cubeLength * 2; i < (cubeLength * 2) + (sphereLength); i++) {
        // calculate sphere normal by transforming point on sphere to vector by subtracting the origin
        let currNormal = vectorNormalize(vectorSub(positions[i], [0, 0, 0, 1]));
        normals.push(currNormal);
    }

    // generate normal for light
    for (let i = (cubeLength * 2) + sphereLength; i < (cubeLength * 2) + (sphereLength * 2); i++) {
        // calculate sphere normal by transforming point on sphere to vector by subtracting the origin
        // inverse the normal for light
        let currNormal = scalarVectorMult(-1, vectorNormalize(vectorSub(positions[i], [0, 0, 0, 1])));
        normals.push(currNormal);
    }

    return;
}

/**
 * Display to the canvas
 */
function display() {
    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw each piece individually with separate ctms

    // Set the model view & projection matrices
    gl.uniformMatrix4fv(model_view_location, false, to1DF32Array(model_view));
    gl.uniformMatrix4fv(projection_location, false, to1DF32Array(projection));

    // Set the light location
    let light_position = [pieceLocations[24][0], pieceLocations[24][1], pieceLocations[24][2], 1];
    gl.uniform4fv(light_position_location, new Float32Array(light_position));

    // Set the shininess
    gl.uniform1f(shininess_location, lightSource.shininess);

    // Set the attenuation
    gl.uniform1f(attenuation_constant_location, lightSource.attenuation_constant);
    gl.uniform1f(attenuation_linear_location, lightSource.attenuation_linear);
    gl.uniform1f(attenuation_quadratic_location, lightSource.attenuation_quadratic);

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

    // Draw light source
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(pieceCtms[24]));
    gl.drawArrays(gl.TRIANGLES, (2 * cubeLength) + (sphereLength), sphereLength);
}
