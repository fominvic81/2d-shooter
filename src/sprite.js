
export const draw = (ctx, img, x, y, width, height, angle, resize) => {
    ctx.save();
    
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    ctx.translate(-width/2 * resize, -height/2 * resize);
    ctx.drawImage(img, 0, 0, width * resize, height * resize);
    
    ctx.restore();
}

export const sprite = (img, x, y, width, height, angle) => {
    return {
        image: img,
        x: x,
        y: y,
        width: width,
        height: height,
        angle: angle,
    }
}

export const sprites = (animations, resize, states, body) => {
    return {
        animations: animations,
        resize: resize,
        body: body,
        dir: 1,
        states: states,
        stepNumber: {},
        stepTimer: {},
        spritesList: [],
        sprites: {},
        isS: false,

        setup () {
            this.isS = true;

            for (const name of this.animations.sprites.names) {
                const sprite = {
                    sprites: this,
                    animations: this.animations,
                    stepNumber: this.stepNumber,
                    name: name,
                    states: this.states,

                    ox: {step: 1, time: 1},
                    x: {step: 0, time: 1},
                    nx: {step: 0, time: 1},

                    oy: {step: 0, time: 1},
                    y: {step: 0, time: 1},
                    ny: {step: 0, time: 1},

                    oangle: {step: 0, time: 1},
                    angle: {step: 0, time: 1},
                    nangle: {step: 0, time: 1},

                    update (dt) {

                        this.angle.step += (this.nangle.step - this.oangle.step) * (dt/this.nangle.time);

                        this.x.step += (this.nx.step - this.ox.step) * (dt/this.nx.time);
            
                        this.y.step += (this.ny.step - this.oy.step) * (dt/this.ny.time);

                        for (const s of this.states) {
                            const state = s.state;

                            if (this.animations.states[state].steps[this.stepNumber[state]] === undefined) {
                                continue;
                            }
                            const step = this.animations.states[state].steps[this.stepNumber[state]][this.name];
                            if (step === undefined) {
                                continue;
                            }

                            // const stepsLength = this.animations.states[state].steps.length;
                            // const lastStepNumber = (stepsLength + this.stepNumber[state] - 1) % (stepsLength);
                            // this.ox.step = this.animations.states[state].steps[lastStepNumber][this.name][0];
                            // this.ox.time = this.animations.states[state].steps[lastStepNumber].stepTime;
                            this.ox.step = this.x.step;
                            this.oy.step = this.y.step;
                            this.oangle.step = this.angle.step;
                            
                            
                            if (step[0] !== '-') {
                                this.nx.state = state;
                                this.nx.step = step[0];
                                this.nx.time = this.animations.states[state].steps[this.stepNumber[state]].stepTime;
                                // this.nx.state = state;
                                // this.nx.time = this.animations.states[state].steps[this.stepNumber[state]].stepTime;
                                // this.nx.step[state] = step[0];
                                
                            }
                            
                            if (step[1] !== '-') {
                                this.ny.state = state;
                                this.ny.step = step[1];
                                this.ny.time = this.animations.states[state].steps[this.stepNumber[state]].stepTime;
                            }
                            if (step[2] !== '-') {
                                this.nangle.state = state;
                                this.nangle.step = step[2];
                                this.nangle.time = this.animations.states[state].steps[this.stepNumber[state]].stepTime;
                            }
                        }
                    },

                    shouldRender() {
                        if (!this.animations.sprites[name].image) return false;
                        for (const s of this.states) {
                            const state = s.state;
                            const steps = this.animations.states[state].steps[this.stepNumber[state]];
                            if (steps && steps[this.name] !== undefined) return true;
                        }
                        return false;
                    },

                    render (ctx) {
                        if (!this.shouldRender()) {
                            return;
                        }
                        this.transform(ctx, () => {
                            ctx.translate(
                                -this.animations.sprites[name].width / 2,
                                -this.animations.sprites[name].height / 2,
                            );
                            ctx.drawImage(this.animations.sprites[name].image, 0, 0, this.animations.sprites[name].width, this.animations.sprites[name].height);
                        });
                    },

                    transform (ctx, fn) {
                        if (this.parent) {
                            this.parent.transform(ctx, () => {
                                this.transformSelf(ctx, fn);
                            });
                        } else {
                            this.transformSelf(ctx, fn);
                        }
                    },

                    transformSelf (ctx, fn) {
                        ctx.save();

                        ctx.translate(this.x.step, this.y.step);
                        ctx.rotate(this.angle.step);

                        fn();
                        
                        ctx.restore();
                    },

                };

                this.spritesList.push(sprite);
                this.sprites[name] = sprite;

            }

                
            for (const sprite in this.sprites) {
                if (this.animations.sprites[sprite].parent) {
                    this.sprites[sprite].parent = this.sprites[this.animations.sprites[sprite].parent];
                }
            }

        },

        update (dt) {
            if (!this.isS) this.setup();
            
            for (const sprite of this.spritesList) {
                sprite.update(dt);
            }

            for (let i = 0; i < this.states.length; ++i) {
                const state = this.states[i].state;
                if (this.stepTimer[state] === undefined) this.stepTimer[state] = 0;
                if (this.stepNumber[state] === undefined) this.stepNumber[state] = 0;
                this.stepTimer[state] += dt * this.states[i].speed;
                if (this.stepTimer[state] >= this.animations.states[state].steps[this.stepNumber[state]].stepTime) {
                    if (this.states[i].autoDelete === true) {
                        if (this.stepNumber[state] >= animations.states[state].steps.length-1) {
                            this.states.splice(i, 1);
                            --i;
                        }
                    }
                    this.stepTimer[state] = 0;
                    this.stepNumber[state] += 1;
                    this.stepNumber[state] = this.stepNumber[state] % animations.states[state].steps.length;
                }
            }

        }, 

        render (ctx) {
            if(!this.isS) this.setup();

            ctx.save();
            ctx.translate(body.position.x, body.position.y);
            ctx.scale(this.resize, this.resize);
            ctx.rotate(body.angle);

            ctx.scale(this.dir, 1);

            for (const sprite of this.spritesList) {
                sprite.render(ctx);
            }

            ctx.restore();

        },

        clearStates () {
            for (let i = 0; i < this.states.length; ++i) {
                if (this.states[i].autoDelete !== true) {
                    this.states.splice(i, 1);
                }
            }
            // this.stepNumber = {};
            // this.stepTimer = {};
        },

        setStates (states) {
            this.clearStates;
            this.stepNumber = {};
            this.stepTimer = {};
            this.states = states;
        },

        addState (state, autoDelete = false, speed = 1) {
            this.states.push({state, autoDelete, speed});
            this.states.sort((a, b) => {
                if(a.autoDelete) {
                    return 1;             
                } else if (b.autoDelete) {
                    return -1;
                } else {
                    return 0;
                }
            });
        },

        hasState(state) {
            for (const s of this.states) {
                if (s.state === state) {
                    return true;
                }
            }
            return false;
        },

        getStates () {
            return this.states;
        },

        setDir (dir) {
            if (dir >= 1) {
                this.dir = 1;
            } else {
                this.dir = -1;
            }
        }

    }
}


/// TODO: new method of drawing images