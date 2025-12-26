// Chess Game with Auto-Move
document.addEventListener('DOMContentLoaded', function() {
    // Game State
    const gameState = {
        board: [],
        currentPlayer: 'white',
        selectedPiece: null,
        possibleMoves: [],
        moveHistory: [],
        gameActive: true,
        moveCount: 0,
        capturedWhite: [],
        capturedBlack: [],
        aiDifficulty: 1,
        aiThinking: false,
        gameStartTime: new Date()
    };

    // Chess Pieces Unicode
    const pieces = {
        white: {
            king: '♔',
            queen: '♕',
            rook: '♖',
            bishop: '♗',
            knight: '♘',
            pawn: '♙'
        },
        black: {
            king: '♚',
            queen: '♛',
            rook: '♜',
            bishop: '♝',
            knight: '♞',
            pawn: '♟'
        }
    };

    // Initialize Board
    function initializeBoard() {
        gameState.board = Array(8).fill().map(() => Array(8).fill(null));
        
        // Set up black pieces
        gameState.board[0] = [
            {type: 'rook', color: 'black'},
            {type: 'knight', color: 'black'},
            {type: 'bishop', color: 'black'},
            {type: 'queen', color: 'black'},
            {type: 'king', color: 'black'},
            {type: 'bishop', color: 'black'},
            {type: 'knight', color: 'black'},
            {type: 'rook', color: 'black'}
        ];
        
        // Black pawns
        for (let i = 0; i < 8; i++) {
            gameState.board[1][i] = {type: 'pawn', color: 'black'};
        }
        
        // White pawns
        for (let i = 0; i < 8; i++) {
            gameState.board[6][i] = {type: 'pawn', color: 'white'};
        }
        
        // Set up white pieces
        gameState.board[7] = [
            {type: 'rook', color: 'white'},
            {type: 'knight', color: 'white'},
            {type: 'bishop', color: 'white'},
            {type: 'queen', color: 'white'},
            {type: 'king', color: 'white'},
            {type: 'bishop', color: 'white'},
            {type: 'knight', color: 'white'},
            {type: 'rook', color: 'white'}
        ];
        
        renderBoard();
        updateGameStatus();
    }

    // Render Chess Board
    function renderBoard() {
        const boardElement = document.getElementById('chessboard');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Check if this square is a possible move
                if (gameState.possibleMoves.some(move => move.row === row && move.col === col)) {
                    square.classList.add('possible-move');
                }
                
                // Check if this square is selected
                if (gameState.selectedPiece && 
                    gameState.selectedPiece.row === row && 
                    gameState.selectedPiece.col === col) {
                    square.classList.add('selected');
                }
                
                // Add piece if exists
                const piece = gameState.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = 'piece';
                    pieceElement.textContent = pieces[piece.color][piece.type];
                    pieceElement.style.color = piece.color === 'white' ? '#ffffff' : '#000000';
                    square.appendChild(pieceElement);
                }
                
                square.addEventListener('click', () => handleSquareClick(row, col));
                boardElement.appendChild(square);
            }
        }
    }

    // Handle Square Click
    function handleSquareClick(row, col) {
        if (!gameState.gameActive || gameState.aiThinking) return;
        
        const clickedPiece = gameState.board[row][col];
        
        // If a piece is already selected
        if (gameState.selectedPiece) {
            // Check if clicking on a possible move
            const isPossibleMove = gameState.possibleMoves.some(
                move => move.row === row && move.col === col
            );
            
            if (isPossibleMove) {
                movePiece(gameState.selectedPiece.row, gameState.selectedPiece.col, row, col);
                gameState.selectedPiece = null;
                gameState.possibleMoves = [];
                renderBoard();
                
                // If it's AI's turn, make AI move after a delay
                if (gameState.currentPlayer === 'black' && gameState.gameActive) {
                    gameState.aiThinking = true;
                    updateAIThinkingStatus();
                    setTimeout(makeAIMove, 1000);
                }
                return;
            }
        }
        
        // Select a piece
        if (clickedPiece && clickedPiece.color === gameState.currentPlayer) {
            gameState.selectedPiece = { row, col, piece: clickedPiece };
            gameState.possibleMoves = getPossibleMoves(row, col, clickedPiece);
            renderBoard();
        } else {
            gameState.selectedPiece = null;
            gameState.possibleMoves = [];
            renderBoard();
        }
    }

    // Get Possible Moves (Simplified for demo)
    function getPossibleMoves(row, col, piece) {
        const moves = [];
        
        // Pawn moves (simplified)
        if (piece.type === 'pawn') {
            const direction = piece.color === 'white' ? -1 : 1;
            const startRow = piece.color === 'white' ? 6 : 1;
            
            // Move forward
            if (row + direction >= 0 && row + direction < 8 && 
                !gameState.board[row + direction][col]) {
                moves.push({row: row + direction, col});
                
                // Double move from start position
                if (row === startRow && !gameState.board[row + 2 * direction][col]) {
                    moves.push({row: row + 2 * direction, col});
                }
            }
            
            // Capture diagonally
            for (let dc = -1; dc <= 1; dc += 2) {
                const newCol = col + dc;
                if (newCol >= 0 && newCol < 8 && 
                    gameState.board[row + direction] &&
                    gameState.board[row + direction][newCol] &&
                    gameState.board[row + direction][newCol].color !== piece.color) {
                    moves.push({row: row + direction, col: newCol});
                }
            }
        }
        
        // Rook moves (simplified - horizontal/vertical)
        if (piece.type === 'rook') {
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            getLinearMoves(row, col, piece, directions, moves);
        }
        
        // Knight moves
        if (piece.type === 'knight') {
            const knightMoves = [
                [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            
            for (const [dr, dc] of knightMoves) {
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    const targetPiece = gameState.board[newRow][newCol];
                    if (!targetPiece || targetPiece.color !== piece.color) {
                        moves.push({row: newRow, col: newCol});
                    }
                }
            }
        }
        
        // King moves (simplified - one square in any direction)
        if (piece.type === 'king') {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        const targetPiece = gameState.board[newRow][newCol];
                        if (!targetPiece || targetPiece.color !== piece.color) {
                            moves.push({row: newRow, col: newCol});
                        }
                    }
                }
            }
        }
        
        return moves;
    }

    // Helper function for linear moves (rook, bishop, queen)
    function getLinearMoves(row, col, piece, directions, moves) {
        for (const [dr, dc] of directions) {
            let newRow = row + dr;
            let newCol = col + dc;
            
            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = gameState.board[newRow][newCol];
                
                if (!targetPiece) {
                    moves.push({row: newRow, col: newCol});
                } else {
                    if (targetPiece.color !== piece.color) {
                        moves.push({row: newRow, col: newCol});
                    }
                    break;
                }
                
                newRow += dr;
                newCol += dc;
            }
        }
    }

    // Move Piece
    function movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = gameState.board[fromRow][fromCol];
        
        // Capture piece if exists
        const capturedPiece = gameState.board[toRow][toCol];
        if (capturedPiece) {
            if (capturedPiece.color === 'white') {
                gameState.capturedWhite.push(capturedPiece);
            } else {
                gameState.capturedBlack.push(capturedPiece);
            }
            updateCapturedPieces();
        }
        
        // Move piece
        gameState.board[toRow][toCol] = piece;
        gameState.board[fromRow][fromCol] = null;
        
        // Special moves (pawn promotion simplified)
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            piece.type = 'queen'; // Auto promote to queen
        }
        
        // Update move history
        const fromPos = String.fromCharCode(97 + fromCol) + (8 - fromRow);
        const toPos = String.fromCharCode(97 + toCol) + (8 - toRow);
        gameState.moveHistory.push(`${piece.color} ${piece.type}: ${fromPos} → ${toPos}`);
        
        gameState.moveCount++;
        gameState.currentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
        
        updateGameStatus();
        updateMoveHistory();
        checkGameStatus();
    }

    // AI Move Logic
    function makeAIMove() {
        if (!gameState.gameActive || gameState.currentPlayer !== 'black') return;
        
        // Get all black pieces
        const blackPieces = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                if (piece && piece.color === 'black') {
                    const moves = getPossibleMoves(row, col, piece);
                    if (moves.length > 0) {
                        blackPieces.push({row, col, piece, moves});
                    }
                }
            }
        }
        
        if (blackPieces.length === 0) {
            gameState.aiThinking = false;
            updateAIThinkingStatus();
            return;
        }
        
        // Select random piece based on difficulty
        let selectedPiece;
        if (gameState.aiDifficulty === 1) {
            // Easy: Random piece
            selectedPiece = blackPieces[Math.floor(Math.random() * blackPieces.length)];
        } else if (gameState.aiDifficulty === 2) {
            // Medium: Prefer pieces that can capture
            const capturingPieces = blackPieces.filter(p => 
                p.moves.some(m => gameState.board[m.row][m.col])
            );
            selectedPiece = capturingPieces.length > 0 
                ? capturingPieces[Math.floor(Math.random() * capturingPieces.length)]
                : blackPieces[Math.floor(Math.random() * blackPieces.length)];
        } else {
            // Hard: Prefer moves that capture higher value pieces
            selectedPiece = blackPieces.reduce((best, current) => {
                const currentScore = evaluateMoveScore(current);
                const bestScore = best ? evaluateMoveScore(best) : -Infinity;
                return currentScore > bestScore ? current : best;
            }, null);
        }
        
        // Select random move from available moves
        const randomMove = selectedPiece.moves[Math.floor(Math.random() * selectedPiece.moves.length)];
        
        // Execute move
        setTimeout(() => {
            movePiece(selectedPiece.row, selectedPiece.col, randomMove.row, randomMove.col);
            gameState.aiThinking = false;
            updateAIThinkingStatus();
            renderBoard();
        }, 500);
    }

    // Evaluate move score for AI (simplified)
    function evaluateMoveScore(pieceInfo) {
        let score = 0;
        
        for (const move of pieceInfo.moves) {
            const targetPiece = gameState.board[move.row][move.col];
            if (targetPiece) {
                // Add value based on captured piece
                const pieceValues = {
                    pawn: 1,
                    knight: 3,
                    bishop: 3,
                    rook: 5,
                    queen: 9,
                    king: 100
                };
                score += pieceValues[targetPiece.type] || 0;
            }
        }
        
        return score;
    }

    // Update Game Status Display
    function updateGameStatus() {
        document.getElementById('currentTurn').textContent = 
            gameState.currentPlayer.charAt(0).toUpperCase() + gameState.currentPlayer.slice(1);
        document.getElementById('currentTurn').className = 
            `turn ${gameState.currentPlayer}-turn`;
        
        document.getElementById('moveCount').textContent = gameState.moveCount;
        
        // Update player indicators
        document.querySelector('.white-player').classList.toggle('active', gameState.currentPlayer === 'white');
        document.querySelector('.black-player').classList.toggle('active', gameState.currentPlayer === 'black');
        
        // Update piece counts
        const pieceCounts = countPieces();
        document.getElementById('whitePieces').textContent = pieceCounts.white;
        document.getElementById('blackPieces').textContent = pieceCounts.black;
        
        // Update time
        updateGameTime();
    }

    // Update AI Thinking Status
    function updateAIThinkingStatus() {
        document.getElementById('aiThinking').textContent = 
            gameState.aiThinking ? 'Yes...' : 'No';
        document.getElementById('aiThinking').style.color = 
            gameState.aiThinking ? '#ffd369' : '#4ecdc4';
    }

    // Update Game Time
    function updateGameTime() {
        const now = new Date();
        const diff = Math.floor((now - gameState.gameStartTime) / 1000);
        const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
        const seconds = (diff % 60).toString().padStart(2, '0');
        document.getElementById('gameTime').textContent = `${minutes}:${seconds}`;
    }

    // Count Pieces
    function countPieces() {
        let whiteCount = 0;
        let blackCount = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                if (piece) {
                    if (piece.color === 'white') whiteCount++;
                    else blackCount++;
                }
            }
        }
        
        return { white: whiteCount, black: blackCount };
    }

    // Update Captured Pieces Display
    function updateCapturedPieces() {
        const whiteCaptured = document.getElementById('capturedWhite');
        const blackCaptured = document.getElementById('capturedBlack');
        
        whiteCaptured.innerHTML = '';
        blackCaptured.innerHTML = '';
        
        gameState.capturedWhite.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.className = 'piece';
            pieceElement.textContent = pieces.white[piece.type];
            pieceElement.style.fontSize = '1.5rem';
            pieceElement.style.opacity = '0.7';
            whiteCaptured.appendChild(pieceElement);
        });
        
        gameState.capturedBlack.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.className = 'piece';
            pieceElement.textContent = pieces.black[piece.type];
            pieceElement.style.fontSize = '1.5rem';
            pieceElement.style.opacity = '0.7';
            blackCaptured.appendChild(pieceElement);
        });
    }

    // Update Move History
    function updateMoveHistory() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        
        gameState.moveHistory.slice(-10).forEach((move, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = `${gameState.moveHistory.length - 10 + index + 1}. ${move}`;
            historyList.appendChild(historyItem);
        });
        
        // Scroll to bottom
        historyList.scrollTop = historyList.scrollHeight;
    }

    // Check Game Status
    function checkGameStatus() {
        // Simplified check - just count kings
        const kings = countPieces().white + countPieces().black;
        if (kings < 2) {
            gameState.gameActive = false;
            document.getElementById('gameStatus').textContent = 'Game Over';
            document.getElementById('gameStatus').style.color = '#ff6b6b';
        }
    }

    // Event Listeners
    document.getElementById('aiMoveBtn').addEventListener('click', function() {
        if (gameState.gameActive && gameState.currentPlayer === 'black' && !gameState.aiThinking) {
            gameState.aiThinking = true;
            updateAIThinkingStatus();
            makeAIMove();
        }
    });

    document.getElementById('resetBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the game?')) {
            resetGame();
        }
    });

    document.getElementById('hintBtn').addEventListener('click', function() {
        if (gameState.gameActive && gameState.currentPlayer === 'white') {
            showHint();
        }
    });

    // Difficulty Level Buttons
    document.querySelectorAll('.level-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            gameState.aiDifficulty = parseInt(this.dataset.level);
        });
    });

    // Toggle Menu for Mobile
    document.getElementById('menuToggle').addEventListener('click', function() {
        document.getElementById('navMenu').classList.toggle('active');
    });

    // Close menu when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 900) {
            const menu = document.getElementById('navMenu');
            const toggle = document.getElementById('menuToggle');
            if (!menu.contains(event.target) && !toggle.contains(event.target)) {
                menu.classList.remove('active');
            }
        }
    });

    // Show Hint
    function showHint() {
        const whitePieces = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                if (piece && piece.color === 'white') {
                    const moves = getPossibleMoves(row, col, piece);
                    if (moves.length > 0) {
                        whitePieces.push({row, col, piece, moves});
                    }
                }
            }
        }
        
        if (whitePieces.length > 0) {
            const randomPiece = whitePieces[Math.floor(Math.random() * whitePieces.length)];
            const randomMove = randomPiece.moves[Math.floor(Math.random() * randomPiece.moves.length)];
            
            // Highlight the suggested move
            gameState.selectedPiece = { row: randomPiece.row, col: randomPiece.col };
            gameState.possibleMoves = [{row: randomMove.row, col: randomMove.col}];
            renderBoard();
            
            // Remove highlight after 3 seconds
            setTimeout(() => {
                gameState.selectedPiece = null;
                gameState.possibleMoves = [];
                renderBoard();
            }, 3000);
            
            alert(`Hint: Try moving your ${randomPiece.piece.type} from ${String.fromCharCode(97 + randomPiece.col)}${8 - randomPiece.row} to ${String.fromCharCode(97 + randomMove.col)}${8 - randomMove.row}`);
        }
    }

    // Reset Game
    function resetGame() {
        gameState.currentPlayer = 'white';
        gameState.selectedPiece = null;
        gameState.possibleMoves = [];
        gameState.moveHistory = [];
        gameState.gameActive = true;
        gameState.moveCount = 0;
        gameState.capturedWhite = [];
        gameState.capturedBlack = [];
        gameState.aiThinking = false;
        gameState.gameStartTime = new Date();
        
        initializeBoard();
        updateCapturedPieces();
        updateMoveHistory();
        updateAIThinkingStatus();
        
        document.getElementById('gameStatus').textContent = 'Playing';
        document.getElementById('gameStatus').style.color = '#4ecdc4';
    }

    // Update game time every second
    setInterval(updateGameTime, 1000);

    // Initialize the game
    initializeBoard();
});