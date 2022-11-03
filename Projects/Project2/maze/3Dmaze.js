// These define our pieces that make up the maze
// Each piece will have the same predefined CTM to adjust the shape to desired specifications and orient properly
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

/**
 * Generate 3D maze by making calls to generate each wall / pillar individually
 * @param maze - maze to convert to 3D
 * @param positions - global positions array
 * @param colors - global colors array 
 * @returns 
 */
function generate3DMaze(maze, positions, colors) {
    // set each piece CTM
    planeCtm = mmMult(translate(0, .05, 0), scaling(colsDim + 1.5, .1, rowsDim + 1.5));
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
                let currColor = grey;
                if (col === 0 && row === 0) {
                    currColor = gold;
                }
                if (col === 0 && row === 2) {
                    currColor = gold;
                }
                if (col === maze.length - 1 && row === maze.length - 1 - 2) {
                    currColor = gold;
                }
                if (col === maze.length - 1 && row === maze.length - 1) {
                    currColor = gold;
                }
                generatePiece(positions, colors, currColor, pillarCtm, translate((col - colsDim) / 2, 0, (row - rowsDim) / 2));

            }
            else {
                // if current col,row is a wall
                if (maze[col][row] === 1) {
                    // determine if vertical or horizontal wall
                    // even column means vertical wall
                    if (col % 2 === 0) {
                        generatePiece(positions, colors, red, wallCtm, mmMult(translate((col - colsDim) / 2, 0, (row - rowsDim) / 2), rotateY(90)));
                    }
                    // else horizontal wall
                    else {
                        generatePiece(positions, colors, green, wallCtm, mmMult(translate((col - colsDim) / 2, 0, (row - rowsDim) / 2), rotateY(0)));
                    }
                }
            }
        }
    }
    return;
}