// Functions for viewing world

/**
 * 
 * @param eye camera placed at 
 * @param at what camera points at
 * @param up up vector of camera for tilt
 * @returns 4x4 matrix
 */

// let eye = [0, 1, 1, 1];
// let at = [0, 0, 0, 1];
// let up = [0, 1, 0, 1];

function look_at(eye, at, up) {
    // VPN = eye - at
    let vpn = vectorSub(eye, at);

    // D is the magnitude of VPN
    let d = vectorMagnitude(vpn);

    // Normalize the VPN
    let n = vectorNormalize(vpn);

    // Calculate up vector
    let vupN = crossProduct(up, n);

    let u = vectorNormalize(vupN);

    let nCrossu = crossProduct(n, u);

    let v = vectorNormalize(nCrossu);

    let result = createMatrix(4, 4);

    // result[0][0] = u[0];
    // result[1][0] = u[1];
    // result[2][0] = u[2];

    // result[0][1] = v[0];
    // result[1][1] = v[1];
    // result[2][1] = v[2];

    // result[0][2] = n[0];
    // result[1][2] = n[1];
    // result[2][2] = n[2];

    // result[3][3] = 1;
    // result[3][2] = -d;
    result[0] = u;
    result[1] = v;
    result[2] = n;

    result[3][3] = 1;

    result = matrixTranspose(result);
    result[3][2] = -d;

    return result;
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