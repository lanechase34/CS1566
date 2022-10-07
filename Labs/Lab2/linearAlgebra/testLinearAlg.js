function main() {
    // initialize test vectors and matrices

    // testing lab instructions
    // let v1 = [1, 2, 3, 4];
    // let v2 = [5, 6, 7, 8];
    // let m1 = [[1, -5, 9, 13], [2, 6, -10, 14], [3, 7, 11, 15], [4, 8, 12, -16]];
    // let m2 = [[4, 8, 12, 16], [3, 7, 11, 15], [2, 6, 10, 14], [1, 5, 9, 13]];
    // let s = 3.0;

    // demo with TA
    let v1 = [10.05, 72.63, -82.17, -81.15]

    let v2 = [-78.40, -22.40, 89.17, -71.11]

    let m1 = [

        [-47.28, -15.54, 50.58, -75.31],

        [-24.87, -71.42, -70.05, 66.31],

        [19.07, -17.87, 4.77, 79.18],

        [90.39, -44.49, 13.44, 7.29]

    ];

    let m2 = [

        [-28.44, 72.09, 47.66, -82.19],

        [94.60, -66.39, 11.38, 67.11],

        [64.76, 97.18, -34.10, 59.25],

        [17.61, 81.95, 91.14, 92.48]

    ];

    let s = -85.64


    // vector operations
    console.log("v1");
    printVector(v1);

    console.log("v2");
    printVector(v2);

    console.log("s * v1");
    printVector(scalarVectorMult(s, v1));

    console.log("v1 + v2");
    printVector(vectorAdd(v1, v2));

    console.log("v1 - v2");
    printVector(vectorSub(v1, v2));

    console.log("|v|");
    console.log(vectorMagnitude(v1));

    console.log("v^ (normalize)");
    printVector(vectorNormalize(v1));

    console.log("v1 dot v2");
    console.log(dotProduct(v1, v2));

    console.log("v1 cross v2");
    printVector(crossProduct(v1, v2));


    // matrix operations
    console.log("m1");
    printMatrix(m1);

    console.log("m2");
    printMatrix(m2);

    console.log("s * m1");
    printMatrix(scalarMatrixMult(s, m1));

    console.log("m1 + m2");
    printMatrix(matrixAdd(m1, m2));

    console.log("m1 - m2");
    printMatrix(matrixSub(m1, m2));

    console.log("m1 * m2");
    printMatrix(matrixMatrixMult(m1, m2));

    console.log("m1^T (transpose)");
    printMatrix(matrixTranspose(m1));

    console.log("m1^-1 (inverse)");
    printMatrix(matrixInverse(m1));

    console.log("m1 * v1");
    printVector(matrixVectorMult(m1, v1));

    console.log("m1 * m1^-1 (returns identity I)");
    printMatrix(matrixMatrixMult(m1, matrixInverse(m1)));

    console.log("m1^-1 * m1(returns identity I)");
    printMatrix(matrixMatrixMult(matrixInverse(m1), m1));
}


