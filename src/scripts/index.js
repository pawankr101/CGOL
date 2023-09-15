/** @class `Game` */
const Game = (function() {

    /** @type {CanvasPlane} */
    const plane = new CanvasPlane('gol-game', 2);

    /** @param {{buffer: ArrayBuffer, stopped: boolean}} data */
    const workerMessageHandler = (data) => {
        if(data.buffer) renderFrame(data.buffer);
        else if(data.stopped) renderFrame();
    }

    /** @type {WorkerProcess} */
    const worker = new WorkerProcess('worker', './scripts/worker.js', workerMessageHandler);

    // Controls
    /**
     * @typedef {{mode: HTMLButtonElement, start: HTMLButtonElement, stop: HTMLButtonElement}} ControlButtons
     * @type {ControlButtons}
     */
    const controlButtons = (() => {
        /** @type {ControlButtons} */
        let buttons = Object.create(null);
        let bts =['mode','start','stop'], len= bts.length, i;
        for(i=0; i<len; i++) {
            buttons[bts[i]] = document.getElementById(bts[i]+'-btn')
        }
        return buttons;
    })();
    /** 
     * @param {'mode'|'start'|'stop'} button
     * @param {boolean} disable
     */
    const enableDisableButton = (button, disable) => {
        button = controlButtons[button];
        if(button) {
            button.disabled = disable || false;
            button.style.cursor = disable ? 'not-allowed' : 'pointer';
        }
    }
    /**
     * @typedef {'mode'|'start'|'stop'} Button
     * @param {Button} button
     * @param {Button[]} buttons
     */
    const enableAll = function(button, ...buttons) {
        enableDisableButton(button)
        buttons.forEach((btn) => enableDisableButton(btn));
    }

    /**
     * @typedef {'mode'|'start'|'stop'} Button
     * @param {Button} button
     * @param {Button[]} buttons
     */
    const disableAll = function(button, ...buttons) {
        enableDisableButton(button, true)
        buttons.forEach((btn) => enableDisableButton(btn, true));
    }
    /** 
     * @param {'mode'|'start'|'stop'} button
     * @param {string} title
     */
    const setButtonTitle = (button, title) => {
        button = controlButtons[button];
        if(button) button.innerHTML = title;
    }

    const gameStatus = {isStarted: false, isPause: false};
    
    /** @param {ArrayBuffer} [buffer] */
    const renderFrame = function(buffer) {
        plane.draw(new CanvasPlaneData(plane.rows, plane.cols, buffer));
        if(gameStatus.isStarted && !gameStatus.isPause) {
            worker.send({next: true});
        }
    }

    /** @constructor */
    function Game() {
        if(!new.target) throw new Error('Use `new` keyword to create Object of this class.');
    }

    Game.start = function() {
        if(gameStatus.isStarted) {
            if(gameStatus.isPause) {
                gameStatus.isPause = false;
                setTimeout(() => { setButtonTitle('start', 'Pause'); }, 0);
                worker.send({next: true});
            }
        }

        if(!gameStatus.isStarted) {
            gameStatus.isStarted = true; gameStatus.isPause = false;
            worker.send({rows: plane.rows, cols: plane.cols});
            setTimeout(() => {
                setButtonTitle('start', 'Pause');
                enableAll('mode', 'start', 'stop');
            }, 10);
        } else {
            if(!gameStatus.isPause){
                gameStatus.isPause = true;
                setTimeout(() => {
                    setButtonTitle('start', 'Start');
                }, 10);
            } else {
                gameStatus.isPause = false;
                worker.send({next: true});
                setTimeout(() => {
                    setButtonTitle('start', 'Pause');
                }, 10);
            }
        }
    }

    Game.stop = function() {
        gameStatus.isStarted = false; gameStatus.isPause = false;
        worker.send({stop: true});
        disableAll('mode', 'stop');
        setTimeout(() => {
            setButtonTitle('start', 'Start');
            enableAll('start');
        }, 10);
    }

    Game.changeMode = function() {
        setButtonTitle('mode', plane.changeMode() ? 'Light Mode' : 'Dark Mode');
        worker.send({next: true});
    }
    return Game;
})();


/** @param {'mode'|'start'|'stop'} action */
function gameControlAction(action) {
    if(action==='start') Game.start();
    else if(action==='stop') Game.stop();
    else if(action==='mode') Game.changeMode();
    else console.log('Unrecognized Action.');
}
