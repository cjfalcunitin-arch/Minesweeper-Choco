// Game State
let gameState = {
    mode: null,
    difficulty: null,
    board: [],
    revealed: [],
    flagged: [],
    gameOver: false,
    gameWon: false,
    timer: null,
    timeLeft: 0,
    timerInterval: null,
    vsaiProgress: [0, 0, 0, 0, 0, 0],
    vsaiInterval: null,
    raceFinished: false
};

const difficultySettings = {
    easy: { rows: 5, cols: 10, mines: 10 },
    medium: { rows: 10, cols: 10, mines: 20 },
    hard: { rows: 15, cols: 10, mines: 30 },
    expert: { rows: 20, cols: 10, mines: 40 }
};

let selectedTimerDifficulty = null;

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId === 'menu' ? 'menuScreen' : screenId).classList.add('active');
}

// Loading Screen
window.addEventListener('load', () => {
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += 5;
        document.getElementById('loadingProgress').style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
                showScreen('menu');
            }, 300);
        }
    }, 50);
});

// Timer Difficulty Selection
function selectTimerDifficulty(difficulty) {
    selectedTimerDifficulty = difficulty;
    showScreen('timerTime');
}

function startTimerGame(minutes) {
    startGame('timer', selectedTimerDifficulty, minutes);
}

// Initialize Board
function initializeBoard(rows, cols, mines) {
    const board = Array(rows).fill(null).map(() => Array(cols).fill(0));
    const minePositions = new Set();
    
    // Place mines
    while (minePositions.size < mines) {
        const pos = Math.floor(Math.random() * rows * cols);
        minePositions.add(pos);
    }
    
    minePositions.forEach(pos => {
        const row = Math.floor(pos / cols);
        const col = pos % cols;
        board[row][col] = -1;
    });
    
    // Calculate numbers
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] === -1) continue;
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === -1) {
                        count++;
                    }
                }
            }
            board[r][c] = count;
        }
    }
    
    return board;
}

// Start Game
function startGame(mode, difficulty, timerMinutes = null) {
    const settings = difficultySettings[difficulty];
    
    gameState = {
        mode: mode,
        difficulty: difficulty,
        board: initializeBoard(settings.rows, settings.cols, settings.mines),
        revealed: Array(settings.rows).fill(null).map(() => Array(settings.cols).fill(false)),
        flagged: Array(settings.rows).fill(null).map(() => Array(settings.cols).fill(false)),
        gameOver: false,
        gameWon: false,
        timer: timerMinutes,
        timeLeft: timerMinutes ? timerMinutes * 60 : 0,
        timerInterval: null,
        vsaiProgress: [0, 0, 0, 0, 0, 0],
        vsaiInterval: null,
        raceFinished: false
    };
    
    renderBoard();
    showScreen('gameScreen');
    
    // Setup timer
    if (mode === 'timer') {
        document.getElementById('timerDisplay').style.display = 'flex';
        updateTimerDisplay();
        startTimer();
    } else {
        document.getElementById('timerDisplay').style.display = 'none';
    }
    
    // Setup VS AI
    if (mode === 'vsai') {
        document.getElementById('raceProgress').style.display = 'block';
        renderRaceProgress();
        startVsAI();
    } else {
        document.getElementById('raceProgress').style.display = 'none';
    }
}

// Restart Game
function restartGame() {
    startGame(gameState.mode, gameState.difficulty, gameState.timer);
}

