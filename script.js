// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const games = document.querySelectorAll('.game');
const instructions = document.getElementById('game-instructions');

// Game instructions for each puzzle
const gameInstructions = {
    'memory': 'Match pairs of cards by flipping them two at a time. Remember the positions of each card to find all matching pairs with the fewest moves.',
    'slider': 'Arrange the tiles in numerical order by sliding them into the empty space. Click on any tile adjacent to the empty space to move it.',
    'hangman': 'Guess the hidden word by selecting letters. Each incorrect guess adds a part to the hangman. You have 6 incorrect guesses before you lose.',
    'sudoku': 'Fill the 4×4 grid with numbers 1-4 so that each row, column, and 2×2 box contains all numbers 1-4 without repetition. You can make up to 3 mistakes.',
    'tic-tac-toe': 'Get three of your symbols (X or O) in a row horizontally, vertically, or diagonally. Play against another player or against the computer.'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Set up tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const gameId = button.getAttribute('data-game');
            switchGame(gameId);
        });
    });
    
    // Initialize all games
    initMemoryGame();
    initSliderPuzzle();
    initHangman();
    initSudoku();
    initTicTacToe();
    
    // Start with the first game
    switchGame('memory');
});

// Switch between games
function switchGame(gameId) {
    // Update active tab
    tabButtons.forEach(button => {
        if (button.getAttribute('data-game') === gameId) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Show selected game
    games.forEach(game => {
        if (game.id === `${gameId}-game`) {
            game.classList.add('active');
        } else {
            game.classList.remove('active');
        }
    });
    
    // Update instructions
    instructions.textContent = gameInstructions[gameId];
}

// ========== MEMORY MATCH GAME ==========
function initMemoryGame() {
    const memoryBoard = document.getElementById('memory-board');
    const memoryMoves = document.getElementById('memory-moves');
    const memoryMatches = document.getElementById('memory-matches');
    const resetBtn = document.getElementById('memory-reset');
    
    let cards = [];
    let flippedCards = [];
    let moves = 0;
    let matches = 0;
    let lockBoard = false;
    
    // Card symbols
    const symbols = ['🚀', '🎮', '🎵', '🎨', '📚', '🍕', '🐱', '🌟'];
    
    // Create card array with pairs
    function createCards() {
        const cardPairs = [...symbols, ...symbols];
        return cardPairs.sort(() => Math.random() - 0.5);
    }
    
    // Create the game board
    function createBoard() {
        memoryBoard.innerHTML = '';
        cards = createCards();
        
        cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.symbol = symbol;
            
            const cardFront = document.createElement('div');
            cardFront.className = 'card-front';
            cardFront.textContent = symbol;
            
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            cardBack.textContent = '?';
            
            card.appendChild(cardFront);
            card.appendChild(cardBack);
            
            card.addEventListener('click', flipCard);
            memoryBoard.appendChild(card);
        });
    }
    
    // Flip a card
    function flipCard() {
        if (lockBoard) return;
        if (this === flippedCards[0]) return;
        if (this.classList.contains('matched')) return;
        
        this.classList.add('flipped');
        flippedCards.push(this);
        
        if (flippedCards.length === 2) {
            moves++;
            memoryMoves.textContent = moves;
            lockBoard = true;
            
            checkForMatch();
        }
    }
    
    // Check if flipped cards match
    function checkForMatch() {
        const isMatch = flippedCards[0].dataset.symbol === flippedCards[1].dataset.symbol;
        
        if (isMatch) {
            disableMatchedCards();
            matches++;
            memoryMatches.textContent = matches;
            
            if (matches === 8) {
                setTimeout(() => {
                    alert(`Congratulations! You won in ${moves} moves!`);
                }, 500);
            }
        } else {
            unflipCards();
        }
    }
    
    // Disable matched cards
    function disableMatchedCards() {
        flippedCards.forEach(card => {
            card.classList.add('matched');
        });
        
        flippedCards = [];
        lockBoard = false;
    }
    
    // Unflip non-matching cards
    function unflipCards() {
        setTimeout(() => {
            flippedCards.forEach(card => {
                card.classList.remove('flipped');
            });
            
            flippedCards = [];
            lockBoard = false;
        }, 1000);
    }
    
    // Reset the game
    function resetGame() {
        moves = 0;
        matches = 0;
        memoryMoves.textContent = '0';
        memoryMatches.textContent = '0';
        flippedCards = [];
        lockBoard = false;
        createBoard();
    }
    
    // Event listener for reset button
    resetBtn.addEventListener('click', resetGame);
    
    // Initialize the board
    createBoard();
}

