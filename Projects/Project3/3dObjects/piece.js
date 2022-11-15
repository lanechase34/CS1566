
/**
 * 
 * @param positions - global positions array
 * @param colors - global colors array
 * @param object - which 3D object to generate
 * @param color - color of the object
 * @param pieceCtm - ctm for cube to make correct piece (plane / pillar / wall)
 * @param ctm - ctm to move piece to desired location / orientation
 */
function generatePiece(positions, colors, object, color, pieceCtm, moveCtm) {
    // generate vertices and colors
    let start = positions.length;
    switch (object) {
        case 'cube':
            generateCubeVertices(positions);
            break;
        case 'sphere':
            generateSphereVertices(positions, 10, 10);
            break;
    }
    let end = positions.length;
    generateColors(colors, end - start, color);

    // apply pieceCtm to modify cube to desired shape first
    // apply ctm to move piece to desired location / orientation
    let ctm = mmMult(moveCtm, pieceCtm);

    // apply the final ctm
    for (let i = start; i < end; i++) {
        positions[i] = matrixVectorMult(ctm, positions[i]);
    }

    return;
}