function generateConeVertices(positions, degrees) {
    // generate circle vertices
    // from/to to debug (make sure triangles are generated in right order)
    let from = 0;
    let to = 360;

    // generate bottom circle of cone
    for (let curr = from; curr < to; curr += degrees) {
        // first vertex always at origin
        positions.push([0, 0, 0, 1]);
        // next at current degree cos/sin
        positions.push([Math.cos(curr * (Math.PI / 180)), 0, Math.sin(curr * (Math.PI / 180)), 1]);
        // next at current + degree cos/sin
        positions.push([Math.cos((curr + degrees) * (Math.PI / 180)), 0, Math.sin((curr + degrees) * (Math.PI / 180)), 1]);
    }

    // generate top half of cone
    for (let curr = from; curr < to; curr += degrees) {
        // cone sides must be facing outwards RHR
        positions.push([0, 1, 0, 1]);
        positions.push([Math.cos((curr + degrees) * (Math.PI / 180)), 0, Math.sin((curr + degrees) * (Math.PI / 180)), 1]);
        positions.push([Math.cos(curr * (Math.PI / 180)), 0, Math.sin(curr * (Math.PI / 180)), 1]);
    }

    return;
}