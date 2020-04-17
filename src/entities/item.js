import { Bodies } from 'matter-js';
import { draw } from '../sprite.js';
import { CATEGORY_ITEM, MASK_ITEM } from '../collisionFilters.js';

export const item = (level, x, y, resize, options, type) => {
    return {
        level: level,
        x: x,
        y: y,
        resize: resize,
        options: options,
        type: type,
        body: Bodies.rectangle(x, y, options.width * resize, options.height * resize, {
            mass: 10,
            collisionFilter: {
                category: CATEGORY_ITEM,
                mask: MASK_ITEM,
            },
        }),
        name: 'item',
        isS: false,

        setup () {
            this.isS = true;
            this.body.showBoundingBox = false;
            this.body.name = 'item';
            this.body.entity = this;
        },

        update (dt) {
            if (!this.isS) this.setup();

        },

        render (ctx) {
            this.x = this.body.position.x;
            this.y = this.body.position.y;
            this.angle = this.body.position.angle;
            if (this.options.image === undefined || typeof(this.options.image) === 'string') return;
            draw(ctx, this.options.image, this.x, this.y, this.options.width, this.options.height, this.body.angle, this.resize);
        },

        getBody () {
            return this.body;
        },
    }
}