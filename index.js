const locals = (() => {
    const canvas = document.getElementsByTagName("canvas").item(0), resolution=8;
    canvas.width = parseInt(canvas.clientWidth); canvas.height = parseInt(canvas.clientHeight);
    const worker = new Worker('./utility.js');
    let pendingUpdate = 0, halted=false;
    worker.addEventListener('error', (event) => {
        console.error(event.error);
    });
    worker.addEventListener('message', (event) => {
        if(event.data.grid) {
            pendingUpdate++;
            setTimeout(() => {
                locals.grid = event.data.grid;
                locals.methods.renderGrid();
                pendingUpdate--;
                if(halted && pendingUpdate<5) locals.methods.continue();
            }, 0);
            if(pendingUpdate>10) locals.methods.halt();
        }
    });
    return {
        context: canvas.getContext("2d"), cols: parseInt(canvas.width/resolution), rows: parseInt(canvas.height/resolution),
        grid: [[0]],
        methods: {
            start() {
                worker.postMessage({cols: locals.cols, rows: locals.rows});
            },
            halt() {
                worker.postMessage({halt: (halted=true)});
            },
            continue() {
                worker.postMessage({continue: !(halted=false)});
            },
            playPause() {
                halted ? this.continue() : this.halt()
            },
            drawPixel(col=0, row=0, value=0) {
                locals.context.beginPath();
                locals.context.rect(col*resolution,row*resolution,resolution,resolution);
                locals.context.fillStyle = value ? 'black' : 'white';
                locals.context.fill();
            },
            renderGrid() {
                for(let c=0, cl=locals.grid.length,r,rl; c<cl; c++) {
                    for (r=0, rl=locals.grid[c].length; r<rl; r++) {
                        locals.methods.drawPixel(c, r, locals.grid[c][r]);
                    }
                }
            }
        }
    }
})();

let startButton = document.getElementById("start")
let playButton = document.getElementById("play-pause")
function start() {
    locals.methods.start();
    startButton.disabled = true;
    startButton.style.cursor = 'not-allowed';
    setTimeout(() => {
        startButton.innerHTML = 'Restart';
        startButton.disabled = true;
        startButton.style.cursor = 'pointer';
    }, 100)
}

function playPause() {
    locals.methods.playPause();
}