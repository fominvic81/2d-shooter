import {
	Engine,
	Runner,
	World,
    Events,
    Mouse,
    MouseConstraint,
    Composite,
} from 'matter-js';
import { createLayout } from './interface/layout.js';

export const initApp = (handleStart, handleResize, handleUpdate, handleRender, handleLoad) => {
    const data = {
        started: false,
        loading: 0,
        
        dt: 0,
        enginedt: 0,
        time: 0,
        
        width: 0,
        height: 0,
    };
    const keys = {};
    const touches = {};

    const renderOptions = {
        bounds: {
            min: {
                x: 0,
                y: 0,
            },
            max: {
                x: window.innerWidth,
                y: window.innerHeight,
            }
        },
        position: {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        },
        width: window.innerWidth,
        height: window.innerHeight,
    };

    const layouts = [];

    const CreateLayout = (opts = {}) => {
        let x = opts.x;
        let y = opts.y;
        let width = opts.width;
        let height = opts.height;
        if (x === undefined) x = 0.5;
        if (y === undefined) y = 0.5;
        if (width === undefined) width = 1;
        if (height === undefined) height = 1;
        
        const layout = createLayout(x, y, width, height);

        layouts.push(layout);

        return layout;
    }


    const layers = [];

    const createLayer = (opts = {}) => {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.left = 0;
        canvas.style.top = 0;
        canvas.style.right = 0;
        canvas.style.bottom = 0;

        const layer = {
            opts,
            canvas,
            ctx: canvas.getContext('2d'),
        };

        layers.push(layer);
        document.body.appendChild(canvas);

        return layer;
    };

    
    const drawLayer = createLayer();
    const draw = {
        canvas: drawLayer.canvas,
        ctx: drawLayer.ctx,
    };
    
    const interfaceLayer = createLayer();
    const interFace = {
        canvas: interfaceLayer.canvas,
        ctx: interfaceLayer.ctx,
    };

    const engine = Engine.create();
    const world = engine.world;
    const runner = Runner.create({fps: 40});
    const mouse = Mouse.create(interFace.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 1,
            }
        });

    
    const render = () => {
        
        for (const layer of layers) {
            if (layer.opts.global) continue;
            
            if (layer.opts.clear !== false) {
                layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
            }
        }

        for (const layout of layouts) {
            layout.render(interFace.ctx);
        }

        const bodies = Composite.allBodies(world);

        
        draw.ctx.save();
        
        const renderWidth = renderOptions.bounds.max.x - renderOptions.bounds.min.x;
        const renderHeight = renderOptions.bounds.max.y - renderOptions.bounds.min.y;
        
        draw.ctx.fillStyle = 'rgb(32, 32, 32)';
        draw.ctx.fillRect(0, 0, draw.canvas.width, draw.canvas.height)

        Mouse.setScale(mouse, {x: renderWidth / draw.canvas.width, y: renderHeight / draw.canvas.height});
        Mouse.setOffset(mouse, renderOptions.bounds.min);

        draw.ctx.translate(draw.canvas.width / 2, draw.canvas.height / 2);
        draw.ctx.scale(draw.canvas.width / renderWidth, draw.canvas.height / renderHeight);
        draw.ctx.translate(-(renderOptions.bounds.max.x + renderOptions.bounds.min.x) / 2, -(renderOptions.bounds.max.y + renderOptions.bounds.min.y) / 2);
        
        
        for (const body of bodies) {
            
            draw.ctx.beginPath();

            if (body.showBoundingBox !== false) {
                const vertices = body.vertices;
                
                draw.ctx.moveTo(vertices[0].x, vertices[0].y);
                
                for (let j = 1; j < vertices.length; j += 1) {
                    draw.ctx.lineTo(vertices[j].x, vertices[j].y);
                }
                
                draw.ctx.lineTo(vertices[0].x, vertices[0].y);
            } 

            
            draw.ctx.lineWidth = 1;
            if (body.isSleeping) {
                draw.ctx.strokeStyle = '#555';
            } else {
                draw.ctx.strokeStyle = '#fff';
            }
            draw.ctx.stroke();
            
            handleRender(draw.ctx);
        }
        
        
        draw.ctx.restore();
        window.requestAnimationFrame(render);
    };
    
    
    let lastUpdate = Date.now()/1000;
    const update = () => {
        const dt = Date.now()/1000 - lastUpdate;
        lastUpdate = Date.now()/1000;
        data.dt = dt;

        data.time += dt;
        
        for (const layout of layouts) {
            layout.update(dt);
        }

        handleUpdate(dt);
        setTimeout(update, 0);
    };

    const resize = () => {
		let w = window.innerWidth;
		let h = window.innerHeight;

		if (data.width === w && data.height === h) {
			return;
        }
        
        handleResize(w, h);

        data.width = w;
        data.height = h;
        for (const layer of layers) {
            layer.canvas.width = w;
            layer.canvas.height = h;
        }
        for (const layout of layouts) {
            layout.resize(w, h);
		}
        renderOptions.width = w;
        renderOptions.height = h;

	};

    const start = () => {
        data.started = true;
        Runner.run(runner, engine);
        World.add(world, mouseConstraint);
        engine.enableSleeping = true;
        resize();
        handleStart();
        lastUpdate = Date.now()/1000;
        update();
        render();
    };

    Events.on(engine, 'afterUpdate', function(event) {
        // update(event.timestamp);
    });

    window.addEventListener('keydown', event => {
		keys[event.key] = true;
	});

	window.addEventListener('keyup', event => {
		keys[event.key] = false;
    });

    window.addEventListener('resize', resize);
    
    window.addEventListener('touchstart', function (event) {
        for (const touch of event.touches) {
            touches[touch.identifier] = {
                x: touch.clientX,
                y: touch.clientY,
                startX: touch.clientX,
                startY: touch.clientY,
                identifier: touch.identifier,
            };
        }
        for (const touch of event.changedTouches) {
            for (const layout of layouts) {
                layout.touchStart(touch.clientX, touch.clientY, touch);
            }
        }
    });
    window.addEventListener('touchend', function (event) {
        for (const touch of event.changedTouches) {
            touches[touch.identifier] = undefined;
        }
        for (const touch of event.changedTouches) {
            for (const layout of layouts) {
                layout.touchEnd(touch.clientX, touch.clientY, touch);
            }
        }
    });
    window.addEventListener('touchcancel', function (event) {
        for (const touch of event.changedTouches) {
            touches[touch.identifier] = undefined;
        }
        for (const touch of event.changedTouches) {
            for (const layout of layouts) {
                layout.touchEnd(touch.clientX, touch.clientY, touch);
            }
        }
    });
    window.addEventListener('touchmove', function (event) {
        for (const touch of event.changedTouches) {
            touches[touch.identifier].x = touch.clientX;
            touches[touch.identifier].y = touch.clientY;
        }
        for (const touch of event.changedTouches) {
            for (const layout of layouts) {
                layout.touchMove(touch.clientX, touch.clientY, touch);
            }
        }
    });

    // Events.on(mouseConstraint, "mousedown", function (event) {
    //     console.log('mouse!!!');
    //     for (const layout of layouts) layout.touchStart(event.mouse.absolute.x, event.mouse.absolute.y, {identifier: 1000});
    // });
    // Events.on(mouseConstraint, "mouseup", function (event) {
    //     for (const layout of layouts) layout.touchEnd(event.mouse.absolute.x, event.mouse.absolute.y, {identifier: 1000});
    // });
    // Events.on(mouseConstraint, "mousemove", function (event) {
    //     for (const layout of layouts) layout.touchMove(event.mouse.absolute.x, event.mouse.absolute.y, {identifier: 1000});
    // });

    return {
        keys,
        data,
        engine,
        world,

        setBounds(x0, y0, width, height = width * (data.height / data.width)) {

            renderOptions.bounds.min = { x: x0 - width/2, y: y0 - height/2 };
            renderOptions.bounds.max = { x: x0 + width/2, y: y0 + height/2 };

            renderOptions.position.x = Math.round((renderOptions.bounds.min.x + renderOptions.bounds.max.x) / 2);
            renderOptions.position.y = Math.round((renderOptions.bounds.min.y + renderOptions.bounds.max.y) / 2);
            renderOptions.width = renderOptions.bounds.max.x - renderOptions.bounds.min.x;
            renderOptions.height = renderOptions.bounds.max.y - renderOptions.bounds.min.y;
            
        },

        getBounds() {
            return {x: renderOptions.position.x, y: renderOptions.position.y, width: renderOptions.width, height: renderOptions.height};
        },

        start: () => {
			if (data.started) {
				return;
			}

			handleLoad();

			if (data.loading !== 0) {
				return;
			}

			start();
		},

        layout: (opts) => CreateLayout(opts),
        layer: (opts) => createLayer(opts),

        img: src => {
			const image = new Image();
			image.src = src;

			++data.loading;

			image.onload = () => {
				if (!data.started && --data.loading === 0) {
					start();
				}
			};

			image.onerror = () => {
				if (!data.started && --data.loading === 0) {
					start();
				}
			};

			return image;
		},

    }

}