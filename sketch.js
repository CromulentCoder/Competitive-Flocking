let flock, b1, b2;

function setup() {
    createCanvas(windowWidth, windowHeight);
    flock = new Flock(200);
}

function draw() {
    background(51);

    flock.update();
}