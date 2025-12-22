// Main Game Hub Application
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Initialize all games
    initSudoku();
    initMemoryGame();
    initTicTacToe();
    setupEventListeners();
    
    // Set default state
    showDefaultState();
    
    // Initialize player stats
    updatePlayerStats();
});

// Global variables
let currentGame = null;
let gameStartTime = null;
let gameTimer = null;
let totalPlayTime = 0;
let gamesCompleted = 0;
let currentStreak = 0;

// Event Listeners Setup
function setupEventListeners() {
    // Game card selection
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', function() {
            const game = this.getAttribute('data-game');
            selectGame(game);
        });
    });
    
    // Back to games button
    document.getElementById('back-btn').addEventListener('click', showDefaultState);
    
    // Restart game button
    document.getElementById('restart-btn').addEventListener('click', restartCurrentGame);
    
    // Game control buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const difficulty = this.getAttribute('data-diff');
            startSudoku(difficulty);
        });
    });
    
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const size = parseInt(this.getAttribute('data-size'));
            startMemoryGame(size);
        });
    });
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const mode = this.getAttribute('data-mode');
            setTicTacToeMode(mode);
        });
    });
    
    // Sudoku controls
    document.getElementById('check-sudoku').addEventListener('click', checkSudokuSolution);
    document.getElementById('solve-sudoku').addEventListener('click', solveSudoku);
    
    // Tic Tac Toe controls
    document.getElementById('reset-score').addEventListener('click', resetTicTacToeScore);
    
    // Number selector for Sudoku
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            if (currentGame === 'sudoku') {
                fillSelectedSudokuCell(value);
            }
        });
    });
}

// Game Selection
function selectGame(game) {
    currentGame = game;
    
    // Hide all games and show selected one
    document.querySelectorAll('.game').forEach(g => {
        g.classList.remove('active');
    });
    
    document.getElementById('default-state').classList.remove('active');
    
    // Show selected game
    document.getElementById(`${game}-game`).classList.add('active');
    
    // Update game title
    const gameTitles = {
        'sudoku': 'Sudoku',
        'memory': 'Memory Match',
        'tictactoe': 'Tic Tac Toe'
    };
    
    document.getElementById('game-title').textContent = gameTitles[game];
    
    // Start the selected game
    switch(game) {
        case 'sudoku':
            startSudoku('easy');
            break;
        case 'memory':
            startMemoryGame(4);
            break;
        case 'tictactoe':
            startTicTacToe();
            break;
    }
    
    // Start game timer
    startGameTimer();
    
    // Show game controls
    document.getElementById('back-btn').style.display = 'flex';
    document.getElementById('restart-btn').style.display = 'flex';
    document.getElementById('game-stats').style.display = 'flex';
}

// Show default state (no game selected)
function showDefaultState() {
    currentGame = null;
    
    // Hide all games and show default
    document.querySelectorAll('.game').forEach(g => {
        g.classList.remove('active');
    });
    
    document.getElementById('default-state').classList.add('active');
    
    // Update game title
    document.getElementById('game-title').textContent = 'Select a Game';
    
    // Hide game controls
    document.getElementById('back-btn').style.display = 'none';
    document.getElementById('restart-btn').style.display = 'none';
    document.getElementById('game-stats').style.display = 'none';
    
    // Reset timer and moves
    clearInterval(gameTimer);
    document.getElementById('timer').textContent = 'Time: 00:00';
    document.getElementById('moves').textContent = 'Moves: 0';
}

// Restart current game
function restartCurrentGame() {
    if (!currentGame) return;
    
    switch(currentGame) {
        case 'sudoku':
            const activeDiff = document.querySelector('.diff-btn.active').getAttribute('data-diff');
            startSudoku(activeDiff);
            break;
        case 'memory':
            const activeSize = parseInt(document.querySelector('.size-btn.active').getAttribute('data-size'));
            startMemoryGame(activeSize);
            break;
        case 'tictactoe':
            startTicTacToe();
            break;
    }
    
    // Reset timer and moves
    startGameTimer();
}

