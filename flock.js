class Flock {
    constructor(n) {
        this.size = n;
        this.boids = [];
        for (let i = 0; i < this.size; i++) {
            this.boids.push(new Boid(random() * width, random() * height));
        }
    }

    update() {
        let copy = this.boids
        for (let boid of copy) {
            boid.flock(copy);
        }
        this.boids = copy;
        for (let boid of this.boids) {
            boid.run();
        }
    }
}