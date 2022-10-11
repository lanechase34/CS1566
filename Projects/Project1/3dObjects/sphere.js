// generate vertices needed for sphere
function generateSphereVertices(positions) {
    let width = .1;
    let height = .1;
    let depth = 1;


    // start with basis rectangle centered at origin
    let rect = [
        [-width, height, depth, 1], // top
        [-width, -height, depth, 1], // bottom
        [width, -height, depth, 1], // bottom
        [-width, height, depth, 1,], //top
        [width, -height, depth, 1], // bottom
        [width, height, depth, 1] // top
    ]


    // // lets rotate this basis rectangle around y-axis
    // let degrees = Math.atan(.2 / (Math.cos(0 * (Math.PI / 180)))) * (180 / Math.PI);
    // for (let i = 0; i < 360; i += degrees) {
    //     let ctm = rotateY(i);
    //     let ctm2 = rotateX(10);
    //     for (let i = 0; i < rect.length; i++) {
    //         positions.push(matrixVectorMult(mmMult(ctm, ctm2), rect[i]));
    //     }
    // }

    // for (let i = 0; i < 360; i += degrees) {
    //     let ctm = rotateX(i);
    //     for (let i = 0; i < rect.length; i++) {
    //         positions.push(matrixVectorMult(ctm, rect[i]));
    //     }
    // }


    // rotate basis band to make bottom half of sphere


    //let degreesY = 15;
    let degreesX = Math.atan((width * 2) / (Math.cos(0 * (Math.PI / 180)))) * (180 / Math.PI);
    // creates bottom half of sphere
    for (let i = -65; i < 65; i += degreesX) {
        let ctmX = rotateX(i);

        // calculate degrees for y
        let degreesY = Math.atan((width * 2) / (depth * Math.cos(i * (Math.PI / 180)))) * (180 / Math.PI);
        //console.log(degreesY);

        for (let k = 0; k < 180; k += degreesY) {
            let ctmY = rotateY(k);
            for (let j = 0; j < rect.length; j++) {
                positions.push(matrixVectorMult(mmMult(ctmY, ctmX), rect[j]));
            }
        }
    }


    // let offset = 6;
    // for (let i = 0; i < 65; i += degreesX) {
    //     let xTop = rotateX(i + offset);
    //     let xBot = rotateX(i + degreesX);

    //     let yTop = Math.atan(.2 / (depth * Math.cos(i * (Math.PI / 180)))) * (180 / Math.PI);
    //     let yBot = Math.atan(.2 / (depth * Math.cos((i + degreesX) * (Math.PI / 180)))) * (180 / Math.PI);

    //     console.log(yTop);
    //     console.log(yBot);
    //     // for (let k = 0; k < 350; k += degreesY) {
    //     yTop = rotateY(yTop);
    //     yBot = rotateZ(yBot);
    //     for (let j = 0; j < rect.length; j++) {
    //         // if top vertex
    //         if (j == 0 || j == 3 || j == 5) {
    //             positions.push(matrixVectorMult(mmMult(yTop, xTop), rect[j]));
    //         }
    //         // bottom vertex
    //         else {
    //             positions.push(matrixVectorMult(mmMult(yBot, xBot), rect[j]));
    //         }
    //     }
    // }



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