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
    "position": [],
    "attenuation_constant": 0,
    "attenuation_linear": .2,
    "attenuation_quadratic": 0
}

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