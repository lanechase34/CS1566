// trackball ctm
let trackBallCtm = [];
// scaling ctm
let scalingCtm = [];

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

// capture when mouse is released
function mouseUpCallback(event) {
    mouseDown = false;
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

// performs scaling when using mouse scroll wheel
let scaleFactor = 1;
let increment = .04;
function mouseWheelCallback(event) {
    // scale up
    if (event.wheelDeltaY > 0) {
        scaleFactor += increment;
    }
    // scale down
    else if (event.wheelDeltaY < 0) {
        scaleFactor -= increment;
    }
    scalingCtm = scaling(scaleFactor, scaleFactor, scaleFactor);

    // display
    display();
}