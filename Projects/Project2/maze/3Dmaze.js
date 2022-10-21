
let planeCtm;
let pillarCtm;
let wallCtm;


/**
 * 
 * @param positions - global positions array
 * @param colors - global colors array
 * @param color - color of pillar represented as [r, g, b]
 * @param pieceCtm - ctm for cube to make correct piece (plane / pillar / wall)
 * @param ctm - ctm to move piece to desired location / orientation
 */
function generatePiece(positions, colors, color, pieceCtm, moveCtm) {

    // generate 'cube' and colors
    let start = positions.length;
    generateCubeVertices(positions);
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

// Generate 3D maze by making calls to generate each wall / pillar individually
function generate3DMaze(maze, positions, colors) {
    // generate individual pieces
    let mazeCol = (maze.length - 1) / 2;
    let mazeRow = (maze[0].length - 1) / 2;
    planeCtm = mmMult(translate((mazeCol - 8) / 2, 0, (mazeRow - 8) / 2), scaling(mazeCol + 1.5, .1, mazeRow + 1.5));
    pillarCtm = mmMult(translate(0, .55, 0), scaling(.2, 1, .2));
    wallCtm = mmMult(translate(0, .55, 0), scaling(.8, 1, .1));

    // gen world platform
    generatePiece(positions, colors, orange, planeCtm, createIdentity());

    // generate maze 
    for (let col = 0; col < maze.length; col++) {
        for (let row = 0; row < maze[0].length; row++) {
            // (even, even) - pillar wall
            // (even, odd) - vertial wall
            // (odd, even) - horizontal wall
            // (odd, odd) - cell (empty)

            // if pillar wall
            if (col % 2 === 0 && row % 2 === 0) {
                generatePiece(positions, colors, grey, pillarCtm, translate((col - 8) / 2, 0, (row - 8) / 2));
            }
            // not pillar wall
            else {
                // if current col,row is a wall
                if (maze[col][row] === 1) {
                    // determine if vertical or horizontal wall
                    // even column means vertical wall
                    if (col % 2 === 0) {
                        generatePiece(positions, colors, red, wallCtm, mmMult(translate((col - 8) / 2, 0, (row - 8) / 2), rotateY(90)));
                    }
                    // else horizontal wall
                    else {
                        generatePiece(positions, colors, green, wallCtm, mmMult(translate((col - 8) / 2, 0, (row - 8) / 2), rotateY(0)));
                    }
                }
            }
        }
    }
    return;
}

/**
 * Animate over the solution matrix and 3D solve the maze by using animations
 */
function animateSolve() {

}