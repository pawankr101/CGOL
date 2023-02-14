const locals = {
    cols: 0,
    rows: 0,
    halt: false,
    grid:[[0]],
    initGrid() {
        locals.grid=[];
        for(let c=0,r,col; c<locals.cols; c++) {
            for (col=[],r=0; r<locals.rows; r++) {
                col[r] = Math.round(Math.random());
            }
            locals.grid[c]=col
        }
        postMessage({grid: locals.grid});
        locals.updateGrid();
    },
    nextCellValue(col=0, row=0) {
        let nc = [0,0], oldValue=locals.grid[col][row];
        for(let i=col-1, gl=locals.grid.length,gil,j,brk; i<=col+1; i++) {
            if(i>=0 && i<gl) {
                brk = false;
                for(j=row-1, gil=locals.grid[i].length; j<=row+1; j++) {
                    if(j>=0 && j<gil) {
                        if(!(i==col && j==row)) {
                            nc[locals.grid[i][j]]++;
                            if(nc[1]>3) {
                                brk = true;
                                break;
                            }
                        }
                    }
                }
                if(brk) break;
            }
        }
        return oldValue ? ((nc[1]<2 || nc[1]>3) ? 0 : oldValue) : ((nc[1]===3) ? 1 : oldValue);
    },
    updateGrid() {
        let grid=[];
        for(let c=0,r,col; c<locals.cols; c++) {
            for (col=[],r=0; r<locals.rows; r++) {
                col[r] = locals.nextCellValue(c, r);
            }
            grid[c]=col;
        }
        locals.grid = grid;
        postMessage({grid});
        if(!locals.halt) {
            setTimeout(() => {
                locals.updateGrid();
            }, 20);
        }
    }
}

onmessage = (ev) => {
    if(ev.data.halt) locals.halt = true;
    else if(ev.data.continue) {
        locals.halt = false;
        locals.updateGrid();
    }
    else if(ev.data.cols && ev.data.rows) {
        locals.cols = ev.data.cols;
        locals.rows = ev.data.rows;
        locals.initGrid();
    }
}