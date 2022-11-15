// generate vertices needed for sphere
// x and y are defined in function call
function generateSphereVertices(positions, x, y) {
    // start with basis point at origin +z 1
    let point = [0, 0, 1, 1];

    // debug -- change how tall we want the sphere bands to be made
    let from = -80;
    let to = 80;

    // generate top of sphere
    // generate top & bottom of sphere
    // get the starting point at top of sphere
    let top = matrixVectorMult(rotateX(from), point);
    // get point in center of top circle
    let topCenter = createVector(4);
    topCenter[0] = 0;
    topCenter[1] = top[1];
    topCenter[2] = 0;
    topCenter[3] = 1;

    // create circles
    for (let i = 0; i < 360; i += y) {
        // left / right y rotations
        let leftYCtm = rotateY(i);
        let rightYCtm = rotateY(i + y);

        // top
        // start from center point
        positions.push(topCenter);
        // left point
        positions.push(matrixVectorMult(leftYCtm, top));
        // right point
        positions.push(matrixVectorMult(rightYCtm, top));
    }

    // generate sphere body by rotating around x axis creating individual band
    for (let i = from; i < to; i += x) {
        // top / bottom x rotations
        let topXCtm = rotateX(i);
        let bottomXCtm = rotateX(i + x);

        for (let j = 0; j < 360; j += y) {
            // left / right y rotations
            let leftYCtm = rotateY(j);
            let rightYCtm = rotateY(j + y);

            // apply proper rotation matrices depending on whether top/bottom & left/right

            // left triangle
            // top left
            positions.push(matrixVectorMult(mmMult(leftYCtm, topXCtm), point));
            // bottom left
            positions.push(matrixVectorMult(mmMult(leftYCtm, bottomXCtm), point));
            // top right
            positions.push(matrixVectorMult(mmMult(rightYCtm, topXCtm), point));

            // right triangle
            // top right
            positions.push(matrixVectorMult(mmMult(rightYCtm, topXCtm), point));
            // bottom left
            positions.push(matrixVectorMult(mmMult(leftYCtm, bottomXCtm), point));
            // bottom right
            positions.push(matrixVectorMult(mmMult(rightYCtm, bottomXCtm), point));
        }
    }

    // get starting point at bottom of sphere
    let bottom = matrixVectorMult(rotateX(to), point);
    // get point in center of bottom circle
    let bottomCenter = createVector(4);
    bottomCenter[0] = 0;
    bottomCenter[1] = bottom[1];
    bottomCenter[2] = 0;
    bottomCenter[3] = 1;

    // create circles
    for (let i = 0; i < 360; i += y) {
        // left / right y rotations
        let leftYCtm = rotateY(i);
        let rightYCtm = rotateY(i + y);

        // bottom
        // start from center point
        positions.push(bottomCenter);
        // right point
        positions.push(matrixVectorMult(rightYCtm, bottom));
        // left point
        positions.push(matrixVectorMult(leftYCtm, bottom));
    }


    return;
}