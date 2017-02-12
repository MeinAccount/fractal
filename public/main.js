"use strict";

const register = 'requestIdleCallback' in window ? requestIdleCallback : requestAnimationFrame;

// render fractal
(function () {
    let width, height, offsetX, offsetY, renderedX;
    let zoom = 350;
    let iterations = 10 * Math.sqrt(zoom);

    // setup continuous rendering
    let isTiming = false;
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');
    const render = () => {
        if (renderedX < width) {
            if (!isTiming) {
                console.time('rendering');
                isTiming = true;
            }

            // Chrome 56 cannot optimize compound let assignments
            let x = renderedX;
            renderedX = renderedX + 100;
            // renderedX += 100;

            // render progressively in columns
            for (; x <= renderedX; x++) {
                for (let y = 0; y <= height; y++) {
                    context.fillStyle = colorAtPoint((x - offsetX) / zoom, (y - offsetY) / zoom, iterations);
                    context.fillRect(x, y, 1, 1);
                }
            }

            // mark current rendering position
            context.fillStyle = 'white';
            context.fillRect(x, 0, 1, height);
        } else if (isTiming) {
            console.timeEnd('rendering');
            isTiming = false;
        }

        register(render);
    };

    // react to resizing
    const resizeHandler = () => {
        canvas.width = width = document.body.clientWidth;
        canvas.height = height = document.body.clientHeight;
        renderedX = 0;
    };
    window.addEventListener('resize', resizeHandler);


    // react to mouse drags
    let downEvent = null;
    canvas.addEventListener('mousedown', event => downEvent = event);
    canvas.addEventListener('mouseup', event => {
        offsetX += event.clientX - downEvent.clientX;
        offsetY += event.clientY - downEvent.clientY;
        downEvent = null;

        renderedX = 0;
    });


    // react to scrolling
    let zoomScaling = 2;
    const scrollHandler = event => {
        let delta = event.wheelDelta ? event.wheelDelta : -event.detail * 40;
        if (delta >= 0) {
            delta *= zoomScaling * zoomScaling * 40;
            zoomScaling++;
        } else {
            zoomScaling = Math.max(zoomScaling - 1, 1);
            delta *= zoomScaling * zoomScaling * 40;
        }


        // there shall be a fixed point under the cursor
        const ratio = (zoom + delta) / zoom;
        offsetX = event.clientX - ratio * (event.clientX - offsetX);
        offsetY = event.clientY - ratio * (event.clientY - offsetY);

        // apply limited zooming
        zoom += delta;
        if (zoom <= 100) {
            zoom = 100;
            zoomScaling = 1;
            offsetX = width / 2;
            offsetY = height / 2;
        }

        // apparently 64bit doubles can't be more precise than 800 iterations
        iterations = Math.min(100 + 0.8 * Math.sqrt(zoom), 800);
        renderedX = 0;
    };
    canvas.addEventListener('DOMMouseScroll', scrollHandler);
    canvas.addEventListener('mousewheel', scrollHandler);


    // TODO: trigger initial resizing
    resizeHandler();
    offsetX = width / 2 + 200;
    offsetY = height / 2;
    register(render);
})();


function colorAtPoint(x, y, max) {
    // always buffer real part (both calculations need to be simulations)
    let currentRe = 0, currentIm = 0, buffer = 0;
    for (let n = 0; n < max; n++) {
        buffer = currentRe * currentRe - currentIm * currentIm + x;
        currentIm = 2 * currentRe * currentIm + y;
        currentRe = buffer;

        if (currentRe * currentRe + currentIm * currentIm > 4) {
            return 'hsl(' + (n / max * 360) + ', 90%, 50%)';
        }
    }

    return 'black';
}
