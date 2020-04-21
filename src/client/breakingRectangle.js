import { World, Bodies, Constraint } from 'matter-js'


export const createBreakingRectangle = (level, x, y, width, height, startHealth, options = {}) => {
    const rect = Bodies.rectangle(x, y, width, height, options);
    rect.level = level;
    rect.world = level.world;
    rect.width = width;
    rect.height = height;
    if (rect.height > rect.width) {
        [rect.height,rect.width] = [rect.width,rect.height];
    }
    rect.isBreaking = true;
    rect.startHealth = startHealth;
    rect.health = startHealth;
    rect.constraints = [];
    rect.addConstraint = (constraint) => {
        rect.constraints.push(constraint);
        World.add(rect.world, constraint);
    }
    rect.breakRect = (alX) => {

        if (!rect.isBreaking) {
            return;
        }
    
        if (rect.height > rect.width) {
            [rect.height,rect.width] = [rect.width,rect.height];
        }
    
        rect.isBreaking = false;
        if (rect.width < 25) {
            return;
        }
    
        let b1width = rect.width * ((alX + rect.width/2) / rect.width);
        let b1height = rect.height;
        let b1x = rect.position.x - Math.cos(rect.angle) * (rect.width - b1width)/2;
        let b1y = rect.position.y - Math.sin(rect.angle) * (rect.width - b1width)/2;
        let body1 = createBreakingRectangle(rect.level, b1x, b1y, b1width, b1height, rect.startHealth, {
                angle: rect.angle,
                collisionFilter : rect.collisionFilter,
                mass: rect.mass * (b1width / rect.width),
            });
        
        
        let b2width = rect.width - b1width;
        let b2height = rect.height;
        let b2x = rect.position.x + Math.cos(rect.angle) * b1width/2;
        let b2y = rect.position.y + Math.sin(rect.angle) * b1width/2
        let body2 = createBreakingRectangle(rect.level, b2x, b2y, b2width, b2height, rect.startHealth, {
                angle: rect.angle,
                collisionFilter : rect.collisionFilter,
                mass: rect.mass * (b2width / rect.width),
            });
        
        for (const constraint of rect.constraints) {
            if (constraint.bodyA.id === rect.id) {
                World.remove(rect.world, constraint);
            }
        }

        
        
        World.remove(rect.world, rect);
        World.add(rect.world, body1);
        World.add(rect.world, body2);
        
    };
    rect.collisionStart = (bodyA, bodyB, pair) => {
        let x0A = rect.position.x;
        let y0A = rect.position.y;
        let aA = 0-rect.angle;
        // let x0B = bodyB.position.x;
        // let y0B = bodyB.position.y;
        // let aB = 0-bodyB.angle;
        let x = pair.activeContacts[0].vertex.x;
        let y = pair.activeContacts[0].vertex.y;
        let alXA = (x0A + (x - x0A) * Math.cos(aA) - (y - y0A) * Math.sin(aA)) - x0A;
        // let alYA = (y0A + (y - y0A) * Math.cos(aA) + (x - x0A) * Math.sin(aA)) - y0A;
        // let alXB = (x0B + (x - x0B) * Math.cos(aB) - (y - y0B) * Math.sin(aB)) - x0B;
        // let alYB = (y0A + (y - y0B) * Math.cos(aB) + (x - x0B) * Math.sin(aB)) - y0B;


        // World.add(rect.world, Bodies.rectangle(x, y, 70, 1, {
        //     collisionFilter: {
        //         category: defaultCategory | wallCategory,
        //         mask: defaultCategory,
        //     },
        //     isStatic: true,
        //     angle: Math.atan2(pair.collision.normal.y, pair.collision.normal.x),
        // }));

        /////////////////////////////////////
        let rectE = rect.speed * rect.mass / 2;
        let bodyBE = bodyB.speed * bodyB.mass / 2;

        if (!isNaN(rectE) && rect.speed > 5) {
            rect.health -= rectE;
        }
        if (!isNaN(bodyBE) && bodyB.speed > 5) {
            rect.health -= bodyBE;
        }
        if (rect.health < 0) {
            if (rect.height > rect.width) {
                [rect.height,rect.width] = [rect.width,rect.height];
            }  
        
            if (Math.abs(alXA) < rect.width/2 - rect.width/8) {
                rect.breakRect(alXA);
            }
        }
    }
    return rect;
}
