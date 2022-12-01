// Keep track of center of masss for each object
let pieceLocations = [
    // World
    [0, -.5, 0], // world base

    // Robot Arm
    [0, 0.5, 0], // base
    [0, 1, 0], // arm0
    [0, 2, 0], // joint1
    [0, 4, 0], // arm1
    [0, 6, 0], // joint2
    [0, 8, 0], // arm2
    [0, 10, 0], // joint3
    [0, 11, 0], // arm3
    [0, 12.25, 0], // wrist
    [0, 12.75, 0], // palm
    [0, 13.5, .2], // finger1
    [0, 13.5, -.2] // finger2


];

// Each piece built in its own frame 
let pieceFrames = [
    // World
    scaling(15, .2, 15), // world base

    // Robot

    // base (0, .5, 0)
    mmMult(translate(0, .5, 0), scaling(1.25, 1, 1.25)),

    // arm0 (0, 1, 0)
    mmMult(translate(0, 1, 0), scaling(.75, 2, .75)),

    // joint1 (0, 0, 0)
    mmMult(rotateZ(90), scaling(1, 2, 1)),

    // arm1 (0, 2, 0)
    mmMult(translate(0, 2, 0), scaling(.75, 4, .75)),

    // joint2 (0, 0, 0)
    mmMult(rotateZ(90), scaling(1, 2, 1)),

    // arm2 (0, 2, 0)
    mmMult(translate(0, 2, 0), scaling(.75, 4, .75)),

    // joint3 (0, 0, 0)
    mmMult(rotateZ(90), scaling(1, 2, 1)),

    // arm3 (0, 1, 0)
    mmMult(translate(0, 1, 0), scaling(.75, 2, .75)),

    // wrist (0, .25, 0)
    mmMult(translate(0, .25, 0), scaling(1, .5, 1)),

    // palm (0, .25, 0)
    mmMult(translate(0, .25, 0), scaling(.5, .5, 2)),

    // finger1 left(0, .5, 0)
    mmMult(translate(0, .5, 0), scaling(.4, 1, .4)),

    // finger2 right(0, .5, 0)
    mmMult(translate(0, .5, 0), scaling(.4, 1, .4))
];

// Ctms to put consecutive piece on previous piece's frame
// EX. arm0 gets put onto base in base frame
// EX. joint1 gets put onto arm0 in arm0 frame

let pieceCtms = [
    // world
    createIdentity(),

    // base
    createIdentity(),

    // arm0
    translate(0, 0, 0),

    // joint1
    translate(0, 2, 0),

    // arm1
    translate(0, 0, 0),

    // joint2
    translate(0, 4, 0),

    // arm2
    translate(0, 0, 0),

    // joint3
    translate(0, 4, 0),

    // arm3
    translate(0, 0, 0),

    // wrist
    translate(0, 2, 0),

    // palm
    translate(0, .5, 0),

    // finger1
    translate(0, .5, 0),

    // finger2
    translate(0, .5, 0)
];






function generateWorld(positions, colors) {
    // world base
    generatePiece(positions, colors, 'cylinder', colorCodes.green);

    // robot cylinder
    generatePiece(positions, colors, 'cylinder', colorCodes.blue);

    // robot cube
    generatePiece(positions, colors, 'cube', colorCodes.red);

    // robot fingers
    generatePiece(positions, colors, 'cube', colorCodes.orange);
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
            break;
        case 'cylinder':
            generateCylinderVertices(positions, 5);
            end = positions.length;
            generateColors(colors, end - start, color);
            break;
    }
    return;
}

/**
 * Generate normals for every object in positions array
 */
function generateNormals() {
    // first two objects are cylinders
    for (let i = 0; i < objectLength.cylinder * 2; i += 3) {
        let u = vectorSub(positions[i], positions[i + 1]);
        let v = vectorSub(positions[i], positions[i + 2]);
        let currNormal = vectorNormalize(crossProduct(u, v));
        normals.push(currNormal);
        normals.push(currNormal);
        normals.push(currNormal);
    }

    // third object is cube
    for (let i = objectLength.cylinder * 2; i < (objectLength.cylinder * 2) + (objectLength.cube * 2); i += 3) {
        let u = vectorSub(positions[i], positions[i + 1]);
        let v = vectorSub(positions[i], positions[i + 2]);
        let currNormal = vectorNormalize(crossProduct(u, v));
        normals.push(currNormal);
        normals.push(currNormal);
        normals.push(currNormal);
    }

    // // first two objects in positions arrays are cubes
    // // to calculate triangle normal, u cross v = normal
    // // each triangle will share same normal since flat
    // for (let i = 0; i < cubeLength * 2; i += 3) {
    //     let u = vectorSub(positions[i], positions[i + 1]);
    //     let v = vectorSub(positions[i], positions[i + 2]);
    //     let currNormal = vectorNormalize(crossProduct(u, v));
    //     normals.push(currNormal);
    //     normals.push(currNormal);
    //     normals.push(currNormal);
    // }

    // // generate normal for spheres
    // for (let i = cubeLength * 2; i < (cubeLength * 2) + (sphereLength); i++) {
    //     // calculate sphere normal by transforming point on sphere to vector by subtracting the origin
    //     let currNormal = vectorNormalize(vectorSub(positions[i], [0, 0, 0, 1]));
    //     normals.push(currNormal);
    // }

    // // generate normal for light
    // for (let i = (cubeLength * 2) + sphereLength; i < (cubeLength * 2) + (sphereLength * 2); i++) {
    //     // calculate sphere normal by transforming point on sphere to vector by subtracting the origin
    //     // inverse the normal for light
    //     let currNormal = scalarVectorMult(-1, vectorNormalize(vectorSub(positions[i], [0, 0, 0, 1])));
    //     normals.push(currNormal);
    // }

    return;
}