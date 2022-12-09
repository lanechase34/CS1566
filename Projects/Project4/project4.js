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

var flashlight_position_location;
var flashlight_direction_location;
var flashlight_alpha_location;
var flashlight_shininess_location;
var flashlight_attenuation_constant_location;
var flashlight_attenuation_linear_location;
var flashlight_attenuation_quadratic_location;

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

    // For robot flashlight light source
    flashlight_position_location = gl.getUniformLocation(shaderProgram, "flashlight_position");
    if (flashlight_position_location == -1) {
        alert("Unable to locate light position");
        return -1;
    }
    flashlight_direction_location = gl.getUniformLocation(shaderProgram, "flashlight_position");
    if (flashlight_position_location == -1) {
        alert("Unable to locate light position");
        return -1;
    }
    // Alpha
    flashlight_alpha_location = gl.getUniformLocation(shaderProgram, "flashlight_alpha");
    if (flashlight_alpha_location == -1) {
        alert("Unable to locate alpha");
        return -1;
    }
    // Shininess
    flashlight_shininess_location = gl.getUniformLocation(shaderProgram, "flashlight_shininess");
    if (flashlight_shininess_location == -1) {
        alert("Unable to locate shininess");
        return -1;
    }
    // Attenuation 
    flashlight_attenuation_constant_location = gl.getUniformLocation(shaderProgram, "flashlight_attenuation_constant");
    if (attenuation_constant_location == -1) {
        alert("Unable to locate attenuation constant");
        return -1;
    }
    flashlight_attenuation_linear_location = gl.getUniformLocation(shaderProgram, "flashlight_attenuation_linear");
    if (flashlight_attenuation_linear_location == -1) {
        alert("Unable to locate attenuation linear");
        return -1;
    }
    flashlight_attenuation_quadratic_location = gl.getUniformLocation(shaderProgram, "flashlight_attenuation_quadratic");
    if (flashlight_attenuation_quadratic_location == -1) {
        alert("Unable to locate attenuation quadratic");
        return -1;
    }

    return 0;
}

// information required for light source
let lightSource = {
    "shininess": 25,
    "position": [],
    "attenuation_constant": 0,
    "attenuation_linear": .075,
    "attenuation_quadratic": 0
}

// information required for player viewer
// adjusting theta (x), phi (y), r (z), we modify the player's position
// player always looks at origin
let player = {
    "eye": [0, 5, 10, 1],
    "at": [0, 5, 0, 1],
    "up": [0, 1, 0, 0],
    "theta": 0,
    "phi": 0,
    "r": 25
}

//positions, colors, normals arrays
let positions = [];
let colors = [];
let normals = [];
// model view, projection
let model_view = [];
let projection = [];

function keyDownCallback(event) {
    switch (event.keyCode) {
        // adjust player (and light)
        // arrow up
        case 38:
            player.theta += 1;
            if (player.theta > 89) player.theta = 89;
            adjustPlayerView();
            break;
        // arrow down
        case 40:
            player.theta -= 1;
            if (player.theta < -89) player.theta = -89;
            adjustPlayerView();
            break;
        // arrow left
        case 37:
            player.phi -= 1;
            adjustPlayerView();
            break;
        // arrow right
        case 39:
            player.phi += 1;
            adjustPlayerView();
            break;

        // base movement
        // rotate -y
        case 81:
            robotDegrees.base -= 1;
            adjustRobot();
            break;
        // rotate +y
        case 87:
            robotDegrees.base += 1;
            adjustRobot();
            break;

        // arm1 
        // up
        case 65:
            robotDegrees.arm1 -= 1;
            adjustRobot();
            break;
        // down
        case 90:
            robotDegrees.arm1 += 1;
            adjustRobot();
            break;

        // arm2
        // up
        case 83:
            robotDegrees.arm2 -= 1;
            adjustRobot();
            break;
        // down
        case 88:
            robotDegrees.arm2 += 1;
            adjustRobot();
            break;

        // arm3
        // up
        case 68:
            robotDegrees.arm3 -= 1;
            adjustRobot();
            break;
        // down
        case 67:
            robotDegrees.arm3 += 1;
            adjustRobot();
            break;

        // wrist
        // left
        case 69:
            robotDegrees.wrist -= 1;
            adjustRobot();
            break;
        // right
        case 82:
            robotDegrees.wrist += 1;
            adjustRobot();
            break;

        // fingers
        // closer
        case 70:
            robotDegrees.leftFinger += .05;
            robotDegrees.rightFinger -= .05;
            adjustRobot();
            break;
        // farther
        case 86:
            robotDegrees.leftFinger -= .05;
            robotDegrees.rightFinger += .05;
            adjustRobot();
            break;
    }
}

function mouseWheelCallback(event) {
    // zoom out -> increase r
    if (event.wheelDeltaY < 0) {
        player.r += .5;
    }
    // zoom in -> decrease r
    else if (event.wheelDeltaY > 0) {
        player.r -= .5;
    }
    adjustPlayerView();
}

/**
 * Adjust our model view based on our current eye, at position will always point at origin
 */
