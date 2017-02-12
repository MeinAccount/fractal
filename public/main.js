"use strict";

// render fractal
(function () {
    let width, height, renderedX;
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');
    const resizeHandler = () => {
        canvas.width = width = document.body.clientWidth;
        canvas.height = height = document.body.clientHeight;
        renderedX = 0;
    };


    // trigger initial resizing
    resizeHandler();
    window.addEventListener('resize', resizeHandler);


    // TODO: construct matching state
    let offsetX = width / 2 + 200;
    let offsetY = height / 2;
    let zoom = 350;
    let iterations = 10 * Math.sqrt(zoom);


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
    const scrollHandler = event => {
        // there shall be a fixed point under the cursor
        const delta = event.wheelDelta ? event.wheelDelta * 10 : -event.detail * 400;
        const ratio = (zoom + delta) / zoom;
        offsetX = event.clientX - ratio * (event.clientX - offsetX);
        offsetY = event.clientY - ratio * (event.clientY - offsetY);

        // redraw everything
        zoom += delta;
        iterations = 10 * Math.sqrt(zoom);
        renderedX = 0;
    };
    canvas.addEventListener('DOMMouseScroll', scrollHandler);
    canvas.addEventListener('mousewheel', scrollHandler);


    // render continuously
    const render = () => {
        if (renderedX < width) {
            let x = renderedX;
            renderedX += 10;

            // render progressively in columns
            for (; x <= renderedX; x++) {
                for (let y = 0; y <= height; y++) {
                    context.fillStyle = colorAtPoint((x - offsetX) / zoom, (y - offsetY) / zoom, iterations);
                    context.fillRect(x, y, 1, 1);
                }
            }
        }

        requestAnimationFrame(render);
    };

    // start rendering
    requestAnimationFrame(render);
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
