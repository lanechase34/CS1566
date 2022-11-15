let pieceLocations = [
    // 4 large platforms
    [-2.5, -0.1, -2.5], // -x, -z (back left)
    [-2.5, -0.1, 2.5], // -x, z (front left)
    [2.5, -0.1, -2.5], // x, -z (back right)
    [2.5, -0.1, 2.5], // x, z (front right)

    // left pieces (-x)
    [-1, -0.1, 0],
    [-2, -0.1, 0],
    [-3, -0.1, 0],
    [-4, -0.1, 0],

    // back pieces (-z)
    [0, -0.1, -1],
    [0, -0.1, -2],
    [0, -0.1, -3],
    [0, -0.1, -4],

    // right pieces (x)
    [1, -0.1, 0],
    [2, -0.1, 0],
    [3, -0.1, 0],
    [4, -0.1, 0],

    // front pieces (z)
    [0, -0.1, 1],
    [0, -0.1, 2],
    [0, -0.1, 3],
    [0, -0.1, 4],

    // spheres
    [1, .5, 0],
    [2, .5, 0],
    [3, .5, 0],
    [4, .5, 0]
];

let pieceCtms = [];
let animationCounters = [];

for (let i = 0; i < pieceLocations.length; i++) {
    pieceCtms.push(createIdentity());
    animationCounters.push(0);
}

let speedAdjs = [1, 1 / 2, 1 / 4, 1 / 8];


// individual piece ctms
let largePlatformCtm = scaling(4, .2, 4);
let smallPlatformCtm = scaling(1, .2, 1);
let sphereCtm = scaling(.5, .5, .5);

function generateWorld(positions, colors) {
    // create large platform
    generatePiece(positions, colors, 'cube', grey, largePlatformCtm, createIdentity());
    // create small platform
    generatePiece(positions, colors, 'cube', red, smallPlatformCtm, createIdentity());
    // create sphere
    generatePiece(positions, colors, 'sphere', blue, sphereCtm, createIdentity());
    return;
}

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
    let end;
    switch (object) {
        case 'cube':
            generateCubeVertices(positions);
            end = positions.length;
            generateColors(colors, end - start, color);
            break;
        case 'sphere':
            generateSphereVertices(positions, 10, 10);
            end = positions.length;
            generateSphereColors(colors, end - start);
            break;
    }


    // apply pieceCtm to modify cube to desired shape first
    // apply ctm to move piece to desired location / orientation
    let ctm = mmMult(moveCtm, pieceCtm);

    // apply the final ctm
    for (let i = start; i < end; i++) {
        positions[i] = matrixVectorMult(ctm, positions[i]);
    }

    return;
}