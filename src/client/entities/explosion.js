import { Bodies, Body } from 'matter-js';
import { dist } from '../../common.js';


export const createExplosion = (level, args) => { //args: x,y,r,force,lifeTime
    return {
        level: level,
        args: args,
        body: Bodies.circle(args.x, args.y, args.r, {isSensor: true, isStatic: true, mass: 0.5}),
        lifeTime: args.lifeTime,
        time: 0,
        name: 'explosion',
        isS: false,

        setup () {
            this.isS = true;
            this.body.entity = this;
            this.body.r = args.r;
            this.body.name = 'explosion';
            this.body.explosiveForce = args.force;
            this.body.lifeTime = args.lifeTime;
            this.body.collisionActive = (bodyA, bodyB, pair) => {
                const d = dist(bodyA.position.x, bodyA.position.y, bodyB.position.x, bodyB.position.y);

                const a = Math.pow(d, 2) / bodyA.r;
                const angle = -Math.atan2(bodyA.position.y - bodyB.position.y, bodyA.position.x - bodyB.position.x);

                const x = -Math.cos(angle) * bodyA.explosiveForce / a / bodyB.mass;
                const y = Math.sin(angle) * bodyA.explosiveForce / a / bodyB.mass;

                Body.setVelocity(bodyB, {x: bodyB.velocity.x + x, y: bodyB.velocity.y + y});
            }
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
            return this.body;
        },
    }
}