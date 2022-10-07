// vector operations

// print 4x1 column vector in nice format
function printVector(v) {
    let output = '';
    for (let i = 0; i < v.length; i++) {
        output = output + v[i].toFixed(4) + '\n';
    }
    console.log(output);
}

// create vector
function createVector(length) {
    let v = new Array(length).fill(0);
    return v;
}

// scalar-vector multiplication
function scalarVectorMult(s, v) {
    let result = createVector(v.length);
    for (let i = 0; i < v.length; i++) {
        result[i] = s * v[i];
    }
    return result;
}

// vector-vector addition
function vectorAdd(v1, v2) {
    if (v1.length !== v2.length) return -1;
    let result = createVector(v1.length);
    for (let i = 0; i < v1.length; i++) {
        result[i] = v1[i] + v2[i];
    }
    return result;
}

// vector-vector subtraction
function vectorSub(v1, v2) {
    if (v1.length !== v2.length) return -1;
    return vectorAdd(v1, scalarVectorMult(-1, v2));
}

// magnitude of vector
function vectorMagnitude(v) {
    let result = 0;
    for (let i = 0; i < v.length; i++) {
        result += Math.pow(v[i], 2);
    }
    return Math.sqrt(result);
}

// normalize vector
function vectorNormalize(v) {
    return scalarVectorMult((1 / vectorMagnitude(v)), v);
}

// dot product
function dotProduct(v1, v2) {
    if (v1.length !== v2.length) return -1;
    let result = 0;
    for (let i = 0; i < v1.length; i++) {
        result += v1[i] * v2[i];
    }
    return result;
}

// cross product
function crossProduct(v1, v2) {
    if (v1.length !== v2.length) return -1;
    let result = createVector(v1.length);
    result[0] = (v1[1] * v2[2]) - (v1[2] * v2[1]);
    result[1] = (v1[2] * v2[0]) - (v1[0] * v2[2]);
    result[2] = (v1[0] * v2[1]) - (v1[1] * v2[0]);
    result[3] = 0;
    return result;
}


// matrix operations (column - major format) m[0] represents 1st col, m[1] represents 2nd col, etc.

// print matrix in nice format
function printMatrix(m) {
    // assume uniform matrix (not jagged)
    let cols = m.length;
    let rows = m[0].length;

    let output = '';
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            output = output + " " + m[j][i].toFixed(4);
        }
        output += '\n';
    }
    console.log(output);
}

// create matrix
function createMatrix(cols, rows) {
    // create cols
    let m = new Array(cols);
    // create rows
    for (let i = 0; i < cols; i++) {
        m[i] = new Array(rows).fill(0);
    }
    return m;
}

// check to see if both matrices have the same dimensions, returns true if they do
function checkDimensions(m1, m2) {
    if (m1.length === m2.length && m1[0].length === m2[0].length) {
        return true;
    }
    return false;
}

// scalar-matrix multiplication
function scalarMatrixMult(s, m) {
    let result = createMatrix(m.length, m[0].length);
    for (let i = 0; i < m.length; i++) {
        for (let j = 0; j < m[i].length; j++) {
            result[i][j] = s * m[i][j];
        }
    }
    return result;
}

// matrix matrix addition
function matrixAdd(m1, m2) {
    if (!checkDimensions(m1, m2)) return -1;
    let result = createMatrix(m1.length, m1[0].length);
    for (let i = 0; i < m1.length; i++) {
        for (let j = 0; j < m1[i].length; j++) {
            result[i][j] = m1[i][j] + m2[i][j];
        }
    }
    return result;
}

// matrix matrix subtraction
function matrixSub(m1, m2) {
    return matrixAdd(m1, scalarMatrixMult(-1, m2));
}

// matrix vector multiplication
function matrixVectorMult(m, v) {
    // initialize empty column matrix
    let result = createVector(v.length);
    // repeated, scalar vector mult then addition
    for (let i = 0; i < v.length; i++) {
        result = vectorAdd(result, scalarVectorMult(v[i], m[i]));
    }
    return result;
}

