/**
 * @class `WorkerProcess`
 * @typedef { {worker: Worker, send: (data: object)=>void} } WorkerProcess
 * @typedef { { new (worker_name: string, filepath: string | URL, messageHandler: (data: any) => void) => WorkerProcess } } WorkerProcessConstructor
 * @type { WorkerProcessConstructor }
 */
const WorkerProcess = (function(){
    /**
     * @constructor WorkerProcess
     * @param {string} worker_name Worker name
     * @param {string | URL} filepath 
     * @param {(data: object)=>void} messageHandler 
     * @returns {WorkerProcess}
     */
    function WorkerProcess(worker_name, filepath, messageHandler) {
        if(!new.target) throw new Error('Use `new` keyword to create Object of this class.');
        
        /** @type {Worker} */
        this.worker = new Worker(filepath, {name: worker_name, type: 'module'});
        this.worker.addEventListener('error', (event) => {
            console.error(event.error);
        });
        this.worker.addEventListener('message', ({data}) => {
            messageHandler(data);
        });
    }

    /**
     * @method `send`
     * @param {object} data 
     */
    WorkerProcess.prototype.send = function(data) {
        this.worker.postMessage(data);
    }
    return WorkerProcess;
})();

/**
 * @class `CanvasPlaneData`
 * @typedef { {rows: number, cols: number, data: Uint8Array, getValue: (row: number, col: number) => number} } CanvasPlaneData
 * @typedef { { new (rows: number, cols: number, buffer?: ArrayBuffer) => CanvasPlaneData } } CanvasPlaneDataConstructor
 * @type { CanvasPlaneDataConstructor }
 */
const CanvasPlaneData = (function(){
    /**
     * @constructor `CanvasPlaneData`
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

    /**
     * @method `getValue`
     * @param {number} row 
     * @param {number} col 
     * @returns {number}
     */
    CanvasPlaneData.prototype.getValue = function(row, col) {
        return this.data[(row*this.cols) + col];
    }
    return CanvasPlaneData;
})();

/**
 * @class `CanvasPlane`
 * @typedef { {rows: number, cols: number, resolution: number, draw: (data: CanvasPlaneData) => void, changeMode: () => boolean} } CanvasPlane
 * @typedef { { new (canvasElId: string, resolution: number) => CanvasPlane } } CanvasPlaneConstructor
 * @type { CanvasPlaneConstructor }
 */
const CanvasPlane = (function(){

    /** @type {HTMLCanvasElement} */
    let canvas;
    /** @type {CanvasRenderingContext2D} */
    let context;

    /** @type {{resolution: number, cols: number, rows: number, darkMode: boolean, planeDataArray: number[][]} */
    const local = {resolution: 1, rows: 0, cols: 0, darkMode: false, planeDataArray: null};

    /**
     * @param {number} rows 
     * @param {number} cols 
     * @returns {number[][]}
     */
    const buildEmptyArray = function(rows, cols) {
        const array = new Array(rows);
        for(let r=0, c, row; r<rows; r++) {
            for(c=0, row=new Array(cols); c<cols; c++) {
                row[c] = 0;
            }
            array[r] = row;
        }
        return array;
    }
    
    /**
     * @param {number} row
     * @param {number} col
     * @param {number} value
     */
    const drawPixel = function(row, col, value) {
        context.beginPath();
        context.rect((col * local.resolution), (row * local.resolution), local.resolution, local.resolution);
        context.fillStyle = (local.darkMode ^ value) ? 'black': 'white';
        context.fill();
    }

    /** 
     * @constructor `CanvasPlane`
     * @param {string} canvasElId 
     * @param {number} resolution 
     * @returns {CanvasPlane}
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

        local.planeDataArray = buildEmptyArray(local.rows, local.cols);
    }

    /** @param {CanvasPlaneData} data */
    CanvasPlane.prototype.draw = function(data) {
        for(let r=0,c, v,rl=local.rows,cl=local.cols; r<rl; r++) {
            for(c=0; c<cl; c++) {
                if(local.planeDataArray[r][c] !== (v = data.getValue(r, c))) {
                    local.planeDataArray[r][c] = v;
                    drawPixel(r, c, v);
                }
            }
        }
    }

    CanvasPlane.prototype.changeMode = function() {
        local.darkMode = !local.darkMode;
        for(let r=0,c, rl=local.rows,cl=local.cols; r<rl; r++) {
            for(c=0; c<cl; c++) {
                drawPixel(r, c, local.planeDataArray[r][c]);
            }
        }
        return local.darkMode;
    }
    return CanvasPlane;
})();
