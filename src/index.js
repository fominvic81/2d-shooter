import {
	Bodies,
    Events,
} from 'matter-js';
import { initApp } from './base.js';
import { createLevel } from './level.js';
import { testLevel } from './levels.js';
import { createPlayer } from './entities/player.js';
import { load } from './loader.js';
import { createExplosion } from './entities/explosion.js';
import { item } from './entities/item.js';

const handleLoad = () => {
    load(require('../assets/weapons/options.json'), '../assets/weapons/');
    load(require('../assets/player/animations.json'), '../assets/player/');
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
export const level = createLevel(testLevel, app);

window.onload = () => {
    app.start();
};


const a = Bodies.circle(100, 100, 25, {mass: 50});
level.addBody(a);
level.addBody(Bodies.rectangle(400, 400, 1500, 100, {mass: 50, angle: Math.PI/2}));
level.addEntity(createPlayer(level, 0, -100, 3));
level.addEntity(createExplosion(level, 0, -200, 100, 10000, 100));
level.addEntity(item(level, -500, -100, 3, require('../assets/weapons/options.json').sprites.knife, 'weapon'));
level.addEntity(item(level, -500, 0, 3, require('../assets/weapons/options.json').sprites.ak47, 'weapon'));
level.addEntity(item(level, -500, 100, 3, require('../assets/weapons/options.json').sprites.rocket, 'weapon'));


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
