document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    const gameContents = document.querySelectorAll('.game-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding game content
            gameContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Initialize all games
    initializeChess();
    initializeTicTacToe();
    initializeMemoryMatch();
    
    // Chess Game Implementation
    function initializeChess() {
        const chessBoard = document.getElementById('chess-board');
        const resetButton = document.getElementById('reset-chess');
        
        // Simple chess piece representation
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
        
        let selectedPiece = null;
        let currentPlayer = 'white';
        let boardState = JSON.parse(JSON.stringify(initialBoard));
        
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
                    
                    square.addEventListener('click', () => handleChessSquareClick(row, col));
                    chessBoard.appendChild(square);
                }
            }
            
            updatePlayerDisplay();
        }
        
        function handleChessSquareClick(row, col) {
            const square = document.querySelector(`.chess-square[data-row="${row}"][data-col="${col}"]`);
            
            // If a piece is already selected
            if (selectedPiece) {
                const [prevRow, prevCol] = selectedPiece;
                
                // If clicking on the same piece, deselect it
                if (prevRow === row && prevCol === col) {
                    clearSelection();
                    return;
                }
                
                // Check if the move is valid (simplified logic)
                const piece = boardState[prevRow][prevCol];
                const targetPiece = boardState[row][col];
                
                // Basic move validation
                let isValidMove = false;
                
                // Pawn moves (simplified)
                if (piece === '♙' && currentPlayer === 'white') {
                    // White pawn moves forward one square
                    if (col === prevCol && row === prevRow - 1 && !targetPiece) {
                        isValidMove = true;
                    }
                } else if (piece === '♟' && currentPlayer === 'black') {
                    // Black pawn moves forward one square
                    if (col === prevCol && row === prevRow + 1 && !targetPiece) {
                        isValidMove = true;
                    }
                } else {
                    // For other pieces, allow any move (simplified for demo)
                    isValidMove = true;
                }
                
                if (isValidMove) {
                    // Make the move
                    boardState[row][col] = piece;
                    boardState[prevRow][prevCol] = '';
                    
                    // Switch player
                    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
                    
                    clearSelection();
                    renderChessBoard();
                } else {
                    clearSelection();
                }
            } else {
                // Select a piece if it exists and belongs to current player
                const piece = boardState[row][col];
                if (piece) {
                    const isWhitePiece = piece.charCodeAt(0) > 9817;
                    if ((currentPlayer === 'white' && isWhitePiece) || 
                        (currentPlayer === 'black' && !isWhitePiece)) {
                        selectedPiece = [row, col];
                        square.classList.add('selected');
                        
                        // Highlight possible moves (simplified)
                        highlightPossibleMoves(row, col, piece);
                    }
                }
            }
        }
        
        function highlightPossibleMoves(row, col, piece) {
            // Simplified possible moves for demo
            let moves = [];
            
            if (piece === '♙' || piece === '♟') {
                // Pawns move forward one square
                if (piece === '♙') {
                    if (row > 0) moves.push([row-1, col]);
                } else {
                    if (row < 7) moves.push([row+1, col]);
                }
            } else {
                // For other pieces, highlight adjacent squares
                const directions = [[-1,0], [1,0], [0,-1], [0,1], [-1,-1], [-1,1], [1,-1], [1,1]];
                for (const [dr, dc] of directions) {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        moves.push([newRow, newCol]);
                    }
                }
            }
            
            moves.forEach(([r, c]) => {
                const square = document.querySelector(`.chess-square[data-row="${r}"][data-col="${c}"]`);
                if (square) {
                    square.classList.add('possible-move');
                }
            });
        }
        
        function clearSelection() {
            document.querySelectorAll('.chess-square').forEach(square => {
                square.classList.remove('selected', 'possible-move');
            });
            selectedPiece = null;
        }
        
        function updatePlayerDisplay() {
            const playerTurnElement = document.querySelector('#chess .player-turn');
            if (playerTurnElement) {
                playerTurnElement.textContent = currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1);
            }
        }
        
        resetButton.addEventListener('click', () => {
            boardState = JSON.parse(JSON.stringify(initialBoard));
            currentPlayer = 'white';
            clearSelection();
            renderChessBoard();
        });
        
        renderChessBoard();
    }
    
    // Tic-Tac-Toe Game Implementation
    function initializeTicTacToe() {
        const tttBoard = document.getElementById('ttt-board');
        const resetButton = document.getElementById('reset-ttt');
        const playerDisplay = document.getElementById('ttt-player');
        const statusDisplay = document.getElementById('ttt-status');
        
        let board = ['', '', '', '', '', '', '', '', ''];
        let currentPlayer = 'X';
        let gameActive = true;
        
        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        function renderTicTacToeBoard() {
            tttBoard.innerHTML = '';
            
            for (let i = 0; i < 9; i++) {
                const cell = document.createElement('div');
                cell.className = 'ttt-cell';
                cell.dataset.index = i;
                
                if (board[i]) {
                    cell.textContent = board[i];
                    cell.classList.add(board[i] === 'X' ? 'x-marker' : 'o-marker');
                }
                
                cell.addEventListener('click', () => handleCellClick(i));
                tttBoard.appendChild(cell);
            }
            
            playerDisplay.textContent = currentPlayer;
            playerDisplay.style.color = currentPlayer === 'X' ? '#4cc9f0' : '#f72585';
        }
        
        function handleCellClick(index) {
            if (board[index] !== '' || !gameActive) return;
            
            board[index] = currentPlayer;
            renderTicTacToeBoard();
            checkResult();
        }
        
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
                statusDisplay.textContent = `Player ${currentPlayer} Wins!`;
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
            
            // Switch player
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;
        }
        
        resetButton.addEventListener('click', () => {
            board = ['', '', '', '', '', '', '', '', ''];
            currentPlayer = 'X';
            gameActive = true;
            statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;
            statusDisplay.style.color = '#72efdd';
            renderTicTacToeBoard();
        });
        
        renderTicTacToeBoard();
    }
    
    // Memory Match Game Implementation
    function initializeMemoryMatch() {
        const memoryBoard = document.getElementById('memory-board');
        const resetButton = document.getElementById('reset-memory');
        const moveCountDisplay = document.getElementById('move-count');
        const matchCountDisplay = document.getElementById('match-count');
        
        const symbols = ['★', '❤', '▲', '◆', '☀', '☁', '⚡', '❄'];
        let cards = [];
        let flippedCards = [];
        let matchedPairs = 0;
        let moves = 0;
        let canFlip = true;
        
        function initializeGame() {
            // Create pairs of symbols
            cards = [...symbols, ...symbols];
            
            // Shuffle cards
            for (let i = cards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cards[i], cards[j]] = [cards[j], cards[i]];
            }
            
            flippedCards = [];
            matchedPairs = 0;
            moves = 0;
            canFlip = true;
            
            updateStats();
            renderMemoryBoard();
        }
        
        function renderMemoryBoard() {
            memoryBoard.innerHTML = '';
            
            cards.forEach((symbol, index) => {
                const card = document.createElement('div');
                card.className = 'memory-card';
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
                
                card.addEventListener('click', () => flipCard(card, index));
                memoryBoard.appendChild(card);
            });
        }
        
        function flipCard(card, index) {
            // Don't allow flipping if card is already flipped or matched, or if we're waiting to flip back
            if (card.classList.contains('flipped') || 
                card.classList.contains('matched') || 
                !canFlip || 
                flippedCards.length >= 2) return;
            
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
                        card1.card.classList.add('matched');
                        card2.card.classList.add('matched');
                        flippedCards = [];
                        canFlip = true;
                        matchedPairs++;
                        updateStats();
                        
                        // Check if game is complete
                        if (matchedPairs === symbols.length) {
                            setTimeout(() => {
                                alert(`Congratulations! You completed the game in ${moves} moves!`);
                            }, 500);
                        }
                    }, 500);
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
        
        function updateStats() {
            moveCountDisplay.textContent = moves;
            matchCountDisplay.textContent = `${matchedPairs}/${symbols.length}`;
        }
        
        resetButton.addEventListener('click', initializeGame);
        
        // Initialize the game
        initializeGame();
    }
});