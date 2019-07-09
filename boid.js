colors = [{
        "r": 255,
        "g": 0,
        "b": 0,
    },
    {
        "r": 0,
        "g": 255,
        "b": 0,
    },
    {
        "r": 0,
        "g": 0,
        "b": 255,
    }
];

const delta = (a1, a2, aMax) => {
    // console.log(a1,a2,aMax);
    let d = min(abs(a1 - a2), abs(abs(a2 - a1) - aMax));
    return d;
}

const distance = (pos1, pos2) => {
    let x = delta(pos1.x, pos2.x, width);
    let y = delta(pos1.y, pos2.y, height);
    return sqrt(x * x + y * y);
}

// Environment properties
const maxForce = 0.5;
const maxSpeed = 8;
const flockRadius = 1000;
const desiredSeparation = 50;

class Boid {
    constructor(x, y) {
        // Physical properties
        this.position = createVector(x, y);
        this.r = 4;
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        this.velocity.setMag(random(2, 4));
        this.acceleration = createVector();
        this.color = colors[floor(random() * colors.length)];
    }

    run() {
        this.update();
        this.edges();
        this.show();
    }

    edges() {
        if (this.position.x + this.r > width) {
            this.position.x = this.r;
        } else if (this.position.x <= this.r) {
            this.position.x = width - this.r;
        }
        if (this.position.y + this.r > height) {
            this.position.y = this.r;
        } else if (this.position.y <= this.r) {
            this.position.y = height - this.r;
        }
    }

    update() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(maxSpeed);

        this.position.add(this.velocity);

        this.acceleration.mult(0);
    }

    flock(boids) {
        let alignForce = this.align(boids);
        let cohesionForce = this.cohesion(boids);
        let sepForce = this.separation(boids);

        this.acceleration.add(alignForce);
        this.acceleration.add(cohesionForce);
        this.acceleration.add(sepForce);
    }

    align(boids) {
        let avg = createVector(0, 0);
        let count = 0;
        for (let other of boids) {
            let d = distance(this.position, other.position);
            if ((d > 0) && (d < flockRadius) && this.color == other.color) {
                avg.add(other.velocity);
                count++;
            }
        }
        if (count > 0) {
            avg.div(count);
            return this.seek(avg);
        } else {
            return createVector(0, 0);
        }
    }

    separation(boids) {
        let steer = createVector(0, 0);
        let count = 0;
        for (let other of boids) {
            let d = distance(this.position, other.position)
            let sep = this.minSep(other);
            if (this.collision(other)) {
                sep *= 5;
            }
            if ((d > 0) && (d < sep)) {
                let diff = p5.Vector.sub(this.position, other.position);
                diff.normalize();
                diff.div(d);
                steer.add(diff);
                count++;
            }
        }
        if (count > 0) {
            steer.div(count);
        }

        if (steer.mag() > 0) {
            // Steering = Desired - Velocity
            return this.seek(steer);
        }
        return steer;
    }

    cohesion(boids) {
        let avg = createVector(0, 0);
        let count = 0;
        for (let other of boids) {
            let d = distance(this.position, other.position);

            if ((d > 0) && (d < flockRadius) && this.color == other.color) {
                avg.add(other.position);
                count++;
            }
        }
        if (count > 0) {
            avg.div(count);
            avg.sub(this.position);
            return this.seek(avg);
        } else {
            return createVector(0, 0);
        }
    }

    minSep(target) {
        if (this.color != target.color) {
            return desiredSeparation * 15;
        }
        return desiredSeparation;
    }

    seek(target) {
        target.normalize();
        target.mult(maxSpeed);
        target = p5.Vector.sub(target, this.velocity);
        target.limit(maxForce);
        return target;
    }

    collision(target) {
        if (distance(target.position, this.position) < this.r) {
            return true;
        } 
        return false;
    }

    show() {
        stroke(this.color["r"], this.color["g"], this.color["b"]);
        noFill();
        let theta = this.velocity.heading() + PI / 2;
        push();
        translate(this.position.x, this.position.y);
        rotate(theta);
        beginShape();
        vertex(0, -this.r * 2);
        vertex(-this.r, this.r * 2);
        vertex(this.r, this.r * 2);
        endShape(CLOSE);
        pop();
    }
}