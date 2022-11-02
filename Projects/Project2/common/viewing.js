// Functions for viewing world

/**
 * 
 * @param eye camera placed at 
 * @param at what camera points at
 * @param up up vector of camera for tilt
 * @returns 4x4 matrix
 */
function look_at(eye, at, up) {
    let rotateM = createMatrix(4, 4);

    // Calculate VPN
    let n = vectorNormalize(vectorSub(eye, at));
    // Calculate right vector
    let u = vectorNormalize(crossProduct(up, n));
    // Calculate new up vector
    let v = vectorNormalize(crossProduct(n, u));

    rotateM[0] = u;
    rotateM[1] = v;
    rotateM[2] = n;
    rotateM[3][3] = 1;

    rotateM = matrixTranspose(rotateM);

    // translate so origin is centered at eye
    let translateM = translate(-eye[0], -eye[1], -eye[2]);

    // translate first, then rotate
    result = mmMult(rotateM, translateM);
    return result;
}

function debugLookAt() {
    let eye = [0, 1, 1, 0];
    let at = [0, 0, 0, 0];
    let up = [0, 1, 0, 0];
    printMatrix(look_at(eye, at, up));

    eye = [0, 0, 0, 0];
    at = [0, 0, -1, 0];
    up = [0, 1, 0, 0];
    printMatrix(look_at(eye, at, up));

    eye = [0, 0, 0, 0];
    at = [0, 0, -1000, 0];
    up = [0, 1, 0, 0];
    printMatrix(look_at(eye, at, up));
}

// translate and scale our desired view volume to fit into the OpenGL canonical view volume
// -1, 1, -1, 1, 1, -1 xyz respectively
// user defined view volume is defined by the 6 parameters to ortho()
// translate center of mass to origin -> scale user view volume to fit into OpenGl view volume (done in one combined step)
function ortho(left, right, bottom, top, near, far) {
    let result = createMatrix(4, 4);
    result[0][0] = 2 / (right - left);
    result[1][1] = 2 / (top - bottom);
    result[2][2] = 2 / (near - far);
    result[3][3] = 1;
    result[3][0] = -1 * (right + left) / (right - left);
    result[3][1] = -1 * (top + bottom) / (top - bottom);
    result[3][2] = -1 * (near + far) / (near - far);

    return result;
}

// shear (H), scale(S), and fit(N) frustrum into OpenGL canonical to perform perspective viewing
// perspective = NSH
// ** near is front of viewer **
function frustrum(left, right, bottom, top, near, far) {
    let result = createMatrix(4, 4);
    result[0][0] = (-2 * near) / (right - left);
    result[1][1] = (-2 * near) / (top - bottom);
    result[2][2] = (near + far) / (far - near);
    result[3][3] = 0;
    result[2][0] = (left + right) / (right - left);
    result[2][1] = (bottom + top) / (top - bottom);
    result[2][3] = -1;
    result[3][2] = (-2 * near * far) / (far - near);

    return result;
}