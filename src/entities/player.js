import { Bodies, Body } from 'matter-js';
import { sprites, sprite } from '../sprite.js';
import { weapon } from '../weapon.js';
import animations from '../../assets/player/animations.json';
import { sign } from '../common.js';
import { CATEGORY_PLAYER, MASK_PLAYER } from '../collisionFilters.js'
import { createJoystick } from '../interface/joystick.js';
import { createButton } from '../interface/button.js';

export const createPlayer = (level, x, y, resize = 1) => {
    return {
        level: level,
        x: x,
        y: y,
        resize: resize,
        angle: 0,
        angle2: 0,
        width: resize * 20,
        height: resize * 48,
        body: Bodies.rectangle(x, y, resize * 20, resize * 48, {
            mass: 50,
            friction: 0.09,
            frictionAir: 0.05,
            collisionFilter: {
                category: CATEGORY_PLAYER,
                mask: MASK_PLAYER,
            },
        }),
        jumpTimer: 0,
        sensors: {},
        dir: 1,
        sprites: {},
        constraints: [],
        invetory: {},
        name: 'player',
        isS: false,

        collisionActive (bodyA, bodyB, pair) {
            if (bodyB.name === 'item') {
                const item = bodyB.entity;
                if (item.type === 'weapon') {
                    for (let i = 0; i < this.invetory.maxWeaponCount; ++i) {
                        if (this.invetory.weapons[i].name === 'fist') {
                            this.invetory.weapons[i] = weapon(this.level, item.options, this.sprites, this.body, this.resize);
                            this.level.removeEntity(item);
                            return;
                        }
                    }
                }
            }
        },

        setup () {
            this.isS = true;
            this.body.name = 'player';
            this.body.entity = this;
            this.sprites = sprites(animations, this.resize, ['idle'], this.body);
            this.body.collisionActive = (bodyA, bodyB, pair) => {
                this.collisionActive(bodyA, bodyB, pair);
            }
            this.body.showBoundingBox = false;
            

            this.addSensor(0, 28, 18, 2, 'down')



            this.invetory = {
                weapons: [],
                weapon: 0,
                maxWeaponCount: 3,
                fist: weapon(this.level, require('../../assets/weapons/options.json').sprites.fist, this.sprites, this.body, this.resize),
            }

            const l = this.invetory.weapons.length;
            for (let i = 0; i < this.invetory.maxWeaponCount - l; ++i) {
                this.invetory.weapons.push(weapon(this.level, require('../../assets/weapons/options.json').sprites.fist, this.sprites, this.body, this.resize));
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
                    this.invetory.weapons[this.invetory.weapon].shot(this.x, this.y, this.angle2)
                }
            });
            this.controls.addElement(this.fireJoystick);


            this.plusZoomButton = createButton(0.9, 0.12, {r: 0.025}, {
                doubleClick: () => {
                    this.invetory.weapons[this.invetory.weapon].addZoom(1000)
                },
                pressed: () => {}
            });
            this.controls.addElement(this.plusZoomButton);


            this.minusZoomButton = createButton(0.84, 0.12, {r: 0.025}, {
                doubleClick: () => {
                    this.invetory.weapons[this.invetory.weapon].addZoom(-1000)
                },
                pressed: () => {}
            });
            this.controls.addElement(this.minusZoomButton);

            this.plusWeaponButton = createButton(0.9, 0.26, {r: 0.025}, {
                click: () => {
                    this.invetory.weapon = (this.invetory.weapon + 1) % this.invetory.maxWeaponCount;
                }
            });
            this.controls.addElement(this.plusWeaponButton);
            
            this.minusWeaponButton = createButton(0.84, 0.26, {r: 0.025}, {
                click: () => {
                    this.invetory.weapon = (this.invetory.maxWeaponCount + this.invetory.weapon - 1) % this.invetory.maxWeaponCount;
                }
            });
            this.controls.addElement(this.minusWeaponButton);

        },
        
        update (dt) {
            if (!this.isS) this.setup();
            this.jumpTimer += dt;

            this.sprites.clearStates();
            this.sprites.addState('idle');
            this.invetory.weapons[this.invetory.weapon].update(dt);
            this.invetory.fist.update(dt);


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
                this.invetory.fist.shot(this.x, this.y, this.angle2);
            }
            if (this.level.app.keys['f']) {
                this.invetory.weapons[this.invetory.weapon].shot(this.x, this.y, this.angle2)
            }
            for (let i = 0; i < this.invetory.maxWeaponCount; ++i) {
                if (this.level.app.keys[i + 1]) {
                    if (this.invetory.weapons[i].name !== 'fist') {
                        this.invetory.weapon = i;
                    }
                }
            }

            Body.setAngularVelocity(this.body, (-(this.body.angle % Math.PI)) / 25 + this.body.angularVelocity);

            if (this.sprites.sprites['head']) {
                this.sprites.sprites['head'].nangle = {step: this.angle/3, time: 0.1};
            }
            if (this.invetory.weapons[this.invetory.weapon].attackClass !== 'short') {
                if (this.sprites.sprites['leftHand']) {
                    this.sprites.sprites['leftHand'].nangle = {step: this.angle/2, time: 0.1};
                }
                if (!this.sprites.hasState('hit')) {
                    if (this.sprites.sprites['rightHand']) {
                        this.sprites.sprites['rightHand'].nangle = {step: this.angle, time: 0.1};
                    }
                }
            }

            if (!this.sensors['down'].isCollide) {
                if (this.jumpTimer >= 0.5) {
                    Body.applyForce(this.body, this.body.position, {x: 0, y: 4 * dt * this.moveJoystick.getPressure().y});
                }
            }


            if (this.plusZoomButton.isPressed) {
                this.invetory.weapons[this.invetory.weapon].addZoom(3 * dt);
            }
            if (this.minusZoomButton.isPressed) {
                this.invetory.weapons[this.invetory.weapon].addZoom(-3 * dt);
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
            this.sprites.setDir(this.dir);
            this.sprites.update(dt);
        },

        render (ctx) {
            this.x = this.body.position.x;
            this.y = this.body.position.y;

            for (const i in this.sensors) {
                const sensor = this.sensors[i];
                Body.setPosition(sensor.body, {x: this.x + sensor.x, y: this.y + sensor.y});
                Body.setVelocity(sensor.body, {x: 0, y: 0});
                Body.applyForce(sensor.body, sensor.body.position, {x: 0, y: 0.0001});
                sensor.body.isSleeping = false;
            }

            // this.angle2 = this.dir * (this.angle + Math.PI / 2) - Math.PI / 2;
            const bounds = this.level.app.getBounds();
            const zoom = this.invetory.weapons[this.invetory.weapon].getZoom();
            this.level.app.setBounds(
            bounds.x - (bounds.x - (this.x + (150 * 1) * Math.cos(this.angle2))) * 0.01,
            bounds.y - (bounds.y - (this.y + (150 * 1) * Math.sin(this.angle2))) * 0.01,
            bounds.width - (bounds.width - 1800 * zoom) * 0.025
            );
            this.sprites.render(ctx);
        },

        addSensor(x, y, w, h, name) {
            this.sensors[name] = {};
            this.sensors[name].body = Bodies.rectangle(0, 0, resize * w, resize * h, {
                isSensor: true,
                isStatic: false,
                collisionFilter: {
                    category: CATEGORY_PLAYER,
                    mask: MASK_PLAYER,
                },
            });
            this.sensors[name].body.isCollide = false;
            this.sensors[name].x = x * this.resize;
            this.sensors[name].y = y * this.resize;

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