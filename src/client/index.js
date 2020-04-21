import {
	Bodies,
    Events,
} from 'matter-js';
import { initApp } from './base.js';
import { createLevel } from './level.js';
import { testLevel } from '../levels.js';
import { createPlayer } from './entities/player.js';
import { load } from './loader.js';
import { createExplosion } from './entities/explosion.js';



const handleLoad = () => {
    load(require('../../assets/weapons/options.json'), '../../assets/weapons/');
    load(require('../../assets/player/animations.json'), '../../assets/player/');
}

const handleResize = (width, height) => {

}

const handleStart = () => {
    app.setBounds(450, 300, 1800, 1200);
}

const handleUpdate = (dt) => {
    level.update(dt);
}

const handleRender = (ctx) => {
    level.render(ctx);
}

export const app = initApp(handleStart, handleResize, handleUpdate, handleRender, handleLoad);
export const level = createLevel(app);

window.onload = () => {
    app.start();
};

app.socket.on('serverAddEntity', function (data) {
    if (data.entityName === 'player') {
        data.args.isLocal = data.isLocal;
        level.addEntity(createPlayer(level, data.args), data.id, data.bodyId);
    } else if (data.entityName === 'explosion') {
        level.addEntity(createExplosion(level, data.args), data.id, data.bodyId);
    }
});

app.socket.on('serverRemoveEntity', function (data) {
    const entity = level.entities.get(data.id);
    if (entity.name === 'player') {
        level.removeEntity(data.id);
    } else {
        level.removeEntity(data.id);
    }
});

app.socket.on('serverSetEntity', function (data) {
    const entity = level.entities.get(data.id);
    entity.angle = data.angle;
    entity.dir = data.dir;
});


Events.on(app.engine, 'collisionStart', function(event) {
    var pairs = event.pairs;    
    for (var i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        if (pair.bodyA.collisionStart !== undefined) pair.bodyA.collisionStart(pair.bodyA, pair.bodyB, pair);
        if (pair.bodyB.collisionStart !== undefined) pair.bodyB.collisionStart(pair.bodyB, pair.bodyA, pair);

    }  
});
Events.on(app.engine, 'collisionActive', function(event) {
    var pairs = event.pairs;
    for (var i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        if (pair.bodyA.collisionActive !== undefined) pair.bodyA.collisionActive(pair.bodyA, pair.bodyB, pair);
        if (pair.bodyB.collisionActive !== undefined) pair.bodyB.collisionActive(pair.bodyB, pair.bodyA, pair);
    }
});
Events.on(app.engine, 'collisionEnd', function(event) {
    var pairs = event.pairs;
    for (var i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        if (pair.bodyA.collisionEnd !== undefined) pair.bodyA.collisionEnd(pair.bodyA, pair.bodyB, pair);
        if (pair.bodyB.collisionEnd !== undefined) pair.bodyB.collisionEnd(pair.bodyB, pair.bodyA, pair);
    }
});