// ========== SLIDER PUZZLE GAME ==========
function initSliderPuzzle() {
    const sliderBoard = document.getElementById('slider-board');
    const sliderMoves = document.getElementById('slider-moves');
    const sliderTime = document.getElementById('slider-time');
    const resetBtn = document.getElementById('slider-reset');
    
    let tiles = [];
    let emptyIndex = 15;
    let moves = 0;
    let timer = 0;
    let timerInterval = null;
    const size = 4;
    
    // Initialize the board
    function initBoard() {
        sliderBoard.innerHTML = '';
        tiles = [];
        
        // Create tiles 1-15 and one empty
        for (let i = 1; i <= size * size; i++) {
            tiles.push(i === size * size ? 0 : i);
        }
        
        // Shuffle the tiles
        shuffleTiles();
        
        // Create tile elements
        tiles.forEach((value, index) => {
            const tile = document.createElement('div');
            tile.className = value === 0 ? 'slider-tile empty' : 'slider-tile';
            tile.textContent = value === 0 ? '' : value;
            tile.dataset.index = index;
            tile.dataset.value = value;
            
            if (value !== 0) {
                tile.addEventListener('click', () => moveTile(index));
            }
            
            sliderBoard.appendChild(tile);
            
            if (value === 0) {
                emptyIndex = index;
            }
        });
        
        moves = 0;
        sliderMoves.textContent = '0';
        
        // Start timer
        clearInterval(timerInterval);
        timer = 0;
        sliderTime.textContent = '0';
        timerInterval = setInterval(() => {
            timer++;
            sliderTime.textContent = timer;
        }, 1000);
    }
    
    // Shuffle tiles (makes sure puzzle is solvable)
    function shuffleTiles() {
        do {
            // Fisher-Yates shuffle
            for (let i = tiles.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
            }
            
            // Find empty tile
            emptyIndex = tiles.indexOf(0);
        } while (!isSolvable() || isSolved());
    }
    
    // Check if puzzle is solvable
    function isSolvable() {
        let inversions = 0;
        
        for (let i = 0; i < tiles.length; i++) {
            for (let j = i + 1; j < tiles.length; j++) {
                if (tiles[i] !== 0 && tiles[j] !== 0 && tiles[i] > tiles[j]) {
                    inversions++;
                }
            }
        }
        
        // For 4x4 puzzle, solvable if empty is on even row from bottom and inversions is odd,
        // or empty is on odd row from bottom and inversions is even
        const emptyRow = Math.floor(emptyIndex / size);
        const emptyRowFromBottom = size - emptyRow;
        
        return (emptyRowFromBottom % 2 === 0) === (inversions % 2 === 1);
    }
    
    // Check if puzzle is solved
    function isSolved() {
        for (let i = 0; i < tiles.length - 1; i++) {
            if (tiles[i] !== i + 1) {
                return false;
            }
        }
        return true;
    }
    
    // Move a tile
    function moveTile(index) {
        const row = Math.floor(index / size);
        const col = index % size;
        const emptyRow = Math.floor(emptyIndex / size);
        const emptyCol = emptyIndex % size;
        
        // Check if tile is adjacent to empty space
        if ((Math.abs(row - emptyRow) === 1 && col === emptyCol) || 
            (Math.abs(col - emptyCol) === 1 && row === emptyRow)) {
            
            // Swap tile with empty space
            [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
            
            // Update display
            updateDisplay();
            
            moves++;
            sliderMoves.textContent = moves;
            
            // Check if puzzle is solved
            if (isSolved()) {
                clearInterval(timerInterval);
                setTimeout(() => {
                    alert(`Congratulations! You solved the puzzle in ${moves} moves and ${timer} seconds!`);
                }, 300);
            }
        }
    }
    
    // Update the display
    function updateDisplay() {
        const tileElements = document.querySelectorAll('.slider-tile');
        
        tileElements.forEach((tile, index) => {
            const value = tiles[index];
            tile.textContent = value === 0 ? '' : value;
            tile.className = value === 0 ? 'slider-tile empty' : 'slider-tile';
            tile.dataset.value = value;
            tile.dataset.index = index;
            
            if (value === 0) {
                emptyIndex = index;
                tile.removeEventListener('click', () => moveTile(index));
            } else {
                tile.addEventListener('click', () => moveTile(index));
            }
        });
    }
    
    // Event listener for reset button
    resetBtn.addEventListener('click', initBoard);
    
    // Initialize the board
    initBoard();
}

// ========== HANGMAN GAME ==========
function initHangman() {
    const wordDisplay = document.getElementById('hangman-word');
    const keyboard = document.getElementById('hangman-keyboard');
    const guessesDisplay = document.getElementById('hangman-guesses');
    const categoryDisplay = document.getElementById('hangman-category');
    const resetBtn = document.getElementById('hangman-reset');
    const hangmanParts = ['head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];
    
    // Word categories
    const wordCategories = {
        'Animals': ['ELEPHANT', 'GIRAFFE', 'KANGAROO', 'DOLPHIN', 'PENGUIN', 'CHEETAH'],
        'Countries': ['CANADA', 'BRAZIL', 'JAPAN', 'AUSTRALIA', 'GERMANY', 'ITALY'],
        'Fruits': ['BANANA', 'ORANGE', 'PINEAPPLE', 'WATERMELON', 'STRAWBERRY', 'BLUEBERRY'],
        'Sports': ['BASKETBALL', 'FOOTBALL', 'BASEBALL', 'VOLLEYBALL', 'TENNIS', 'HOCKEY']
    };
    
    let currentWord = '';
    let currentCategory = '';
    let guessedLetters = [];
    let wrongGuesses = 0;
    const maxWrongGuesses = 6;
    let gameOver = false;
    
    // Initialize the game
    function initGame() {
        // Select a random category
        const categories = Object.keys(wordCategories);
        currentCategory = categories[Math.floor(Math.random() * categories.length)];
        
        // Select a random word from the category
        const words = wordCategories[currentCategory];
        currentWord = words[Math.floor(Math.random() * words.length)];
        
        // Reset game state
        guessedLetters = [];
        wrongGuesses = 0;
        gameOver = false;
        
        // Update displays
        updateWordDisplay();
        updateKeyboard();
        updateHangman();
        guessesDisplay.textContent = maxWrongGuesses - wrongGuesses;
        categoryDisplay.textContent = currentCategory;
        
        // Hide all hangman parts
        hangmanParts.forEach(part => {
            document.getElementById(part).style.display = 'none';
        });
    }
    
    // Update the word display
    function updateWordDisplay() {
        let display = '';
        
        for (let letter of currentWord) {
            if (guessedLetters.includes(letter) || letter === ' ') {
                display += letter + ' ';
            } else {
                display += '_ ';
            }
        }
        
        wordDisplay.textContent = display.trim();
        
        // Check if player has won
        if (!display.includes('_')) {
            gameOver = true;
            setTimeout(() => {
                alert(`Congratulations! You guessed the word: ${currentWord}`);
            }, 300);
        }
    }
    
    // Update the keyboard
    function updateKeyboard() {
        keyboard.innerHTML = '';
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        for (let letter of letters) {
            const key = document.createElement('button');
            key.className = 'key';
            key.textContent = letter;
            key.disabled = guessedLetters.includes(letter) || gameOver;
            
            if (guessedLetters.includes(letter)) {
                if (currentWord.includes(letter)) {
                    key.classList.add('correct');
                } else {
                    key.classList.add('wrong');
                }
            }
            
            key.addEventListener('click', () => guessLetter(letter));
            keyboard.appendChild(key);
        }
    }
    
    // Update the hangman display
    function updateHangman() {
        // Show hangman parts based on wrong guesses
        for (let i = 0; i < wrongGuesses; i++) {
            if (i < hangmanParts.length) {
                document.getElementById(hangmanParts[i]).style.display = 'block';
            }
        }
    }
    
    // Guess a letter
    function guessLetter(letter) {
        if (gameOver || guessedLetters.includes(letter)) return;
        
        guessedLetters.push(letter);
        
        if (!currentWord.includes(letter)) {
            wrongGuesses++;
            guessesDisplay.textContent = maxWrongGuesses - wrongGuesses;
            
            if (wrongGuesses >= maxWrongGuesses) {
                gameOver = true;
                setTimeout(() => {
                    alert(`Game Over! The word was: ${currentWord}`);
                }, 300);
            }
        }
        
        updateWordDisplay();
        updateKeyboard();
        updateHangman();
    }
    
    // Event listener for reset button
    resetBtn.addEventListener('click', initGame);
    
    // Initialize the game
    initGame();
}

// ========== MINI SUDOKU GAME ==========
function initSudoku() {
    const sudokuGrid = document.getElementById('sudoku-grid');
    const mistakesDisplay = document.getElementById('sudoku-mistakes');
    const timeDisplay = document.getElementById('sudoku-time');
    const resetBtn = document.getElementById('sudoku-reset');
    const numberButtons = document.querySelectorAll('.num-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    let board = [];
    let solution = [];
    let selectedCell = null;
    let mistakes = 0;
    const maxMistakes = 3;
    let timer = 0;
    let timerInterval = null;
    const size = 4;
    
    // Initialize the game
    function initGame() {
        generatePuzzle();
        renderBoard();
        
        mistakes = 0;
        mistakesDisplay.textContent = '0';
        
        // Start timer
        clearInterval(timerInterval);
        timer = 0;
        timeDisplay.textContent = '0';
        timerInterval = setInterval(() => {
            timer++;
            timeDisplay.textContent = timer;
        }, 1000);
    }
    
    // Generate a Sudoku puzzle
    function generatePuzzle() {
        // Start with a valid solved board
        board = [
            [1, 2, 3, 4],
            [3, 4, 1, 2],
            [2, 1, 4, 3],
            [4, 3, 2, 1]
        ];
        
        // Make a copy for the solution
        solution = JSON.parse(JSON.stringify(board));
        
        // Shuffle the board while keeping it valid
        shuffleBoard();
        
        // Remove some numbers to create the puzzle
        const cellsToRemove = 8; // 8 out of 16 cells
        let removed = 0;
        
        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * size);
            const col = Math.floor(Math.random() * size);
            
            if (board[row][col] !== 0) {
                board[row][col] = 0;
                removed++;
            }
        }
    }
    
    // Shuffle the board while keeping it valid
    function shuffleBoard() {
        // Randomly swap rows within the same 2-row block
        for (let block = 0; block < 2; block++) {
            if (Math.random() > 0.5) {
                const row1 = block * 2;
                const row2 = block * 2 + 1;
                [board[row1], board[row2]] = [board[row2], board[row1]];
                [solution[row1], solution[row2]] = [solution[row2], solution[row1]];
            }
        }
        
        // Randomly swap columns within the same 2-column block
        for (let block = 0; block < 2; block++) {
            if (Math.random() > 0.5) {
                for (let row = 0; row < size; row++) {
                    const col1 = block * 2;
                    const col2 = block * 2 + 1;
                    [board[row][col1], board[row][col2]] = [board[row][col2], board[row][col1]];
                    [solution[row][col1], solution[row][col2]] = [solution[row][col2], solution[row][col1]];
                }
            }
        }
    }
    
    // Render the board
    function renderBoard() {
        sudokuGrid.innerHTML = '';
        selectedCell = null;
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const cell = document.createElement('button');
                cell.className = 'sudoku-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                const value = board[row][col];
                cell.textContent = value === 0 ? '' : value;
                
                if (value !== 0) {
                    cell.classList.add('fixed');
                    cell.disabled = true;
                } else {
                    cell.addEventListener('click', selectCell);
                }
                
                sudokuGrid.appendChild(cell);
            }
        }
    }
    
    // Select a cell
    function selectCell() {
        // Deselect previous cell
        if (selectedCell) {
            selectedCell.classList.remove('selected');
        }
        
        // Select new cell
        this.classList.add('selected');
        selectedCell = this;
    }
    
    // Place a number in the selected cell
    function placeNumber(number) {
        if (!selectedCell || selectedCell.classList.contains('fixed')) return;
        
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        
        // Check if the move is correct
        if (number === solution[row][col]) {
            selectedCell.textContent = number;
            board[row][col] = number;
            selectedCell.classList.remove('error');
            
            // Check if puzzle is complete
            if (isPuzzleComplete()) {
                clearInterval(timerInterval);
                setTimeout(() => {
                    alert(`Congratulations! You solved the Sudoku in ${timer} seconds with ${mistakes} mistakes!`);
                }, 300);
            }
        } else {
            // Incorrect move
            selectedCell.textContent = number;
            selectedCell.classList.add('error');
            mistakes++;
            mistakesDisplay.textContent = mistakes;
            
            if (mistakes >= maxMistakes) {
                clearInterval(timerInterval);
                setTimeout(() => {
                    alert(`Game Over! You made ${mistakes} mistakes. Try again!`);
                    initGame();
                }, 300);
            }
        }
    }
    
    // Clear the selected cell
    function clearCell() {
        if (!selectedCell || selectedCell.classList.contains('fixed')) return;
        
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        
        selectedCell.textContent = '';
        selectedCell.classList.remove('error');
        board[row][col] = 0;
    }
    
    // Check if puzzle is complete
    function isPuzzleComplete() {
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (board[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // Event listeners
    numberButtons.forEach(button => {
        if (button.id !== 'clear-btn') {
            button.addEventListener('click', () => {
                const number = parseInt(button.dataset.number);
                placeNumber(number);
            });
        }
    });
    
    clearBtn.addEventListener('click', clearCell);
    resetBtn.addEventListener('click', initGame);
    
    // Initialize the game
    initGame();
}

// ========== TIC-TAC-TOE GAME ==========
function initTicTacToe() {
    const ticTacToeGrid = document.getElementById('tic-tac-toe-grid');
    const turnDisplay = document.getElementById('tic-tac-toe-turn');
    const scoreDisplay = document.getElementById('tic-tac-toe-score');
    const resetBtn = document.getElementById('tic-tac-toe-reset');
    const modeButtons = document.querySelectorAll('.mode-btn');
    
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameOver = false;
    let gameMode = 'pvp'; // Player vs Player
    let scores = { X: 0, O: 0 };
    
    // Winning combinations
    const winCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    // Initialize the game
    function initGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        gameOver = false;
        turnDisplay.textContent = currentPlayer;
        renderBoard();
    }
    
    // Render the board
    function renderBoard() {
        ticTacToeGrid.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = `ttt-cell ${board[i].toLowerCase()}`;
            cell.textContent = board[i];
            cell.dataset.index = i;
            
            if (board[i] === '' && !gameOver) {
                cell.classList.remove('occupied');
                cell.addEventListener('click', () => makeMove(i));
            } else {
                cell.classList.add('occupied');
            }
            
            ticTacToeGrid.appendChild(cell);
        }
    }
    
    // Make a move
    function makeMove(index) {
        if (board[index] !== '' || gameOver) return;
        
        // Player's move
        board[index] = currentPlayer;
        renderBoard();
        
        // Check for win or tie
        if (checkWin()) {
            gameOver = true;
            scores[currentPlayer]++;
            updateScore();
            setTimeout(() => {
                alert(`Player ${currentPlayer} wins!`);
            }, 300);
            return;
        }
        
        if (checkTie()) {
            gameOver = true;
            setTimeout(() => {
                alert("It's a tie!");
            }, 300);
            return;
        }
        
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        turnDisplay.textContent = currentPlayer;
        
        // Computer's move (if in Player vs Computer mode and it's computer's turn)
        if (gameMode === 'pvc' && currentPlayer === 'O' && !gameOver) {
            setTimeout(makeComputerMove, 500);
        }
    }
    
    // Make computer move
    function makeComputerMove() {
        if (gameOver) return;
        
        // Find available moves
        const availableMoves = [];
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                availableMoves.push(i);
            }
        }
        
        // Choose a random move
        if (availableMoves.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableMoves.length);
            const moveIndex = availableMoves[randomIndex];
            
            board[moveIndex] = 'O';
            renderBoard();
            
            // Check for win or tie
            if (checkWin()) {
                gameOver = true;
                scores['O']++;
                updateScore();
                setTimeout(() => {
                    alert('Computer wins!');
                }, 300);
                return;
            }
            
            if (checkTie()) {
                gameOver = true;
                setTimeout(() => {
                    alert("It's a tie!");
                }, 300);
                return;
            }
            
            // Switch back to player
            currentPlayer = 'X';
            turnDisplay.textContent = currentPlayer;
        }
    }
    
    // Check for win
    function checkWin() {
        for (const combination of winCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return true;
            }
        }
        return false;
    }
    
    // Check for tie
    function checkTie() {
        return !board.includes('') && !checkWin();
    }
    
    // Update score display
    function updateScore() {
        scoreDisplay.textContent = `X:${scores.X} O:${scores.O}`;
    }
    
    // Change game mode
    function changeGameMode(mode) {
        gameMode = mode;
        modeButtons.forEach(button => {
            if (button.dataset.mode === mode) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Reset the game when changing mode
        initGame();
    }
    
    // Event listeners
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            changeGameMode(button.dataset.mode);
        });
    });
    
    resetBtn.addEventListener('click', () => {
        initGame();
    });
    
    // Initialize the game
    initGame();
    updateScore();
}