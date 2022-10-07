// scaling matrix
function scaling(x, y, z) {
    let result = createMatrix(4, 4);
    result[0][0] = x;
    result[1][1] = y;
    result[2][2] = z;
    result[3][3] = 1;
    return result;
}

// translation matrix
function translate(x, y, z) {
    let result = createMatrix(4, 4);
    result[0][0] = 1;
    result[1][1] = 1;
    result[2][2] = 1;
    result[3][3] = 1;
    result[3][0] = x;
    result[3][1] = y;
    result[3][2] = z;
    return result;
}

// rotate z matrix
function rotateZ(degrees) {
    let result = createMatrix(4, 4);
    result[0][0] = Math.cos(degrees * (Math.PI / 180));
    result[1][1] = Math.cos(degrees * (Math.PI / 180));
    result[0][1] = Math.sin(degrees * (Math.PI / 180));
    result[1][0] = -1 * Math.sin(degrees * (Math.PI / 180));
    result[2][2] = 1;
    result[3][3] = 1;
    return result;
}

// rotate x matrix
function rotateX(degrees) {
    let result = createMatrix(4, 4);
    result[1][1] = Math.cos(degrees * (Math.PI / 180));
    result[2][2] = Math.cos(degrees * (Math.PI / 180));
    result[2][1] = -1 * Math.sin(degrees * (Math.PI / 180));
    result[1][2] = Math.sin(degrees * (Math.PI / 180));
    result[3][3] = 1;
    result[0][0] = 1;
    return result;
}


// rotate y matrix
function rotateY(degrees) {
    let result = createMatrix(4, 4);
    result[0][0] = Math.cos(degrees * (Math.PI / 180));
    result[2][2] = Math.cos(degrees * (Math.PI / 180));
    result[2][0] = Math.sin(degrees * (Math.PI / 180));
    result[0][2] = -1 * Math.sin(degrees * (Math.PI / 180));
    result[1][1] = 1;
    result[3][3] = 1;
    return result;
}