// Game Timer
function startGameTimer() {
    clearInterval(gameTimer);
    gameStartTime = Date.now();
    
    gameTimer = setInterval(() => {
        const elapsed = Date.now() - gameStartTime;
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const displaySeconds = seconds % 60;
        
        document.getElementById('timer').textContent = `Time: ${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
        
        // Update total play time every 10 seconds
        if (seconds % 10 === 0) {
            totalPlayTime += 10;
            updatePlayerStats();
        }
    }, 1000);
}

// Update Player Stats
function updatePlayerStats() {
    // Update total play time
    const totalHours = Math.floor(totalPlayTime / 3600);
    const totalMinutes = Math.floor((totalPlayTime % 3600) / 60);
    const totalSeconds = totalPlayTime % 60;
    
    document.getElementById('total-time').textContent = 
        `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
    
    // Update games completed
    document.getElementById('games-completed').textContent = gamesCompleted;
    
    // Update current streak (simulated)
    document.getElementById('current-streak').textContent = `${currentStreak} days`;
}

// ==================== SUDOKU GAME ====================
let sudokuBoard = [];
let selectedSudokuCell = null;
let initialSudokuBoard = [];

function initSudoku() {
    // Create Sudoku board grid
    const sudokuBoardElement = document.getElementById('sudoku-board');
    sudokuBoardElement.innerHTML = '';
    
    for (let i = 0; i < 81; i++) {
        const cell = document.createElement('div');
        cell.classList.add('sudoku-cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', () => selectSudokuCell(i));
        sudokuBoardElement.appendChild(cell);
    }
}

function startSudoku(difficulty) {
    // Generate a Sudoku puzzle based on difficulty
    sudokuBoard = generateSudokuPuzzle(difficulty);
    initialSudokuBoard = JSON.parse(JSON.stringify(sudokuBoard));
    
    // Update the UI
    updateSudokuBoard();
    
    // Reset selected cell
    selectedSudokuCell = null;
    document.querySelectorAll('.sudoku-cell').forEach(cell => {
        cell.classList.remove('selected');
    });
    
    // Reset moves
    document.getElementById('moves').textContent = 'Moves: 0';
}

function generateSudokuPuzzle(difficulty) {
    // For simplicity, we'll use a pre-defined puzzle
    // In a real implementation, you would generate puzzles algorithmically
    
    const puzzles = {
        easy: [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ],
        medium: [
            [0, 0, 0, 2, 6, 0, 7, 0, 1],
            [6, 8, 0, 0, 7, 0, 0, 9, 0],
            [1, 9, 0, 0, 0, 4, 5, 0, 0],
            [8, 2, 0, 1, 0, 0, 0, 4, 0],
            [0, 0, 4, 6, 0, 2, 9, 0, 0],
            [0, 5, 0, 0, 0, 3, 0, 2, 8],
            [0, 0, 9, 3, 0, 0, 0, 7, 4],
            [0, 4, 0, 0, 5, 0, 0, 3, 6],
            [7, 0, 3, 0, 1, 8, 0, 0, 0]
        ],
        hard: [
            [0, 0, 0, 6, 0, 0, 4, 0, 0],
            [7, 0, 0, 0, 0, 3, 6, 0, 0],
            [0, 0, 0, 0, 9, 1, 0, 8, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 5, 0, 1, 8, 0, 0, 0, 3],
            [0, 0, 0, 3, 0, 6, 0, 4, 5],
            [0, 4, 0, 2, 0, 0, 0, 6, 0],
            [9, 0, 3, 0, 0, 0, 0, 0, 0],
            [0, 2, 0, 0, 0, 0, 1, 0, 0]
        ]
    };
    
    return puzzles[difficulty] || puzzles.easy;
}

function updateSudokuBoard() {
    const cells = document.querySelectorAll('.sudoku-cell');
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const index = row * 9 + col;
            const cell = cells[index];
            const value = sudokuBoard[row][col];
            
            cell.textContent = value === 0 ? '' : value;
            cell.classList.toggle('fixed', value !== 0 && initialSudokuBoard[row][col] !== 0);
            cell.classList.remove('error');
        }
    }
}

