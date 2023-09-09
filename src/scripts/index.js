
const Game = (function() {
    /**
     * @typedef {{mode: HTMLButtonElement, start: HTMLButtonElement, stop: HTMLButtonElement}} ControlButtons
    */

    const plane = new CanvasPlane('gol-game', 2);
    /** @param {{buffer: ArrayBuffer, stopped: boolean}} */
    const workerMessageHandler = ({buffer, stopped}) => {
        if(buffer) renderFrame(buffer);
        else if(stopped) renderFrame();
    }
    const worker = new WorkerProcess('worker', './worker.js', workerMessageHandler);

    // Controls
    const controlButtons = (() => {
        /** @type {ControlButtons} */
        let buttons = Object.create(null);
        let bts =['mode'|'start'|'stop'], len= bts.length, i;
        for(i = 0; i<len; i++) {
            controls[bts[i]] = document.getElementById(bts[i])
        }
        return buttons;
    })();
    /** 
     * @param {'mode'|'start'|'stop'} button
     * @param {boolean} disable
     */
    const enableDisableButton = (button, disable) => {
        let button = controlButtons[button];
        if(button) {
            button.disabled = disable;
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
        let button = controlButtons[button];
        if(button) button.innerText = title;
    }

    const gameStatus = {isStarted: false, isPause: false};
    
    /** @param {ArrayBuffer} [buffer] */
    const renderFrame = function(buffer) {
        plane.draw(new CanvasPlaneData(plane.rows, plane.cols, buffer));
        if(gameStatus.isStarted && !gameStatus.isPause) worker.send({next: true});
    }

    /** @constructor */
    function Game() {
        if(!new.target) throw new Error('Use `new` keyword to create Object of this class.');
    }

    Game.start = function() {
        if(!gameStatus.isStarted) {
            gameStatus.isStarted = true; gameStatus.isPause = false;
            worker.send({rows: plane.rows, cols: plane.cols});
            disableAll('start');
            setTimeout(() => {
                setButtonTitle('start', 'Pause');
                enableAll('mode', 'start', 'stop');
            }, 100);
        } else if(!gameStatus.isPause){
            gameStatus.isPause = true;
            disableAll('start');
            setTimeout(() => {
                setButtonTitle('start', 'Start');
                enableAll('start');
            }, 100);
        } else {
            gameStatus.isPause = false;
            worker.send({next: true});
            disableAll('start');
            setTimeout(() => {
                setButtonTitle('start', 'Pause');
                enableAll('start');
            }, 100);
        }
    }

    Game.stop = function() {
        gameStatus.isStarted = false; gameStatus.isPause = false;
        worker.send({stop: true});
        disableAll('mode', 'start', 'stop');
        setTimeout(() => {
            setButtonTitle('start', 'Start');
            enableAll('start');
        }, 100);
    }
    Game.changeMode = function() {
        let darkMode = plane.changeMode();
        worker.send({next: true});
        setButtonTitle('mode', darkMode ? 'Dark Mode' : 'light Mode')
    }

    return Game;
})();


/** @param {'mode'|'start'|'pause'|'stop'} action */
function gameControlAction(action) {
    if(action==='start') Game.start();
    else if(action==='stop') Game.stop();
    else if(action==='mode') Game.changeMode();
    else console.log('Unrecognized Action.');
}