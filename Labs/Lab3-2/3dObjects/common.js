// generates random colors
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

// generates solid colors
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

// generate solid color per cube side
function generateCubeColors(colors, length) {
    // each side of cube (6 - vertices) has the same color
    for (let curr = 0; curr < (length / 6); curr++) {
        let currColor = [Math.random(), Math.random(), Math.random(), 1];
        colors.push(currColor);
        colors.push(currColor);
        colors.push(currColor);
        colors.push(currColor);
        colors.push(currColor);
        colors.push(currColor);
    }

    return;
}