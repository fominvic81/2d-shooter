

export const createButton = (x, y, size, events = {}) => {
    return {
        x: 0,
        y: 0,
        tX: x,
        tY: y,
        r: undefined,
        tR: size.r,
        width: undefined,
        height: undefined,
        tWidth: size.width,
        tHeight: size.height,
        events,
        updated: false,
        doubleClickTimer: 1000,
        doubleClickTime: 0.25,
        touchIn: false,
        isPressed: false,
        updateDoubleClick: false,


        update (dt) {
            if (this.events.doubleClick && this.updateDoubleClick) {
                this.doubleClickTimer += dt;
                if (this.doubleClickTimer <= this.doubleClickTime) {
                    this.updated = true;
                } else if (this.events.click) {
                    this.events.click();
                }
            }
            if (this.isPressed && this.events.pressed) {
                this.updated = true;
                this.events.pressed();
            }
        },

        render (ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            if (this.updated) {
                ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
            } else {
                ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
            }
            ctx.lineWidth = 4;
            if (this.tR) {
                ctx.beginPath();
                ctx.arc(0, 0, this.r, -Math.PI, Math.PI);
                ctx.stroke();
            } else if (this.tWidth && this.tHeight) {
                ctx.translate(-this.width/2, -this.height/2);
                ctx.strokeRect(0, 0, this.width, this.height);
            }
            ctx.restore();
        },

        resize (width, height) {
            this.x = width * this.tX;
            this.y = height * this.tY;
            if (this.tR) {
                this.r = width * this.tR;
            }
            if (this.tWidth && this.tHeight) {
                this.width = width * this.tWidth;
                this.height = height * this.tHeight;
            }
        },

        touchStart (x, y, touch) {
            this.touchIn = true;
            if (this.events.pressed) {
                this.isPressed = true;
                this.layout.addUpdate(this);
            }
        },
        
        touchEnd (x, y, touch) {
            if (this.touchIn) {
                if (this.events.doubleClick && this.doubleClickTimer < this.doubleClickTime) {
                    this.events.doubleClick();
                    this.updateDoubleClick = false;
                    this.doubleClickTimer = this.doubleClickTime + 1;
                } else { 
                    if (this.events.doubleClick) {
                        this.doubleClickTimer = 0;
                        this.updateDoubleClick = true;
                        this.layout.addUpdate(this);
                    }
                    if (this.events.click && !this.events.doubleClick) {
                        this.events.click();
                    }
                }
            }
            this.touchIn = false;
            this.isPressed = false;
        },
        
        touchMove (x, y, touch) {

        },
        
        touchOut (x, y, touch) {
            this.touchIn = false;
        },
        
        touchOver (x, y, touch) {
            this.touchIn = true;
        },

    }
}