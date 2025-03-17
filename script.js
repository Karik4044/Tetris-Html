document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const miniGrid = document.querySelector('.mini-grid');
    const scoreDisplay = document.querySelector('#score');
    const gameOverScreen = document.querySelector('#game-over');
    const finalScoreDisplay = document.querySelector('#final-score');
    const restartBtn = document.querySelector('#restart-btn');
    let squares = Array.from(document.querySelectorAll('.grid div'));
    const width = 10;
    let nextRandom = 0;
    let score = 0;
    let timerId;
    let dropSpeed = 500;
    let fastDropSpeed = 50;
    let isFastDropping = false;
    let isGameOver = false; // Thêm biến kiểm tra trạng thái game over

    // Tạo grid chính và mini grid
    for (let i = 0; i < 200; i++) {
        const square = document.createElement('div');
        grid.appendChild(square);
    }
    for (let i = 0; i < 10; i++) {
        const square = document.createElement('div');
        square.classList.add('taken');
        grid.appendChild(square);
    }
    for (let i = 0; i < 16; i++) {
        const square = document.createElement('div');
        miniGrid.appendChild(square);
    }
    squares = Array.from(document.querySelectorAll('.grid div'));

    // Các khối Tetromino
    const lTetromino = [
        [1, width+1, width*2+1, 2],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2+1, width*2],
        [width, width*2, width*2+1, width*2+2]
    ];

    const zTetromino = [
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1],
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1]
    ];

    const tTetromino = [
        [1, width, width+1, width+2],
        [1, width+1, width+2, width*2+1],
        [width, width+1, width+2, width*2+1],
        [1, width, width+1, width*2+1]
    ];

    const oTetromino = [
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1]
    ];

    const iTetromino = [
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3],
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3]
    ];

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

    let currentPosition = 4;
    let currentRotation = 0;
    let random = Math.floor(Math.random()*theTetrominoes.length);
    let current = theTetrominoes[random][currentRotation];
    let currentColor = getRandomColor();

    // Tạo màu ngẫu nhiên từ 7 màu cố định
    function getRandomColor() {
        const colors = [
            '#FF0000', // Đỏ
            '#00FF00', // Xanh lá
            '#0000FF', // Xanh dương
            '#FFFF00', // Vàng
            '#FF00FF', // Hồng
            '#00FFFF', // Xanh ngọc
            '#FFA500'  // Cam
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Vẽ khối với màu
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino');
            squares[currentPosition + index].style.backgroundColor = currentColor;
        });
    }

    // Xóa khối
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
            if (!squares[currentPosition + index].classList.contains('taken')) {
                squares[currentPosition + index].style.backgroundColor = '';
            }
        });
    }

    // Điều khiển
    function control(e) {
        if (!isGameOver) { // Chỉ cho phép điều khiển khi chưa game over
            if(e.keyCode === 37) {
                moveLeft();
            } else if(e.keyCode === 38) {
                rotate();
            } else if(e.keyCode === 39) {
                moveRight();
            }
        }
    }

    document.addEventListener('keydown', (e) => {
        if (!isGameOver && e.keyCode === 40 && !isFastDropping) {
            isFastDropping = true;
            clearInterval(timerId);
            timerId = setInterval(moveDown, fastDropSpeed);
        }
    });

    document.addEventListener('keyup', (e) => {
        if(e.keyCode === 40) {
            isFastDropping = false;
            clearInterval(timerId);
            timerId = setInterval(moveDown, dropSpeed);
        } else {
            control(e);
        }
    });

    // Di chuyển xuống
    function moveDown() {
        if (!isGameOver) { // Chỉ di chuyển khi chưa game over
            undraw();
            currentPosition += width;
            draw();
            freeze();
        }
    }

    // Đóng băng khi chạm đáy
    function freeze() {
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => {
                squares[currentPosition + index].classList.add('taken');
                squares[currentPosition + index].style.backgroundColor = currentColor;
            });
            if (!isGameOver) { // Chỉ tạo khối mới nếu chưa game over
                random = nextRandom;
                nextRandom = Math.floor(Math.random() * theTetrominoes.length);
                current = theTetrominoes[random][currentRotation];
                currentColor = getRandomColor();
                currentPosition = 4;
                draw();
                displayShape();
                addScore();
                gameOver();
            }
        }
    }

    // Di chuyển trái
    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if(!isAtLeftEdge) currentPosition -=1;
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition +=1;
        }
        draw();
    }

    // Di chuyển phải
    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1);
        if(!isAtRightEdge) currentPosition +=1;
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -=1;
        }
        draw();
    }

    // Xoay khối
    function rotate() {
        undraw();
        currentRotation++;
        if(currentRotation === current.length) {
            currentRotation = 0;
        }
        current = theTetrominoes[random][currentRotation];
        draw();
    }

    // Hiển thị khối tiếp theo
    const displaySquares = document.querySelectorAll('.mini-grid div');
    const displayWidth = 4;
    let displayIndex = 0;

    const upNextTetrominoes = [
        [1, displayWidth+1, displayWidth*2+1, 2],
        [0, displayWidth, displayWidth+1, displayWidth*2+1],
        [1, displayWidth, displayWidth+1, displayWidth+2],
        [0, 1, displayWidth, displayWidth+1],
        [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1]
    ];

    function displayShape() {
        displaySquares.forEach(square => {
            square.classList.remove('tetromino');
            square.style.backgroundColor = '';
        });
        upNextTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('tetromino');
            displaySquares[displayIndex + index].style.backgroundColor = currentColor;
        });
    }

    // Thêm điểm
    function addScore() {
        for (let i = 0; i < 199; i +=width) {
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];
            if(row.every(index => squares[index].classList.contains('taken'))) {
                score +=10;
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    squares[index].classList.remove('taken');
                    squares[index].classList.remove('tetromino');
                    squares[index].style.backgroundColor = '';
                });
                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell));
            }
        }
    }

    // Kết thúc game
    function gameOver() {
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            isGameOver = true; // Đặt trạng thái game over
            clearInterval(timerId);
            finalScoreDisplay.innerHTML = score;
            gameOverScreen.style.display = 'flex';
        }
    }

    // Khởi động lại game
    function restartGame() {
        // Reset các biến
        score = 0;
        scoreDisplay.innerHTML = score;
        currentPosition = 4;
        currentRotation = 0;
        random = Math.floor(Math.random() * theTetrominoes.length);
        current = theTetrominoes[random][currentRotation];
        currentColor = getRandomColor();
        nextRandom = Math.floor(Math.random() * theTetrominoes.length);
        isFastDropping = false;
        isGameOver = false; // Reset trạng thái game over

        // Xóa tất cả khối trên grid
        squares.forEach(square => {
            square.classList.remove('tetromino');
            square.classList.remove('taken');
            square.style.backgroundColor = '';
        });
        for (let i = 200; i < 210; i++) {
            squares[i].classList.add('taken');
        }

        // Ẩn màn hình Game Over và khởi động lại timer
        gameOverScreen.style.display = 'none';
        timerId = setInterval(moveDown, dropSpeed);
        draw();
        displayShape();
    }

    // Gắn sự kiện cho nút Restart
    restartBtn.addEventListener('click', restartGame);

    // Khởi động game lần đầu
    timerId = setInterval(moveDown, dropSpeed);
    draw();
    displayShape();
});