function selectSudokuCell(index) {
    // Deselect previous cell
    document.querySelectorAll('.sudoku-cell').forEach(cell => {
        cell.classList.remove('selected');
    });
    
    // Select new cell
    const cell = document.querySelector(`.sudoku-cell[data-index="${index}"]`);
    cell.classList.add('selected');
    
    // Only allow selection of non-fixed cells
    const row = Math.floor(index / 9);
    const col = index % 9;
    
    if (initialSudokuBoard[row][col] === 0) {
        selectedSudokuCell = index;
    } else {
        selectedSudokuCell = null;
    }
}

function fillSelectedSudokuCell(value) {
    if (selectedSudokuCell === null) return;
    
    const row = Math.floor(selectedSudokuCell / 9);
    const col = selectedSudokuCell % 9;
    
    // Only allow filling empty cells
    if (initialSudokuBoard[row][col] === 0) {
        sudokuBoard[row][col] = value === 0 ? 0 : value;
        updateSudokuBoard();
        
        // Update moves
        const movesElement = document.getElementById('moves');
        const currentMoves = parseInt(movesElement.textContent.split(': ')[1]) || 0;
        movesElement.textContent = `Moves: ${currentMoves + 1}`;
        
        // Reselect the cell
        selectSudokuCell(selectedSudokuCell);
    }
}

function checkSudokuSolution() {
    // Simple validation - check for empty cells and obvious conflicts
    let hasErrors = false;
    const cells = document.querySelectorAll('.sudoku-cell');
    
    // Reset all error highlighting
    cells.forEach(cell => cell.classList.remove('error'));
    
    // Check rows and columns for duplicates
    for (let i = 0; i < 9; i++) {
        const rowSet = new Set();
        const colSet = new Set();
        
        for (let j = 0; j < 9; j++) {
            // Check rows
            const rowVal = sudokuBoard[i][j];
            if (rowVal !== 0) {
                if (rowSet.has(rowVal)) {
                    // Mark all cells in this row with this value
                    for (let k = 0; k < 9; k++) {
                        if (sudokuBoard[i][k] === rowVal) {
                            cells[i * 9 + k].classList.add('error');
                            hasErrors = true;
                        }
                    }
                }
                rowSet.add(rowVal);
            }
            
            // Check columns
            const colVal = sudokuBoard[j][i];
            if (colVal !== 0) {
                if (colSet.has(colVal)) {
                    // Mark all cells in this column with this value
                    for (let k = 0; k < 9; k++) {
                        if (sudokuBoard[k][i] === colVal) {
                            cells[k * 9 + i].classList.add('error');
                            hasErrors = true;
                        }
                    }
                }
                colSet.add(colVal);
            }
        }
    }
    
    if (!hasErrors) {
        // Check if puzzle is complete (no zeros)
        const isComplete = sudokuBoard.every(row => row.every(cell => cell !== 0));
        
        if (isComplete) {
            alert('Congratulations! You solved the Sudoku puzzle!');
            gamesCompleted++;
            updatePlayerStats();
        } else {
            alert('No conflicts found, but puzzle is not complete yet.');
        }
    } else {
        alert('There are conflicts in your solution. Please check highlighted cells.');
    }
}

function solveSudoku() {
    // For simplicity, we'll just fill in the solution to the easy puzzle
    // In a real implementation, you would use a backtracking algorithm
    
    const solution = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ];
    
    sudokuBoard = solution;
    updateSudokuBoard();
    
    alert('Sudoku puzzle solved!');
}

// ==================== MEMORY GAME ====================
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 0;
let memoryMoves = 0;

function initMemoryGame() {
    // Memory game is initialized when started
}

