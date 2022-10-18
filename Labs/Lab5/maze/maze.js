
// generate maze with width - cols, height - rows
function generateMaze(args) {
    console.log('Generating Maze');
    // create datastructure needed
    //
    let maze = generateEmptyMaze(args.cols, args.rows);

    let cols = maze.length;
    let rows = maze[0].length;
    createChamber(maze, 0, cols, 0, rows);



    printMaze(maze);
    return maze;
}

// create maze chamber
function createChamber(maze, fromCol, toCol, fromRow, toRow) {
    // randomly pick position in chamber
    let col = Math.floor(Math.random() * toCol / 2) * 2 + fromCol;
    let row = Math.floor(Math.random() * toRow / 2) * 2 + fromRow;

    console.log(col);
    console.log(row);

    // position[0] - col
    // create wall from position
    for (let i = 0; i < maze.length; i++) {
        maze[col][i] = 1;
    }
    for (let i = 0; i < maze.length; i++) {
        maze[i][row] = 1;
    }
}

// pretty print maze
function printMaze(maze) {
    let cols = maze.length;
    let rows = maze[0].length;

    let output = '';
    let curr = '';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            // even rows are north/south walls
            if (r % 2 === 0) {
                // if corner piece
                if (c % 2 === 0) {
                    curr += '+';
                }
                // check if wall exists
                else {
                    if (maze[c][r] === 1) {
                        curr += '---';
                    }
                    else {
                        curr += '   ';
                    }
                }
            }
            // odd rows are east/west walls
            else {
                // check if wall exists
                if (c % 2 === 0) {
                    if (maze[c][r] === 1) {
                        curr += '|';
                    }
                    else {
                        curr += ' ';
                    }
                }
                else {
                    curr += '   ';
                }
            }
        }
        output += curr + '\n';
        curr = '';
    }
    console.log(output);
}

// generate empty maze with perimeter walls defined/
// maze is defined column major
// maze[0] represents 1st col
function generateEmptyMaze(cols, rows) {
    maze = createMatrix((cols * 2) + 1, (rows * 2) + 1);
    for (let c = 0; c < (cols * 2) + 1; c++) {
        for (let r = 0; r < (rows * 2) + 1; r++) {
            let curr = 0;
            // west wall
            if (c === 0) {
                curr = 1;
            }
            // east wall
            else if (c === (cols * 2)) {
                curr = 1;
            }
            // north wall
            else if (r === 0) {
                curr = 1;
            }
            // south wall
            else if (r === (rows * 2)) {
                curr = 1;
            }

            maze[c][r] = curr;
        }
    }

    return maze;
}