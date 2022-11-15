// generates colors
function generateColors(colors, length, color = null) {
    if (color != null) {
        let currColor = [color[0] / 255, color[1] / 255, color[2] / 255, 1];
        for (let curr = 0; curr < length; curr++) {
            colors.push(currColor);
        }
    }
    else {
        for (let curr = 0; curr < length; curr += 3) {
            let currColor = [Math.random(), Math.random(), Math.random(), 1];
            colors.push(currColor);
            colors.push(currColor);
            colors.push(currColor);
        }
    }

    return;
}

// generate sphere colors
function generateSphereColors(colors, length) {
    // each half of sphere is different color
    for (let i = 0; i < 2; i++) {
        let currColor = [Math.random(), Math.random(), Math.random(), 1];
        for (let i = 0; i < sphereLength / 2; i++) {
            colors.push(currColor);
        }
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