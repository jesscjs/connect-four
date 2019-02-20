(function() {

    let col = Number($('.board-col').val());
    let row = Number($('.board-row').val());
    let win = Number($('.board-pick-win').val());

    $('.board-col').on('input', () => {
        col = $('.board-col').val();
    });
    $('.board-row').on('input', () => {
        row = $('.board-row').val();
    });
    $('.board-win').on('input', () => {
        win = $('.board-pick-win').val();
    });

    var slots = [];
    var player = 0;
    var errorMsg = false;

    $('body').on('keydown', (e) => {
        
        if(e.which === 13){
            if(col > 3 && col < 11 && row > 3 && row < 11 && win > 2 && col > win && row > win && win < 10){
                $('body').off('keydown');
                startGame();
            } else {
                if(!errorMsg) {$('.settings').prepend(`<h1 class="fadeinout" top="10px">Column and row size must be at least 4 <span></br></span>Consecutive discs must be at least 3 and smaller than number of rows and columns</h1>`);}
                errorMsg = true;
            }
        }
    });

    startGame = () => {
       fillSlots(col, row);
        // LISTEN TO CLICKS ON BOARD
        $("#board").on('click','.col', e => {
            dropToken(e.currentTarget, player);
        });
    }

    fillSlots = (col, row) => {
        // console.log(`fillSlots(${row}, ${col})`);
        player = 1;
        var html, colDiv, slot;
        var colDiv = '<div class="col" id="';
        var slot = '<div class="slot ';
        var html = '<div class="col" id="0">';
        slots.push(Array.apply(null, Array(Number($('.board-row').val()))).map( x => { return 0;}));

        for(var i = 0; i < row*col; i++){
            if(i % row === 0 && i !== 0){
                slots.push(Array.apply(null, Array(Number($('.board-row').val()))).map( x => { return 0;}));
                html += '</div>';                           // close previous col div
                html = html + colDiv + (i/row) + '">';      // start new col div
            }   
            html = html + slot + i + '"></div>';
        }
        $('#board').append(html);
        $('.settings').hide();
    }


    check = (col, row, p) => {
        var coords = [];
        var winArray = [];
        var sr, sl, su, sd;
        sr = slots.length - (col + 1);
        sl = col;
        sd = slots[0].length - (row + 1);
        su = row;

        // check down
        var cr = row + 1;
        for(var i = 0; i < sd; i++){
            if(slots[col][cr] === p){
                winArray.push({'col': col, 'row': cr});
                cr++;
            } else {
                break;
            }
        }

        winArray.length >= win - 1 ? (winArray.map(x => coords.push(x)), winArray = []) : winArray = [];

        // check right
        var cc = col + 1;
        for(let i = 0; i < sr; i++){
            if(slots[cc][row] === p){
                winArray.push({'col': cc, 'row': row});
                cc++;
            } else {
                break;
            }
        }
        // check left
        var cc = col - 1;
        for(let i = 0; i < sl; i++){
            if(slots[cc][row] === p){
                winArray.push({'col': cc, 'row': row});
                cc--;
            } else {
                break;
            }
        }

        winArray.length >= win - 1 ? (winArray.map(x => coords.push(x)), winArray = []) : winArray = [];

        // check up right
        var sdiag = Math.min(su, sr);
        cc = col + 1;
        cr = row - 1;
        for (let i = 0; i < sdiag; i++) {
            if(slots[cc][cr] === p){
                winArray.push({'col': cc, 'row': cr});
                cr--;
                cc++;
            } else {
                break;
            }
        }

        // check down left
        sdiag = Math.min(sd, sl);
        
        cc = col - 1;
        if (cc >= 0) {cr = row + 1}
        // console.log(sdiag, cc, cr);
        for (let i = 0; i < sdiag; i++) {
            // console.log(cc, cr)
            if(slots[cc][cr] === p){
                winArray.push({'col': cc, 'row': cr});
                cr++;
                cc--;
            } else {
                break;
            }
        }

         winArray.length >= win - 1 ? (winArray.map(x => coords.push(x)), winArray = []) : winArray = [];

        // check down right
        sdiag = Math.min(sd, sr);
        cc = col + 1;
        cr = row + 1;
        for (let i = 0; i < sdiag; i++) {
            if(slots[cc][cr] === p){
                winArray.push({'col': cc, 'row': cr});
                cr++;
                cc++;
            } else {
                break;
            }
        }
        // check up left
        sdiag = Math.min(su, sl);
        cc = col - 1;
        cr = row - 1;
        for (let i = 0; i < sdiag; i++) {
            if(slots[cc][cr] === p){
                winArray.push({'col': cc, 'row': cr});
                cr--;
                cc--;
            } else {
                break;
            }
        }
         winArray.length >= win - 1 ? (winArray.map(x => coords.push(x)), winArray = []) : winArray = [];

        coords.push({'col': col, 'row': row}); // push current slot
        if(coords.length >= win) {
            animateWin(coords, p);
        };
    }

    // ADD TOKEN TO SLOT

    dropToken = (col, p) => {
        var colNo = Number($(col).attr('id'));
        // console.log(`dropToken(${colNo}, ${p})`);
        for(var i = slots[0].length - 1; i >= 0; i--){
            if(slots[colNo][i] === 0){
                slots[colNo][i] = p;
                $(col.childNodes).eq(i).append(`<div class=p${p}></div>`); 
                check(colNo, i, p);
                p === 1 ? player = 2 : player = 1;
                break;
            }
        }
    }

    animateWin = (coords, p) => {
        // console.log(`animateWin, ${coords}, ${p}`)
        var slot;
        for(var i = 0; i < coords.length; i++){
            slot = ((coords[i].col * row))+ coords[i].row;
            $("#board").find(`div.${slot} :first-child`).addClass('animate-win');
        }
        $("#board").off('click');
        updateScore(p);   
    }        

    updateScore = p => {
        var score = Number($(`.score-p${p}`).find('.score-text').text());
        $(`.score-p${p}`).find('.score-text').text(++score);

        setTimeout( () => {
            $('#board').empty();
            slots=[];
            startGame(col, row);
        }, 5000);
    }

})()