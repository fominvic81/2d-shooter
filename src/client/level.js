import {
	World,
} from 'matter-js';

export const createLevel = (app) => {
    return {
        app: app,
        world: app.world,
        entities: new Map(),
        isS: false,



        update (dt) {

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

        addEntity (entity, id, bodyId) {
            entity.id = id;
            entity.body = this.app.bodies.get(bodyId);
            this.entities.set(entity.id, entity);
        },

        removeEntity (id) {
            this.entities.delete(id);
        },

    }
}