// Timer Functions
function startTimer() {
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    
    gameState.timerInterval = setInterval(() => {
        if (gameState.gameOver || gameState.gameWon) {
            clearInterval(gameState.timerInterval);
            return;
        }
        
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            endGame(false, 'Time\'s up!');
        }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(gameState.timeLeft / 60);
    const secs = gameState.timeLeft % 60;
    document.getElementById('timerText').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}

// VS AI Functions
function startVsAI() {
    if (gameState.vsaiInterval) clearInterval(gameState.vsaiInterval);
    
    gameState.vsaiInterval = setInterval(() => {
        if (gameState.gameOver || gameState.gameWon || gameState.raceFinished) {
            clearInterval(gameState.vsaiInterval);
            return;
        }
        
        gameState.vsaiProgress = gameState.vsaiProgress.map((progress, idx) => {
            if (idx === 0 || progress >= 100) return progress;
            const speed = 0.5 + Math.random() * 1.5;
            return Math.min(100, progress + speed);
        });
        
        renderRaceProgress();
        
        // Check if any AI finished
        const aiFinished = gameState.vsaiProgress.slice(1).some(p => p >= 100);
        if (aiFinished) {
            gameState.raceFinished = true;
            clearInterval(gameState.vsaiInterval);
            endGame(false, 'An AI beat you!');
        }
    }, 100);
}

function renderRaceProgress() {
    const container = document.getElementById('raceProgressBars');
    const labels = ['YOU', 'AI 1', 'AI 2', 'AI 3', 'AI 4', 'AI 5'];
    
    container.innerHTML = labels.map((label, idx) => `
        <div class="progress-row">
            <span class="progress-label ${idx === 0 ? 'player' : 'ai'}">${label}</span>
            <div class="progress-track">
                <div class="progress-bar-fill ${idx === 0 ? 'player' : 'ai'}" 
                     style="width: ${gameState.vsaiProgress[idx]}%"></div>
            </div>
            <span class="progress-percent">${Math.floor(gameState.vsaiProgress[idx])}%</span>
        </div>
    `).join('');
}

// Render Board
function renderBoard() {
    const board = document.getElementById('board');
    const settings = difficultySettings[gameState.difficulty];
    const cellSize = Math.min(32, Math.floor((window.innerWidth - 48) / settings.cols));
    
    board.innerHTML = '';
    
    for (let r = 0; r < settings.rows; r++) {
        const row = document.createElement('div');
        row.className = 'board-row';
        
        for (let c = 0; c < settings.cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.width = cellSize + 'px';
            cell.style.height = cellSize + 'px';
            cell.style.fontSize = (cellSize * 0.5) + 'px';
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            updateCell(cell, r, c);
            
            cell.addEventListener('click', () => revealCell(r, c));
            cell.addEventListener('dragover', (e) => e.preventDefault());
            cell.addEventListener('drop', () => handleFlagDrop(r, c));
            
            row.appendChild(cell);
        }
        
        board.appendChild(row);
    }
}

function updateCell(cell, row, col) {
    const isRevealed = gameState.revealed[row][col];
    const isFlagged = gameState.flagged[row][col];
    const value = gameState.board[row][col];
    
    cell.className = 'cell';
    
    if (isFlagged) {
        cell.classList.add('hidden');
        cell.innerHTML = '<span style="font-size: 1.2em;">🚩</span>';
    } else if (isRevealed) {
        if (value === -1) {
            cell.classList.add('mine');
            cell.textContent = '💣';
        } else {
            cell.classList.add('revealed');
            if (value > 0) {
                cell.textContent = value;
                cell.classList.add('cell-' + value);
            } else {
                cell.textContent = '';
            }
        }
    } else {
        cell.classList.add('hidden');
        cell.textContent = '';
    }
}

// Reveal Cell
function revealCell(row, col) {
    if (gameState.gameOver || gameState.gameWon) return;
    if (gameState.revealed[row][col] || gameState.flagged[row][col]) return;
    
    const reveal = (r, c) => {
        if (r < 0 || r >= gameState.board.length || c < 0 || c >= gameState.board[0].length) return;
        if (gameState.revealed[r][c] || gameState.flagged[r][c]) return;
        
        gameState.revealed[r][c] = true;
        
        const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        if (cell) updateCell(cell, r, c);
        
        if (gameState.board[r][c] === -1) {
            endGame(false);
            return;
        }
        
        if (gameState.board[r][c] === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    reveal(r + dr, c + dc);
                }
            }
        }
    };
    
    reveal(row, col);
    checkWin();
}

// Flag Handling
const flagContainer = document.getElementById('flagContainer');
let isDraggingFlag = false;

flagContainer.addEventListener('dragstart', (e) => {
    isDraggingFlag = true;
    flagContainer.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
});

flagContainer.addEventListener('dragend', () => {
    isDraggingFlag = false;
    flagContainer.classList.remove('dragging');
});

// Touch support for flag
let touchStartX, touchStartY;

flagContainer.addEventListener('touchstart', (e) => {
    isDraggingFlag = true;
    flagContainer.classList.add('dragging');
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    e.preventDefault();
});

flagContainer.addEventListener('touchmove', (e) => {
    if (!isDraggingFlag) return;
    e.preventDefault();
});

flagContainer.addEventListener('touchend', (e) => {
    if (!isDraggingFlag) return;
    
    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.classList.contains('cell')) {
        const row = parseInt(element.dataset.row);
        const col = parseInt(element.dataset.col);
        handleFlagDrop(row, col);
    }
    
    isDraggingFlag = false;
    flagContainer.classList.remove('dragging');
});

function handleFlagDrop(row, col) {
    if (gameState.gameOver || gameState.gameWon) return;
    if (gameState.revealed[row][col]) return;
    
    gameState.flagged[row][col] = !gameState.flagged[row][col];
    
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cell) updateCell(cell, row, col);
}

// Check Win
function checkWin() {
    let allNonMinesRevealed = true;
    
    for (let r = 0; r < gameState.board.length; r++) {
        for (let c = 0; c < gameState.board[0].length; c++) {
            if (gameState.board[r][c] !== -1 && !gameState.revealed[r][c]) {
                allNonMinesRevealed = false;
                break;
            }
        }
        if (!allNonMinesRevealed) break;
    }
    
    if (allNonMinesRevealed) {
        if (gameState.mode === 'vsai') {
            gameState.vsaiProgress[0] = 100;
            renderRaceProgress();
        }
        endGame(true);
    }
}

// End Game
function endGame(won, message = '') {
    gameState.gameOver = !won;
    gameState.gameWon = won;
    
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    if (gameState.vsaiInterval) clearInterval(gameState.vsaiInterval);
    
    const gameOverDiv = document.getElementById('gameOver');
    const title = document.getElementById('gameOverTitle');
    const text = document.getElementById('gameOverText');
    
    title.textContent = won ? '🎉 YOU WIN! 🎉' : '💥 GAME OVER 💥';
    title.className = 'game-over-title ' + (won ? 'win' : 'lose');
    
    if (gameState.mode === 'vsai') {
        text.textContent = message || (won ? 'You finished first!' : 'An AI beat you to it!');
    } else {
        text.textContent = message || '';
    }
    
    gameOverDiv.style.display = 'block';
    
    // Reveal all mines if lost
    if (!won) {
        for (let r = 0; r < gameState.board.length; r++) {
            for (let c = 0; c < gameState.board[0].length; c++) {
                if (gameState.board[r][c] === -1) {
                    gameState.revealed[r][c] = true;
                    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                    if (cell) updateCell(cell, r, c);
                }
            }
        }
    }
}

// Prevent default drag behavior
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});