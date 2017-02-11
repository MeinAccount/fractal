"use strict";

const iterations = 200;
const reds = [], greens = [];

// calculate colors as micro task
(function () {
    let offsetRed = 10, offsetGreen = 10;
    for (let i = 0; i <= 200; i++) {
        reds[i] = offsetRed;
        greens[i] = offsetGreen;

        if (i < 100) {
            offsetRed += 4;
        } else if (i < 200) {
            offsetGreen += 4;
        }
    }
})();


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


    // resize canvas
    resizeHandler();
    window.addEventListener('resize', resizeHandler);


    // TODO: construct matching state
    let offsetX = -width / 2 - 200;
    let offsetY = -height / 2;
    let zoom = 350;


    // allow mouse drags
    let downEvent = null;
    canvas.addEventListener('mousedown', event => downEvent = event);
    canvas.addEventListener('mouseup', event => {
        offsetX -= event.clientX - downEvent.clientX;
        offsetY -= event.clientY - downEvent.clientY;
        downEvent = null;

        renderedX = 0;
    });


    // render continuously
    const render = () => {
        if (renderedX < width) {
            let x = renderedX;
            renderedX += 10;

            // render progressively in columns
            for (; x <= renderedX; x++) {
                for (let y = 0; y <= height; y++) {
                    const n = stepsToDivergence((x + offsetX) / zoom, (y + offsetY) / zoom, iterations);
                    context.fillStyle = colorFromSteps(n, iterations);
                    context.fillRect(x, y, 1, 1);
                }
            }
        }

        requestAnimationFrame(render);
    };

    // start rendering
    requestAnimationFrame(render);
})();


function stepsToDivergence(x, y, max) {
    // always buffer real part (both calculations need to be simulations)
    let currentRe = 0, currentIm = 0, buffer = 0;
    for (let n = 0; n < max; n++) {
        buffer = currentRe * currentRe - currentIm * currentIm + x;
        currentIm = 2 * currentRe * currentIm + y;
        currentRe = buffer;

        if (currentRe * currentRe + currentIm * currentIm > 4) {
            return n;
        }
    }

    return 0;
}

function colorFromSteps(n, max) {
    if (n == 0) {
        return 'black';
    }

    let index = Math.round(n / max * 200);
    return `rgb(${reds[index]}, ${greens[index]}, 0)`;
}