function adjustPlayerView(initialize = false) {
    let eyeX = rotateX(player.theta);
    let eyeY = rotateY(player.phi);
    let eyeZ = [0, 0, player.r, 1];

    player.eye = matrixVectorMult(mmMult(eyeY, eyeX), eyeZ);
    model_view = look_at(player.eye, player.at, player.up);

    // light position is always where player eye is
    lightSource.position = player.eye;

    if (!initialize) display();
}

/**
 * Create the world
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

    projection = frustrum(-1, 1, -1, 1, -1, -50);

    generateNormals();

    init(positions, colors, normals);

    if (normals.length !== positions.length || positions.length !== colors.length) console.log("incorrect dimensions");

    display();
}

/**
 * Draw to the canvas by applying individual ctms and translations
 */
function display() {
    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the model view & projection matrices
    gl.uniformMatrix4fv(model_view_location, false, to1DF32Array(model_view));
    gl.uniformMatrix4fv(projection_location, false, to1DF32Array(projection));

    // For player light
    // Set the light location
    gl.uniform4fv(light_position_location, new Float32Array(lightSource.position));
    // Set the shininess
    gl.uniform1f(shininess_location, lightSource.shininess);
    // Set the attenuation
    gl.uniform1f(attenuation_constant_location, lightSource.attenuation_constant);
    gl.uniform1f(attenuation_linear_location, lightSource.attenuation_linear);
    gl.uniform1f(attenuation_quadratic_location, lightSource.attenuation_quadratic);

    // For robot flashlight
    gl.uniform4fv(flashlight_position_location, new Float32Array(robotFlashlight.position));
    gl.uniform4fv(flashlight_direction_location, new Float32Array(robotFlashlight.direction));
    gl.uniform1f(flashlight_alpha_location, robotFlashlight.alpha);
    gl.uniform1f(flashlight_shininess_location, robotFlashlight.shininess);
    gl.uniform1f(flashlight_attenuation_constant_location, robotFlashlight.attenuation_constant);
    gl.uniform1f(flashlight_attenuation_linear_location, robotFlashlight.attenuation_linear);
    gl.uniform1f(flashlight_attenuation_quadratic_location, robotFlashlight.attenuation_quadratic);

    // Pieces stores object type, object starting vertex, object vertex length
    // Pieces[0] - robot cylinder, Pieces[1] - robot cube
    // Rest of pieces make up world
    // World
    let offset = 2; // first two pieces for robot
    for (let i = 0; i < pieceLocations.length; i++) {
        // apply pieceCtm to scale / orient in proper direction then apply move
        gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(mmMult(translate(pieceLocations[i][0], pieceLocations[i][1], pieceLocations[i][2]), pieceCtms[i])));
        gl.drawArrays(gl.TRIANGLES, pieces[i + offset][1], pieces[i + offset][2]);
    }

    // Robot
    // As each piece gets added, they inherit the previous piece's transformations to build a hierarchy
    // arm2 has arm2 tilt, inherits arm1 tilt, inherits base rotate, etc. 
    // the structure base->arm0->joint1->arm1->joint2->arm2->joint3->arm3->wrist->palm (branch) --> left finger, right finger

    let ctm = createIdentity();
    // Base, arm0, joint1, arm1, joint2, arm2, joint3, arm3, wrist (all cylinder)
    for (let i = 0; i <= 8; i++) {
        // all pieces rotate by base
        if (i === 0) ctm = mmMult(ctm, robotCtm.base);
        // arm1, joint2 (moved by arm1 tilt)
        if (i === 3) ctm = mmMult(ctm, robotCtm.arm1);
        // arm2, joint3 (moved by arm2 tilt)
        if (i === 5) ctm = mmMult(ctm, robotCtm.arm2);
        // arm3 (moved by arm3 tilt)
        if (i === 7) ctm = mmMult(ctm, robotCtm.arm3);
        // wrist (moved by wrist rotate)
        if (i === 8) ctm = mmMult(ctm, robotCtm.wrist);

        // add our current objects ctm to put piece on previous piece's frame
        ctm = mmMult(ctm, robotCtms[i]);
        // add our current object frame ctm to orient in its frame and scale to correct size
        gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(mmMult(ctm, robotFrames[i])));
        gl.drawArrays(gl.TRIANGLES, pieces[0][1], pieces[0][2]);
    }

    let tempCtm = createIdentity();
    // Palm, Left Finger, Right Finger (all cube)
    for (let i = 9; i <= 11; i++) {
        // Left Finger
        if (i === 10) tempCtm = mmMult(robotCtms[9], robotCtm.leftFinger);
        // Right Finger
        if (i === 11) tempCtm = mmMult(robotCtms[9], robotCtm.rightFinger);

        // Since we have varying movement ctms for individual finger, don't assign directly to ctm and just pass to graphics
        gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(mmMult(ctm, mmMult(tempCtm, mmMult(robotCtms[i], robotFrames[i])))));
        gl.drawArrays(gl.TRIANGLES, pieces[1][1], pieces[1][2]);
    }

    // Update robot flashlight position
    robotFlashlight.position = matrixVectorMult(mmMult(ctm, mmMult(robotCtms[9], robotFrames[9])), [0, 0, 0, 1]);
    // Update robot flashlight cone projection
    robotFlashlight.direction = matrixVectorMult(mmMult(ctm, mmMult(translate(0, robotFlashlight.coneHeight, 0), mmMult(robotCtms[9], robotFrames[9]))), [0, 0, 0, 1]);
}