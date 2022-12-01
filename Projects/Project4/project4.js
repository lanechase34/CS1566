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

// information required for light source
let lightSource = {
    "shininess": 50,
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

// colors for world in RGB
let colorCodes = {
    "orange": [255, 140, 0],
    "darkorange": [220, 88, 42],
    "grey": [105, 105, 105],
    "black": [0, 0, 0],
    "red": [255, 0, 0],
    "green": [0, 255, 0],
    "white": [255, 255, 255],
    "pink": [255, 192, 203],
    "yellow": [255, 255, 0],
    "purple": [191, 64, 191],
    "gold": [255, 215, 0],
    "blue": [0, 0, 255],
    "darkgrey": [90, 90, 90],
    "lime": [208, 255, 20]
}

// length of vertices for each unique object
let objectLength = {
    "cube": 36,
    "sphere": 3672,
    "cylinder": 864,
    "cone": 0,
}

//positions, colors, normals arrays
let positions = [];
let colors = [];
let normals = [];
// model view, projection
let model_view = [];
let projection = [];

function keyDownCallback(event) {
    console.log(event.keyCode);
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
    let eyeZ = [0, 5, player.r, 1];
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

    // Set the light location
    gl.uniform4fv(light_position_location, new Float32Array(lightSource.position));

    // Set the shininess
    gl.uniform1f(shininess_location, lightSource.shininess);

    // Set the attenuation
    gl.uniform1f(attenuation_constant_location, lightSource.attenuation_constant);
    gl.uniform1f(attenuation_linear_location, lightSource.attenuation_linear);
    gl.uniform1f(attenuation_quadratic_location, lightSource.attenuation_quadratic);

    let move;
    let ctm;

    // World base
    move = translate(pieceLocations[0][0], pieceLocations[0][1], pieceLocations[0][2]);
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(mmMult(move, pieceFrames[0])));
    gl.drawArrays(gl.TRIANGLES, 0, objectLength.cylinder);

    // Robot
    // As each piece gets added, they inherit the previous piece's transformations to build a hierarchy


    // Base
    ctm = mmMult(robotCtm.base, mmMult(pieceCtms[1], pieceFrames[1]));
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    gl.drawArrays(gl.TRIANGLES, objectLength.cylinder, objectLength.cylinder);

    // Arm0
    ctm = mmMult(robotCtm.base, mmMult(pieceCtms[1], mmMult(pieceCtms[2], pieceFrames[2])));
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    gl.drawArrays(gl.TRIANGLES, objectLength.cylinder, objectLength.cylinder);

    // Joint1
    ctm = mmMult(robotCtm.base, mmMult(pieceCtms[1], mmMult(pieceCtms[2], mmMult(pieceCtms[3], pieceFrames[3]))));
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    gl.drawArrays(gl.TRIANGLES, objectLength.cylinder, objectLength.cylinder);

    // Arm1
    ctm = mmMult(robotCtm.base, mmMult(pieceCtms[1], mmMult(pieceCtms[2], mmMult(pieceCtms[3], mmMult(pieceCtms[4], mmMult(robotCtm.arm1, pieceFrames[4]))))));
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    gl.drawArrays(gl.TRIANGLES, objectLength.cylinder, objectLength.cylinder);

    // Joint2
    ctm = mmMult(robotCtm.base, mmMult(pieceCtms[1], mmMult(pieceCtms[2], mmMult(pieceCtms[3], mmMult(pieceCtms[4], mmMult(robotCtm.arm1, mmMult(pieceCtms[5], pieceFrames[5])))))));
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    gl.drawArrays(gl.TRIANGLES, objectLength.cylinder, objectLength.cylinder);

    // Arm2
    ctm = mmMult(robotCtm.base, mmMult(pieceCtms[1], mmMult(pieceCtms[2], mmMult(pieceCtms[3], mmMult(pieceCtms[4], mmMult(robotCtm.arm1, mmMult(pieceCtms[5], mmMult(pieceCtms[6], mmMult(robotCtm.arm2, pieceFrames[6])))))))));
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    gl.drawArrays(gl.TRIANGLES, objectLength.cylinder, objectLength.cylinder);

    // Joint3
    ctm = mmMult(robotCtm.base, mmMult(pieceCtms[1], mmMult(pieceCtms[2], mmMult(pieceCtms[3], mmMult(pieceCtms[4], mmMult(robotCtm.arm1, mmMult(pieceCtms[5], mmMult(pieceCtms[6], mmMult(robotCtm.arm2, mmMult(pieceCtms[7], pieceFrames[7]))))))))));
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    gl.drawArrays(gl.TRIANGLES, objectLength.cylinder, objectLength.cylinder);

    // Arm3
    ctm = mmMult(robotCtm.base, mmMult(pieceCtms[1], mmMult(pieceCtms[2], mmMult(pieceCtms[3], mmMult(pieceCtms[4], mmMult(robotCtm.arm1, mmMult(pieceCtms[5], mmMult(pieceCtms[6], mmMult(robotCtm.arm2, mmMult(pieceCtms[7], mmMult(pieceCtms[8], mmMult(robotCtm.arm3, pieceFrames[8]))))))))))));
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    gl.drawArrays(gl.TRIANGLES, objectLength.cylinder, objectLength.cylinder);

    // Wrist
    ctm = mmMult(robotCtm.base, mmMult(pieceCtms[1], mmMult(pieceCtms[2], mmMult(pieceCtms[3], mmMult(pieceCtms[4], mmMult(robotCtm.arm1, mmMult(pieceCtms[5], mmMult(pieceCtms[6], mmMult(robotCtm.arm2, mmMult(pieceCtms[7], mmMult(pieceCtms[8], mmMult(robotCtm.arm3, mmMult(pieceCtms[9], mmMult(robotCtm.wrist, pieceFrames[9]))))))))))))));
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    gl.drawArrays(gl.TRIANGLES, objectLength.cylinder, objectLength.cylinder);

    // Palm
    ctm = mmMult(robotCtm.base, mmMult(pieceCtms[1], mmMult(pieceCtms[2], mmMult(pieceCtms[3], mmMult(pieceCtms[4], mmMult(robotCtm.arm1, mmMult(pieceCtms[5], mmMult(pieceCtms[6], mmMult(robotCtm.arm2, mmMult(pieceCtms[7], mmMult(pieceCtms[8], mmMult(robotCtm.arm3, mmMult(pieceCtms[9], mmMult(robotCtm.wrist, mmMult(pieceCtms[10], pieceFrames[10])))))))))))))));
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    gl.drawArrays(gl.TRIANGLES, objectLength.cylinder * 2, objectLength.cube);

    // Left Finger
    ctm = mmMult(robotCtm.base, mmMult(pieceCtms[1], mmMult(pieceCtms[2], mmMult(pieceCtms[3], mmMult(pieceCtms[4], mmMult(robotCtm.arm1, mmMult(pieceCtms[5], mmMult(pieceCtms[6], mmMult(robotCtm.arm2, mmMult(pieceCtms[7], mmMult(pieceCtms[8], mmMult(robotCtm.arm3, mmMult(pieceCtms[9], mmMult(robotCtm.wrist, mmMult(pieceCtms[10], mmMult(pieceCtms[11], mmMult(robotCtm.leftFinger, pieceFrames[11])))))))))))))))));
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    gl.drawArrays(gl.TRIANGLES, (objectLength.cylinder * 2) + objectLength.cube, objectLength.cube);


    // RightFinger
    ctm = mmMult(robotCtm.base, mmMult(pieceCtms[1], mmMult(pieceCtms[2], mmMult(pieceCtms[3], mmMult(pieceCtms[4], mmMult(robotCtm.arm1, mmMult(pieceCtms[5], mmMult(pieceCtms[6], mmMult(robotCtm.arm2, mmMult(pieceCtms[7], mmMult(pieceCtms[8], mmMult(robotCtm.arm3, mmMult(pieceCtms[9], mmMult(robotCtm.wrist, mmMult(pieceCtms[10], mmMult(pieceCtms[12], mmMult(robotCtm.rightFinger, pieceFrames[12])))))))))))))))));
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    gl.drawArrays(gl.TRIANGLES, (objectLength.cylinder * 2) + objectLength.cube, objectLength.cube);


    // for (let i = 1; i <= 3; i++) {
    //     move = translate(pieceLocations[i][0], pieceLocations[i][1], pieceLocations[i][2]);
    //     ctm = mmMult(robotCtm.base, mmMult(move, pieceCtms[i]));
    //     gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    //     gl.drawArrays(gl.TRIANGLES, objectLength.cylinder, objectLength.cylinder);
    // }

    // // Arm1, Joint2
    // for (let i = 4; i <= 5; i++) {
    //     move = translate(pieceLocations[i][0], pieceLocations[i][1], pieceLocations[i][2]);
    //     ctm = mmMult(robotCtm.base, mmMult(robotCtm.arm1, mmMult(move, pieceCtms[i])));
    //     gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    //     gl.drawArrays(gl.TRIANGLES, objectLength.cylinder, objectLength.cylinder);
    // }

    // // Arm2, Joint 3
    // for (let i = 6; i <= 7; i++) {
    //     move = translate(pieceLocations[i][0], pieceLocations[i][1], pieceLocations[i][2]);
    //     ctm = mmMult(robotCtm.base, mmMult(robotCtm.arm1, mmMult(robotCtm.arm2, mmMult(move, pieceCtms[i]))));
    //     gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    //     gl.drawArrays(gl.TRIANGLES, objectLength.cylinder, objectLength.cylinder);
    // }

    // // Arm3 
    // for (let i = 8; i <= 8; i++) {
    //     move = translate(pieceLocations[i][0], pieceLocations[i][1], pieceLocations[i][2]);
    //     ctm = mmMult(robotCtm.base, mmMult(robotCtm.arm1, mmMult(robotCtm.arm2, mmMult(robotCtm.arm3, mmMult(move, pieceCtms[i])))));
    //     gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    //     gl.drawArrays(gl.TRIANGLES, objectLength.cylinder, objectLength.cylinder);
    // }

    // // Wrist
    // for (let i = 9; i <= 9; i++) {
    //     move = translate(pieceLocations[i][0], pieceLocations[i][1], pieceLocations[i][2]);
    //     ctm = mmMult(robotCtm.base, mmMult(robotCtm.arm1, mmMult(robotCtm.arm2, mmMult(robotCtm.arm3, mmMult(robotCtm.wrist, mmMult(move, pieceCtms[i]))))));
    //     gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    //     gl.drawArrays(gl.TRIANGLES, objectLength.cylinder, objectLength.cylinder);
    // }

    // // Palm
    // for (let i = 10; i <= 10; i++) {
    //     move = translate(pieceLocations[i][0], pieceLocations[i][1], pieceLocations[i][2]);
    //     ctm = mmMult(robotCtm.base, mmMult(robotCtm.arm1, mmMult(robotCtm.arm2, mmMult(robotCtm.arm3, mmMult(robotCtm.wrist, mmMult(move, pieceCtms[i]))))));
    //     gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    //     gl.drawArrays(gl.TRIANGLES, objectLength.cylinder * 2, objectLength.cube);
    // }

    // // Left Finger
    // move = translate(pieceLocations[11][0], pieceLocations[11][1], pieceLocations[11][2]);
    // ctm = mmMult(robotCtm.base, mmMult(robotCtm.arm1, mmMult(robotCtm.arm2, mmMult(robotCtm.arm3, mmMult(robotCtm.wrist, mmMult(robotCtm.leftFinger, mmMult(move, pieceCtms[11])))))));
    // gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    // gl.drawArrays(gl.TRIANGLES, (objectLength.cylinder * 2) + objectLength.cube, objectLength.cube);

    // // Right Finger
    // move = translate(pieceLocations[12][0], pieceLocations[12][1], pieceLocations[12][2]);
    // ctm = mmMult(robotCtm.base, mmMult(robotCtm.arm1, mmMult(robotCtm.arm2, mmMult(robotCtm.arm3, mmMult(robotCtm.wrist, mmMult(robotCtm.rightFinger, mmMult(move, pieceCtms[12])))))));
    // gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    // gl.drawArrays(gl.TRIANGLES, (objectLength.cylinder * 2) + objectLength.cube, objectLength.cube);

}