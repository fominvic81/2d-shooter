import {
	World,
} from 'matter-js';

export const createLevel = (level, app) => {
    return {
        app: app,
        world: app.world,
        entities: new Map(),
        lastId: 0,
        isS: false,

        setup () {
            this.isS = true;
            for (const body of level.bodies) {
                app.matter.addBody(body);
            }
        },

        update (dt) {
            if (!this.isS) this.setup();

            for (const entity of this.entities.values()) {
                entity.update(dt);
            }

        },

        addBody (body) {
            app.matter.addBody(body);
        },

        addEntity (entity, socket = undefined) {
            ++this.lastId;
            console.log(this.lastId);
            if (entity.getBody()) {
                app.matter.addBody(entity.getBody());
            }
            entity.id = this.lastId;
            this.entities.set(entity.id, entity);
            
            if (entity.name === 'player') {
                if (socket) {
                    entity.socket = socket;
                    socket.entity = entity;
                    socket.broadcast.emit('serverAddEntity', {id: entity.id, entityName: entity.name, args: entity.args, bodyId: entity.getBody().id, isLocal: false});
                    socket.emit('serverAddEntity', {id: entity.id, entityName: entity.name, args: entity.args, bodyId: entity.getBody().id, isLocal: true});
                }
            } else {
                this.app.io.sockets.emit('serverAddEntity', {id: entity.id, entityName: entity.name, args: entity.args, bodyId: entity.getBody().id});
            }
            
        },
        
        removeEntity (entity) {
            this.app.io.sockets.emit('serverRemoveEntity', {id: entity.id});
            this.app.matter.removeBody(entity.getBody());
            this.entities.delete(entity.id);
        },

        handleConnect (socket) {
            for (const entity of this.entities.values()) {
                if (entity.name === 'player') {
                    socket.emit('serverAddEntity', {id: entity.id, entityName: 'player', args: {x: entity.x, y: entity.y}, bodyId: entity.getBody().id, isLocal: false});
                } else if (entity.name === 'explosion') {
                    socket.emit('serverAddEntity', {id: entity.id, entityName: 'explosion', args: entity.args, bodyId: entity.getBody().id});
                }
            }
        }

    }
}
