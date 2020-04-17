import {
	World,
} from 'matter-js';

export const createLevel = (level, app) => {
    return {
        app: app,
        world: app.world,
        entities: new Map(),
        isS: false,

        setup () {
            this.isS = true;
            for (const body of level.bodies) {
                World.add(this.world, body);
            }
        },

        update (dt) {
            if (!this.isS) this.setup();

            for (const entity of this.entities.values()) {
                entity.update(dt);
            }

        },

        render (ctx) {
            for (const entity of this.entities.values()) {
                entity.render(ctx);
            }
        },

        addBody (body) {
            World.add(this.world, body);
        },

        addEntity (entity) {
            if (entity.getBody()) {
                World.add(this.world, entity.getBody());
            }
            entity.id = Symbol('id');
            this.entities.set(entity.id, entity);
        },

        removeEntity (entity) {
            World.remove(this.world, entity.getBody());
            this.entities.delete(entity.id);
        },

    }
}
