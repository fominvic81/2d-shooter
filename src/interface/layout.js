import { dist } from '../common.js';

export const createLayout = (x, y, width, height) => {
    return {
        x: 0,
        y: 0,
        tX: x,
        tY: y,
        width: 0,
        height: 0,
        tWidth: width,
        tHeight: height,
        elements: new Map(),
        update_elements: new Map(),
        lastId: 0,

        addUpdate (element) {
            if (this.update_elements.get(element.id)) return;
            element.updated = true;
            this.update_elements.set(element.id, element);
        },

        removeUpdate (element) {
            element.updated = false;
            this.update_elements.delete(element.id);
        },

        update (dt) {
            for (const element of this.update_elements.values()) {
                element.updated = false;
                element.update(dt);
                if (element.updated !== true) {
                    this.update_elements.delete(element.id);
                }
            }
        },

        render (ctx) {
            for (const element of this.elements.values()) {
                element.render(ctx);
            }
        },

        resize (width, height) {
            this.x = width * this.tX;
            this.y = height * this.tY;
            this.width = width * this.tWidth;
            this.height = height * this.tHeight;
            for (const element of this.elements.values()) {
                element.resize(this.width, this.height);
            }
        },

        addElement (element) {
            element.resize(this.width, this.height);
            element.x += this.x - this.width/2;
            element.y += this.y - this.height/2;
            element.layout = this;
            this.lastId += 1;
            element.id = this.lastId;
            this.elements.set(this.lastId, element);
        },
        
        removeElement (id) {
            this.update_elements.delete(id);
            this.elements.delete(id);
        },

        touchStart (x, y, touch) {
            for (const element of this.elements.values()) {
                if (element.width && element.height) {
                    if (x <= element.x + element.width/2 &&
                        x + element.width/2 >= element.x &&
                        y <= element.y + element.height/2 &&
                        element.height/2 + y >= element.y) {
                            element.touchStart(x, y, touch);
                            element._touch = touch;
                            element._touchIn = true;
                            break;
                    }
                } else if (element.r !== undefined) {
                    if (dist(x, y, element.x, element.y) <= element.r) {
                        element.touchStart(x, y, touch);
                        element._touch = touch;
                        element._touchIn = true;
                        break;
                    }
                }
            }
        },
        touchEnd (x, y, touch) {
            for (const element of this.elements.values()) {
                if (element._touch === undefined) continue;
                if (touch.identifier === element._touch.identifier) {
                    element.touchEnd(x, y, touch);
                    element._touchIn = false;
                    element._touch = undefined;
                }
            }
        },
        touchMove (x, y, touch) {
            for (const element of this.elements.values()) {
                if (element._touch === undefined) continue;
                if (touch.identifier === element._touch.identifier) {
                    element.touchMove(x, y, touch);
                    if (element._touchIn) {
                        if (element.width !== undefined && element.height !== undefined) {
                            if (!(x <= element.x + element.width/2 &&
                                x + element.width/2 >= element.x &&
                                y <= element.y + element.height/2 &&
                                element.height/2 + y >= element.y)) {
                                    element.touchOut(x, y, touch);
                                    element._touchIn = false;
                            }
                        } else if (element.r !== undefined) {
                            if (!(dist(x, y, element.x, element.y) <= element.r)) {
                                element.touchOut(x, y, touch);
                                element._touchIn = false;
                            }
                        }
                    }
                    if (!element._touchIn) {
                        if (element.width !== undefined && element.height !== undefined) {
                            if (x <= element.x + element.width/2 &&
                                x + element.width/2 >= element.x &&
                                y <= element.y + element.height/2 &&
                                element.height/2 + y >= element.y) {
                                    element.touchOver(x, y, touch);
                                    element._touchIn = true;
                            }
                        } else if (element.r !== undefined) {
                            if (dist(x, y, element.x, element.y) <= element.r) {
                                element.touchOver(x, y, touch);
                                element._touchIn = true;
                            }
                        }
                    }
                }
            }
        }

    }
}

