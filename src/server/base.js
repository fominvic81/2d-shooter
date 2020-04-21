import './hack';
import io_ from 'socket.io';
import http_ from 'http';
import {
	Engine,
	Runner,
	World,
    Events,
    Mouse,
    MouseConstraint,
    Composite,
} from 'matter-js';

export const initApp = (handleStart, handleUpdate) => {
    const data = {
        started: false,
        
        dt: 0,
        enginedt: 0,
        time: 0,
        
    };

    const engine = Engine.create();
    const world = engine.world;
    const runner = Runner.create({fps: 40});

    const http = http_.createServer();
    const io = io_.listen(http);
    http.listen(5860);

    const matterHandler = {
        bodies: new Map(),
        lastId: 0,
        timer: 0,

        update(dt) {
            this.timer += dt;

            if (this.timer >= 1) {
                this.timer -= 1;
                for (const body of this.bodies.values()) {
                    if (body.isStatic) continue;
                    io.sockets.emit('serverSetBody', {id: body.netId, options: {
                        velocity: body.velocity,
                        position: body.position,
                        isSleeping: body.isSleeping,
                        angularVelocity: body.angularVelocity,
                        angle: body.angle,
                    }});
                }
            }
        },

        addBody(body) {
            this.lastId += 1;
            body.netId = this.lastId;
            World.addBody(world, body);
            this.bodies.set(this.lastId, body);
            const vertices = [];
            for (const v of body.vertices) {
                const x = (body.position.x + (v.x - body.position.x) * Math.cos(-body.angle) - (v.y - body.position.y) * Math.sin(-body.angle));
                const y = (body.position.y + (v.y - body.position.y) * Math.cos(-body.angle) + (v.x - body.position.x) * Math.sin(-body.angle));
                vertices.push({
                    x: x,
                    y: y,
                });
            }
            io.sockets.emit('serverAddBody', {id: body.netId, options: {
                vertices,
                isStatic: body.isStatic,
                isSensor: body.isSensor,
                isSleeping: body.isSleeping,
                mass: body.mass,
                collisionFilter: body.collisionFilter,
                friction: body.friction,
                frictionAir: body.frictionAir,
                frictionStatic: body.frictionStatic,
                angle: body.angle,
            }});
        },
        
        removeBody(body) {
            this.bodies.delete(body.netId);
            World.remove(world, body);
            io.sockets.emit('serverRemoveBody', {id: body.netId});
        },
        
    };

    
    let lastUpdate = Date.now()/1000;
    const update = () => {
        const dt = Date.now()/1000 - lastUpdate;
        lastUpdate = Date.now()/1000;
        data.dt = dt;

        data.time += dt;

        matterHandler.update(dt);
        handleUpdate(dt);
        setTimeout(update, 0);
    };


    const start = () => {
        data.started = true;
        Runner.run(runner, engine);
        engine.enableSleeping = true;
        handleStart();
        lastUpdate = Date.now()/1000;
        update();
    };

    setTimeout(start, 0);


    return {
        data,
        engine,
        world,
        io,
        matter: matterHandler,

    }

}