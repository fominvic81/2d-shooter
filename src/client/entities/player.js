import { Bodies, Body } from 'matter-js';
import { sprites, sprite } from '../sprite.js';
import { weapon } from '../weapon.js';
import animations from '../../../assets/player/animations.json';
import { sign } from '../../common.js';
import { CATEGORY_PLAYER, MASK_PLAYER } from '../../collisionFilters.js'
import { createJoystick } from '../interface/joystick.js';
import { createButton } from '../interface/button.js';

export const createPlayer = (level, args) => { // args: x,y,isLocal
    return {
        level: level,
        args: args,
        x: args.x,
        y: args.y,
        nx: args.x,
        ny: args.y,
        isLocal: args.isLocal,
        angle: 0,
        nangle: 0,
        angle2: 0,
        width: 60,
        height: 144,
        // body: Bodies.rectangle(args.x, args.y, 60, 144, {
        //     mass: 50,
        //     friction: 0.09,
        //     frictionAir: 0.05,
        //     collisionFilter: {
        //         category: CATEGORY_PLAYER,
        //         mask: MASK_PLAYER,
        //     },
        // }),
        jumpTimer: 0,
        sensors: {},
        dir: 1,
        sprites: {},
        constraints: [],
        inventory: {},
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
            this.body.showBoundingBox = false;
            this.sprites = sprites(animations, ['idle'], this);
            
            this.inventory = {
                weapons: [],
                weapon: 0,
                maxWeaponCount: 3,
                fist: weapon(this.level, require('../../../assets/weapons/options.json').sprites.fist, this.sprites, this.body),
            }
            
            const l = this.inventory.weapons.length;
            for (let i = 0; i < this.inventory.maxWeaponCount - l; ++i) {
                this.inventory.weapons.push(weapon(this.level, require('../../../assets/weapons/options.json').sprites.ak47, this.sprites, this.body));
            }

            if (this.isLocal) {
                this.addSensor(0, 84, 54, 6, 'down');

                this.body.collisionActive = (bodyA, bodyB, pair) => {
                    this.collisionActive(bodyA, bodyB, pair);
                }
                


                this.controls = this.level.app.layout();

                this.moveJoystick = createJoystick(0.14, 0.75, 0.07, true, {
                    active: (isDouble) => {
                        if (this.sensors['down'].isCollide) {
                            if (this.moveJoystick.getPressure().y <= -0.8) {
                                // Body.applyForce(this.body, this.body.position, {x: 0, y: -0.5});
                                Body.setVelocity(this.body, {x: this.body.velocity.x, y: -18});
                                this.jumpTimer = 0;
                            }
                        }
                    },
                });
                this.controls.addElement(this.moveJoystick);


                this.fireJoystick = createJoystick(0.86, 0.75, 0.07, false, {
                    active: (isDouble) => {
                        this.inventory.weapons[this.inventory.weapon].shot(this.x, this.y, this.angle2)
                    }
                });
                this.controls.addElement(this.fireJoystick);


                this.plusZoomButton = createButton(0.9, 0.12, {r: 0.025}, {
                    doubleClick: () => {
                        this.inventory.weapons[this.inventory.weapon].addZoom(1000)
                    },
                    pressed: () => {}
                });
                this.controls.addElement(this.plusZoomButton);


                this.minusZoomButton = createButton(0.84, 0.12, {r: 0.025}, {
                    doubleClick: () => {
                        this.inventory.weapons[this.inventory.weapon].addZoom(-1000)
                    },
                    pressed: () => {}
                });
                this.controls.addElement(this.minusZoomButton);

                this.plusWeaponButton = createButton(0.9, 0.26, {r: 0.025}, {
                    click: () => {
                        this.inventory.weapon = (this.inventory.weapon + 1) % this.inventory.maxWeaponCount;
                    }
                });
                this.controls.addElement(this.plusWeaponButton);
                
                this.minusWeaponButton = createButton(0.84, 0.26, {r: 0.025}, {
                    click: () => {
                        this.inventory.weapon = (this.inventory.maxWeaponCount + this.inventory.weapon - 1) % this.inventory.maxWeaponCount;
                    }
                });
                this.controls.addElement(this.minusWeaponButton);
            }

        },
        
        update (dt) {
            if (!this.isS) this.setup();

            this.sprites.clearStates();
            this.sprites.addState('idle');
            Body.setAngularVelocity(this.body, (-(this.body.angle % Math.PI)) / 25 + this.body.angularVelocity);
            if (this.sprites.sprites['head']) {
                this.sprites.sprites['head'].nangle = {step: this.angle/3, time: 0.1};
            }
            if (this.inventory.weapons[this.inventory.weapon].attackClass !== 'short') {
                if (this.sprites.sprites['leftHand']) {
                    this.sprites.sprites['leftHand'].nangle = {step: this.angle/2, time: 0.1};
                }
                if (!this.sprites.hasState('hit')) {
                    if (this.sprites.sprites['rightHand']) {
                        this.sprites.sprites['rightHand'].nangle = {step: this.angle, time: 0.1};
                    }
                }
            }

            this.x = this.x - (this.x - this.body.position.x) * (1 - Math.exp(-10 * dt));
            this.y = this.y - (this.y - this.body.position.y) * (1 - Math.exp(-10 * dt));

            // console.log(this.x);

            if (this.isLocal) {

                this.inventory.weapons[this.inventory.weapon].update(dt);
                this.inventory.fist.update(dt);
                this.jumpTimer += dt;

                if (Math.abs(this.nx - this.body.position.x) >= 5) {
                    this.nx = this.body.position.x;
                    this.level.app.socket.emit('clientMove', {body: {velocity: this.body.velocity, position: {x: this.x, y: this.y}, angle: this.body.angle, angularVelocity: this.body.angularVelocity}, entity: {angle: this.angle, dir: this.dir}});
                }
                if (Math.abs(this.ny - this.body.position.y) >= 5) {
                    this.ny = this.body.position.y;
                    this.level.app.socket.emit('clientMove', {body: {velocity: this.body.velocity, position: {x: this.x, y: this.y}, angle: this.body.angle, angularVelocity: this.body.angularVelocity}, entity: {angle: this.angle, dir: this.dir}});
                };
                if (Math.abs(this.nangle - this.angle) >= 0.1) {
                    this.nangle = this.angle;
                    this.level.app.socket.emit('clientMove', {body: {velocity: this.body.velocity, position: {x: this.x, y: this.y}, angle: this.body.angle, angularVelocity: this.body.angularVelocity}, entity: {angle: this.angle, dir: this.dir}});
                };

                for (const i in this.sensors) {
                    const sensor = this.sensors[i];
                    Body.setPosition(sensor.body, {x: this.x + sensor.x, y: this.y + sensor.y});
                    Body.setVelocity(sensor.body, {x: 0, y: 0});
                    Body.applyForce(sensor.body, sensor.body.position, {x: 0, y: 0.0001});
                }



                if (this.level.app.keys['ArrowLeft']) {
                    this.sprites.addState('go');
                    this.dir = 1;
                    Body.applyForce(this.body, this.body.position, {x: -2 * dt, y: 0});
                } else if (this.level.app.keys['ArrowRight']) {
                    this.sprites.addState('go');
                    this.dir = -1;
                    Body.applyForce(this.body, this.body.position, {x: 2 * dt, y: 0});
                }
                if (this.level.app.keys['ArrowUp']) {
                    if (this.sensors['down'].isCollide) {
                        // Body.applyForce(this.body, this.body.position, {x: 0, y: -0.5});
                        Body.setVelocity(this.body, {x: this.body.velocity.x, y: -18});
                        this.jumpTimer = 0;
                    } else
                    if (!this.sensors['down'].isCollide) {
                        if (this.jumpTimer >= 0.5) {
                            Body.applyForce(this.body, this.body.position, {x: 0, y: -4 * dt});
                        }
                    }
                } else if (this.level.app.keys['ArrowDown']) {
                    this.sprites.addState('sit');
                }
                if (this.level.app.keys['g']) {
                    this.inventory.fist.shot(this.x, this.y, this.angle2);
                }
                if (this.level.app.keys['f']) {
                    this.inventory.weapons[this.inventory.weapon].shot(this.x, this.y, this.angle2)
                }
                for (let i = 0; i < this.inventory.maxWeaponCount; ++i) {
                    if (this.level.app.keys[i + 1]) {
                        if (this.inventory.weapons[i].name !== 'fist') {
                            this.inventory.weapon = i;
                        }
                    }
                }


                if (!this.sensors['down'].isCollide) {
                    if (this.jumpTimer >= 0.5) {
                        // Body.applyForce(this.body, this.body.position, {x: 0, y: 4 * dt * this.moveJoystick.getPressure().y});
                    }
                }


                if (this.plusZoomButton.isPressed) {
                    this.inventory.weapons[this.inventory.weapon].addZoom(3 * dt);
                }
                if (this.minusZoomButton.isPressed) {
                    this.inventory.weapons[this.inventory.weapon].addZoom(-3 * dt);
                }
                
                this.angle2 = this.fireJoystick.angle;

                if (this.angle2 <= -Math.PI/2) {
                    this.dir = 1;
                } else if (this.angle2 >= Math.PI/2) {
                    this.dir = 1;
                } else {
                    this.dir = -1;
                }

                this.angle = (this.dir * (this.angle2 + Math.PI/2) + Math.PI/2);
                if (this.angle >= Math.PI + Math.PI/2) {
                    this.angle -= Math.PI*2;
                }

                if (this.moveJoystick.getPressure().pressure >= 0.1) {
                    Body.applyForce(this.body, this.body.position, {x: 2 * dt * this.moveJoystick.getPressure().x, y: 0});
                    this.sprites.addState('go', false, this.moveJoystick.getPressure().pressure);
                }

                // if (this.angle % Math.PI >= Math.PI/2 && this.dir === 1) {
                //     this.dir = -1;
                //     this.angle -= 0.1;
                // } else if (this.angle % Math.PI < -Math.PI/2 && this.dir === -1) {
                //     this.dir = 1;
                //     this.angle += 0.1;
                // } else if (this.angle % Math.PI < -Math.PI/2 && this.dir === 1) {
                //     this.dir = -1;
                // } else if (this.angle % Math.PI >= Math.PI/2 && this.dir === -1) {
                //     this.dir = 1;
                // }
            }


            this.sprites.setDir(this.dir);
            this.sprites.update(dt);
        },

        render (ctx) {
            if (!this.isS) this.setup();
            
            if (this.isLocal) {
                // console.log(this.y);
                // this.angle2 = this.dir * (this.angle + Math.PI / 2) - Math.PI / 2;
                const bounds = this.level.app.getBounds();
                // console.log(bounds);
                const zoom = this.inventory.weapons[this.inventory.weapon].getZoom();
                this.level.app.setBounds(
                bounds.x - (bounds.x - (this.x + (150 * 1) * Math.cos(this.angle2))) * 0.01,
                bounds.y - (bounds.y - (this.y + (150 * 1) * Math.sin(this.angle2))) * 0.01,
                bounds.width - (bounds.width - 1800 * zoom) * 0.025
                );
            }
            this.sprites.render(ctx);
        },

        addSensor(x, y, w, h, name) {
            this.sensors[name] = {};
            this.sensors[name].body = Bodies.rectangle(0, 0, w, h, {
                isSensor: true,
                isStatic: false,
                collisionFilter: {
                    category: CATEGORY_PLAYER,
                    mask: MASK_PLAYER,
                },
            });
            this.sensors[name].body.isCollide = false;
            this.sensors[name].x = x;
            this.sensors[name].y = y;

            this.sensors[name].body.collisionActive = (bodyA, bodyB, pair) => {
                if (bodyB.entity === this) return;
                this.sensors[name].isCollide = true;
            }
            this.sensors[name].body.collisionEnd = () => {
                this.sensors[name].isCollide = false;
            }
            level.addBody(this.sensors[name].body);
            
        },

        getBody () {
            if (!this.isS) this.setup();
            return this.body;
        },

    }


}