// Main Game Hub Application
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Initialize all games
    initSudoku();
    initMemoryGame();
    initTicTacToe();
    initHangman();
    initWordSearch();
    initMinesweeper();
    initSlidingPuzzle();
    initQuiz();
    initSnake();
    initConnectFour();
    
    setupEventListeners();
    
    // Show home page by default
    showHomePage();
    
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
let totalGamesPlayed = 0;

// Event Listeners Setup
function setupEventListeners() {
    // Desktop navigation items
    document.querySelectorAll('.nav-item, .dropdown-game').forEach(item => {
        item.addEventListener('click', function() {
            const game = this.getAttribute('data-game');
            if (game) {
                selectGameFromNav(game);
            }
        });
    });
    
    // Mobile navigation items
    document.querySelectorAll('.mobile-game-item').forEach(item => {
        item.addEventListener('click', function() {
            const game = this.getAttribute('data-game');
            selectGameFromNav(game);
            closeMobileNav();
        });
    });
    
    // Game card selection (home page)
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', function() {
            const game = this.getAttribute('data-game');
            selectGameFromNav(game);
        });
    });
    
    // Mobile menu button
    document.getElementById('mobile-menu-btn').addEventListener('click', openMobileNav);
    
    // Close mobile nav button
    document.getElementById('close-nav').addEventListener('click', closeMobileNav);
    
    // Back to home button
    document.getElementById('back-btn').addEventListener('click', showHomePage);
    
    // Restart game button
    document.getElementById('restart-btn').addEventListener('click', restartCurrentGame);
    
    // Game control buttons for all games
    setupGameSpecificControls();
}

function setupGameSpecificControls() {
    // Sudoku controls
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const difficulty = this.getAttribute('data-diff');
            startSudoku(difficulty);
        });
    });
    
    document.getElementById('check-sudoku').addEventListener('click', checkSudokuSolution);
    document.getElementById('solve-sudoku').addEventListener('click', solveSudoku);
    
    // Memory game controls
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const size = parseInt(this.getAttribute('data-size'));
            startMemoryGame(size);
        });
    });
    
    // Tic Tac Toe controls
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const mode = this.getAttribute('data-mode');
            setTicTacToeMode(mode);
        });
    });
    
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
    
    // Hangman controls
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            startHangman(category);
        });
    });
    
    document.getElementById('new-word-btn').addEventListener('click', function() {
        const activeCategory = document.querySelector('.category-btn.active').getAttribute('data-category');
        startHangman(activeCategory);
    });
    
    document.getElementById('hint-btn').addEventListener('click', giveHangmanHint);
    
    // Word Search controls
    document.querySelectorAll('.ws-category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.ws-category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            startWordSearch(category);
        });
    });
    
    document.getElementById('check-wordsearch').addEventListener('click', checkWordSearch);
    document.getElementById('solve-wordsearch').addEventListener('click', solveWordSearch);
    
    // Minesweeper controls
    document.querySelectorAll('.ms-diff-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.ms-diff-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const difficulty = this.getAttribute('data-diff');
            startMinesweeper(difficulty);
        });
    });
    
    document.getElementById('new-minesweeper').addEventListener('click', function() {
        const activeDiff = document.querySelector('.ms-diff-btn.active').getAttribute('data-diff');
        startMinesweeper(activeDiff);
    });
    
    document.getElementById('dig-mode').addEventListener('click', function() {
        document.getElementById('dig-mode').classList.add('active');
        document.getElementById('flag-mode').classList.remove('active');
        minesweeperMode = 'dig';
    });
    
    document.getElementById('flag-mode').addEventListener('click', function() {
        document.getElementById('flag-mode').classList.add('active');
        document.getElementById('dig-mode').classList.remove('active');
        minesweeperMode = 'flag';
    });
    
    // Sliding Puzzle controls
    document.querySelectorAll('.puzzle-size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.puzzle-size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const size = parseInt(this.getAttribute('data-size'));
            startSlidingPuzzle(size);
        });
    });
    
    document.getElementById('shuffle-puzzle').addEventListener('click', shuffleSlidingPuzzle);
    document.getElementById('solve-puzzle').addEventListener('click', solveSlidingPuzzle);
    
    // Quiz controls
    document.querySelectorAll('.quiz-category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.quiz-category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            startQuiz(category);
        });
    });
    
    document.getElementById('next-question').addEventListener('click', nextQuizQuestion);
    document.getElementById('restart-quiz').addEventListener('click', function() {
        const activeCategory = document.querySelector('.quiz-category-btn.active').getAttribute('data-category');
        startQuiz(activeCategory);
    });
    
    // Snake controls
    document.querySelectorAll('.snake-diff-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.snake-diff-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const difficulty = this.getAttribute('data-diff');
            startSnake(difficulty);
        });
    });
    
    document.getElementById('pause-snake').addEventListener('click', toggleSnakePause);
    document.getElementById('restart-snake').addEventListener('click', function() {
        const activeDiff = document.querySelector('.snake-diff-btn.active').getAttribute('data-diff');
        startSnake(activeDiff);
    });
    
    // Mobile snake controls
    document.getElementById('up-btn').addEventListener('click', () => changeSnakeDirection('up'));
    document.getElementById('down-btn').addEventListener('click', () => changeSnakeDirection('down'));
    document.getElementById('left-btn').addEventListener('click', () => changeSnakeDirection('left'));
    document.getElementById('right-btn').addEventListener('click', () => changeSnakeDirection('right'));
    
    // Connect Four controls
    document.querySelectorAll('.connect4-mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.connect4-mode-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const mode = this.getAttribute('data-mode');
            setConnectFourMode(mode);
        });
    });
    
    document.getElementById('reset-connect4').addEventListener('click', startConnectFour);
    document.getElementById('reset-scores-connect4').addEventListener('click', resetConnectFourScores);
    
    document.querySelectorAll('.drop-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const col = parseInt(this.getAttribute('data-col'));
            makeConnectFourMove(col);
        });
    });
}

// Navigation Functions
function selectGameFromNav(game) {
    if (game === 'all' || game === 'home') {
        showHomePage();
    } else {
        selectGame(game);
    }
    
    // Update active state in desktop navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-game') === game) {
            item.classList.add('active');
        }
    });
}

