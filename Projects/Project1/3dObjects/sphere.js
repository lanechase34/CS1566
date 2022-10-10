// generate vertices needed for sphere
function generateSphereVertices(positions) {
    let width = .05;
    let height = .05;


    // start with basis rectangle centered at origin
    let rect = [
        [-width, height, 1, 1], // top
        [-width, -height, 1, 1], // bottom
        [width, -height, 1, 1], // bottom
        [-width, height, 1, 1,], //top
        [width, -height, 1, 1], // bottom
        [width, height, 1, 1] // top
    ]

    // add basis rect
    // for (let i = 0; i < rect.length; i++) {
    //     positions.push(rect[i]);
    // }

    // lets rotate this basis rectangle around y-axis
    // let degrees = 5.73;
    // for (let i = 0; i < 360; i += degrees) {
    //     let ctm = rotateY(i);
    //     for (let i = 0; i < rect.length; i++) {
    //         positions.push(matrixVectorMult(ctm, rect[i]));
    //     }
    // }

    // rotate basis band to make bottom half of sphere


    // keep top vetrices consistent, only rotate bottom by x degrees

    let degreesX = 8;
    let degreesY = 5.73;

    for (let i = 10; i < 20; i += degreesX) {
        console.log(i);
        let ctmXBottom = rotateX(i);

        let ctmXTop = rotateX(i + degreesX);

        for (let k = 0; k < 360; k += degreesY) {
            let ctmY = rotateY(k);

            for (let j = 0; j < rect.length; j++) {
                //if (j == 0 || j == 3 || j == 5) {
                if (j == 1 || j == 2 || j == 4) {
                    positions.push(matrixVectorMult(matrixMatrixMult(ctmY, ctmXTop), rect[j]));
                } else {
                    positions.push(matrixVectorMult(matrixMatrixMult(ctmY, ctmXBottom), rect[j]));
                }
            }
        }


    }

    // for (let i = 0; i < 360; i += degrees) {
    //     let ctm = rotateX(i);
    //     for (let i = 0; i < rect.length; i++) {
    //         positions.push(matrixVectorMult(ctm, rect[i]));
    //     }
    // }
    //let ctm = rotateX(10);

    // positions.push(rect[0]);
    // positions.push(matrixVectorMult(ctm, rect[1]));
    // positions.push(matrixVectorMult(ctm, rect[2]));
    // positions.push(rect[3]);
    // positions.push(rect[4]);
    // positions.push(matrixVectorMult(ctm, rect[5]));

    // let bottom = [
    //     [0, 0, 1, 1],
    //     [-width / 2, -height, 1, 1],
    //     [width / 2, -height, 1, 1]
    // ];

    // let top = [
    //     [0, 0, 1, 1],
    //     [-width, 0, 1, 1],
    //     [-width / 2, -height, 1, 1]
    // ]

    // // positions.push([0, 0, 1, 1]);
    // // positions.push([-width / 2, -height, 1, 1]);
    // // positions.push([width / 2, -height, 1, 1]);

    // // rotate about y to complete band
    // let degrees = 5.73;
    // // to get degrees need tan 
    // // adjacent is 1, opposite is width / 2

    // let bandStart = positions.length;
    // // create bottom half of initial band
    // for (let curr = 0; curr < 360; curr += degrees) {
    //     let ctm = rotateY(curr);
    //     positions.push(matrixVectorMult(ctm, bottom[0]));
    //     positions.push(matrixVectorMult(ctm, bottom[1]));
    //     positions.push(matrixVectorMult(ctm, bottom[2]));
    // }

    // // create tophalf of initial band
    // for (let curr = 0; curr < 360; curr += degrees) {
    //     let ctm = rotateY(curr);
    //     positions.push(matrixVectorMult(ctm, top[0]));
    //     positions.push(matrixVectorMult(ctm, top[1]));
    //     positions.push(matrixVectorMult(ctm, top[2]));
    // }

    // let bandEnd = positions.length;
    // let ctm = rotateX(30);
    // for (let i = bandStart; i < bandEnd; i++) {
    //     positions.push(matrixVectorMult(ctm, positions[i]));
    // }



    return;
}