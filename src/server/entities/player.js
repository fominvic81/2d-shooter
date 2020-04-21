import { Bodies, Body } from 'matter-js';
import { weapon } from '../weapon.js';
import { CATEGORY_PLAYER, MASK_PLAYER } from '../../collisionFilters.js'


export const createPlayer = (level, args) => { // args: x,y
    return {
        level: level,
        args: args,
        x: args.x,
        y: args.y,
        angle: 0,
        angle2: 0,
        width: 60,
        height: 144,
        body: Bodies.rectangle(args.x, args.y, 60, 144, {
            mass: 50,
            friction: 0.09,
            frictionAir: 0.05,
            collisionFilter: {
                category: CATEGORY_PLAYER,
                mask: MASK_PLAYER,
            },
        }),
        sensors: {},
        constraints: [],
        invetory: {},
        name: 'player',
        isS: false,

        collisionActive (bodyA, bodyB, pair) {
            if (bodyB.name === 'item') {
                const item = bodyB.entity;
                
            }
        },

        setup () {
            this.isS = true;
            this.body.name = 'player';
            this.body.entity = this;
            this.body.collisionActive = (bodyA, bodyB, pair) => {
                this.collisionActive(bodyA, bodyB, pair);
            }


            this.invetory = {
                weapons: [],
                weapon: 0,
                maxWeaponCount: 3,
                fist: weapon(this.level, require('../../../assets/weapons/options.json').sprites.fist, this.sprites, this.body),
            }

            const l = this.invetory.weapons.length;
            for (let i = 0; i < this.invetory.maxWeaponCount - l; ++i) {
                this.invetory.weapons.push(weapon(this.level, require('../../../assets/weapons/options.json').sprites.fist, this.sprites, this.body));
            }
        
        },
        
        update (dt) {
            if (!this.isS) this.setup();

            this.x = this.body.position.x;
            this.y = this.body.position.y;


            this.invetory.weapons[this.invetory.weapon].update(dt);
            this.invetory.fist.update(dt);


            

            Body.setAngularVelocity(this.body, (-(this.body.angle % Math.PI)) / 25 + this.body.angularVelocity);


            this.angle = (this.dir * (this.angle2 + Math.PI/2) + Math.PI/2);

        },

        getBody () {
            if (!this.isS) this.setup();
            return this.body;
        },

    }


}