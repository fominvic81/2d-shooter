import _ from 'lodash';

export const draw = (ctx, img, x, y, width, height, angle, resize) => {
    ctx.save();
    
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.translate(-x, -y);
    ctx.translate(-width/2 * resize, -height/2 * resize);
    ctx.drawImage(img, x, y, width * resize, height * resize);
    
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
        oangle: {},
        angle: {},
        nangle: {},
        ox: {},
        x: {},
        nx: {},
        oy: {},
        y: {},
        ny: {},
        isS: false,

        setup () {
            this.isS = true;

            for (const i of this.animations.sprites.names) {
                this.nangle[i] = { step: 1, time: 1 };
                this.angle[i] = { step: 1, time: 1 };
                this.oangle[i] = { step: 1, time: 1 };
            }

            for (const i of this.animations.sprites.names) {
                this.nx[i] = { step: 1, time: 1 };
                this.x[i] = { step: 1, time: 1 };
                this.ox[i] = { step: 1, time: 1 };
            }

            for (const i of this.animations.sprites.names) {
                this.ny[i] = { step: 1, time: 1 };
                this.y[i] = { step: 1, time: 1 };
                this.oy[i] = { step: 1, time: 1 };
            }

        },

        update (dt) {
            if (!this.isS) this.setup();

            for (const name in this.nangle) {
                this.angle[name].step += (this.nangle[name].step - this.oangle[name].step) * (dt/this.nangle[name].time);
            }
            
            for (const name in this.nx) {
                this.x[name].step += (this.nx[name].step - this.ox[name].step) * (dt/this.nx[name].time);
            }

            for (const name in this.ny) {
                this.y[name].step += (this.ny[name].step - this.oy[name].step) * (dt/this.ny[name].time);
            }

            for (let i = 0; i < this.states.length; ++i) {
                const state = this.states[i].state;
                if (this.stepTimer[state] === undefined) this.stepTimer[state] = 0;
                if (this.stepNumber[state] === undefined) this.stepNumber[state] = 0;
                this.stepTimer[state] += dt;
                if (this.stepTimer[state] >= this.animations.states[state].steps[this.stepNumber[state]].stepTime) {
                    if (this.states[i].autoDelete === true) {
                        if (this.stepNumber[state] >= animations.states[state].steps.length-1) {
                            this.states.splice(i, 1);
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
            ctx.rotate(body.angle);

            for (const i of this.animations.sprites.names) {
                for (const s of this.states) {
                    const state = s.state
                    const sprite = this.animations.sprites[i];
                    if (this.animations.states[state].steps[this.stepNumber[state]] === undefined) {
                        continue;
                    }
                    const step = this.animations.states[state].steps[this.stepNumber[state]][i];
                    if (step === undefined) {
                        continue;
                    }

                    this.ox[i] = this.x[i];
                    this.oy[i] = this.y[i];
                    this.oangle[i] = this.angle[i];

                    this.nx[i].step = step[0];
                    this.nx[i].time = this.animations.states[state].steps[this.stepNumber[state]].stepTime;
                    this.ny[i].step = step[1];
                    this.ny[i].time = this.animations.states[state].steps[this.stepNumber[state]].stepTime;
                    this.nangle[i].step = step[2];
                    this.nangle[i].time = this.animations.states[state].steps[this.stepNumber[state]].stepTime;
                    ctx.save();

                    ctx.scale(this.resize, this.resize);
                    ctx.scale(this.dir, 1);
                    ctx.translate(this.x[i].step, this.y[i].step);
                    ctx.rotate(this.angle[i].step);

                    ctx.translate(-sprite.width/2, -sprite.height/2);

                    ctx.drawImage(sprite.image, 0, 0, sprite.width, sprite.height);
                    

                    ctx.restore();
                }
                
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

        addState (state, autoDelete = false) {
            this.states.push({state: state, autoDelete: autoDelete});
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