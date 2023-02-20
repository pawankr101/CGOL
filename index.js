const locals = (() => {
    const startButton = document.getElementById("start"), stopButton = document.getElementById("stop");
    const worker = new Worker('./utility.js', {name: "Utility", credentials: 'same-origin'});
    const canvas = document.getElementsByTagName("canvas").item(0), resolution=1;
    canvas.width = parseInt(canvas.clientWidth); canvas.height = parseInt(canvas.clientHeight);
    let started=false, isPause = false;
    worker.addEventListener('error', (event) => {
        console.error(event.error);
    });
    worker.addEventListener('message', ({data}) => {
        if(data.buffer) {
            locals.grid = new Int8Array(data.buffer);
            locals.methods.render();
        }
    });
    return {
        context: canvas.getContext("2d"), cols: parseInt(canvas.height/resolution), rows: parseInt(canvas.width/resolution),
        grid: new Int8Array(0),
        methods: {
            getGridVal(col=0, row=0) {
                return locals.grid[(col*locals.rows) + row];
            },
            start() {
                if(!started) {
                    started = true; isPause = false;
                    worker.postMessage({cols: locals.cols, rows: locals.rows});
                    startButton.disabled = true;
                    startButton.style.cursor = 'not-allowed';
                    setTimeout(() => {
                        startButton.innerHTML = 'Pause';
                        startButton.disabled = false;
                        startButton.style.cursor = 'pointer';
                        stopButton.disabled = false;
                        stopButton.style.cursor = 'pointer';
                    }, 100);
                } else {
                    if(!isPause) {
                        isPause = true;
                        startButton.disabled = true;
                        startButton.style.cursor = 'not-allowed';
                        setTimeout(() => {
                            startButton.innerHTML = 'Start';
                            startButton.disabled = false;
                            startButton.style.cursor = 'pointer';
                        }, 100);
                    } else {
                        isPause = false;
                        worker.postMessage({next: true});
                        startButton.disabled = true;
                        startButton.style.cursor = 'not-allowed';
                        setTimeout(() => {
                            startButton.innerHTML = 'Pause';
                            startButton.disabled = false;
                            startButton.style.cursor = 'pointer';
                        }, 100);
                    }
                }
            },
            stop() {
                started = false; isPause = true;
                startButton.disabled = true;
                startButton.style.cursor = 'not-allowed';
                stopButton.disabled = true;
                stopButton.style.cursor = 'not-allowed';
                worker.postMessage({stop: true});
                locals.grid = new Int8Array(0);
                locals.methods.render();
                setTimeout(() => {
                    startButton.innerHTML = 'Start';
                    startButton.disabled = false;
                    startButton.style.cursor = 'pointer';
                }, 100);
            },
            drawPixel(col=0, row=0, value=0) {
                locals.context.beginPath();
                locals.context.rect(row*resolution,col*resolution,resolution,resolution);
                locals.context.fillStyle = value ? 'black' : 'white';
                locals.context.fill();
            },
            drawPlane() {
                for(let c=0, r,cl=locals.cols, t; c<cl; c++) {
                    for (r=0, rl=locals.rows; r<rl; r++) {
                        locals.methods.drawPixel(c, r, locals.methods.getGridVal(c, r));
                    }
                }
            },
            render() {
                setTimeout(() => {
                    locals.methods.drawPlane();
                    if(started && !isPause) worker.postMessage({next: true});
                }, 0);
            }
        }
    }
})();

function start() {
    locals.methods.start();
}
function stop() {
    locals.methods.stop();
}