function startMemoryGame(size) {
    const memoryBoard = document.getElementById('memory-board');
    memoryBoard.innerHTML = '';
    memoryBoard.className = `memory-board ${size === 6 ? 'size-6' : ''}`;
    
    // Reset game state
    memoryCards = [];
    flippedCards = [];
    matchedPairs = 0;
    memoryMoves = 0;
    
    // Calculate total pairs
    totalPairs = (size * size) / 2;
    
    // Create card values
    const cardValues = [];
    for (let i = 1; i <= totalPairs; i++) {
        cardValues.push(i);
        cardValues.push(i);
    }
    
    // Shuffle card values
    shuffleArray(cardValues);
    
    // Create card elements
    for (let i = 0; i < size * size; i++) {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.setAttribute('data-index', i);
        card.setAttribute('data-value', cardValues[i]);
        
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        cardFront.textContent = cardValues[i];
        
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardBack.innerHTML = '<i class="fas fa-question"></i>';
        
        card.appendChild(cardFront);
        card.appendChild(cardBack);
        
        card.addEventListener('click', () => flipMemoryCard(i));
        memoryBoard.appendChild(card);
        
        memoryCards.push({
            element: card,
            value: cardValues[i],
            flipped: false,
            matched: false
        });
    }
    
    // Update UI
    document.getElementById('matches').textContent = `0/${totalPairs}`;
    document.getElementById('moves').textContent = 'Moves: 0';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function flipMemoryCard(index) {
    const card = memoryCards[index];
    
    // Don't allow flipping if card is already flipped or matched, or if two cards are already flipped
    if (card.flipped || card.matched || flippedCards.length >= 2) {
        return;
    }
    
    // Flip the card
    card.element.classList.add('flipped');
    card.flipped = true;
    flippedCards.push(index);
    
    // If two cards are flipped, check for match
    if (flippedCards.length === 2) {
        memoryMoves++;
        document.getElementById('moves').textContent = `Moves: ${memoryMoves}`;
        
        const card1 = memoryCards[flippedCards[0]];
        const card2 = memoryCards[flippedCards[1]];
        
        if (card1.value === card2.value) {
            // Match found
            card1.matched = true;
            card2.matched = true;
            matchedPairs++;
            
            document.getElementById('matches').textContent = `${matchedPairs}/${totalPairs}`;
            
            // Check if game is complete
            if (matchedPairs === totalPairs) {
                setTimeout(() => {
                    alert(`Congratulations! You completed the memory game in ${memoryMoves} moves!`);
                    gamesCompleted++;
                    updatePlayerStats();
                }, 500);
            }
            
            flippedCards = [];
        } else {
            // No match, flip cards back after a delay
            setTimeout(() => {
                card1.element.classList.remove('flipped');
                card2.element.classList.remove('flipped');
                card1.flipped = false;
                card2.flipped = false;
                flippedCards = [];
            }, 1000);
        }
    }
}

// ==================== TIC TAC TOE GAME ====================
let ticTacToeBoard = Array(9).fill('');
let currentPlayer = 'X';
let gameMode = 'player'; // 'player' or 'computer'
let gameActive = true;
let xWins = 0;
let oWins = 0;
let draws = 0;

function initTicTacToe() {
    // Create Tic Tac Toe board
    const ticTacToeBoardElement = document.getElementById('tictactoe-board');
    ticTacToeBoardElement.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('tictactoe-cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', () => makeMove(i));
        ticTacToeBoardElement.appendChild(cell);
    }
    
    // Load scores from localStorage if available
    const savedScores = localStorage.getItem('ticTacToeScores');
    if (savedScores) {
        const scores = JSON.parse(savedScores);
        xWins = scores.xWins || 0;
        oWins = scores.oWins || 0;
        draws = scores.draws || 0;
        updateScoreDisplay();
    }
}

function startTicTacToe() {
    // Reset board
    ticTacToeBoard = Array(9).fill('');
    gameActive = true;
    currentPlayer = 'X';
    
    // Update UI
    updateTicTacToeBoard();
    document.getElementById('current-player').textContent = currentPlayer;
    document.getElementById('moves').textContent = 'Moves: 0';
}

function setTicTacToeMode(mode) {
    gameMode = mode;
    startTicTacToe();
}