function openMobileNav() {
    document.getElementById('mobile-nav').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
    document.getElementById('mobile-nav').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Show home page with game selection cards
function showHomePage() {
    currentGame = null;
    
    // Show game selection, hide game area
    document.getElementById('game-selection').classList.add('active');
    document.getElementById('game-area').classList.remove('active');
    
    // Reset timer and moves
    clearInterval(gameTimer);
    document.getElementById('timer').textContent = 'Time: 00:00';
    document.getElementById('moves').textContent = 'Moves: 0';
    document.getElementById('score').textContent = 'Score: 0';
    document.getElementById('score').style.display = 'none';
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-game') === 'all') {
            item.classList.add('active');
        }
    });
}

// Game Selection
function selectGame(game) {
    currentGame = game;
    totalGamesPlayed++;
    updatePlayerStats();
    
    // Hide game selection, show game area
    document.getElementById('game-selection').classList.remove('active');
    document.getElementById('game-area').classList.add('active');
    
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
        'tictactoe': 'Tic Tac Toe',
        'hangman': 'Hangman',
        'wordsearch': 'Word Search',
        'minesweeper': 'Minesweeper',
        'slidingpuzzle': 'Sliding Puzzle',
        'quiz': 'Trivia Quiz',
        'snake': 'Snake Game',
        'connect4': 'Connect Four'
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
        case 'hangman':
            startHangman('animals');
            break;
        case 'wordsearch':
            startWordSearch('animals');
            break;
        case 'minesweeper':
            startMinesweeper('easy');
            break;
        case 'slidingpuzzle':
            startSlidingPuzzle(3);
            break;
        case 'quiz':
            startQuiz('general');
            break;
        case 'snake':
            startSnake('easy');
            break;
        case 'connect4':
            startConnectFour();
            break;
    }
    
    // Start game timer
    startGameTimer();
    
    // Show/hide score based on game
    document.getElementById('score').style.display = 
        ['hangman', 'quiz', 'snake'].includes(game) ? 'inline' : 'none';
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
        case 'hangman':
            const activeCategory = document.querySelector('.category-btn.active').getAttribute('data-category');
            startHangman(activeCategory);
            break;
        case 'wordsearch':
            const wsCategory = document.querySelector('.ws-category-btn.active').getAttribute('data-category');
            startWordSearch(wsCategory);
            break;
        case 'minesweeper':
            const msDiff = document.querySelector('.ms-diff-btn.active').getAttribute('data-diff');
            startMinesweeper(msDiff);
            break;
        case 'slidingpuzzle':
            const puzzleSize = parseInt(document.querySelector('.puzzle-size-btn.active').getAttribute('data-size'));
            startSlidingPuzzle(puzzleSize);
            break;
        case 'quiz':
            const quizCategory = document.querySelector('.quiz-category-btn.active').getAttribute('data-category');
            startQuiz(quizCategory);
            break;
        case 'snake':
            const snakeDiff = document.querySelector('.snake-diff-btn.active').getAttribute('data-diff');
            startSnake(snakeDiff);
            break;
        case 'connect4':
            startConnectFour();
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
        
        // Update puzzle timer if in sliding puzzle
        if (currentGame === 'slidingpuzzle') {
            document.getElementById('puzzle-time').textContent = `${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
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
    
    // Update mobile stats
    document.getElementById('mobile-total-time').textContent = 
        `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}`;
    
    // Update games completed
    document.getElementById('games-completed').textContent = gamesCompleted;
    document.getElementById('mobile-games-completed').textContent = gamesCompleted;
    
    // Update total games played
    document.getElementById('total-games').textContent = totalGamesPlayed;
    
    // Update current streak (simulated)
    document.getElementById('current-streak').textContent = `${currentStreak} days`;
}

// ==================== EXISTING GAMES ====================
// (Sudoku, Memory, Tic Tac Toe code remains the same as before)

// ==================== HANGMAN GAME ====================
let hangmanWord = '';
let hangmanGuessedLetters = [];
let hangmanWrongGuesses = 0;
const HANGMAN_MAX_WRONG = 6;
let hangmanScore = 0;

const hangmanWords = {
    animals: ['ELEPHANT', 'GIRAFFE', 'KANGAROO', 'DOLPHIN', 'PENGUIN', 'BUTTERFLY', 'CROCODILE', 'HIPPOPOTAMUS'],
    countries: ['CANADA', 'BRAZIL', 'AUSTRALIA', 'GERMANY', 'JAPAN', 'ITALY', 'EGYPT', 'THAILAND'],
    fruits: ['PINEAPPLE', 'WATERMELON', 'STRAWBERRY', 'BLUEBERRY', 'RASPBERRY', 'POMEGRANATE', 'AVOCADO', 'MANGO']
};

function initHangman() {
    // Setup keyboard event listeners
    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('click', function() {
            const letter = this.getAttribute('data-key');
            makeHangmanGuess(letter);
        });
    });
}

function startHangman(category) {
    // Reset game state
    hangmanGuessedLetters = [];
    hangmanWrongGuesses = 0;
    
    // Select random word from category
    const words = hangmanWords[category] || hangmanWords.animals;
    hangmanWord = words[Math.floor(Math.random() * words.length)];
    
    // Update UI
    updateHangmanDisplay();
    updateHangmanFigure();
    
    // Reset keyboard
    document.querySelectorAll('.key').forEach(key => {
        key.disabled = false;
        key.classList.remove('correct', 'incorrect');
    });
    
    // Update stats
    document.getElementById('lives').textContent = HANGMAN_MAX_WRONG - hangmanWrongGuesses;
    document.getElementById('hangman-score').textContent = hangmanScore;
    document.getElementById('moves').textContent = 'Guesses: 0';
}

function makeHangmanGuess(letter) {
    if (hangmanGuessedLetters.includes(letter) || hangmanWrongGuesses >= HANGMAN_MAX_WRONG) {
        return;
    }
    
    hangmanGuessedLetters.push(letter);
    
    // Update moves
    const moves = parseInt(document.getElementById('moves').textContent.split(': ')[1]) || 0;
    document.getElementById('moves').textContent = `Guesses: ${moves + 1}`;
    
    // Check if letter is in word
    const keyElement = document.querySelector(`.key[data-key="${letter}"]`);
    if (hangmanWord.includes(letter)) {
        keyElement.classList.add('correct');
    } else {
        keyElement.classList.add('incorrect');
        hangmanWrongGuesses++;
        updateHangmanFigure();
        document.getElementById('lives').textContent = HANGMAN_MAX_WRONG - hangmanWrongGuesses;
    }
    
    // Update display
    updateHangmanDisplay();
    
    // Check win/lose conditions
    checkHangmanStatus();
}

function updateHangmanDisplay() {
    const wordDisplay = document.getElementById('word-display');
    wordDisplay.innerHTML = '';
    
    for (let letter of hangmanWord) {
        const letterElement = document.createElement('div');
        letterElement.className = 'word-letter';
        
        if (hangmanGuessedLetters.includes(letter)) {
            letterElement.textContent = letter;
        } else {
            letterElement.textContent = '_';
        }
        
        wordDisplay.appendChild(letterElement);
    }
}

function updateHangmanFigure() {
    // Show hangman parts based on wrong guesses
    const parts = ['head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];
    
    for (let i = 0; i < parts.length; i++) {
        const part = document.getElementById(parts[i]);
        if (i < hangmanWrongGuesses) {
            part.style.display = 'block';
        } else {
            part.style.display = 'none';
        }
    }
}

function checkHangmanStatus() {
    // Check if won
    const wordGuessed = hangmanWord.split('').every(letter => hangmanGuessedLetters.includes(letter));
    
    if (wordGuessed) {
        setTimeout(() => {
            alert(`Congratulations! You guessed the word: ${hangmanWord}`);
            hangmanScore += 100;
            gamesCompleted++;
            updatePlayerStats();
            document.getElementById('score').textContent = `Score: ${hangmanScore}`;
            document.getElementById('hangman-score').textContent = hangmanScore;
        }, 300);
        return;
    }
    
    // Check if lost
    if (hangmanWrongGuesses >= HANGMAN_MAX_WRONG) {
        setTimeout(() => {
            alert(`Game Over! The word was: ${hangmanWord}`);
        }, 300);
    }
}

function giveHangmanHint() {
    // Find a letter that hasn't been guessed yet
    const unguessedLetters = hangmanWord.split('').filter(letter => !hangmanGuessedLetters.includes(letter));
    
    if (unguessedLetters.length > 0) {
        const hintLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
        makeHangmanGuess(hintLetter);
        hangmanScore = Math.max(0, hangmanScore - 20); // Penalty for using hint
        document.getElementById('score').textContent = `Score: ${hangmanScore}`;
        document.getElementById('hangman-score').textContent = hangmanScore;
    }
}

// ==================== WORD SEARCH GAME ====================
let wordSearchGrid = [];
let wordSearchWords = [];
let foundWords = [];

const wordSearchCategories = {
    animals: ['CAT', 'DOG', 'BIRD', 'FISH', 'BEAR', 'DEER', 'FOX', 'WOLF', 'LION', 'TIGER'],
    fruits: ['APPLE', 'BANANA', 'CHERRY', 'GRAPE', 'LEMON', 'MANGO', 'PEACH', 'PEAR', 'PLUM', 'KIWI'],
    countries: ['USA', 'UK', 'CANADA', 'CHINA', 'INDIA', 'JAPAN', 'FRANCE', 'GERMANY', 'ITALY', 'SPAIN']
};

function initWordSearch() {
    // Setup grid click handlers
    document.getElementById('wordsearch-grid').addEventListener('mousedown', startWordSelection);
    document.getElementById('wordsearch-grid').addEventListener('touchstart', startWordSelection);
    
    document.addEventListener('mousemove', updateWordSelection);
    document.addEventListener('touchmove', updateWordSelection);
    
    document.addEventListener('mouseup', endWordSelection);
    document.addEventListener('touchend', endWordSelection);
}

let isSelecting = false;
let startCell = null;
let selectedCells = [];

function startWordSelection(e) {
    e.preventDefault();
    isSelecting = true;
    const cell = e.target.closest('.ws-cell');
    if (cell) {
        startCell = cell;
        selectedCells = [cell];
        cell.classList.add('selected');
    }
}

function updateWordSelection(e) {
    if (!isSelecting) return;
    e.preventDefault();
    
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    const element = document.elementFromPoint(clientX, clientY);
    const cell = element ? element.closest('.ws-cell') : null;
    
    if (cell && !selectedCells.includes(cell)) {
        selectedCells.forEach(c => c.classList.remove('selected'));
        selectedCells = [startCell, cell];
        
        // Select all cells between start and current
        const startIndex = parseInt(startCell.getAttribute('data-index'));
        const endIndex = parseInt(cell.getAttribute('data-index'));
        
        const startRow = Math.floor(startIndex / 15);
        const startCol = startIndex % 15;
        const endRow = Math.floor(endIndex / 15);
        const endCol = endIndex % 15;
        
        const rowDiff = endRow - startRow;
        const colDiff = endCol - startCol;
        
        const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
        
        selectedCells = [];
        for (let i = 0; i <= steps; i++) {
            const row = startRow + Math.round(rowDiff * i / steps);
            const col = startCol + Math.round(colDiff * i / steps);
            const index = row * 15 + col;
            const cell = document.querySelector(`.ws-cell[data-index="${index}"]`);
            if (cell) {
                cell.classList.add('selected');
                selectedCells.push(cell);
            }
        }
    }
}

function endWordSelection() {
    if (!isSelecting) return;
    isSelecting = false;
    
    // Get the selected word
    const selectedWord = selectedCells.map(cell => cell.textContent).join('');
    
    // Check if it matches any word
    const matchedWord = wordSearchWords.find(word => 
        word === selectedWord || word === selectedWord.split('').reverse().join('')
    );
    
    if (matchedWord && !foundWords.includes(matchedWord)) {
        foundWords.push(matchedWord);
        selectedCells.forEach(cell => cell.classList.add('found'));
        
        // Update word list
        document.querySelectorAll('.word-item').forEach(item => {
            if (item.textContent === matchedWord) {
                item.classList.add('found');
            }
        });
        
        // Update stats
        document.getElementById('words-found').textContent = `${foundWords.length}/${wordSearchWords.length}`;
        document.getElementById('moves').textContent = `Words: ${foundWords.length}`;
        
        // Check if all words found
        if (foundWords.length === wordSearchWords.length) {
            setTimeout(() => {
                alert('Congratulations! You found all the words!');
                gamesCompleted++;
                updatePlayerStats();
            }, 300);
        }
    } else {
        // Clear selection
        selectedCells.forEach(cell => {
            cell.classList.remove('selected');
        });
    }
    
    selectedCells = [];
}

function startWordSearch(category) {
    // Reset game state
    foundWords = [];
    wordSearchWords = wordSearchCategories[category] || wordSearchCategories.animals;
    
    // Generate grid
    generateWordSearchGrid();
    
    // Update UI
    updateWordList();
    document.getElementById('words-found').textContent = `0/${wordSearchWords.length}`;
    document.getElementById('moves').textContent = 'Words: 0';
}

function generateWordSearchGrid() {
    const grid = document.getElementById('wordsearch-grid');
    grid.innerHTML = '';
    wordSearchGrid = [];
    
    // Create empty 15x15 grid
    for (let i = 0; i < 225; i++) {
        const cell = document.createElement('div');
        cell.className = 'ws-cell';
        cell.setAttribute('data-index', i);
        cell.textContent = getRandomLetter();
        grid.appendChild(cell);
        wordSearchGrid.push(cell.textContent);
    }
    
    // Place words in grid
    wordSearchWords.forEach(word => {
        placeWordInGrid(word);
    });
    
    // Update grid display
    for (let i = 0; i < 225; i++) {
        const cell = document.querySelector(`.ws-cell[data-index="${i}"]`);
        cell.textContent = wordSearchGrid[i];
    }
}

function getRandomLetter() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[Math.floor(Math.random() * letters.length)];
}

function placeWordInGrid(word) {
    const directions = [
        { dr: 0, dc: 1 },   // horizontal
        { dr: 1, dc: 0 },   // vertical
        { dr: 1, dc: 1 },   // diagonal down-right
        { dr: 1, dc: -1 }   // diagonal down-left
    ];
    
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 100) {
        attempts++;
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * 15);
        const col = Math.floor(Math.random() * 15);
        
        // Check if word fits
        const endRow = row + direction.dr * (word.length - 1);
        const endCol = col + direction.dc * (word.length - 1);
        
        if (endRow < 0 || endRow >= 15 || endCol < 0 || endCol >= 15) {
            continue;
        }
        
        // Check for conflicts
        let conflict = false;
        for (let i = 0; i < word.length; i++) {
            const r = row + direction.dr * i;
            const c = col + direction.dc * i;
            const index = r * 15 + c;
            const currentLetter = wordSearchGrid[index];
            
            if (currentLetter !== ' ' && currentLetter !== word[i]) {
                conflict = true;
                break;
            }
        }
        
        if (!conflict) {
            // Place word
            for (let i = 0; i < word.length; i++) {
                const r = row + direction.dr * i;
                const c = col + direction.dc * i;
                const index = r * 15 + c;
                wordSearchGrid[index] = word[i];
            }
            placed = true;
        }
    }
}

function updateWordList() {
    const wordList = document.getElementById('word-list');
    wordList.innerHTML = '';
    
    wordSearchWords.forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.textContent = word;
        wordList.appendChild(wordItem);
    });
}

function checkWordSearch() {
    alert(`You have found ${foundWords.length} out of ${wordSearchWords.length} words.`);
}

function solveWordSearch() {
    // Mark all words as found
    wordSearchWords.forEach(word => {
        if (!foundWords.includes(word)) {
            foundWords.push(word);
        }
    });
    
    // Update display
    document.querySelectorAll('.ws-cell').forEach(cell => {
        cell.classList.remove('selected');
    });
    
    document.querySelectorAll('.word-item').forEach(item => {
        item.classList.add('found');
    });
    
    document.getElementById('words-found').textContent = `${wordSearchWords.length}/${wordSearchWords.length}`;
    document.getElementById('moves').textContent = `Words: ${wordSearchWords.length}`;
    
    alert('All words have been revealed!');
    gamesCompleted++;
    updatePlayerStats();
}

// ==================== MINESWEEPER GAME ====================
let minesweeperGrid = [];
let minesweeperRevealed = [];
let minesweeperFlagged = [];
let minesCount = 10;
let gameOver = false;
let minesweeperMode = 'dig';

function initMinesweeper() {
    // Grid will be initialized when game starts
}

function startMinesweeper(difficulty) {
    // Set grid size and mine count based on difficulty
    let gridSize, mines;
    switch(difficulty) {
        case 'easy':
            gridSize = 9;
            mines = 10;
            break;
        case 'medium':
            gridSize = 16;
            mines = 40;
            break;
        case 'hard':
            gridSize = 24;
            mines = 99;
            break;
        default:
            gridSize = 9;
            mines = 10;
    }
    
    // Reset game state
    minesCount = mines;
    gameOver = false;
    minesweeperGrid = [];
    minesweeperRevealed = [];
    minesweeperFlagged = [];
    
    // Create grid
    const gridElement = document.getElementById('minesweeper-grid');
    gridElement.innerHTML = '';
    gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    // Initialize arrays
    for (let i = 0; i < gridSize * gridSize; i++) {
        minesweeperGrid[i] = 0;
        minesweeperRevealed[i] = false;
        minesweeperFlagged[i] = false;
        
        const cell = document.createElement('div');
        cell.className = 'ms-cell';
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', () => handleMinesweeperClick(i));
        cell.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            toggleFlag(i);
        });
        gridElement.appendChild(cell);
    }
    
    // Place mines
    placeMines(gridSize, mines);
    
    // Calculate numbers
    calculateNumbers(gridSize);
    
    // Update UI
    document.getElementById('mines-left').textContent = minesCount;
    document.getElementById('flags').textContent = '0';
    document.getElementById('moves').textContent = 'Clicks: 0';
}

function placeMines(gridSize, mines) {
    let minesPlaced = 0;
    while (minesPlaced < mines) {
        const index = Math.floor(Math.random() * gridSize * gridSize);
        if (minesweeperGrid[index] !== 'M') {
            minesweeperGrid[index] = 'M';
            minesPlaced++;
        }
    }
}

function calculateNumbers(gridSize) {
    for (let i = 0; i < gridSize * gridSize; i++) {
        if (minesweeperGrid[i] === 'M') continue;
        
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        let mineCount = 0;
        
        // Check all 8 neighbors
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
                    const neighborIndex = newRow * gridSize + newCol;
                    if (minesweeperGrid[neighborIndex] === 'M') {
                        mineCount++;
                    }
                }
            }
        }
        
        minesweeperGrid[i] = mineCount;
    }
}

function handleMinesweeperClick(index) {
    if (gameOver || minesweeperFlagged[index]) return;
    
    if (minesweeperMode === 'dig') {
        revealCell(index);
        
        // Update moves
        const moves = parseInt(document.getElementById('moves').textContent.split(': ')[1]) || 0;
        document.getElementById('moves').textContent = `Clicks: ${moves + 1}`;
    } else if (minesweeperMode === 'flag') {
        toggleFlag(index);
    }
}

function revealCell(index) {
    if (minesweeperRevealed[index] || minesweeperFlagged[index]) return;
    
    minesweeperRevealed[index] = true;
    const cell = document.querySelector(`.ms-cell[data-index="${index}"]`);
    cell.classList.add('revealed');
    
    if (minesweeperGrid[index] === 'M') {
        // Game over
        cell.classList.add('mine');
        gameOver = true;
        revealAllMines();
        setTimeout(() => alert('Game Over! You hit a mine.'), 100);
        return;
    }
    
    // Show number
    if (minesweeperGrid[index] > 0) {
        cell.textContent = minesweeperGrid[index];
        // Add color based on number
        const colors = ['blue', 'green', 'red', 'purple', 'maroon', 'turquoise', 'black', 'gray'];
        if (minesweeperGrid[index] <= 8) {
            cell.style.color = colors[minesweeperGrid[index] - 1];
        }
    } else {
        cell.textContent = '';
        // Reveal adjacent cells if it's a zero
        revealAdjacentCells(index);
    }
    
    // Check win condition
    checkMinesweeperWin();
}

function revealAdjacentCells(index) {
    const gridSize = Math.sqrt(minesweeperGrid.length);
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
                const neighborIndex = newRow * gridSize + newCol;
                revealCell(neighborIndex);
            }
        }
    }
}

function toggleFlag(index) {
    if (minesweeperRevealed[index] || gameOver) return;
    
    minesweeperFlagged[index] = !minesweeperFlagged[index];
    const cell = document.querySelector(`.ms-cell[data-index="${index}"]`);
    
    if (minesweeperFlagged[index]) {
        cell.classList.add('flagged');
        cell.textContent = '🚩';
        minesCount--;
    } else {
        cell.classList.remove('flagged');
        cell.textContent = '';
        minesCount++;
    }
    
    document.getElementById('mines-left').textContent = minesCount;
    document.getElementById('flags').textContent = document.querySelectorAll('.ms-cell.flagged').length;
}

function revealAllMines() {
    for (let i = 0; i < minesweeperGrid.length; i++) {
        if (minesweeperGrid[i] === 'M') {
            const cell = document.querySelector(`.ms-cell[data-index="${i}"]`);
            cell.classList.add('mine', 'revealed');
            cell.textContent = '💣';
        }
    }
}

function checkMinesweeperWin() {
    const totalCells = minesweeperGrid.length;
    let revealedCells = 0;
    
    for (let i = 0; i < totalCells; i++) {
        if (minesweeperRevealed[i]) revealedCells++;
    }
    
    if (revealedCells === totalCells - minesCount) {
        gameOver = true;
        setTimeout(() => {
            alert('Congratulations! You won!');
            gamesCompleted++;
            updatePlayerStats();
        }, 100);
    }
}

// ==================== SLIDING PUZZLE GAME ====================
let puzzleSize = 3;
let puzzleBoard = [];
let emptyIndex = 0;
let puzzleMoves = 0;

function initSlidingPuzzle() {
    // Game will be initialized when started
}

function startSlidingPuzzle(size) {
    puzzleSize = size;
    puzzleMoves = 0;
    
    // Create board
    const boardElement = document.getElementById('slidingpuzzle-board');
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    
    puzzleBoard = [];
    let numbers = [];
    
    // Create numbers 1 to size*size - 1, plus empty space
    for (let i = 1; i < size * size; i++) {
        numbers.push(i);
    }
    numbers.push(0); // 0 represents empty space
    
    // Shuffle numbers
    shuffleArray(numbers);
    
    // Create tiles
    for (let i = 0; i < size * size; i++) {
        const tile = document.createElement('div');
        tile.className = 'puzzle-tile';
        if (numbers[i] === 0) {
            tile.classList.add('empty');
            emptyIndex = i;
            tile.textContent = '';
        } else {
            tile.textContent = numbers[i];
        }
        tile.setAttribute('data-index', i);
        tile.setAttribute('data-value', numbers[i]);
        tile.addEventListener('click', () => moveTile(i));
        
        boardElement.appendChild(tile);
        puzzleBoard.push(numbers[i]);
    }
    
    // Update UI
    document.getElementById('puzzle-moves').textContent = '0';
    document.getElementById('puzzle-time').textContent = '00:00';
    document.getElementById('moves').textContent = 'Moves: 0';
}

function moveTile(index) {
    // Check if tile is adjacent to empty space
    const row = Math.floor(index / puzzleSize);
    const col = index % puzzleSize;
    const emptyRow = Math.floor(emptyIndex / puzzleSize);
    const emptyCol = emptyIndex % puzzleSize;
    
    // Check if adjacent (up, down, left, right)
    if ((Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
        (Math.abs(col - emptyCol) === 1 && row === emptyRow)) {
        
        // Swap positions
        [puzzleBoard[index], puzzleBoard[emptyIndex]] = [puzzleBoard[emptyIndex], puzzleBoard[index]];
        
        // Update DOM
        const tiles = document.querySelectorAll('.puzzle-tile');
        tiles[index].textContent = puzzleBoard[index] === 0 ? '' : puzzleBoard[index];
        tiles[index].setAttribute('data-value', puzzleBoard[index]);
        tiles[emptyIndex].textContent = puzzleBoard[emptyIndex] === 0 ? '' : puzzleBoard[emptyIndex];
        tiles[emptyIndex].setAttribute('data-value', puzzleBoard[emptyIndex]);
        
        // Update classes
        tiles[index].classList.toggle('empty', puzzleBoard[index] === 0);
        tiles[emptyIndex].classList.toggle('empty', puzzleBoard[emptyIndex] === 0);
        
        // Update empty index
        emptyIndex = index;
        
        // Update moves
        puzzleMoves++;
        document.getElementById('puzzle-moves').textContent = puzzleMoves;
        document.getElementById('moves').textContent = `Moves: ${puzzleMoves}`;
        
        // Check if solved
        checkPuzzleSolved();
    }
}

function checkPuzzleSolved() {
    for (let i = 0; i < puzzleBoard.length - 1; i++) {
        if (puzzleBoard[i] !== i + 1) {
            return false;
        }
    }
    
    // Last tile should be empty (0)
    if (puzzleBoard[puzzleBoard.length - 1] !== 0) return false;
    
    // Puzzle solved!
    setTimeout(() => {
        alert(`Congratulations! You solved the puzzle in ${puzzleMoves} moves!`);
        gamesCompleted++;
        updatePlayerStats();
    }, 300);
    return true;
}

function shuffleSlidingPuzzle() {
    // Create an array of numbers
    let numbers = [];
    for (let i = 1; i < puzzleSize * puzzleSize; i++) {
        numbers.push(i);
    }
    numbers.push(0);
    
    // Shuffle until solvable
    do {
        shuffleArray(numbers);
    } while (!isSolvable(numbers));
    
    // Update board
    const tiles = document.querySelectorAll('.puzzle-tile');
    for (let i = 0; i < tiles.length; i++) {
        puzzleBoard[i] = numbers[i];
        tiles[i].textContent = numbers[i] === 0 ? '' : numbers[i];
        tiles[i].setAttribute('data-value', numbers[i]);
        tiles[i].classList.toggle('empty', numbers[i] === 0);
        
        if (numbers[i] === 0) {
            emptyIndex = i;
        }
    }
    
    // Reset moves
    puzzleMoves = 0;
    document.getElementById('puzzle-moves').textContent = '0';
    document.getElementById('moves').textContent = 'Moves: 0';
}

function isSolvable(arr) {
    // Count inversions
    let inversions = 0;
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
        for (let j = i + 1; j < n; j++) {
            if (arr[i] > arr[j] && arr[i] !== 0 && arr[j] !== 0) {
                inversions++;
            }
        }
    }
    
    // For even-sized puzzles, check position of empty space
    if (puzzleSize % 2 === 0) {
        const emptyRow = Math.floor(emptyIndex / puzzleSize);
        return (inversions % 2 === 0) !== (emptyRow % 2 === 1);
    } else {
        // For odd-sized puzzles, puzzle is solvable if inversions is even
        return inversions % 2 === 0;
    }
}

function solveSlidingPuzzle() {
    // Simply set the board to solved state
    const tiles = document.querySelectorAll('.puzzle-tile');
    for (let i = 0; i < tiles.length; i++) {
        puzzleBoard[i] = i + 1;
        tiles[i].textContent = i + 1;
        tiles[i].setAttribute('data-value', i + 1);
        tiles[i].classList.remove('empty');
    }
    
    // Set last tile to empty
    const lastIndex = tiles.length - 1;
    puzzleBoard[lastIndex] = 0;
    tiles[lastIndex].textContent = '';
    tiles[lastIndex].setAttribute('data-value', '0');
    tiles[lastIndex].classList.add('empty');
    emptyIndex = lastIndex;
    
    alert('Puzzle solved automatically!');
}

// ==================== TRIVIA QUIZ GAME ====================
let quizQuestions = [];
let currentQuestion = 0;
let quizScore = 0;
let selectedAnswer = null;

const quizData = {
    general: [
        {
            question: "What is the capital of France?",
            options: ["London", "Berlin", "Paris", "Madrid"],
            answer: 2
        },
        {
            question: "Which planet is known as the Red Planet?",
            options: ["Venus", "Mars", "Jupiter", "Saturn"],
            answer: 1
        },
        {
            question: "What is the largest mammal in the world?",
            options: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
            answer: 1
        },
        {
            question: "Who painted the Mona Lisa?",
            options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
            answer: 1
        },
        {
            question: "What is the chemical symbol for gold?",
            options: ["Go", "Gd", "Au", "Ag"],
            answer: 2
        }
    ],
    science: [
        {
            question: "What is the atomic number of carbon?",
            options: ["6", "12", "14", "16"],
            answer: 0
        },
        {
            question: "Which gas do plants absorb during photosynthesis?",
            options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
            answer: 1
        },
        {
            question: "What is the speed of light?",
            options: ["299,792 km/s", "150,000 km/s", "1,080 km/h", "10,000 km/s"],
            answer: 0
        },
        {
            question: "What is the hardest natural substance on Earth?",
            options: ["Gold", "Iron", "Diamond", "Platinum"],
            answer: 2
        },
        {
            question: "Which planet has the most moons?",
            options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
            answer: 1
        }
    ],
    history: [
        {
            question: "In which year did World War II end?",
            options: ["1943", "1944", "1945", "1946"],
            answer: 2
        },
        {
            question: "Who was the first president of the United States?",
            options: ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"],
            answer: 2
        },
        {
            question: "Which ancient civilization built the pyramids?",
            options: ["Romans", "Greeks", "Egyptians", "Mayans"],
            answer: 2
        },
        {
            question: "Who discovered penicillin?",
            options: ["Marie Curie", "Alexander Fleming", "Louis Pasteur", "Albert Einstein"],
            answer: 1
        },
        {
            question: "When did the Berlin Wall fall?",
            options: ["1987", "1988", "1989", "1990"],
            answer: 2
        }
    ],
    geography: [
        {
            question: "What is the longest river in the world?",
            options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
            answer: 1
        },
        {
            question: "Which country has the largest population?",
            options: ["India", "United States", "China", "Indonesia"],
            answer: 2
        },
        {
            question: "What is the smallest country in the world?",
            options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
            answer: 1
        },
        {
            question: "Which desert is the largest in the world?",
            options: ["Sahara", "Arabian", "Gobi", "Antarctic"],
            answer: 3
        },
        {
            question: "What is the capital of Japan?",
            options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
            answer: 2
        }
    ]
};

function initQuiz() {
    // Setup will be done when quiz starts
}

function startQuiz(category) {
    quizQuestions = [...quizData[category] || quizData.general];
    currentQuestion = 0;
    quizScore = 0;
    selectedAnswer = null;
    
    // Shuffle questions
    shuffleArray(quizQuestions);
    
    // Display first question
    displayQuestion();
    
    // Update UI
    document.getElementById('question-number').textContent = `1/${quizQuestions.length}`;
    document.getElementById('quiz-score').textContent = '0';
    document.getElementById('score').textContent = 'Score: 0';
    document.getElementById('quiz-progress').style.width = '0%';
    document.getElementById('moves').textContent = 'Questions: 0';
}

function displayQuestion() {
    if (currentQuestion >= quizQuestions.length) {
        endQuiz();
        return;
    }
    
    const question = quizQuestions[currentQuestion];
    document.getElementById('quiz-question').textContent = question.question;
    
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.addEventListener('click', () => selectAnswer(index));
        optionsContainer.appendChild(button);
    });
    
    // Update progress
    document.getElementById('question-number').textContent = `${currentQuestion + 1}/${quizQuestions.length}`;
    const progress = ((currentQuestion) / quizQuestions.length) * 100;
    document.getElementById('quiz-progress').style.width = `${progress}%`;
    
    // Disable next button until answer is selected
    document.getElementById('next-question').disabled = true;
}

function selectAnswer(index) {
    if (selectedAnswer !== null) return;
    
    selectedAnswer = index;
    const question = quizQuestions[currentQuestion];
    const buttons = document.querySelectorAll('.option-btn');
    
    // Mark correct and incorrect answers
    buttons[question.answer].classList.add('correct');
    if (index !== question.answer) {
        buttons[index].classList.add('incorrect');
    }
    
    // Update score if correct
    if (index === question.answer) {
        quizScore += 20;
        document.getElementById('quiz-score').textContent = quizScore;
        document.getElementById('score').textContent = `Score: ${quizScore}`;
    }
    
    // Enable next button
    document.getElementById('next-question').disabled = false;
    
    // Update moves
    const moves = parseInt(document.getElementById('moves').textContent.split(': ')[1]) || 0;
    document.getElementById('moves').textContent = `Questions: ${moves + 1}`;
}

function nextQuizQuestion() {
    currentQuestion++;
    selectedAnswer = null;
    
    if (currentQuestion < quizQuestions.length) {
        displayQuestion();
    } else {
        endQuiz();
    }
}

function endQuiz() {
    const percentage = Math.round((quizScore / (quizQuestions.length * 20)) * 100);
    
    alert(`Quiz Completed!\nYour Score: ${quizScore} (${percentage}%)\nYou got ${quizScore / 20} out of ${quizQuestions.length} questions correct.`);
    
    if (percentage >= 70) {
        gamesCompleted++;
        updatePlayerStats();
    }
}

// ==================== SNAKE GAME ====================
let snake = [];
let food = {};
let direction = 'right';
let snakeSpeed = 150;
let snakeInterval;
let isPaused = false;
let snakeScore = 0;
let snakeHighScore = 0;

function initSnake() {
    // Setup keyboard controls
    document.addEventListener('keydown', handleSnakeKeyPress);
    
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
        snakeHighScore = parseInt(savedHighScore);
        document.getElementById('snake-highscore').textContent = snakeHighScore;
    }
}

function startSnake(difficulty) {
    // Set speed based on difficulty
    switch(difficulty) {
        case 'easy':
            snakeSpeed = 200;
            break;
        case 'medium':
            snakeSpeed = 150;
            break;
        case 'hard':
            snakeSpeed = 100;
            break;
    }
    
    // Reset game state
    clearInterval(snakeInterval);
    snake = [{x: 5, y: 5}];
    direction = 'right';
    snakeScore = 0;
    isPaused = false;
    
    // Create initial food
    generateFood();
    
    // Draw initial state
    drawSnake();
    
    // Start game loop
    snakeInterval = setInterval(gameLoop, snakeSpeed);
    
    // Update UI
    document.getElementById('snake-score').textContent = '0';
    document.getElementById('score').textContent = 'Score: 0';
    document.getElementById('pause-snake').textContent = 'Pause';
}

function generateFood() {
    // Generate random position
    const gridSize = 20;
    food = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
    };
    
    // Make sure food doesn't appear on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

function drawSnake() {
    const board = document.getElementById('snake-board');
    board.innerHTML = '';
    board.style.gridTemplateColumns = 'repeat(20, 1fr)';
    
    // Create cells
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
            const cell = document.createElement('div');
            cell.className = 'snake-cell';
            
            // Check if this is snake segment
            let isSnake = false;
            for (let segment of snake) {
                if (segment.x === x && segment.y === y) {
                    isSnake = true;
                    break;
                }
            }
            
            if (isSnake) {
                cell.classList.add('snake');
            } else if (food.x === x && food.y === y) {
                cell.classList.add('food');
            }
            
            board.appendChild(cell);
        }
    }
}

function gameLoop() {
    if (isPaused) return;
    
    // Move snake
    const head = {...snake[0]};
    
    switch(direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // Check wall collision
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
        gameOver();
        return;
    }
    
    // Check self collision
    for (let segment of snake) {
        if (segment.x === head.x && segment.y === head.y) {
            gameOver();
            return;
        }
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        snakeScore += 10;
        document.getElementById('snake-score').textContent = snakeScore;
        document.getElementById('score').textContent = `Score: ${snakeScore}`;
        generateFood();
        
        // Update high score
        if (snakeScore > snakeHighScore) {
            snakeHighScore = snakeScore;
            document.getElementById('snake-highscore').textContent = snakeHighScore;
            localStorage.setItem('snakeHighScore', snakeHighScore);
        }
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
    
    // Redraw
    drawSnake();
}

function handleSnakeKeyPress(e) {
    if (isPaused) return;
    
    switch(e.key) {
        case 'ArrowUp':
            if (direction !== 'down') direction = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') direction = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') direction = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') direction = 'right';
            break;
    }
}

function changeSnakeDirection(newDirection) {
    if (isPaused) return;
    
    // Prevent 180-degree turns
    if ((newDirection === 'up' && direction !== 'down') ||
        (newDirection === 'down' && direction !== 'up') ||
        (newDirection === 'left' && direction !== 'right') ||
        (newDirection === 'right' && direction !== 'left')) {
        direction = newDirection;
    }
}

function toggleSnakePause() {
    isPaused = !isPaused;
    document.getElementById('pause-snake').textContent = isPaused ? 'Resume' : 'Pause';
}

function gameOver() {
    clearInterval(snakeInterval);
    alert(`Game Over! Your score: ${snakeScore}`);
    gamesCompleted++;
    updatePlayerStats();
}

// ==================== CONNECT FOUR GAME ====================
let connect4Board = [];
let currentPlayerConnect4 = 1;
let connect4GameActive = true;
let player1Score = 0;
let player2Score = 0;
let connect4Mode = 'player';

function initConnectFour() {
    // Load scores from localStorage
    const savedScores = localStorage.getItem('connect4Scores');
    if (savedScores) {
        const scores = JSON.parse(savedScores);
        player1Score = scores.player1 || 0;
        player2Score = scores.player2 || 0;
        updateConnect4Scores();
    }
}

function startConnectFour() {
    // Reset board
    connect4Board = [];
    for (let row = 0; row < 6; row++) {
        connect4Board[row] = [];
        for (let col = 0; col < 7; col++) {
            connect4Board[row][col] = 0;
        }
    }
    
    currentPlayerConnect4 = 1;
    connect4GameActive = true;
    
    // Create board UI
    const boardElement = document.getElementById('connect4-board');
    boardElement.innerHTML = '';
    
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            const cell = document.createElement('div');
            cell.className = 'connect4-cell';
            cell.setAttribute('data-row', row);
            cell.setAttribute('data-col', col);
            boardElement.appendChild(cell);
        }
    }
    
    // Update UI
    updateConnect4Board();
    updateCurrentPlayerDisplay();
    document.getElementById('moves').textContent = 'Moves: 0';
    
    // Enable/disable drop buttons based on mode
    document.querySelectorAll('.drop-btn').forEach(btn => {
        btn.disabled = false;
    });
}

function setConnectFourMode(mode) {
    connect4Mode = mode;
    startConnectFour();
}

function makeConnectFourMove(col) {
    if (!connect4GameActive) return;
    
    // Find the lowest empty row in the column
    let row = -1;
    for (let r = 5; r >= 0; r--) {
        if (connect4Board[r][col] === 0) {
            row = r;
            break;
        }
    }
    
    if (row === -1) return; // Column is full
    
    // Make move
    connect4Board[row][col] = currentPlayerConnect4;
    updateConnect4Board();
    
    // Update moves
    const moves = parseInt(document.getElementById('moves').textContent.split(': ')[1]) || 0;
    document.getElementById('moves').textContent = `Moves: ${moves + 1}`;
    
    // Check for win
    if (checkConnect4Win(row, col)) {
        connect4GameActive = false;
        
        if (currentPlayerConnect4 === 1) {
            player1Score++;
            alert('Player 1 wins!');
        } else {
            player2Score++;
            alert('Player 2 wins!');
        }
        
        gamesCompleted++;
        updateConnect4Scores();
        saveConnect4Scores();
        updatePlayerStats();
        return;
    }
    
    // Check for draw
    if (isBoardFull()) {
        connect4GameActive = false;
        alert("It's a draw!");
        gamesCompleted++;
        updatePlayerStats();
        return;
    }
    
    // Switch player
    currentPlayerConnect4 = currentPlayerConnect4 === 1 ? 2 : 1;
    updateCurrentPlayerDisplay();
    
    // If playing against computer and it's computer's turn
    if (connect4Mode === 'computer' && currentPlayerConnect4 === 2 && connect4GameActive) {
        setTimeout(makeComputerMoveConnect4, 500);
    }
}

function makeComputerMoveConnect4() {
    if (!connect4GameActive) return;
    
    // Simple AI: try to win, then block, then random
    let moveCol = -1;
    
    // Check for winning move
    moveCol = findWinningMoveConnect4(2);
    
    // Check for blocking move
    if (moveCol === -1) {
        moveCol = findWinningMoveConnect4(1);
    }
    
    // Choose random move
    if (moveCol === -1) {
        const availableCols = [];
        for (let col = 0; col < 7; col++) {
            if (connect4Board[0][col] === 0) {
                availableCols.push(col);
            }
        }
        
        if (availableCols.length > 0) {
            moveCol = availableCols[Math.floor(Math.random() * availableCols.length)];
        }
    }
    
    if (moveCol !== -1) {
        makeConnectFourMove(moveCol);
    }
}

function findWinningMoveConnect4(player) {
    for (let col = 0; col < 7; col++) {
        // Find where the piece would land
        let row = -1;
        for (let r = 5; r >= 0; r--) {
            if (connect4Board[r][col] === 0) {
                row = r;
                break;
            }
        }
        
        if (row === -1) continue; // Column is full
        
        // Temporarily place piece
        connect4Board[row][col] = player;
        
        // Check if this creates a win
        if (checkConnect4Win(row, col)) {
            // Undo temporary placement
            connect4Board[row][col] = 0;
            return col;
        }
        
        // Undo temporary placement
        connect4Board[row][col] = 0;
    }
    
    return -1;
}

function checkConnect4Win(row, col) {
    const player = connect4Board[row][col];
    
    // Check horizontal
    let count = 0;
    for (let c = 0; c < 7; c++) {
        count = connect4Board[row][c] === player ? count + 1 : 0;
        if (count >= 4) return true;
    }
    
    // Check vertical
    count = 0;
    for (let r = 0; r < 6; r++) {
        count = connect4Board[r][col] === player ? count + 1 : 0;
        if (count >= 4) return true;
    }
    
    // Check diagonal (top-left to bottom-right)
    count = 0;
    let r = row - Math.min(row, col);
    let c = col - Math.min(row, col);
    while (r < 6 && c < 7) {
        count = connect4Board[r][c] === player ? count + 1 : 0;
        if (count >= 4) return true;
        r++;
        c++;
    }
    
    // Check diagonal (top-right to bottom-left)
    count = 0;
    r = row - Math.min(row, 6 - col);
    c = col + Math.min(row, 6 - col);
    while (r < 6 && c >= 0) {
        count = connect4Board[r][c] === player ? count + 1 : 0;
        if (count >= 4) return true;
        r++;
        c--;
    }
    
    return false;
}

function isBoardFull() {
    for (let col = 0; col < 7; col++) {
        if (connect4Board[0][col] === 0) {
            return false;
        }
    }
    return true;
}

function updateConnect4Board() {
    const cells = document.querySelectorAll('.connect4-cell');
    cells.forEach(cell => {
        const row = parseInt(cell.getAttribute('data-row'));
        const col = parseInt(cell.getAttribute('data-col'));
        
        cell.className = 'connect4-cell';
        if (connect4Board[row][col] === 1) {
            cell.classList.add('player1');
        } else if (connect4Board[row][col] === 2) {
            cell.classList.add('player2');
        }
    });
}

function updateCurrentPlayerDisplay() {
    const currentPlayerEl = document.querySelector('.current-player-connect4 .player-chip');
    currentPlayerEl.className = 'player-chip';
    
    if (currentPlayerConnect4 === 1) {
        currentPlayerEl.classList.add('player1-chip');
    } else {
        currentPlayerEl.classList.add('player2-chip');
    }
}

function updateConnect4Scores() {
    document.getElementById('player1-score').textContent = player1Score;
    document.getElementById('player2-score').textContent = player2Score;
}

function resetConnectFourScores() {
    player1Score = 0;
    player2Score = 0;
    updateConnect4Scores();
    saveConnect4Scores();
}

function saveConnect4Scores() {
    const scores = {
        player1: player1Score,
        player2: player2Score
    };
    localStorage.setItem('connect4Scores', JSON.stringify(scores));
}

// ==================== UTILITY FUNCTIONS ====================
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Handle window resize for responsiveness
window.addEventListener('resize', function() {
    // Close mobile nav on resize to larger screens
    if (window.innerWidth > 768) {
        closeMobileNav();
    }
    
    // Redraw games if needed
    if (currentGame === 'snake') {
        drawSnake();
    }
});

// Keyboard shortcuts for games
document.addEventListener('keydown', function(e) {
    // Space to restart current game
    if (e.key === ' ' && currentGame) {
        e.preventDefault();
        restartCurrentGame();
    }
    
    // Escape to go back to home
    if (e.key === 'Escape') {
        showHomePage();
    }
});