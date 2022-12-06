// colors for world in RGB
let colorCodes = {
    "orange": [255, 140, 0],
    "darkorange": [220, 88, 42],
    "grey": [105, 105, 105],
    "black": [0, 0, 0],
    "red": [255, 0, 0],
    "green": [0, 255, 0],
    "white": [255, 255, 255],
    "pink": [255, 192, 203],
    "yellow": [255, 255, 0],
    "purple": [191, 64, 191],
    "gold": [255, 215, 0],
    "blue": [0, 0, 255],
    "darkgrey": [90, 90, 90],
    "lime": [208, 255, 20],
    "turquoise": [64, 224, 208]
};

// length of vertices for each unique object
let objectLength = {
    "cube": 36,
    "sphere": 3672,
    "cylinder": 864,
    "cone": 432,
    "torus": 31104
};

// Keep track of center of masss for each object
let pieceLocations = [
    // World
    [0, -.1, 0], // world base
    [10, .75, 0], // purple sphere
    [-8, 1.5, -7], // orange sphere
    [-6, .5, 5], // pink cube
    [3, 1, -6], // gold cube
    [5, 1, 6], // grey cone
    [-2, .5, 7], // turqouise cone
    [0, .75, 11], // yellow torus
];


let pieceCtms = [
    scaling(12, .2, 12),
    scaling(.75, .75, .75),
    scaling(1.5, 1.5, 1.5),
    scaling(1, 1, 1),
    scaling(2, 2, 2),
    scaling(1.5, 2, 1.5),
    scaling(1.5, 1, 1.5),
    mmMult(rotateX(90), scaling(.75, 1.25, .75)),
];

// Keep track of what kind of piece and the starting vertex in positions
let pieces = [];


function generateWorld(positions, colors) {
    // robot cylinder
    generatePiece(positions, colors, 'cylinder', colorCodes.blue);

    // robot cube
    generatePiece(positions, colors, 'cube', colorCodes.red);

    // world base
    generatePiece(positions, colors, 'cylinder', colorCodes.green);

    // sphere
    generatePiece(positions, colors, 'sphere', colorCodes.purple);

    // sphere
    generatePiece(positions, colors, 'sphere', colorCodes.darkorange);

    // cube
    generatePiece(positions, colors, 'cube', colorCodes.pink);

    generatePiece(positions, colors, 'cube', colorCodes.gold);

    generatePiece(positions, colors, 'cone', colorCodes.darkgrey);

    generatePiece(positions, colors, 'cone', colorCodes.turquoise);

    generatePiece(positions, colors, 'torus', colorCodes.orange);
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
function generatePiece(positions, colors, object, color) {
    // generate vertices and colors
    let start = positions.length;
    let end;
    switch (object) {
        case 'cube':
            generateCubeVertices(positions);
            end = positions.length;
            generateColors(colors, end - start, color);
            pieces.push(['cube', start, objectLength.cube]);
            break;
        case 'sphere':
            generateSphereVertices(positions, 10, 10);
            end = positions.length;
            if (color) {
                generateColors(colors, end - start, color);
            }
            else {
                generateSphereColors(colors, end - start);
            }
            pieces.push(['sphere', start, objectLength.sphere]);
            break;
        case 'cylinder':
            generateCylinderVertices(positions, 5);
            end = positions.length;
            generateColors(colors, end - start, color);
            pieces.push(['cylinder', start, objectLength.cylinder]);
            break;
        case 'cone':
            generateConeVertices(positions, 5);
            end = positions.length;
            generateColors(colors, end - start, color);
            pieces.push(['cone', start, objectLength.cone]);
            break;
        case 'torus':
            generateTorusVertices(positions, 5, 5);
            end = positions.length;
            generateColors(colors, end - start, color);
            pieces.push(['torus', start, objectLength.torus]);
            break;
    }
    return;
}

/**
 * Generate normals for every object in positions array
 */

let curr = 0;
function generateNormals() {
    for (let i = 0; i < pieces.length; i++) {
        switch (pieces[i][0]) {
            // cylinder normals
            case 'cylinder':
                for (let i = curr; i < curr + objectLength.cylinder; i += 3) {
                    let u = vectorSub(positions[i], positions[i + 1]);
                    let v = vectorSub(positions[i], positions[i + 2]);
                    let currNormal = vectorNormalize(crossProduct(u, v));
                    normals.push(currNormal);
                    normals.push(currNormal);
                    normals.push(currNormal);
                }
                curr += objectLength.cylinder;
                break;

            // cube normals
            case 'cube':
                for (let i = curr; i < curr + objectLength.cube; i += 3) {
                    let u = vectorSub(positions[i], positions[i + 1]);
                    let v = vectorSub(positions[i], positions[i + 2]);
                    let currNormal = vectorNormalize(crossProduct(u, v));
                    normals.push(currNormal);
                    normals.push(currNormal);
                    normals.push(currNormal);
                }
                curr += objectLength.cube;
                break;

            // sphere normals
            case 'sphere':
                for (let i = curr; i < curr + objectLength.sphere; i++) {
                    // calculate sphere normal by transforming point on sphere to vector by subtracting the origin
                    let currNormal = vectorNormalize(vectorSub(positions[i], [0, 0, 0, 1]));
                    normals.push(currNormal);
                }
                curr += objectLength.sphere;
                break;

            // cone normals 
            case 'cone':
                for (let i = curr; i < curr + objectLength.cone; i += 3) {
                    let u = vectorSub(positions[i], positions[i + 1]);
                    let v = vectorSub(positions[i], positions[i + 2]);
                    let currNormal = vectorNormalize(crossProduct(u, v));
                    normals.push(currNormal);
                    normals.push(currNormal);
                    normals.push(currNormal);
                }
                curr += objectLength.cone;
                break;

            // torus normals
            case 'torus':
                for (let i = curr; i < curr + objectLength.torus; i += 3) {
                    let u = vectorSub(positions[i], positions[i + 1]);
                    let v = vectorSub(positions[i], positions[i + 2]);
                    let currNormal = vectorNormalize(crossProduct(u, v));
                    normals.push(currNormal);
                    normals.push(currNormal);
                    normals.push(currNormal);
                }
                curr += objectLength.torus;
                break;
        }
    }
}