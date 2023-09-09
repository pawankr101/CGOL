/** @class `WorkerProcess` */
const WorkerProcess = (function(){
    /**
     * @constructor
     * @param {string} worker_name Worker name
     * @param {string | URL} filepath 
     * @param {(data: any)=> void} messageHandler 
     * @returns {WorkerProcess}
     */
    function WorkerProcess(worker_name, filepath, messageHandler) {
        if(!new.target) throw new Error('Use `new` keyword to create Object of this class.');
        
        /** @type {Worker} */
        this.worker = new Worker(filepath, {name: worker_name, credentials: 'same-origin', type: 'module'});
        this.worker.addEventListener('error', (event) => {
            console.error(event.error);
        });
        this.worker.addEventListener('message', ({data}) => {
            messageHandler(data);
        });
    }

    WorkerProcess.prototype.send = function(data) {
        this.worker.postMessage(data);
    }
    return WorkerProcess;
})();

/** @class `CanvasPlaneData` */
const CanvasPlaneData = (function(){
    /** 
     * @constructor 
     * @param {number} rows 
     * @param {number} cols 
     * @param {ArrayBuffer} [buffer]
     * @returns {CanvasPlaneData}
     */
    function CanvasPlaneData(rows, cols, buffer) {
        if(!new.target) throw new Error('Use `new` keyword to create Object of this class.');

        /** @type {number} */
        this.rows = rows

        /** @type {number} */
        this.cols = cols

        /** @type {Uint8Array} */
        this.data = buffer ? new Uint8Array(buffer) : new Uint8Array(rows * cols);
    }

    /** @returns {number} */
    CanvasPlaneData.prototype.getValue = function(row=0, col=0) {
        return this.data[(row*this.cols) + col];
    }
    return CanvasPlaneData;
})();

/** @class `CanvasPlane` */
const CanvasPlane = (function(){

    /** @type {HTMLCanvasElement} */
    let canvas;
    /** @type {CanvasRenderingContext2D} */
    let context;

    /** @type {{resolution: number, cols: number, rows: number, darkMode: boolean} */
    const local = {resolution: 1, rows: 0, cols: 0, darkMode: false};
    
    /** @param {number} row  @param {number} col  @param {number} value  */
    const drawPixel = function(row=0, col=0, value=0) {
        context.beginPath();
        context.rect((col * local.resolution), (row * local.resolution), local.resolution, local.resolution);
        context.fillStyle = (local.darkMode ^ value) ? 'black': 'white';
        context.fill();
    }

    /** 
     * @constructor 
     * @param {string} canvasElId 
     * @param {number} resolution 
     */
    function CanvasPlane(canvasElId, resolution) {
        if(!new.target) throw new Error('Use `new` keyword to create Object of this class.');

        canvas = document.getElementById(canvasElId);
        canvas.width = Math.floor(canvas.clientWidth);
        canvas.height = Math.floor(canvas.clientHeight);
        context = canvas.getContext('2d');

        /** @type {number} */
        this.resolution = local.resolution = resolution;

        /** @type {number} */
        this.rows = local.rows = Math.floor(canvas.height/resolution);

        /** @type {number} */
        this.cols = local.cols = Math.floor(canvas.width/resolution);
    }

    /** @param {CanvasPlaneData} data */
    CanvasPlane.prototype.draw = function(data) {
        for(let r=0,c,rl=local.rows,cl=local.cols; r<rl; r++) {
            for(c=0; c<cl; c++) {
                drawPixel(r, c, data.getValue(r, c));
            }
        }
    }

    CanvasPlane.prototype.changeMode = function() {
        return (local.darkMode = !local.darkMode);
    }
    return CanvasPlane;
})();

/** @type {WorkerProcess} */
window.WorkerProcess = WorkerProcess;

/** @type {CanvasPlaneData} */
window.CanvasPlaneData = CanvasPlaneData;

/** @type {CanvasPlane} */
window.CanvasPlane = CanvasPlane;