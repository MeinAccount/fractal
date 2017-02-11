"use strict";

const iterations = 200;
(function () {
    const width = document.body.clientWidth;
    const height = document.body.clientHeight;

    // set canvas size
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;


    // TODO: construct matching state
    const offsetX = -width / 2 - 200;
    const offsetY = -height / 2;
    const zoom = 350;

    // define rendering function
    let lastX = 0;
    const render = () => {
        let x = lastX;
        lastX += 5;

        // render progressively in columns
        for (; x <= lastX; x++) {
            for (let y = 0; y <= height; y++) {
                const n = stepsToDivergence((x + offsetX) / zoom, (y + offsetY) / zoom, iterations);
                context.fillStyle = colorFromSteps(n, iterations);
                context.fillRect(x, y, 1, 1);
            }
        }

        if (lastX < width) {
            requestAnimationFrame(render);
        }
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

// calculate colors
const reds = [], greens = [];
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


function colorFromSteps(n, max) {
    if (n == 0) {
        return 'black';
    }

    let index = Math.round(n / max * 200);
    return `rgb(${reds[index]}, ${greens[index]}, 0)`;
}

