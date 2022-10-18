let worldThickness = .1;

// generate world platform at y=0
function generateWorld(positions, colors, color) {
    let start = positions.length;
    generateCubeVertices(positions);
    let end = positions.length;
    generateColors(colors, end - start, color);

    let ctm = scaling(5, worldThickness, 5);
    for (let i = start; i < end; i++) {
        positions[i] = matrixVectorMult(ctm, positions[i]);
    }


    return;
}

/**
 * 
 * @param positions - global positions array
 * @param colors - global colors array
 * @param color - color of pillar represented as [r, g, b]
 * @param ctm - ctm to move pillar
 */
function generatePillar(positions, colors, color, ctm) {
    let start = positions.length;
    generateCubeVertices(positions);
    let end = positions.length;
    generateColors(colors, end - start, color);

    let pillarCtm = mmMult(translate(0, worldThickness + .4, 0), scaling(.2, 1, .2));

    let finalCtm = mmMult(ctm, pillarCtm);

    for (let i = start; i < end; i++) {
        positions[i] = matrixVectorMult(finalCtm, positions[i]);
    }

    return;
}



let pillar;
let verticalWall;
let horizontalWall;