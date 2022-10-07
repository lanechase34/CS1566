function generateConeVertices(positions, degrees) {
    // generate circle vertices
    // from/to to debug (make sure triangles are generated in right order)
    let from = 0;
    let to = 360;

    // change height and radius for debug (make sure triangles follow RHR)
    let radius = .3;
    let height = 1;

    for (let curr = from; curr < to; curr += degrees) {
        // first vertex always at origin
        positions.push([0, 0, 0, 1]);
        // next at current degree cos/sin
        positions.push([radius * Math.cos(curr * (Math.PI / 180)), 0, radius * Math.sin(curr * (Math.PI / 180)), 1]);
        // next at current + degree cos/sin
        positions.push([radius * Math.cos((curr + degrees) * (Math.PI / 180)), 0, radius * Math.sin((curr + degrees) * (Math.PI / 180)), 1]);
    }

    // generate top half of cone
    for (let curr = from; curr < to; curr += degrees) {
        // cone sides must be facing outwards RHR
        positions.push([0, height, 0, 1]);
        positions.push([radius * Math.cos((curr + degrees) * (Math.PI / 180)), 0, radius * Math.sin((curr + degrees) * (Math.PI / 180)), 1]);
        positions.push([radius * Math.cos(curr * (Math.PI / 180)), 0, radius * Math.sin(curr * (Math.PI / 180)), 1]);
    }

    return;
}

// generates random colors for cone vertices
function generateColors(colors, length) {
    // each triangle is a solid color aka the three vertices share the same color
    // colors for bottom circle
    for (let curr = 0; curr < (length / 2); curr += 3) {
        let currColor = [Math.random(), Math.random(), Math.random(), 1];
        colors.push(currColor);
        colors.push(currColor);
        colors.push(currColor);
    }

    // colors for top of cone
    for (let curr = 0; curr < (length / 2); curr += 3) {
        let currColor = [Math.random(), Math.random(), Math.random(), 1];
        colors.push(currColor);
        colors.push(currColor);
        colors.push(currColor);
    }

    return;
}

// generates solid cone colors
function generateSolidColors(colors, length) {
    let topColor = [0, 1, 0, 1];
    let bottomColor = [1, 0, 0, 1];
    for (let curr = 0; curr < (length / 2); curr += 3) {
        colors.push(bottomColor);
        colors.push(bottomColor);
        colors.push(bottomColor);
    }

    for (let curr = 0; curr < (length / 2); curr += 3) {
        colors.push(topColor);
        colors.push(topColor);
        colors.push(topColor);
    }

    return;
}