// matrix matrix multiplication
function matrixMatrixMult(m1, m2) {
    if (!checkDimensions(m1, m2)) return -1;
    // initialize empty col matrix
    let result = new Array(m1.length);
    // perform repeated, matrix vector mult, and assign to correct column in result
    for (let i = 0; i < m1.length; i++) {
        result[i] = matrixVectorMult(m1, m2[i]);
    }
    return result;
}

// transpose of matrix m^T - 1st col becomes 1st row, 2nd col becomes 2nd row, etc..
function matrixTranspose(m) {
    let result = createMatrix(m[0].length, m.length);
    for (let i = 0; i < m.length; i++) {
        for (let j = 0; j < m[0].length; j++) {
            result[j][i] = m[i][j];
        }
    }
    return result;
}

// inverse of matrix m^-1
function matrixInverse(m) {
    let minor = matrixOfMinor(m);
    let cofactor = matrixCofactor(minor);
    let transpose = matrixTranspose(cofactor);
    let determinant = matrixDeterminant(m, minor);
    // if determininant of A is 0, there is no inverse
    if (determinant === 0) return 'No inverse of M';
    return scalarMatrixMult((1 / determinant), transpose);
}

// helper functions for inverse of matrix
// matrix of minor
function matrixOfMinor(m) {
    let result = createMatrix(m.length, m[0].length);
    // m ij is the determinant of matrix where row i and column j are removed
    // aei + bfg + cdh - gec - hfa - idb

    // first col
    result[0][0] = (m[1][1] * m[2][2] * m[3][3]) + (m[2][1] * m[3][2] * m[1][3]) + (m[3][1] * m[1][2] * m[2][3]) - (m[1][3] * m[2][2] * m[3][1]) - (m[2][3] * m[3][2] * m[1][1]) - (m[3][3] * m[1][2] * m[2][1]);
    result[0][1] = (m[0][1] * m[2][2] * m[3][3]) + (m[2][1] * m[3][2] * m[0][3]) + (m[3][1] * m[0][2] * m[2][3]) - (m[0][3] * m[2][2] * m[3][1]) - (m[2][3] * m[3][2] * m[0][1]) - (m[3][3] * m[0][2] * m[2][1]);
    result[0][2] = (m[0][1] * m[1][2] * m[3][3]) + (m[1][1] * m[3][2] * m[0][3]) + (m[3][1] * m[0][2] * m[1][3]) - (m[0][3] * m[1][2] * m[3][1]) - (m[1][3] * m[3][2] * m[0][1]) - (m[3][3] * m[0][2] * m[1][1]);
    result[0][3] = (m[0][1] * m[1][2] * m[2][3]) + (m[1][1] * m[2][2] * m[0][3]) + (m[2][1] * m[0][2] * m[1][3]) - (m[0][3] * m[1][2] * m[2][1]) - (m[1][3] * m[2][2] * m[0][1]) - (m[2][3] * m[0][2] * m[1][1]);

    // 2nd col
    result[1][0] = (m[1][0] * m[2][2] * m[3][3]) + (m[2][0] * m[3][2] * m[1][3]) + (m[3][0] * m[1][2] * m[2][3]) - (m[1][3] * m[2][2] * m[3][0]) - (m[2][3] * m[3][2] * m[1][0]) - (m[3][3] * m[1][2] * m[2][0]);
    result[1][1] = (m[0][0] * m[2][2] * m[3][3]) + (m[2][0] * m[3][2] * m[0][3]) + (m[3][0] * m[0][2] * m[2][3]) - (m[0][3] * m[2][2] * m[3][0]) - (m[2][3] * m[3][2] * m[0][0]) - (m[3][3] * m[0][2] * m[2][0]);
    result[1][2] = (m[0][0] * m[1][2] * m[3][3]) + (m[1][0] * m[3][2] * m[0][3]) + (m[3][0] * m[0][2] * m[1][3]) - (m[0][3] * m[1][2] * m[3][0]) - (m[1][3] * m[3][2] * m[0][0]) - (m[3][3] * m[0][2] * m[1][0]);
    result[1][3] = (m[0][0] * m[1][2] * m[2][3]) + (m[1][0] * m[2][2] * m[0][3]) + (m[2][0] * m[0][2] * m[1][3]) - (m[0][3] * m[1][2] * m[2][0]) - (m[1][3] * m[2][2] * m[0][0]) - (m[2][3] * m[0][2] * m[1][0]);

    // 3rd col
    result[2][0] = (m[1][0] * m[2][1] * m[3][3]) + (m[2][0] * m[3][1] * m[1][3]) + (m[3][0] * m[1][1] * m[2][3]) - (m[1][3] * m[2][1] * m[3][0]) - (m[2][3] * m[3][1] * m[1][0]) - (m[3][3] * m[1][1] * m[2][0]);
    result[2][1] = (m[0][0] * m[2][1] * m[3][3]) + (m[2][0] * m[3][1] * m[0][3]) + (m[3][0] * m[0][1] * m[2][3]) - (m[0][3] * m[2][1] * m[3][0]) - (m[2][3] * m[3][1] * m[0][0]) - (m[3][3] * m[0][1] * m[2][0]);
    result[2][2] = (m[0][0] * m[1][1] * m[3][3]) + (m[1][0] * m[3][1] * m[0][3]) + (m[3][0] * m[0][1] * m[1][3]) - (m[0][3] * m[1][1] * m[3][0]) - (m[1][3] * m[3][1] * m[0][0]) - (m[3][3] * m[0][1] * m[1][0]);
    result[2][3] = (m[0][0] * m[1][1] * m[2][3]) + (m[1][0] * m[2][1] * m[0][3]) + (m[2][0] * m[0][1] * m[1][3]) - (m[0][3] * m[1][1] * m[2][0]) - (m[1][3] * m[2][1] * m[0][0]) - (m[2][3] * m[0][1] * m[1][0]);

    // 4th col
    result[3][0] = (m[1][0] * m[2][1] * m[3][2]) + (m[2][0] * m[3][1] * m[1][2]) + (m[3][0] * m[1][1] * m[2][2]) - (m[1][2] * m[2][1] * m[3][0]) - (m[2][2] * m[3][1] * m[1][0]) - (m[3][2] * m[1][1] * m[2][0]);
    result[3][1] = (m[0][0] * m[2][1] * m[3][2]) + (m[2][0] * m[3][1] * m[0][2]) + (m[3][0] * m[0][1] * m[2][2]) - (m[0][2] * m[2][1] * m[3][0]) - (m[2][2] * m[3][1] * m[0][0]) - (m[3][2] * m[0][1] * m[2][0]);
    result[3][2] = (m[0][0] * m[1][1] * m[3][2]) + (m[1][0] * m[3][1] * m[0][2]) + (m[3][0] * m[0][1] * m[1][2]) - (m[0][2] * m[1][1] * m[3][0]) - (m[1][2] * m[3][1] * m[0][0]) - (m[3][2] * m[0][1] * m[1][0]);
    result[3][3] = (m[0][0] * m[1][1] * m[2][2]) + (m[1][0] * m[2][1] * m[0][2]) + (m[2][0] * m[0][1] * m[1][2]) - (m[0][2] * m[1][1] * m[2][0]) - (m[1][2] * m[2][1] * m[0][0]) - (m[2][2] * m[0][1] * m[1][0]);

    // created the minor row major, so need to transpose
    return matrixTranspose(result);
}

// matrix cofactor - apply a 4x4 checkerboard of pluses/minuses
function matrixCofactor(m) {
    // focus only on elements turning negative
    let result = scalarMatrixMult(1, m);
    // 1st col
    result[0][1] *= -1
    result[0][3] *= -1
    // 2nd col
    result[1][0] *= -1
    result[1][2] *= -1
    // 3rd col
    result[2][1] *= -1
    result[2][3] *= -1
    // 4th col
    result[3][0] *= -1
    result[3][2] *= -1
    return result;
}

// matrix determinant
function matrixDeterminant(m1, m2) {
    // |A| = (a11 * m11) - (a12 * m12) + (a13 * m13) - (a14 * m14)
    return (m1[0][0] * m2[0][0]) - (m1[0][1] * m2[0][1]) + (m1[0][2] * m2[0][2]) - (m1[0][3] * m2[0][3])
}


