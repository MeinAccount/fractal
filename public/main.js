"use strict";

const RENDER_CHUNK = 100;
const REQUEST_IDLE = 'requestIdleCallback' in window ? requestIdleCallback : f => {
    };


// render fractal
(function () {
    let width, height, offsetX, offsetY, renderCurrentX, renderAgain;
    let zoom = 350;
    let iterations = 10 * Math.sqrt(zoom);

    // setup continuous rendering
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');
    const render = () => {
        if (renderCurrentX < width) {
            // Chrome 56 cannot optimize compound let assignments
            let x = renderCurrentX;
            renderCurrentX = renderCurrentX + RENDER_CHUNK;
            // renderCurrentX += RENDER_CHUNK;

            // render progressively in columns
            for (; x <= renderCurrentX; x++) {
                for (let y = 0; y <= height; y++) {
                    context.fillStyle = colorAtPoint((x - offsetX) / zoom, (y - offsetY) / zoom, iterations);
                    context.fillRect(x, y, 1, 1);
                }
            }
        } else if (renderAgain) {
            console.log('rendering again');
            renderCurrentX = 0;
            renderAgain = false;
        }
    };

    // callback renders
    const renderAnimation = () => {
        render();
        requestAnimationFrame(renderAnimation);
    };
    const renderIdle = () => {
        render();

        if (renderCurrentX < width) {
            requestIdleCallback(renderIdle);
        }
    };


    // react to resizing
    const resizeHandler = () => {
        canvas.width = width = document.body.clientWidth;
        canvas.height = height = document.body.clientHeight;
        renderCurrentX = 0;
        REQUEST_IDLE(renderIdle);
    };
    window.addEventListener('resize', resizeHandler);


    // react to mouse drags
    let downEvent = null;
    canvas.addEventListener('mousedown', event => downEvent = event);
    canvas.addEventListener('mouseup', event => {
        offsetX += event.clientX - downEvent.clientX;
        offsetY += event.clientY - downEvent.clientY;
        downEvent = null;

        renderCurrentX = event.clientX - RENDER_CHUNK / 2;
        renderAgain = true;
        REQUEST_IDLE(renderIdle);
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
        renderCurrentX = event.clientX - RENDER_CHUNK / 2;
        renderAgain = true;
        REQUEST_IDLE(renderIdle);
    };
    canvas.addEventListener('DOMMouseScroll', scrollHandler);
    canvas.addEventListener('mousewheel', scrollHandler);


    // TODO: trigger initial resizing
    resizeHandler();
    offsetX = width / 2 + 200;
    offsetY = height / 2;
    requestAnimationFrame(renderAnimation);
    REQUEST_IDLE(renderIdle);
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
