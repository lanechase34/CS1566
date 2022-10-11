// generate vertices needed for sphere
// x and y are defined in function call
function generateSphereVertices(positions, x, y) {
    // start with basis point at origin +z 1
    let point = [0, 0, 1, 1];

    // debug -- change how tall we want the sphere bands to be made
    let from = -75;
    let to = 75;

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

    // generate top / bottom circles of sphere
    return;
}