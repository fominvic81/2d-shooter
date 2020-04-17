import {
	Composites,
	Composite,
	Constraint,
	Bodies,
} from 'matter-js';

import { CATEGORY_WALL, MASK_WALL } from './collisionFilters.js';

const filter = {
    category: CATEGORY_WALL,
    mask: MASK_WALL,
}

export const testLevel = {
    bodies: [
        Bodies.rectangle(400, 1200, 3000, 50, {isStatic: true, collisionFilter: filter}),
        Bodies.rectangle(-1000, 1050, 1000, 50, {isStatic: true, angle: 0.1 * Math.PI, collisionFilter: filter}),
        Bodies.rectangle(-1400, 800, 1000, 50, {isStatic: true, angle: 0.2 * Math.PI, collisionFilter: filter}),
        Bodies.rectangle(800, 800, 1000, 50, {isStatic: true, angle: 0.5 * Math.PI, collisionFilter: filter}),
        Bodies.rectangle(1200, 300, 1000, 50, {isStatic: true, angle: 1 * Math.PI, collisionFilter: filter}),
        Bodies.rectangle(800, -800, 2000, 50, {isStatic: true, angle: 1 * Math.PI, collisionFilter: filter}),

    ],
}