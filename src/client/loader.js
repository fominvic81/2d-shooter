import { app } from './index.js';


export const load = (animations, path) => {
    for (const name of animations.sprites.names) {
        if (animations.sprites[name] !== undefined && animations.sprites[name].image !== undefined) {
            animations.sprites[name].image = app.img(path + animations.sprites[name].image);
        }
    }
}