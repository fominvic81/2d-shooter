import { dist } from '../../common.js';


export const createJoystick = (x, y, r, autoRecovery, events = {}) => {
    return {
        x: 0,
        y: 0,
        tX: x,
        tY: y,
        r: undefined,
        tR: r,
        autoRecovery,
        events,
        angle: 0,
        stickX: 0,
        stickY: 0,
        stickR: 0,
        doubleClickTimer: 1000,
        doubleClickTime: 0.2,
        isPressed: false,
        isDouble: false,
        updated: false,
        updateRecovery: false,

        update (dt) {
            if (autoRecovery === true && Math.abs(this.stickX) >= 0.001 && Math.abs(this.stickY) >= 0.1 && this.updateRecovery) {
                    this.updated = true;
                    this.stickX += (-this.stickX) * dt * 8;
                    this.stickY += (-this.stickY) * dt * 8;
            }
            if (this.active && this.events.active) {
                this.updated = true;

                this.events.active(this.isDouble);
            }

            if (this.updateDoubleClick) {
                this.doubleClickTimer += dt;
                if (this.doubleClickTimer <= this.doubleClickTime) {
                    this.updated = true;
                } else if (this.events.click) {
                    this.updateDoubleClick = false;
                    this.events.click();
                }
            }
            if (this.isPressed && this.events.pressed) {
                this.updated = true;
                this.events.pressed(this.isDouble);
            }
        },

        render (ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            if (this.active) {
                ctx.strokeStyle = 'rgba(255, 50, 50, 0.5)';
            } else if (this.updated) {
                ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
            } else {
                ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
            }
            ctx.beginPath();
            ctx.arc(0, 0, this.r, -Math.PI, Math.PI);
            ctx.moveTo(this.stickX - this.stickR, this.stickY);
            ctx.arc(this.stickX, this.stickY, this.stickR, -Math.PI, Math.PI);
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.restore();
        },

        getPressure () {
            return {
                pressure: Math.sqrt(Math.pow(this.stickX, 2) + Math.pow(this.stickY, 2)) / this.r,
                x: this.stickX/this.r,
                y: this.stickY/this.r,
            };
        },

        resize (width, height) {
            this.x = width * this.tX;
            this.y = height * this.tY;
            this.r = width * this.tR;
            this.stickR = this.r*0.75;
        },

        touchStart (x, y, touch) {
            this.updateRecovery = false;
            if (this.events.pressed) {
                this.isPressed = true;
                this.layout.addUpdate(this);
            }
            this.active = false;
            this.stickX = x - this.x;
            this.stickY = y - this.y;
            this.angle = Math.atan2(this.stickY, this.stickX);

            if (dist(this.x, this.y, x, y) >= this.r) {
                                
                this.stickX = this.r * Math.cos(this.angle);
                this.stickY = this.r * Math.sin(this.angle);

                this.active = true;
                this.layout.addUpdate(this);
            }


            
            if (this.doubleClickTimer < this.doubleClickTime) {
                if (this.events.doubleClick) this.events.doubleClick();
                this.isDouble = true;
                this.updateDoubleClick = false;
                this.doubleClickTimer = this.doubleClickTime + 1;
            } else { 
                this.doubleClickTimer = 0;
                this.updateDoubleClick = true;
                this.layout.addUpdate(this);

                if (this.events.click && !this.events.doubleClick) {
                    this.events.click();
                }
            }
        },
        
        touchEnd (x, y, touch) {
            if (this.autoRecovery) {
                this.layout.addUpdate(this);
                this.updateRecovery = true;
            }
            this.isPressed = false;
            this.isDouble = false;
            this.active = false;
        },
        
        touchMove (x, y, touch) {
            this.updateRecovery = false;
            this.active = false;
            this.stickX = x - this.x;
            this.stickY = y - this.y;
            this.angle = Math.atan2(this.stickY, this.stickX);

            if (dist(this.x, this.y, x, y) >= this.r) {
                                
                this.stickX = this.r * Math.cos(this.angle);
                this.stickY = this.r * Math.sin(this.angle);

                this.active = true;
                this.layout.addUpdate(this);
            }

        },
        
        touchOut (x, y, touch) {

        },
        
        touchOver (x, y, touch) {

        },

    }
}