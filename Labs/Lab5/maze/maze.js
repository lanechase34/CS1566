
// generate maze with width - cols, height - rows
function generateMaze(args) {
    console.log('Generating Maze');
    // create datastructure needed
    //
    let maze = generateEmptyMaze(args.cols, args.rows);

    let cols = maze.length;
    let rows = maze[0].length;
    createChamber(maze, 0, cols - 1, 0, rows - 1);

    // create openings in top left / bottom right
    maze[0][1] = 0;
    maze[16][15] = 0;

    printMaze(maze);
    return maze;
}

// create maze chamber
function createChamber(maze, fromCol, toCol, fromRow, toRow, debug = 'start') {
    // pick position in chamber that is not on an outside wall
    // random position must be between +2 fromCol/fromRow and -2 toCol/toRow (excludes the outside walls)

    // exit condition
    // if the cell is only 1 width or 1 height we return (1x1) cell
    if (fromCol + 2 === toCol || fromRow + 2 === toRow) {
        return;
    }

    // create bounds for random number generator
    let bounds = [
        fromCol + 2,
        toCol - 2,
        fromRow + 2,
        toRow - 2
    ];
    //console.log(`creating r pos from col ${bounds[0]},${bounds[1]} - row ${bounds[2]},${bounds[3]}`);

    // randomly pick EVEN,EVEN position in chamber
    // this guarantees we always select a wall junction
    let col = (Math.floor(Math.random() * (bounds[1] - bounds[0]) / 2) * 2) + bounds[0];
    let row = (Math.floor(Math.random() * (bounds[3] - bounds[2]) / 2) * 2) + bounds[2];

    //console.log(`random position - ${col},${row}`);

    // create wall from position
    // create column
    for (let i = fromCol; i < toCol; i++) {
        maze[i][row] = 1;

    }
    // create row
    for (let i = fromRow; i < toRow; i++) {
        maze[col][i] = 1;
    }

    // create three walls (n,e,s,w) and open a random hole on that wall
    // choose wall not do include (n-1, e-2, w-3, s-4)
    let exclude = Math.floor(Math.random() * (4 - 0)) + 1;

    // create north opening
    if (exclude !== 1) {
        // want opening at same column as random position
        // generate random row wall
        let open = (Math.floor(Math.random() * (row - fromRow) / 2) * 2) + fromRow + 1;
        maze[col][open] = 0;
    }

    // create south opening
    if (exclude !== 4) {
        // want opening at same column as random position
        // generate random row wall
        let open = (Math.floor(Math.random() * (toRow - row) / 2) * 2) + row + 1;
        maze[col][open] = 0;
    }

    // create east opening
    if (exclude !== 2) {
        // want opening at same row as random position
        // generate random column wall
        let open = (Math.floor(Math.random() * (toCol - col) / 2) * 2) + col + 1;
        maze[open][row] = 0;
    }

    // create west opening
    if (exclude !== 3) {
        // want opening at same row as random position
        // generate random column wall
        let open = (Math.floor(Math.random() * (col - fromCol) / 2) * 2) + fromCol + 1;
        maze[open][row] = 0;
    }

    // call recursive function for each new chamber

    // top left chamber
    createChamber(maze, fromCol, col, fromRow, row, 'top left');

    // top right chamber
    createChamber(maze, col, toCol, fromRow, row, 'top right');

    // bottom left chamber
    createChamber(maze, fromCol, col, row, toRow, 'bottom left');

    // bottom right chamber
    createChamber(maze, col, toCol, row, toRow, 'bottom right');

    return;
}

// pretty print maze
function printMaze(maze, printSolution = false, solution = null) {
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
                    if (printSolution) {
                        if (solution[c][r] === 1) {
                            curr += ' x ';
                        }
                        else {
                            curr += '   ';
                        }
                    }
                    else {
                        curr += '   ';
                    }
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

let directions = ['north', 'east', 'south', 'west'];
/**
 * Solve maze recursively using backtracking
 * @param {maze} maze - maze 
 * @param {coordinate} curr - current position in maze 
 * @param {coordinate} end - where the maze exit is
 * @param {direction} direction - 1,2,3,4 / n,e,s,w respectively where you entered the current cell from
 * @param {matrix} solution - solution 2D array (matrix)
 */
let solved = false;

function solveMaze(maze, curr, end, direction, solution) {
    let col = curr[0];
    let row = curr[1];
    // console.log('\n');
    // console.log(`coming from direction ${directions[direction - 1]}`);
    // console.log(`solving cell - ${col},${row}`);

    // if at exit
    if (col == end[0] && row == end[1]) {
        console.log('Solved Maze!');
        solved = true;
        solution[col][row] = 1;
        return;
    }

    // check if current position is a dead end
    // exclude direction we are coming from
    let deadEnd = false;
    switch (direction) {
        // entered from noth
        case 1:
            if (maze[col + 1][row] == 1 && maze[col][row + 1] == 1 && maze[col - 1][row] == 1) deadEnd = true;
            break;
        // entered from east
        case 2:
            if (maze[col][row + 1] == 1 && maze[col - 1][row] == 1 && maze[col][row - 1] == 1) deadEnd = true;
            break;
        // entered from south
        case 3:
            if (maze[col - 1][row] == 1 && maze[col][row - 1] == 1 && maze[col + 1][row] == 1) deadEnd = true;
            break;
        // entered from west
        case 4:
            if (maze[col][row - 1] == 1 && maze[col + 1][row] && maze[col][row + 1] == 1) deadEnd = true;
            break;
    }
    // if there is no where left to go (deadEnd) return
    if (deadEnd) {
        solution[col][row] = 0;
        return false;
    }

    // recursively check next directions in maze
    // only check spots that are available to move to (not same direction you entered from)
    if (!solved) {
        // did not enter from north
        if (direction !== 1) {
            // go north (enter from south)
            if (maze[col][row - 1] !== 1) {
                solveMaze(maze, [col, row - 2], end, 3, solution);
            }
        }
    }
    if (!solved) {
        // did not enter from east
        if (direction !== 2) {
            // go east (enter from west)
            if (maze[col + 1][row] !== 1) {
                solveMaze(maze, [col + 2, row], end, 4, solution);
            }
        }
    }
    if (!solved) {
        // did not enter from south
        if (direction !== 3) {
            // go south (enter from north)
            if (maze[col][row + 1] !== 1) {
                solveMaze(maze, [col, row + 2], end, 1, solution);
            }
        }
    }
    if (!solved) {
        // did not enter from west
        if (direction !== 4) {
            // go west (enter from east)
            if (maze[col - 1][row] !== 1) {
                solveMaze(maze, [col - 2, row], end, 2, solution);
            }
        }
    }
    if (solved) {
        solution[col][row] = 1;
        return;
    }
    return;
}