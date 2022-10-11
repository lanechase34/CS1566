// generate vertices needed for torus
function generateTorusVertices(positions) {
    // start with basis point
    // y axis defines radius about origin 
    let radius = .3;
    let point = [0, radius, 0, 1];

    // create circle to base bands off of
    // translate matrix will bring starting circle to the right by adding x
    let tCtm = translate((1 - radius), 0, 0);

    let z = 15;
    let y = 15;

    // debug
    let fromY = 0;
    let toY = 360;
    let fromZ = 0;
    let toZ = 360;

    // rotate band around y axis
    for (let i = fromY; i < toY; i += y) {
        // left / right circle y rotations
        let leftYCtm = rotateY(i);
        let rightYCtm = rotateY(i + y);

        // creates triangles between two circles (band)
        for (let j = fromZ; j < toZ; j += z) {

            // top / bottom circle rotations
            let topZCtm = rotateZ(j);
            let bottomZCtm = rotateZ(j + z);

            // assume looking from outside at circles (two | lines)

            // left circle triangles
            // top left
            positions.push(matrixVectorMult(mmMult(leftYCtm, mmMult(tCtm, topZCtm)), point));
            // bottom left
            positions.push(matrixVectorMult(mmMult(leftYCtm, mmMult(tCtm, bottomZCtm)), point));
            // top right
            positions.push(matrixVectorMult(mmMult(rightYCtm, mmMult(tCtm, topZCtm)), point));

            // right circle triangles
            // top right
            positions.push(matrixVectorMult(mmMult(rightYCtm, mmMult(tCtm, topZCtm)), point));
            // bottom left
            positions.push(matrixVectorMult(mmMult(leftYCtm, mmMult(tCtm, bottomZCtm)), point));
            // bottom right
            positions.push(matrixVectorMult(mmMult(rightYCtm, mmMult(tCtm, bottomZCtm)), point));
        }
    }



    return;
}