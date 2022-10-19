

let planeCtm = scaling(9, .1, 9);
let pillarCtm = mmMult(translate(0, 1, 0), scaling(.2, 1, .2));
let wallCtm = mmMult(translate(0, 1, 0), scaling(1, 1, .1));

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


function generate3DMaze(maze, positions, colors) {

    // gen world
    generatePiece(positions, colors, orange, planeCtm, createIdentity());

    // gen pillars
    for (let i = -4; i <= 4; i++) {
        for (let j = -4; j <= 4; j++) {
            generatePiece(positions, colors, grey, pillarCtm, translate(i, 0, j));
        }

    }

    // gen perimeter wall
    for (let i = -4; i < 4; i++) {
        // col (vertical) walls
        // top left opening
        if (i != -4) {
            generatePiece(positions, colors, red, wallCtm, mmMult(translate(-4, 0, i + .5), rotateY(90)));
        }
        // bottom right opening
        if (i != 3) {
            generatePiece(positions, colors, red, wallCtm, mmMult(translate(4, 0, i + .5), rotateY(90)));

        }

        // row (horizontal) walls
        generatePiece(positions, colors, green, wallCtm, mmMult(translate(i + .5, 0, -4), rotateY(0)));
        generatePiece(positions, colors, green, wallCtm, mmMult(translate(i + .5, 0, 4), rotateY(0)));
    }


    // generate chamber walls

    // change to 0 - maze.length and generate entire maze in loops
    for (let col = 1; col < maze.length - 1; col++) {
        for (let row = 1; row < maze[0].length - 1; row++) {
            // if pillar wall (even, even)
            if (col % 2 === 0 && row % 2 === 0) {

            }
            // not pillar wall
            else {
                // if current col,row is a wall
                if (maze[col][row] === 1) {
                    // figure out if vertical or horizontal wall
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
    // gen world
    // loop over maze
    // for i < col
    // for i < row

    // if even,even - pillar piece
    // if even,odd / odd,even - wall piece
    // even,odd - vertical wall
    // odd,even - horizontal wall
    // odd,odd - cells (empty)

    return;
}