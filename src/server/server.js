import { initApp } from './base.js';
import { createLevel } from './level.js';
import { testLevel } from '../levels.js';
import { createPlayer } from './entities/player.js';
import { createExplosion } from './entities/explosion.js';
import {
    Bodies,
    Body,
} from 'matter-js';



const handleStart = () => {
    
};

const handleUpdate = (dt) => {
    level.update(dt);
};

const handleConnect = (socket) => {
    level.handleConnect(socket);
    level.addEntity(createPlayer(level, {x: 100, y: 100}), socket);
    level.addEntity(createExplosion(level, {x: 100, y: -100, r: 20, force: 20, lifeTime: 5}))
};

export const app = initApp(handleStart, handleUpdate);
export const level = createLevel(testLevel, app);

app.io.sockets.on('connection', function (socket) {
    for (const body of app.matter.bodies.values()) {
        const vertices = [];
        for (const v of body.vertices) {
            const x = (body.position.x + (v.x - body.position.x) * Math.cos(-body.angle) - (v.y - body.position.y) * Math.sin(-body.angle));
            const y = (body.position.y + (v.y - body.position.y) * Math.cos(-body.angle) + (v.x - body.position.x) * Math.sin(-body.angle));
            vertices.push({
                x: x,
                y: y,
            });
        }
        socket.emit('serverAddBody', {id: body.netId, options: {
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
    }
    
    
    socket.on('disconnect', function () {
        console.log('user disconnected');
        level.removeEntity(socket.entity);
    });

    socket.on('clientMove', function (data) {
        const entity = socket.entity;
        const body = entity.getBody();
        Body.setPosition(body, data.body.position);
        Body.setAngle(body, data.body.angle);
        // Body.setAngularVelocity(body, data.angluarVelocity);
        Body.setAngularVelocity(body, data.body.angularVelocity)
        Body.setVelocity(body, data.body.velocity);
        socket.broadcast.emit('serverSetBody', {id: body.netId, options: {
            velocity: body.velocity,
            position: body.position,
            isSleeping: body.isSleeping,
            angularVelocity: body.angularVelocity,
            angle: body.angle,
        }});
        socket.broadcast.emit('serverSetEntity', {id: entity.id, angle: data.entity.angle, dir: data.entity.dir})
    });


    handleConnect(socket);
});

const a = Bodies.rectangle(100, 100, 50, 50);
// const b = Bodies.rectangle(100, 0, 50, 50);
// const c = Bodies.rectangle(100, -50, 50, 50);
// Body.applyForce(a, a.position, {x: 0, y: -1});
level.addBody(a);
