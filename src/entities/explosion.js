import { Bodies, Body } from 'matter-js';
import { dist } from '../common.js';


export const createExplosion = (level, x, y, r, force, lifeTime) => {
    const explosion = Bodies.circle(x, y, r, {isSensor: true, isStatic: true, mass: 0.5});
    explosion.r = r;
    explosion.name = 'explosion';
    explosion.explosiveForce = force;
    explosion.lifeTime = lifeTime;
    explosion.collisionActive = (bodyA, bodyB, pair) => {
        const d = dist(bodyA.position.x, bodyA.position.y, bodyB.position.x, bodyB.position.y);

        const a = Math.pow(d, 2) / bodyA.r;
        const angle = -Math.atan2(bodyA.position.y - bodyB.position.y, bodyA.position.x - bodyB.position.x);

        const x = -Math.cos(angle) * bodyA.explosiveForce / a / bodyB.mass;
        const y = Math.sin(angle) * bodyA.explosiveForce / a / bodyB.mass;

        let x1 = bodyB.velocity.x
        // if (Math.abs(x) > Math.abs(x1)) {
            x1 += x;
        // }
        let y1 = bodyB.velocity.y
        // if (Math.abs(y) > Math.abs(y1)) {
            y1 += y;
        // }
        Body.setVelocity(bodyB, {x: x1, y: y1});
    }
    return {
        level: level,
        explosion: explosion,
        lifeTime: lifeTime,
        time: 0,
        name: 'explosion',
        isS: false,

        setup () {
            this.isS = true;
        },

        update (dt) {
            if (!this.isS) this.setup();
            this.time += dt;

            if (this.time >= this.lifeTime) {
                this.level.removeEntity(this);
            }

        },

        render (ctx) {

        },

        getBody () {
            return this.explosion;
        },
    }
}