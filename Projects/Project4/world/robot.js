// To model hierarch of ctm for the robot
let robotCtm = {
    "base": createIdentity(),
    "arm1": createIdentity(),
    "arm2": createIdentity(),
    "arm3": createIdentity(),
    "wrist": createIdentity(),
    "leftFinger": createIdentity(),
    "rightFinger": createIdentity()
}

// to keep track of degrees for robot movement
let robotDegrees = {
    "base": 0,
    "arm1": 0,
    "arm2": 0,
    "arm3": 0,
    "wrist": 0,
    "leftFinger": 0,
    "rightFinger": 0
}

// information for robot flashlight located at tip of arm
let robotFlashlight = {
    "shininess": 100,
    "position": [0, 12.75, 0, 1],
    "attenuation_constant": 0,
    "attenuation_linear": .15,
    "attenuation_quadratic": 0,
    // To simulate spotlight projection, a cone is formed at the flashlight location, 
    // any points located inside the cone will have the light
    "direction": [0, 13.75, 0, 1],
    "coneHeight": .1,
    // determines the dropoff of intensity outside the direct flashlight
    "alpha": 1
}

// Each piece built in its own frame
// Robot arm pieces are above y axis 0, joint pieces are centered at y-axis 0
let robotFrames = [
    // base (0, .5, 0)
    mmMult(translate(0, .5, 0), scaling(1.25, 1, 1.25)),

    // arm0 (0, 1, 0)
    mmMult(translate(0, 1, 0), scaling(.75, 2, .75)),

    // joint1 (0, 0, 0)
    mmMult(rotateZ(90), scaling(1, 2, 1)),

    // arm1 (0, 2, 0)
    mmMult(translate(0, 2, 0), scaling(.75, 4, .75)),

    // joint2 (0, 0, 0)
    mmMult(rotateZ(90), scaling(1, 2, 1)),

    // arm2 (0, 2, 0)
    mmMult(translate(0, 2, 0), scaling(.75, 4, .75)),

    // joint3 (0, 0, 0)
    mmMult(rotateZ(90), scaling(1, 2, 1)),

    // arm3 (0, 1, 0)
    mmMult(translate(0, 1, 0), scaling(.75, 2, .75)),

    // wrist (0, .25, 0)
    mmMult(translate(0, .25, 0), scaling(1, .5, 1)),

    // palm (0, .25, 0)
    mmMult(translate(0, .25, 0), scaling(.5, .5, 2)),

    // finger1 left(0, .5, 0)
    mmMult(translate(0, .5, 0), scaling(.4, 1, .4)),

    // finger2 right(0, .5, 0)
    mmMult(translate(0, .5, 0), scaling(.4, 1, .4))
];

// Ctms to put consecutive piece on previous piece's frame
// EX. arm0 gets put onto base in base frame
// EX. joint1 gets put onto arm0 in arm0 frame
let robotCtms = [
    // base
    createIdentity(),

    // arm0
    translate(0, 0, 0),

    // joint1
    translate(0, 2, 0),

    // arm1
    translate(0, 0, 0),

    // joint2
    translate(0, 4, 0),

    // arm2
    translate(0, 0, 0),

    // joint3
    translate(0, 4, 0),

    // arm3
    translate(0, 0, 0),

    // wrist
    translate(0, 2, 0),

    // palm
    translate(0, .5, 0),

    // finger1
    translate(0, .5, 0),

    // finger2
    translate(0, .5, 0)
]

// Adjust robot ctms 
function adjustRobot() {
    robotCtm.base = rotateY(robotDegrees.base);
    robotCtm.arm1 = rotateX(robotDegrees.arm1);
    robotCtm.arm2 = rotateX(robotDegrees.arm2);
    robotCtm.arm3 = rotateX(robotDegrees.arm3);

    robotCtm.wrist = rotateY(robotDegrees.wrist);

    robotCtm.leftFinger = translate(0, 0, robotDegrees.leftFinger);
    robotCtm.rightFinger = translate(0, 0, robotDegrees.rightFinger);

    display();
}