function makeMove(index) {
    if (!gameActive || ticTacToeBoard[index] !== '') {
        return;
    }
    
    // Make player move
    ticTacToeBoard[index] = currentPlayer;
    updateTicTacToeBoard();
    
    // Check for win or draw
    if (checkWin()) {
        gameActive = false;
        
        if (currentPlayer === 'X') {
            xWins++;
            alert('Player X wins!');
        } else {
            oWins++;
            alert('Player O wins!');
        }
        
        gamesCompleted++;
        updateScoreDisplay();
        saveScores();
        updatePlayerStats();
        return;
    }
    
    if (checkDraw()) {
        gameActive = false;
        draws++;
        alert("It's a draw!");
        updateScoreDisplay();
        saveScores();
        updatePlayerStats();
        return;
    }
    
    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    document.getElementById('current-player').textContent = currentPlayer;
    
    // Update moves
    const movesElement = document.getElementById('moves');
    const currentMoves = parseInt(movesElement.textContent.split(': ')[1]) || 0;
    movesElement.textContent = `Moves: ${currentMoves + 1}`;
    
    // If playing against computer and it's computer's turn
    if (gameMode === 'computer' && currentPlayer === 'O' && gameActive) {
        setTimeout(makeComputerMove, 500);
    }
}

function makeComputerMove() {
    if (!gameActive) return;
    
    // Simple AI: try to win, then block, then choose random
    let moveIndex = -1;
    
    // Check for winning move
    moveIndex = findWinningMove('O');
    
    // Check for blocking move
    if (moveIndex === -1) {
        moveIndex = findWinningMove('X');
    }
    
    // Choose random move
    if (moveIndex === -1) {
        const availableMoves = [];
        for (let i = 0; i < 9; i++) {
            if (ticTacToeBoard[i] === '') {
                availableMoves.push(i);
            }
        }
        
        if (availableMoves.length > 0) {
            moveIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
    }
    
    if (moveIndex !== -1) {
        ticTacToeBoard[moveIndex] = 'O';
        updateTicTacToeBoard();
        
        // Check for win or draw
        if (checkWin()) {
            gameActive = false;
            oWins++;
            alert('Computer wins!');
            gamesCompleted++;
            updateScoreDisplay();
            saveScores();
            updatePlayerStats();
            return;
        }
        
        if (checkDraw()) {
            gameActive = false;
            draws++;
            alert("It's a draw!");
            updateScoreDisplay();
            saveScores();
            updatePlayerStats();
            return;
        }
        
        // Switch back to player
        currentPlayer = 'X';
        document.getElementById('current-player').textContent = currentPlayer;
        
        // Update moves
        const movesElement = document.getElementById('moves');
        const currentMoves = parseInt(movesElement.textContent.split(': ')[1]) || 0;
        movesElement.textContent = `Moves: ${currentMoves + 1}`;
    }
}

function findWinningMove(player) {
    // Check all possible moves for a win
    for (let i = 0; i < 9; i++) {
        if (ticTacToeBoard[i] === '') {
            ticTacToeBoard[i] = player;
            if (checkWin()) {
                ticTacToeBoard[i] = '';
                return i;
            }
            ticTacToeBoard[i] = '';
        }
    }
    return -1;
}

function checkWin() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (ticTacToeBoard[a] && 
            ticTacToeBoard[a] === ticTacToeBoard[b] && 
            ticTacToeBoard[a] === ticTacToeBoard[c]) {
            return true;
        }
    }
    
    return false;
}

function checkDraw() {
    return ticTacToeBoard.every(cell => cell !== '');
}

function updateTicTacToeBoard() {
    const cells = document.querySelectorAll('.tictactoe-cell');
    
    cells.forEach((cell, index) => {
        cell.textContent = ticTacToeBoard[index];
        cell.className = 'tictactoe-cell';
        
        if (ticTacToeBoard[index] === 'X') {
            cell.classList.add('x');
        } else if (ticTacToeBoard[index] === 'O') {
            cell.classList.add('o');
        }
    });
}

function updateScoreDisplay() {
    document.getElementById('x-wins').textContent = xWins;
    document.getElementById('o-wins').textContent = oWins;
    document.getElementById('draws').textContent = draws;
}

function resetTicTacToeScore() {
    xWins = 0;
    oWins = 0;
    draws = 0;
    updateScoreDisplay();
    saveScores();
}

function saveScores() {
    const scores = {
        xWins,
        oWins,
        draws
    };
    localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
}