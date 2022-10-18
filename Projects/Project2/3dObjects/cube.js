// hard coded cube vertices generated in top right of canvas
function generateCubeVertices(positions) {
    let start = positions.length;
    // front side
    positions.push([1, 1, 1, 1]);
    positions.push([0, 1, 1, 1]);
    positions.push([1, 0, 1, 1]);

    positions.push([0, 1, 1, 1]);
    positions.push([0, 0, 1, 1]);
    positions.push([1, 0, 1, 1]);

    // left side
    positions.push([0, 1, 1, 1]);
    positions.push([0, 1, 0, 1]);
    positions.push([0, 0, 1, 1]);

    positions.push([0, 1, 0, 1]);
    positions.push([0, 0, 0, 1]);
    positions.push([0, 0, 1, 1]);

    // bottom side
    positions.push([0, 0, 1, 1]);
    positions.push([0, 0, 0, 1]);
    positions.push([1, 0, 0, 1]);

    positions.push([0, 0, 1, 1]);
    positions.push([1, 0, 0, 1]);
    positions.push([1, 0, 1, 1]);

    // right side
    positions.push([1, 1, 1, 1]);
    positions.push([1, 0, 1, 1]);
    positions.push([1, 0, 0, 1]);

    positions.push([1, 1, 1, 1]);
    positions.push([1, 0, 0, 1]);
    positions.push([1, 1, 0, 1]);

    // back side
    positions.push([0, 1, 0, 1]);
    positions.push([1, 0, 0, 1]);
    positions.push([0, 0, 0, 1]);

    positions.push([0, 1, 0, 1]);
    positions.push([1, 1, 0, 1]);
    positions.push([1, 0, 0, 1]);

    // top side
    positions.push([0, 1, 1, 1]);
    positions.push([1, 1, 0, 1]);
    positions.push([0, 1, 0, 1]);

    positions.push([0, 1, 1, 1]);
    positions.push([1, 1, 1, 1]);
    positions.push([1, 1, 0, 1]);

    let end = positions.length;
    // translate cube to origin
    let move = translate(-.5, -.5, -.5);
    for (let i = start; i < end; i++) {
        positions[i] = matrixVectorMult(move, positions[i]);
    }

    return;
}