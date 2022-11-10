
/**
 * 
 * @param positions - global positions array
 * @param colors - global colors array
 * @param pieceCtm - ctm for cube to make correct piece (plane / pillar / wall)
 * @param ctm - ctm to move piece to desired location / orientation
 */
function generatePiece(positions, colors, pieceCtm, moveCtm) {
    // generate 'cube' and colors
    let start = positions.length;
    generateCubeVertices(positions);
    let end = positions.length;
    generateCubeColors(colors, end - start);

    // apply pieceCtm to modify cube to desired shape first
    // apply ctm to move piece to desired location / orientation
    let ctm = mmMult(moveCtm, pieceCtm);

    // apply the final ctm
    for (let i = start; i < end; i++) {
        positions[i] = matrixVectorMult(ctm, positions[i]);
    }

    return;
}