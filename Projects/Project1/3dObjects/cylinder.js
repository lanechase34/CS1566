// generate vertices needed for cylinder
function generateCylinderVertices(positions, degrees) {
    // from / to for debug
    let from = 0;
    let to = 360;

    // generate bottom circle
    for (let curr = from; curr < to; curr += degrees) {
        // origin
        positions.push([0, 0, 0, 1]);
        // next at current degree cos/sin
        positions.push([Math.cos(curr * (Math.PI / 180)), 0, Math.sin(curr * (Math.PI / 180)), 1]);
        // next at current + degree cos/sin
        positions.push([Math.cos((curr + degrees) * (Math.PI / 180)), 0, Math.sin((curr + degrees) * (Math.PI / 180)), 1]);
    }

    // generate top circle
    // this circle should be facing up
    for (let curr = from; curr < to; curr += degrees) {
        // origin
        positions.push([0, 1, 0, 1]);
        // next at current + degree cos/sin
        positions.push([Math.cos((curr + degrees) * (Math.PI / 180)), 1, Math.sin((curr + degrees) * (Math.PI / 180)), 1]);
        // next at current degree cos/sin
        positions.push([Math.cos(curr * (Math.PI / 180)), 1, Math.sin(curr * (Math.PI / 180)), 1]);
    }

    // generate triangles going up from bottom circle
    for (let curr = from; curr < to; curr += degrees) {
        positions.push([Math.cos((curr + degrees) * (Math.PI / 180)), 1, Math.sin((curr + degrees) * (Math.PI / 180)), 1]);
        positions.push([Math.cos((curr + degrees) * (Math.PI / 180)), 0, Math.sin((curr + degrees) * (Math.PI / 180)), 1]);
        positions.push([Math.cos(curr * (Math.PI / 180)), 0, Math.sin(curr * (Math.PI / 180)), 1]);
    }

    // generate triangles going down from top circle
    for (let curr = from; curr < to; curr += degrees) {
        positions.push([Math.cos((curr + degrees) * (Math.PI / 180)), 1, Math.sin((curr + degrees) * (Math.PI / 180)), 1]);
        positions.push([Math.cos(curr * (Math.PI / 180)), 0, Math.sin(curr * (Math.PI / 180)), 1]);
        positions.push([Math.cos((curr) * (Math.PI / 180)), 1, Math.sin((curr) * (Math.PI / 180)), 1]);
    }

    return;
}