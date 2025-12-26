document.addEventListener('DOMContentLoaded', function() {
    // Set current year
    const currentYear = new Date().getFullYear();
    document.getElementById('current-year').textContent = currentYear;
    document.getElementById('footer-year').textContent = currentYear;
    
    // Menu toggle functionality
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const closeMenu = document.getElementById('closeMenu');
    const mainContent = document.getElementById('mainContent');
    const menuLinks = document.querySelectorAll('.menu-link');
    
    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('open');
        menuToggle.style.opacity = '0';
    });
    
    closeMenu.addEventListener('click', () => {
        sidebar.classList.remove('open');
        menuToggle.style.opacity = '1';
    });
    
    // Close menu when clicking outside on mobile
    mainContent.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
            menuToggle.style.opacity = '1';
        }
    });
    
    // Menu navigation
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = link.getAttribute('data-tab');
            
            // Update active menu item
            menuLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Switch to corresponding tab
            switchTab(targetTab);
            
            // Close menu on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
                menuToggle.style.opacity = '1';
            }
        });
    });
    
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    const gameContents = document.querySelectorAll('.game-content');
    
    function switchTab(tabId) {
        // Update active tab
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
        });
        
        // Show corresponding game content
        gameContents.forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
        
        // Update active menu item
        menuLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-tab') === tabId);
        });
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
    
    // Initialize all games
    initializeChess();
    initializeTicTacToe();
    initializeMemoryMatch();
    initializeSettings();
    
    // Chess Game Implementation with Auto Player
    function initializeChess() {
        const chessBoard = document.getElementById('chess-board');
        const resetButton = document.getElementById('reset-chess');
        const modeToggle = document.getElementById('toggle-chess-mode');
        const modeDisplay = document.getElementById('chess-mode');
        const modeBtn = document.getElementById('chess-mode-btn');
        const playerDisplay = document.getElementById('chess-player');
        
        // Game state
        let boardState = [];
        let selectedPiece = null;
        let currentPlayer = 'white';
        let vsComputer = false;
        let gameActive = true;
        let computerThinking = false;
        let lastMove = null;
        
        // Piece values for computer AI
        const pieceValues = {
            '♙': 1, '♟': 1,
            '♘': 3, '♞': 3,
            '♗': 3, '♝': 3,
            '♖': 5, '♜': 5,
            '♕': 9, '♛': 9,
            '♔': 100, '♚': 100
        };
        
        // Position values for AI (center control)
        const positionValues = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0.1, 0.2, 0.2, 0.2, 0.2, 0.1, 0],
            [0, 0.1, 0.3, 0.4, 0.4, 0.3, 0.1, 0],
            [0, 0.1, 0.3, 0.5, 0.5, 0.3, 0.1, 0],
            [0, 0.1, 0.3, 0.5, 0.5, 0.3, 0.1, 0],
            [0, 0.1, 0.3, 0.4, 0.4, 0.3, 0.1, 0],
            [0, 0.1, 0.2, 0.2, 0.2, 0.2, 0.1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];
        
        // Initial board setup
        const initialBoard = [
            ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
            ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
            ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
        ];
        
        // Initialize game
        function initGame() {
            boardState = JSON.parse(JSON.stringify(initialBoard));
            selectedPiece = null;
            currentPlayer = 'white';
            gameActive = true;
            computerThinking = false;
            lastMove = null;
            renderChessBoard();
            updateStatus();
            
            // If computer starts first
            if (vsComputer && currentPlayer === 'black') {
                setTimeout(computerMove, 1000);
            }
        }
        
        // Render chess board
        function renderChessBoard() {
            chessBoard.innerHTML = '';
            
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const square = document.createElement('div');
                    square.className = `chess-square ${(row + col) % 2 === 0 ? 'light-square' : 'dark-square'}`;
                    square.dataset.row = row;
                    square.dataset.col = col;
                    
                    // Highlight last move
                    if (lastMove && 
                        ((lastMove.fromRow === row && lastMove.fromCol === col) ||
                         (lastMove.toRow === row && lastMove.toCol === col))) {
                        square.classList.add('last-move');
                    }
                    
                    if (boardState[row][col]) {
                        square.textContent = boardState[row][col];
                        // Color pieces
                        if (boardState[row][col].charCodeAt(0) > 9817) {
                            square.style.color = '#f1f1f1'; // White pieces
                        } else {
                            square.style.color = '#333'; // Black pieces
                        }
                    }
                    
                    square.addEventListener('click', () => handleSquareClick(row, col));
                    chessBoard.appendChild(square);
                }
            }
            
            updateStatus();
        }
        
        // Handle square click
        function handleSquareClick(row, col) {
            if (!gameActive || computerThinking) return;
            
            const piece = boardState[row][col];
            
            // If a piece is already selected
            if (selectedPiece) {
                const [prevRow, prevCol] = selectedPiece;
                
                // If clicking on the same piece, deselect it
                if (prevRow === row && prevCol === col) {
                    clearSelection();
                    return;
                }
                
                // Check if the move is valid
                if (isValidMove(prevRow, prevCol, row, col)) {
                    // Make the move
                    makeMove(prevRow, prevCol, row, col, true);
                    
                    // If playing against computer and it's computer's turn
                    if (vsComputer && currentPlayer === 'black' && gameActive) {
                        setTimeout(computerMove, 800);
                    }
                } else {
                    clearSelection();
                    // Try to select another piece if valid
                    if (piece && isCurrentPlayerPiece(piece)) {
                        selectPiece(row, col);
                    }
                }
            } else {
                // Select a piece if it exists and belongs to current player
                if (piece && isCurrentPlayerPiece(piece)) {
                    selectPiece(row, col);
                }
            }
        }
        
        // Check if piece belongs to current player
        function isCurrentPlayerPiece(piece) {
            const isWhitePiece = piece.charCodeAt(0) > 9817;
            return (currentPlayer === 'white' && isWhitePiece) || 
                   (currentPlayer === 'black' && !isWhitePiece);
        }
        
        // Select a piece
        function selectPiece(row, col) {
            clearSelection();
            selectedPiece = [row, col];
            
            const square = document.querySelector(`.chess-square[data-row="${row}"][data-col="${col}"]`);
            if (square) {
                square.classList.add('selected');
                
                // Highlight possible moves if hints are enabled
                const showHints = document.getElementById('chess-hints')?.checked ?? true;
                if (showHints) {
                    highlightPossibleMoves(row, col);
                }
            }
        }
        
        // Clear selection
        function clearSelection() {
            document.querySelectorAll('.chess-square').forEach(square => {
                square.classList.remove('selected', 'possible-move');
            });
            selectedPiece = null;
        }
        
        // Highlight possible moves
        function highlightPossibleMoves(row, col) {
            const piece = boardState[row][col];
            const moves = getPossibleMoves(row, col, piece);
            
            moves.forEach(([r, c]) => {
                const square = document.querySelector(`.chess-square[data-row="${r}"][data-col="${c}"]`);
                if (square) {
                    square.classList.add('possible-move');
                }
            });
        }
        
        // Get possible moves
        function getPossibleMoves(row, col, piece) {
            const moves = [];
            const isWhite = piece.charCodeAt(0) > 9817;
            
            // Pawn moves
            if (piece === '♙' || piece === '♟') {
                const direction = isWhite ? -1 : 1;
                const startRow = isWhite ? 6 : 1;
                
                // Move forward one square
                if (isInBounds(row + direction, col) && !boardState[row + direction][col]) {
                    moves.push([row + direction, col]);
                    
                    // Move forward two squares from starting position
                    if (row === startRow && !boardState[row + 2 * direction][col]) {
                        moves.push([row + 2 * direction, col]);
                    }
                }
                
                // Captures
                [-1, 1].forEach(dc => {
                    const newRow = row + direction;
                    const newCol = col + dc;
                    if (isInBounds(newRow, newCol) && boardState[newRow][newCol] && 
                        isWhite !== (boardState[newRow][newCol].charCodeAt(0) > 9817)) {
                        moves.push([newRow, newCol]);
                    }
                });
            }
            // Knight moves
            else if (piece === '♘' || piece === '♞') {
                const knightMoves = [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1]
                ];
                knightMoves.forEach(([dr, dc]) => {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (isInBounds(newRow, newCol) && 
                        (!boardState[newRow][newCol] || 
                         isWhite !== (boardState[newRow][newCol].charCodeAt(0) > 9817))) {
                        moves.push([newRow, newCol]);
                    }
                });
            }
            // Rook moves (vertical and horizontal)
            else if (piece === '♖' || piece === '♜') {
                const directions = [[-1,0], [1,0], [0,-1], [0,1]];
                directions.forEach(([dr, dc]) => {
                    let newRow = row + dr;
                    let newCol = col + dc;
                    while (isInBounds(newRow, newCol)) {
                        if (!boardState[newRow][newCol]) {
                            moves.push([newRow, newCol]);
                        } else {
                            if (isWhite !== (boardState[newRow][newCol].charCodeAt(0) > 9817)) {
                                moves.push([newRow, newCol]);
                            }
                            break;
                        }
                        newRow += dr;
                        newCol += dc;
                    }
                });
            }
            // Bishop moves (diagonal)
            else if (piece === '♗' || piece === '♝') {
                const directions = [[-1,-1], [-1,1], [1,-1], [1,1]];
                directions.forEach(([dr, dc]) => {
                    let newRow = row + dr;
                    let newCol = col + dc;
                    while (isInBounds(newRow, newCol)) {
                        if (!boardState[newRow][newCol]) {
                            moves.push([newRow, newCol]);
                        } else {
                            if (isWhite !== (boardState[newRow][newCol].charCodeAt(0) > 9817)) {
                                moves.push([newRow, newCol]);
                            }
                            break;
                        }
                        newRow += dr;
                        newCol += dc;
                    }
                });
            }
            // Queen moves (combines rook and bishop)
            else if (piece === '♕' || piece === '♛') {
                const directions = [
                    [-1,0], [1,0], [0,-1], [0,1],
                    [-1,-1], [-1,1], [1,-1], [1,1]
                ];
                directions.forEach(([dr, dc]) => {
                    let newRow = row + dr;
                    let newCol = col + dc;
                    while (isInBounds(newRow, newCol)) {
                        if (!boardState[newRow][newCol]) {
                            moves.push([newRow, newCol]);
                        } else {
                            if (isWhite !== (boardState[newRow][newCol].charCodeAt(0) > 9817)) {
                                moves.push([newRow, newCol]);
                            }
                            break;
                        }
                        newRow += dr;
                        newCol += dc;
                    }
                });
            }
            // King moves (one square in any direction)
            else if (piece === '♔' || piece === '♚') {
                const directions = [
                    [-1,0], [1,0], [0,-1], [0,1],
                    [-1,-1], [-1,1], [1,-1], [1,1]
                ];
                directions.forEach(([dr, dc]) => {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (isInBounds(newRow, newCol) && 
                        (!boardState[newRow][newCol] || 
                         isWhite !== (boardState[newRow][newCol].charCodeAt(0) > 9817))) {
                        moves.push([newRow, newCol]);
                    }
                });
            }
            
            return moves;
        }
        
        // Check if coordinates are within board
        function isInBounds(row, col) {
            return row >= 0 && row < 8 && col >= 0 && col < 8;
        }
        
        // Validate move
        function isValidMove(fromRow, fromCol, toRow, toCol) {
            const piece = boardState[fromRow][fromCol];
            const moves = getPossibleMoves(fromRow, fromCol, piece);
            
            return moves.some(([r, c]) => r === toRow && c === toCol);
        }
        
        // Make a move
        function makeMove(fromRow, fromCol, toRow, toCol, isPlayerMove = false) {
            const piece = boardState[fromRow][fromCol];
            
            // Store last move
            lastMove = { fromRow, fromCol, toRow, toCol };
            
            // Visual feedback for computer moves
            if (!isPlayerMove && vsComputer) {
                const fromSquare = document.querySelector(`.chess-square[data-row="${fromRow}"][data-col="${fromCol}"]`);
                const toSquare = document.querySelector(`.chess-square[data-row="${toRow}"][data-col="${toCol}"]`);
                if (fromSquare && toSquare) {
                    fromSquare.classList.add('computer-move');
                    toSquare.classList.add('computer-move');
                    setTimeout(() => {
                        fromSquare.classList.remove('computer-move');
                        toSquare.classList.remove('computer-move');
                    }, 1000);
                }
            }
            
            // Update board
            boardState[toRow][toCol] = piece;
            boardState[fromRow][fromCol] = '';
            
            // Switch player
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            
            // Check for checkmate or stalemate
            checkGameStatus();
            
            clearSelection();
            renderChessBoard();
        }
        
        // Computer move logic
        function computerMove() {
            if (!gameActive || currentPlayer !== 'black' || computerThinking) return;
            
            computerThinking = true;
            
            setTimeout(() => {
                // Get all possible moves for black pieces
                const allMoves = [];
                
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        const piece = boardState[row][col];
                        if (piece && piece.charCodeAt(0) <= 9817) { // Black pieces
                            const moves = getPossibleMoves(row, col, piece);
                            moves.forEach(([toRow, toCol]) => {
                                // Evaluate move
                                let score = 0;
                                
                                // Capture scoring
                                const targetPiece = boardState[toRow][toCol];
                                if (targetPiece) {
                                    score += pieceValues[targetPiece] || 0;
                                }
                                
                                // Position scoring (center control)
                                score += positionValues[toRow][toCol] || 0;
                                
                                // Piece development (move pieces from back rank)
                                if (row === 0 || row === 1) {
                                    score += 0.2;
                                }
                                
                                // Avoid moving king unnecessarily
                                if (piece === '♚' && !targetPiece) {
                                    score -= 0.5;
                                }
                                
                                allMoves.push({
                                    fromRow: row,
                                    fromCol: col,
                                    toRow,
                                    toCol,
                                    piece,
                                    score
                                });
                            });
                        }
                    }
                }
                
                if (allMoves.length > 0) {
                    // Sort moves by score (highest first)
                    allMoves.sort((a, b) => b.score - a.score);
                    
                    // Get difficulty setting
                    const difficulty = document.getElementById('chess-difficulty')?.value || 'medium';
                    
                    let selectedMove;
                    if (difficulty === 'easy') {
                        // Easy: Random move from all moves
                        selectedMove = allMoves[Math.floor(Math.random() * allMoves.length)];
                    } else if (difficulty === 'medium') {
                        // Medium: Usually best move, sometimes random
                        if (Math.random() > 0.7) {
                            const randomIndex = Math.floor(Math.random() * Math.min(3, allMoves.length));
                            selectedMove = allMoves[randomIndex];
                        } else {
                            selectedMove = allMoves[0];
                        }
                    } else {
                        // Hard: Best move
                        selectedMove = allMoves[0];
                    }
                    
                    // Make the computer move
                    makeMove(
                        selectedMove.fromRow, 
                        selectedMove.fromCol, 
                        selectedMove.toRow, 
                        selectedMove.toCol,
                        false
                    );
                }
                
                computerThinking = false;
            }, 800);
        }
        
        // Check game status
        function checkGameStatus() {
            // Check if kings are on the board
            let whiteKing = false;
            let blackKing = false;
            let whitePieces = 0;
            let blackPieces = 0;
            
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = boardState[row][col];
                    if (piece) {
                        if (piece === '♔') whiteKing = true;
                        if (piece === '♚') blackKing = true;
                        
                        if (piece.charCodeAt(0) > 9817) {
                            whitePieces++;
                        } else {
                            blackPieces++;
                        }
                    }
                }
            }
            
            if (!whiteKing) {
                setTimeout(() => {
                    if (gameActive) {
                        alert('Checkmate! Black wins!');
                        gameActive = false;
                    }
                }, 100);
            } else if (!blackKing) {
                setTimeout(() => {
                    if (gameActive) {
                        alert('Checkmate! White wins!');
                        gameActive = false;
                    }
                }, 100);
            }
            // Stalemate detection (simplified)
            else if ((currentPlayer === 'white' && whitePieces === 1) || 
                     (currentPlayer === 'black' && blackPieces === 1)) {
                // Check if the player has any valid moves
                let hasValidMoves = false;
                
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        const piece = boardState[row][col];
                        if (piece && isCurrentPlayerPiece(piece)) {
                            const moves = getPossibleMoves(row, col, piece);
                            if (moves.length > 0) {
                                hasValidMoves = true;
                                break;
                            }
                        }
                    }
                    if (hasValidMoves) break;
                }
                
                if (!hasValidMoves && gameActive) {
                    setTimeout(() => {
                        alert('Stalemate! Game ends in a draw.');
                        gameActive = false;
                    }, 100);
                }
            }
        }
        
        // Update game status display
        function updateStatus() {
            playerDisplay.textContent = currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1);
            playerDisplay.style.color = currentPlayer === 'white' ? '#f1f1f1' : '#333';
            
            // If it's computer's turn and we're in vsComputer mode, trigger computer move
            if (vsComputer && currentPlayer === 'black' && gameActive && !computerThinking) {
                setTimeout(computerMove, 800);
            }
        }
        
        // Toggle computer mode
        modeToggle.addEventListener('click', () => {
            vsComputer = !vsComputer;
            modeDisplay.textContent = vsComputer ? 'Player vs Computer' : 'Player vs Player';
            modeBtn.textContent = vsComputer ? 'vs Player' : 'vs Computer';
            initGame();
        });
        
        // Reset game
        resetButton.addEventListener('click', initGame);
        
        // Initialize the game
        initGame();
    }
    
    // Tic-Tac-Toe Game with Auto Player
    function initializeTicTacToe() {
        const tttBoard = document.getElementById('ttt-board');
        const resetButton = document.getElementById('reset-ttt');
        const modeToggle = document.getElementById('toggle-ttt-mode');
        const modeBtn = document.getElementById('ttt-mode-btn');
        const playerDisplay = document.getElementById('ttt-player');
        const statusDisplay = document.getElementById('ttt-status');
        const difficultySelect = document.getElementById('ttt-difficulty-select');
        const difficultyDisplay = document.getElementById('ttt-difficulty');
        
        // Game state
        let board = ['', '', '', '', '', '', '', '', ''];
        let currentPlayer = 'X';
        let gameActive = true;
        let vsComputer = false;
        let computerDifficulty = 'easy';
        let playerStarts = true;
        
        // Winning combinations
        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        // Initialize game
        function initGame() {
            board = ['', '', '', '', '', '', '', '', ''];
            gameActive = true;
            
            // Determine starting player
            const startSetting = document.getElementById('ttt-start-player')?.value || 'random';
            if (startSetting === 'random') {
                playerStarts = Math.random() > 0.5;
            } else {
                playerStarts = startSetting === 'player';
            }
            
            currentPlayer = playerStarts ? 'X' : 'O';
            
            renderBoard();
            updateStatus();
            
            // If computer starts and vsComputer mode is on
            if (vsComputer && !playerStarts && gameActive) {
                setTimeout(computerMove, 800);
            }
        }
        
        // Render board
        function renderBoard() {
            tttBoard.innerHTML = '';
            
            for (let i = 0; i < 9; i++) {
                const cell = document.createElement('div');
                cell.className = 'ttt-cell';
                cell.dataset.index = i;
                
                if (board[i]) {
                    cell.textContent = board[i];
                    cell.classList.add(board[i] === 'X' ? 'x-marker' : 'o-marker');
                    if (board[i] === 'O' && vsComputer) {
                        cell.classList.add('computer-cell');
                    }
                }
                
                cell.addEventListener('click', () => handleCellClick(i));
                tttBoard.appendChild(cell);
            }
            
            playerDisplay.textContent = currentPlayer;
            playerDisplay.style.color = currentPlayer === 'X' ? '#4cc9f0' : '#f72585';
        }
        
        // Handle cell click
        function handleCellClick(index) {
            if (board[index] !== '' || !gameActive) return;
            
            // If playing against computer and it's computer's turn
            if (vsComputer && currentPlayer === 'O') return;
            
            makeMove(index);
        }
        
        // Make a move
        function makeMove(index) {
            board[index] = currentPlayer;
            renderBoard();
            
            // Check for win or draw
            checkResult();
            
            // If game is still active, switch player
            if (gameActive) {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                updateStatus();
                
                // If playing against computer and it's computer's turn
                if (vsComputer && currentPlayer === 'O') {
                    setTimeout(computerMove, 800);
                }
            }
        }
        
        // Computer move logic
        function computerMove() {
            if (!gameActive || currentPlayer !== 'O') return;
            
            let moveIndex;
            
            // Different strategies based on difficulty
            if (computerDifficulty === 'easy') {
                // Easy: Random move
                moveIndex = getRandomMove();
            } else if (computerDifficulty === 'medium') {
                // Medium: Try to win, block if needed, otherwise random
                moveIndex = getWinningMove('O') || getWinningMove('X') || getRandomMove();
            } else {
                // Hard: Minimax algorithm or strategic
                moveIndex = getBestMove();
            }
            
            if (moveIndex !== undefined) {
                setTimeout(() => makeMove(moveIndex), 500);
            }
        }
        
        // Get a random available move
        function getRandomMove() {
            const availableMoves = board
                .map((cell, index) => cell === '' ? index : null)
                .filter(index => index !== null);
            
            return availableMoves.length > 0 
                ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
                : undefined;
        }
        
        // Check for winning move for a player
        function getWinningMove(player) {
            for (const condition of winningConditions) {
                const [a, b, c] = condition;
                const cells = [board[a], board[b], board[c]];
                
                // If two cells are player's and one is empty
                if (cells.filter(cell => cell === player).length === 2) {
                    const emptyIndex = condition.find(index => board[index] === '');
                    if (emptyIndex !== undefined) {
                        return emptyIndex;
                    }
                }
            }
            return null;
        }
        
        // Get best move (simplified hard difficulty)
        function getBestMove() {
            // Try to win
            const winningMove = getWinningMove('O');
            if (winningMove !== null) return winningMove;
            
            // Try to block opponent
            const blockMove = getWinningMove('X');
            if (blockMove !== null) return blockMove;
            
            // Take center if available
            if (board[4] === '') return 4;
            
            // Take corners if available
            const corners = [0, 2, 6, 8];
            const availableCorners = corners.filter(index => board[index] === '');
            if (availableCorners.length > 0) {
                return availableCorners[Math.floor(Math.random() * availableCorners.length)];
            }
            
            // Otherwise random
            return getRandomMove();
        }
        
        // Check game result
        function checkResult() {
            let roundWon = false;
            let winningCombo = [];
            
            for (let i = 0; i < winningConditions.length; i++) {
                const [a, b, c] = winningConditions[i];
                if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                    roundWon = true;
                    winningCombo = winningConditions[i];
                    break;
                }
            }
            
            if (roundWon) {
                gameActive = false;
                statusDisplay.textContent = `Player ${board[winningCombo[0]]} Wins!`;
                statusDisplay.style.color = '#72efdd';
                
                // Highlight winning cells
                winningCombo.forEach(index => {
                    document.querySelector(`.ttt-cell[data-index="${index}"]`).classList.add('winning-cell');
                });
                return;
            }
            
            const roundDraw = !board.includes('');
            if (roundDraw) {
                gameActive = false;
                statusDisplay.textContent = "Game Ended in a Draw!";
                statusDisplay.style.color = '#f4a261';
                return;
            }
        }
        
        // Update game status
        function updateStatus() {
            if (!gameActive) return;
            
            statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;
            statusDisplay.style.color = '#72efdd';
        }
        
        // Toggle computer mode
        modeToggle.addEventListener('click', () => {
            vsComputer = !vsComputer;
            modeBtn.textContent = vsComputer ? 'vs Player' : 'vs Computer';
            difficultySelect.style.display = vsComputer ? 'block' : 'none';
            difficultyDisplay.textContent = vsComputer ? computerDifficulty.charAt(0).toUpperCase() + computerDifficulty.slice(1) : 'N/A';
            initGame();
        });
        
        // Update difficulty
        difficultySelect.addEventListener('change', (e) => {
            computerDifficulty = e.target.value;
            difficultyDisplay.textContent = computerDifficulty.charAt(0).toUpperCase() + computerDifficulty.slice(1);
            if (vsComputer && currentPlayer === 'O' && gameActive) {
                setTimeout(computerMove, 500);
            }
        });
        
        // Reset game
        resetButton.addEventListener('click', initGame);
        
        // Initialize the game
        initGame();
    }
    
    // Memory Match Game with Auto Player
    function initializeMemoryMatch() {
        const memoryBoard = document.getElementById('memory-board');
        const resetButton = document.getElementById('reset-memory');
        const modeToggle = document.getElementById('toggle-memory-mode');
        const modeBtn = document.getElementById('memory-mode-btn');
        const moveCountDisplay = document.getElementById('move-count');
        const matchCountDisplay = document.getElementById('match-count');
        const timerDisplay = document.getElementById('timer');
        
        // Game state
        let cards = [];
        let flippedCards = [];
        let matchedPairs = 0;
        let moves = 0;
        let canFlip = true;
        let vsComputer = false;
        let autoPlaying = false;
        let timer = 0;
        let timerInterval = null;
        let gridSize = '4x5';
        let theme = 'symbols';
        
        // Symbols for different themes
        const themes = {
            symbols: ['★', '❤', '▲', '◆', '☀', '☁', '⚡', '❄', '✿', '♫', '☂', '♠', '♣', '♥', '♦'],
            animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'],
            numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']
        };
        
        // Initialize game
        function initGame() {
            // Clear previous timer
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            
            // Get settings
            gridSize = document.getElementById('memory-grid')?.value || '4x5';
            theme = document.getElementById('memory-theme')?.value || 'symbols';
            
            // Determine grid dimensions
            let rows, cols, totalPairs;
            switch(gridSize) {
                case '4x4': rows = 4; cols = 4; totalPairs = 8; break;
                case '4x5': rows = 4; cols = 5; totalPairs = 10; break;
                case '5x6': rows = 5; cols = 6; totalPairs = 15; break;
                default: rows = 4; cols = 5; totalPairs = 10;
            }
            
            // Update memory board grid
            memoryBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            memoryBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
            memoryBoard.style.width = cols * 100 + (cols - 1) * 15 + 'px';
            memoryBoard.style.height = rows * 100 + (rows - 1) * 15 + 'px';
            
            // Reset game state
            const symbolSet = themes[theme] || themes.symbols;
            const selectedSymbols = symbolSet.slice(0, totalPairs);
            cards = [...selectedSymbols, ...selectedSymbols];
            
            // Shuffle cards
            shuffleArray(cards);
            
            flippedCards = [];
            matchedPairs = 0;
            moves = 0;
            canFlip = true;
            autoPlaying = false;
            timer = 0;
            
            // Update displays
            updateStats();
            
            // Start timer
            timerInterval = setInterval(() => {
                timer++;
                timerDisplay.textContent = `${timer}s`;
            }, 1000);
            
            // Render board
            renderBoard();
            
            // If auto-play mode is on
            if (vsComputer) {
                setTimeout(startAutoPlay, 2000);
            }
        }
        
        // Shuffle array
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
        
        // Render board
        function renderBoard() {
            memoryBoard.innerHTML = '';
            
            cards.forEach((symbol, index) => {
                const card = document.createElement('div');
                card.className = 'memory-card';
                if (flippedCards.some(c => c.index === index) || cards[index] === null) {
                    card.classList.add('flipped');
                }
                if (cards[index] === null) {
                    card.classList.add('matched');
                }
                
                card.dataset.index = index;
                card.dataset.symbol = symbol;
                
                const cardFront = document.createElement('div');
                cardFront.className = 'memory-card-front';
                cardFront.textContent = symbol;
                
                const cardBack = document.createElement('div');
                cardBack.className = 'memory-card-back';
                cardBack.textContent = '?';
                
                card.appendChild(cardFront);
                card.appendChild(cardBack);
                
                if (cards[index] !== null && !card.classList.contains('matched')) {
                    card.addEventListener('click', () => flipCard(card, index));
                }
                
                memoryBoard.appendChild(card);
            });
        }
        
        // Flip card
        function flipCard(card, index) {
            if (card.classList.contains('flipped') || 
                card.classList.contains('matched') || 
                !canFlip || 
                flippedCards.length >= 2 ||
                autoPlaying) return;
            
            card.classList.add('flipped');
            flippedCards.push({card, index, symbol: cards[index]});
            
            if (flippedCards.length === 2) {
                moves++;
                updateStats();
                canFlip = false;
                
                const [card1, card2] = flippedCards;
                
                if (card1.symbol === card2.symbol) {
                    // Match found
                    setTimeout(() => {
                        cards[card1.index] = null;
                        cards[card2.index] = null;
                        card1.card.classList.add('matched');
                        card2.card.classList.add('matched');
                        flippedCards = [];
                        canFlip = true;
                        matchedPairs++;
                        updateStats();
                        
                        // Check if game is complete
                        if (matchedPairs === cards.filter(c => c === null).length / 2) {
                            clearInterval(timerInterval);
                            setTimeout(() => {
                                alert(`Congratulations! You completed the game in ${moves} moves and ${timer} seconds!`);
                            }, 500);
                        }
                    }, 800);
                } else {
                    // No match, flip back after delay
                    setTimeout(() => {
                        card1.card.classList.remove('flipped');
                        card2.card.classList.remove('flipped');
                        flippedCards = [];
                        canFlip = true;
                    }, 1000);
                }
            }
        }
        
        // Start auto-play
        function startAutoPlay() {
            if (!vsComputer || autoPlaying) return;
            
            autoPlaying = true;
            const cardElements = document.querySelectorAll('.memory-card:not(.matched)');
            
            if (cardElements.length === 0) return;
            
            // Computer memory (remembers card positions)
            const computerMemory = {};
            let firstCard = null;
            
            function computerTurn() {
                if (!autoPlaying || matchedPairs === cards.filter(c => c === null).length / 2) {
                    autoPlaying = false;
                    return;
                }
                
                // If we have a card waiting to be matched
                if (firstCard !== null) {
                    // Look for match in memory
                    const matchIndex = Object.keys(computerMemory).find(idx => 
                        computerMemory[idx] === firstCard.symbol && 
                        idx != firstCard.index && 
                        cards[idx] !== null
                    );
                    
                    if (matchIndex !== undefined) {
                        // We know where the match is
                        setTimeout(() => {
                            const matchCard = document.querySelector(`.memory-card[data-index="${matchIndex}"]`);
                            if (matchCard && !matchCard.classList.contains('flipped')) {
                                simulateFlip(matchCard, parseInt(matchIndex), () => {
                                    // Match found
                                    cards[firstCard.index] = null;
                                    cards[matchIndex] = null;
                                    matchedPairs++;
                                    moves++;
                                    updateStats();
                                    firstCard = null;
                                    
                                    // Check if game is complete
                                    if (matchedPairs === cards.filter(c => c === null).length / 2) {
                                        clearInterval(timerInterval);
                                        autoPlaying = false;
                                        setTimeout(() => {
                                            alert(`Computer solved the puzzle in ${moves} moves and ${timer} seconds!`);
                                        }, 1000);
                                    } else {
                                        setTimeout(computerTurn, 800);
                                    }
                                });
                            }
                        }, 500);
                        return;
                    }
                }
                
                // Otherwise, flip a random card
                const unflippedCards = Array.from(document.querySelectorAll('.memory-card:not(.flipped):not(.matched)'));
                if (unflippedCards.length === 0) {
                    autoPlaying = false;
                    return;
                }
                
                const randomCard = unflippedCards[Math.floor(Math.random() * unflippedCards.length)];
                const index = parseInt(randomCard.dataset.index);
                
                setTimeout(() => {
                    simulateFlip(randomCard, index, () => {
                        // Remember this card
                        computerMemory[index] = cards[index];
                        
                        if (firstCard === null) {
                            // First card flipped
                            firstCard = {index, symbol: cards[index]};
                            setTimeout(computerTurn, 800);
                        } else {
                            // Second card flipped - check for match
                            moves++;
                            updateStats();
                            
                            if (cards[index] === firstCard.symbol) {
                                // Match found
                                setTimeout(() => {
                                    cards[firstCard.index] = null;
                                    cards[index] = null;
                                    matchedPairs++;
                                    updateStats();
                                    firstCard = null;
                                    
                                    // Check if game is complete
                                    if (matchedPairs === cards.filter(c => c === null).length / 2) {
                                        clearInterval(timerInterval);
                                        autoPlaying = false;
                                        setTimeout(() => {
                                            alert(`Computer solved the puzzle in ${moves} moves and ${timer} seconds!`);
                                        }, 1000);
                                    } else {
                                        setTimeout(computerTurn, 800);
                                    }
                                }, 800);
                            } else {
                                // No match
                                setTimeout(() => {
                                    // Flip both cards back
                                    const firstCardElement = document.querySelector(`.memory-card[data-index="${firstCard.index}"]`);
                                    if (firstCardElement) {
                                        firstCardElement.classList.remove('flipped');
                                    }
                                    randomCard.classList.remove('flipped');
                                    firstCard = null;
                                    setTimeout(computerTurn, 800);
                                }, 1000);
                            }
                        }
                    });
                }, 500);
            }
            
            // Start computer's turn
            computerTurn();
        }
        
        // Simulate card flip (for auto-play)
        function simulateFlip(card, index, callback) {
            card.classList.add('flipped', 'auto-flip');
            setTimeout(() => {
                card.classList.remove('auto-flip');
                if (callback) callback();
            }, 800);
        }
        
        // Update stats
        function updateStats() {
            moveCountDisplay.textContent = moves;
            const totalPairs = cards.filter(c => c !== null).length / 2 + matchedPairs;
            matchCountDisplay.textContent = `${matchedPairs}/${totalPairs}`;
        }
        
        // Toggle auto-play mode
        modeToggle.addEventListener('click', () => {
            vsComputer = !vsComputer;
            modeBtn.textContent = vsComputer ? 'Manual Play' : 'Auto Play';
            
            if (vsComputer) {
                // Stop any ongoing auto-play
                autoPlaying = false;
                // Start new game with auto-play
                initGame();
            } else {
                // Stop auto-play
                autoPlaying = false;
            }
        });
        
        // Reset game
        resetButton.addEventListener('click', () => {
            if (timerInterval) clearInterval(timerInterval);
            initGame();
        });
        
        // Initialize the game
        initGame();
    }
    
    // Settings functionality
    function initializeSettings() {
        const saveButton = document.getElementById('save-settings');
        const themeSelect = document.getElementById('theme-select');
        
        // Load saved settings
        loadSettings();
        
        // Save settings
        saveButton.addEventListener('click', () => {
            saveSettings();
            alert('Settings saved! Some changes may require restarting games.');
        });
        
        // Theme change
        themeSelect.addEventListener('change', (e) => {
            const theme = e.target.value;
            document.body.className = `${theme}-theme`;
        });
    }
    
    // Load settings from localStorage
    function loadSettings() {
        const savedTheme = localStorage.getItem('gameTheme') || 'dark';
        document.body.className = `${savedTheme}-theme`;
        document.getElementById('theme-select').value = savedTheme;
        
        // Load other settings
        const settings = JSON.parse(localStorage.getItem('gameSettings') || '{}');
        
        if (settings.chessDifficulty) {
            document.getElementById('chess-difficulty').value = settings.chessDifficulty;
        }
        
        if (settings.chessHints !== undefined) {
            document.getElementById('chess-hints').checked = settings.chessHints;
        }
        
        if (settings.tttStartPlayer) {
            document.getElementById('ttt-start-player').value = settings.tttStartPlayer;
        }
        
        if (settings.tttSounds !== undefined) {
            document.getElementById('ttt-sounds').checked = settings.tttSounds;
        }
        
        if (settings.memoryGrid) {
            document.getElementById('memory-grid').value = settings.memoryGrid;
        }
        
        if (settings.memoryTheme) {
            document.getElementById('memory-theme').value = settings.memoryTheme;
        }
        
        if (settings.animationSpeed) {
            document.getElementById('animation-speed').value = settings.animationSpeed;
        }
    }
    
    // Save settings to localStorage
    function saveSettings() {
        const settings = {
            theme: document.getElementById('theme-select').value,
            chessDifficulty: document.getElementById('chess-difficulty').value,
            chessHints: document.getElementById('chess-hints').checked,
            tttStartPlayer: document.getElementById('ttt-start-player').value,
            tttSounds: document.getElementById('ttt-sounds').checked,
            memoryGrid: document.getElementById('memory-grid').value,
            memoryTheme: document.getElementById('memory-theme').value,
            animationSpeed: document.getElementById('animation-speed').value
        };
        
        localStorage.setItem('gameSettings', JSON.stringify(settings));
        localStorage.setItem('gameTheme', settings.theme);
        
        // Apply theme immediately
        document.body.className = `${settings.theme}-theme`;
    }
    
    // Add CSS for chess highlights
    const style = document.createElement('style');
    style.textContent = `
        .last-move {
            background-color: rgba(255, 255, 100, 0.5) !important;
        }
        
        .check-square {
            background-color: rgba(255, 50, 50, 0.7) !important;
            animation: pulseRed 1s infinite;
        }
        
        @keyframes pulseRed {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
});
// Chess Game Implementation with Auto Player
function initializeChess() {
    const chessBoard = document.getElementById('chess-board');
    const resetButton = document.getElementById('reset-chess');
    const modeToggle = document.getElementById('toggle-chess-mode');
    const modeDisplay = document.getElementById('chess-mode');
    const modeBtn = document.getElementById('chess-mode-btn');
    const playerDisplay = document.getElementById('chess-player');
    
    // Game state
    let boardState = [];
    let selectedPiece = null;
    let currentPlayer = 'white';
    let vsComputer = false;
    let gameActive = true;
    let computerThinking = false;
    
    // Piece values for computer AI
    const pieceValues = {
        '♙': 1, '♟': 1,
        '♘': 3, '♞': 3,
        '♗': 3, '♝': 3,
        '♖': 5, '♜': 5,
        '♕': 9, '♛': 9,
        '♔': 100, '♚': 100
    };
    
    // Initial board setup
    const initialBoard = [
        ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
        ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
        ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
    ];
    
    // Initialize game
    function initGame() {
        boardState = JSON.parse(JSON.stringify(initialBoard));
        selectedPiece = null;
        currentPlayer = 'white';
        gameActive = true;
        computerThinking = false;
        renderChessBoard();
        updateStatus();
        
        // If computer starts first
        if (vsComputer && currentPlayer === 'black') {
            setTimeout(computerMove, 1000);
        }
    }
    
    // Render chess board
    function renderChessBoard() {
        chessBoard.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `chess-square ${(row + col) % 2 === 0 ? 'light-square' : 'dark-square'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                if (boardState[row][col]) {
                    square.textContent = boardState[row][col];
                    // Color pieces
                    if (boardState[row][col].charCodeAt(0) > 9817) {
                        square.style.color = '#f1f1f1'; // White pieces
                    } else {
                        square.style.color = '#333'; // Black pieces
                    }
                }
                
                square.addEventListener('click', () => handleSquareClick(row, col));
                chessBoard.appendChild(square);
            }
        }
        
        updateStatus();
    }
    
    // Handle square click
    function handleSquareClick(row, col) {
        if (!gameActive || computerThinking) return;
        
        const piece = boardState[row][col];
        
        // If a piece is already selected
        if (selectedPiece) {
            const [prevRow, prevCol] = selectedPiece;
            
            // If clicking on the same piece, deselect it
            if (prevRow === row && prevCol === col) {
                clearSelection();
                return;
            }
            
            // Check if the move is valid
            if (isValidMove(prevRow, prevCol, row, col)) {
                // Make the move
                makeMove(prevRow, prevCol, row, col, true);
                
                // If playing against computer and it's computer's turn
                if (vsComputer && currentPlayer === 'black' && gameActive) {
                    setTimeout(computerMove, 800);
                }
            } else {
                clearSelection();
                // Try to select another piece if valid
                if (piece && isCurrentPlayerPiece(piece)) {
                    selectPiece(row, col);
                }
            }
        } else {
            // Select a piece if it exists and belongs to current player
            if (piece && isCurrentPlayerPiece(piece)) {
                selectPiece(row, col);
            }
        }
    }
    
    // Check if piece belongs to current player
    function isCurrentPlayerPiece(piece) {
        const isWhitePiece = piece.charCodeAt(0) > 9817;
        return (currentPlayer === 'white' && isWhitePiece) || 
               (currentPlayer === 'black' && !isWhitePiece);
    }
    
    // Select a piece
    function selectPiece(row, col) {
        clearSelection();
        selectedPiece = [row, col];
        
        const square = document.querySelector(`.chess-square[data-row="${row}"][data-col="${col}"]`);
        square.classList.add('selected');
        
        // Highlight possible moves
        highlightPossibleMoves(row, col);
    }
    
    // Clear selection
    function clearSelection() {
        document.querySelectorAll('.chess-square').forEach(square => {
            square.classList.remove('selected', 'possible-move');
        });
        selectedPiece = null;
    }
    
    // Highlight possible moves
    function highlightPossibleMoves(row, col) {
        const piece = boardState[row][col];
        const moves = getPossibleMoves(row, col, piece);
        
        moves.forEach(([r, c]) => {
            const square = document.querySelector(`.chess-square[data-row="${r}"][data-col="${c}"]`);
            if (square) {
                square.classList.add('possible-move');
            }
        });
    }
    
    // Get possible moves
    function getPossibleMoves(row, col, piece) {
        const moves = [];
        const isWhite = piece.charCodeAt(0) > 9817;
        
        // Pawn moves
        if (piece === '♙' || piece === '♟') {
            const direction = isWhite ? -1 : 1;
            const startRow = isWhite ? 6 : 1;
            
            // Move forward one square
            if (isInBounds(row + direction, col) && !boardState[row + direction][col]) {
                moves.push([row + direction, col]);
                
                // Move forward two squares from starting position
                if (row === startRow && !boardState[row + 2 * direction][col]) {
                    moves.push([row + 2 * direction, col]);
                }
            }
            
            // Captures
            [-1, 1].forEach(dc => {
                const newRow = row + direction;
                const newCol = col + dc;
                if (isInBounds(newRow, newCol) && boardState[newRow][newCol] && 
                    isWhite !== (boardState[newRow][newCol].charCodeAt(0) > 9817)) {
                    moves.push([newRow, newCol]);
                }
            });
        }
        // Knight moves
        else if (piece === '♘' || piece === '♞') {
            const knightMoves = [
                [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            knightMoves.forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                if (isInBounds(newRow, newCol) && 
                    (!boardState[newRow][newCol] || 
                     isWhite !== (boardState[newRow][newCol].charCodeAt(0) > 9817))) {
                    moves.push([newRow, newCol]);
                }
            });
        }
        // Rook moves (vertical and horizontal)
        else if (piece === '♖' || piece === '♜') {
            const directions = [[-1,0], [1,0], [0,-1], [0,1]];
            directions.forEach(([dr, dc]) => {
                let newRow = row + dr;
                let newCol = col + dc;
                while (isInBounds(newRow, newCol)) {
                    if (!boardState[newRow][newCol]) {
                        moves.push([newRow, newCol]);
                    } else {
                        if (isWhite !== (boardState[newRow][newCol].charCodeAt(0) > 9817)) {
                            moves.push([newRow, newCol]);
                        }
                        break;
                    }
                    newRow += dr;
                    newCol += dc;
                }
            });
        }
        // Bishop moves (diagonal)
        else if (piece === '♗' || piece === '♝') {
            const directions = [[-1,-1], [-1,1], [1,-1], [1,1]];
            directions.forEach(([dr, dc]) => {
                let newRow = row + dr;
                let newCol = col + dc;
                while (isInBounds(newRow, newCol)) {
                    if (!boardState[newRow][newCol]) {
                        moves.push([newRow, newCol]);
                    } else {
                        if (isWhite !== (boardState[newRow][newCol].charCodeAt(0) > 9817)) {
                            moves.push([newRow, newCol]);
                        }
                        break;
                    }
                    newRow += dr;
                    newCol += dc;
                }
            });
        }
        // Queen moves (combines rook and bishop)
        else if (piece === '♕' || piece === '♛') {
            const directions = [
                [-1,0], [1,0], [0,-1], [0,1],
                [-1,-1], [-1,1], [1,-1], [1,1]
            ];
            directions.forEach(([dr, dc]) => {
                let newRow = row + dr;
                let newCol = col + dc;
                while (isInBounds(newRow, newCol)) {
                    if (!boardState[newRow][newCol]) {
                        moves.push([newRow, newCol]);
                    } else {
                        if (isWhite !== (boardState[newRow][newCol].charCodeAt(0) > 9817)) {
                            moves.push([newRow, newCol]);
                        }
                        break;
                    }
                    newRow += dr;
                    newCol += dc;
                }
            });
        }
        // King moves (one square in any direction)
        else if (piece === '♔' || piece === '♚') {
            const directions = [
                [-1,0], [1,0], [0,-1], [0,1],
                [-1,-1], [-1,1], [1,-1], [1,1]
            ];
            directions.forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                if (isInBounds(newRow, newCol) && 
                    (!boardState[newRow][newCol] || 
                     isWhite !== (boardState[newRow][newCol].charCodeAt(0) > 9817))) {
                    moves.push([newRow, newCol]);
                }
            });
        }
        
        return moves;
    }
    
    // Check if coordinates are within board
    function isInBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    
    // Validate move
    function isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = boardState[fromRow][fromCol];
        const moves = getPossibleMoves(fromRow, fromCol, piece);
        
        return moves.some(([r, c]) => r === toRow && c === toCol);
    }
    
    // Make a move
    function makeMove(fromRow, fromCol, toRow, toCol, isPlayerMove = false) {
        const piece = boardState[fromRow][fromCol];
        
        // Visual feedback for computer moves
        if (!isPlayerMove && vsComputer) {
            const fromSquare = document.querySelector(`.chess-square[data-row="${fromRow}"][data-col="${fromCol}"]`);
            const toSquare = document.querySelector(`.chess-square[data-row="${toRow}"][data-col="${toCol}"]`);
            if (fromSquare && toSquare) {
                fromSquare.classList.add('computer-move');
                toSquare.classList.add('computer-move');
                setTimeout(() => {
                    fromSquare.classList.remove('computer-move');
                    toSquare.classList.remove('computer-move');
                }, 1000);
            }
        }
        
        // Update board
        boardState[toRow][toCol] = piece;
        boardState[fromRow][fromCol] = '';
        
        // Switch player
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
        
        // Check for checkmate (simplified)
        checkGameStatus();
        
        clearSelection();
        renderChessBoard();
    }
    
    // Computer move logic
    function computerMove() {
        if (!gameActive || currentPlayer !== 'black' || computerThinking) return;
        
        computerThinking = true;
        
        setTimeout(() => {
            // Get all possible moves for black pieces
            const allMoves = [];
            
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = boardState[row][col];
                    if (piece && piece.charCodeAt(0) <= 9817) { // Black pieces
                        const moves = getPossibleMoves(row, col, piece);
                        moves.forEach(([toRow, toCol]) => {
                            // Evaluate move
                            let score = 0;
                            
                            // Capture scoring
                            const targetPiece = boardState[toRow][toCol];
                            if (targetPiece) {
                                score += pieceValues[targetPiece] || 0;
                            }
                            
                            // Position scoring (center control)
                            const centerDistance = Math.abs(3.5 - toRow) + Math.abs(3.5 - toCol);
                            score += (8 - centerDistance) * 0.1;
                            
                            // Piece development (move pieces from back rank)
                            if (row === 0 || row === 1) {
                                score += 0.2;
                            }
                            
                            allMoves.push({
                                fromRow: row,
                                fromCol: col,
                                toRow,
                                toCol,
                                piece,
                                score
                            });
                        });
                    }
                }
            }
            
            if (allMoves.length > 0) {
                // Sort moves by score (highest first)
                allMoves.sort((a, b) => b.score - a.score);
                
                // Get difficulty setting
                const difficulty = document.getElementById('chess-difficulty').value;
                
                let selectedMove;
                if (difficulty === 'easy') {
                    // Easy: Random move from top 50%
                    const topHalf = Math.floor(allMoves.length / 2);
                    selectedMove = allMoves[Math.floor(Math.random() * topHalf)];
                } else if (difficulty === 'medium') {
                    // Medium: Usually best move, sometimes random
                    if (Math.random() > 0.7) {
                        selectedMove = allMoves[Math.floor(Math.random() * allMoves.length)];
                    } else {
                        selectedMove = allMoves[0];
                    }
                } else {
                    // Hard: Best move
                    selectedMove = allMoves[0];
                }
                
                // Make the computer move
                makeMove(
                    selectedMove.fromRow, 
                    selectedMove.fromCol, 
                    selectedMove.toRow, 
                    selectedMove.toCol,
                    false
                );
            }
            
            computerThinking = false;
        }, 800);
    }
    
    // Check game status
    function checkGameStatus() {
        // Check if kings are on the board
        let whiteKing = false;
        let blackKing = false;
        let whitePieces = 0;
        let blackPieces = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = boardState[row][col];
                if (piece) {
                    if (piece === '♔') whiteKing = true;
                    if (piece === '♚') blackKing = true;
                    
                    if (piece.charCodeAt(0) > 9817) {
                        whitePieces++;
                    } else {
                        blackPieces++;
                    }
                }
            }
        }
        
        if (!whiteKing) {
            setTimeout(() => {
                if (gameActive) {
                    alert('Checkmate! Black wins!');
                    gameActive = false;
                }
            }, 100);
        } else if (!blackKing) {
            setTimeout(() => {
                if (gameActive) {
                    alert('Checkmate! White wins!');
                    gameActive = false;
                }
            }, 100);
        }
        // Stalemate detection (simplified)
        else if ((currentPlayer === 'white' && whitePieces === 1) || 
                 (currentPlayer === 'black' && blackPieces === 1)) {
            setTimeout(() => {
                if (gameActive) {
                    alert('Stalemate! Game ends in a draw.');
                    gameActive = false;
                }
            }, 100);
        }
    }
    
    // Update game status display
    function updateStatus() {
        playerDisplay.textContent = currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1);
        playerDisplay.style.color = currentPlayer === 'white' ? '#f1f1f1' : '#333';
        
        // If it's computer's turn and we're in vsComputer mode, trigger computer move
        if (vsComputer && currentPlayer === 'black' && gameActive && !computerThinking) {
            setTimeout(computerMove, 800);
        }
    }
    
    // Toggle computer mode
    modeToggle.addEventListener('click', () => {
        vsComputer = !vsComputer;
        modeDisplay.textContent = vsComputer ? 'Player vs Computer' : 'Player vs Player';
        modeBtn.textContent = vsComputer ? 'vs Player' : 'vs Computer';
        initGame();
    });
    
    // Reset game
    resetButton.addEventListener('click', initGame);
    
    // Initialize the game
    initGame();
}