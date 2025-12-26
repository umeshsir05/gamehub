// Chess Game with Smart AI
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
        aiDifficulty: 2,
        aiThinking: false,
        gameStartTime: new Date(),
        aiThinkingTime: 0,
        aiBestMove: null
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

    // Piece values for AI evaluation
    const pieceValues = {
        pawn: 100,
        knight: 320,
        bishop: 330,
        rook: 500,
        queen: 900,
        king: 20000
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

    // Render Chess Board with AI thinking animation
    function renderBoard() {
        const boardElement = document.getElementById('chessboard');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Highlight AI's best move if thinking
                if (gameState.aiThinking && gameState.aiBestMove) {
                    const bestMove = gameState.aiBestMove;
                    if ((bestMove.from.row === row && bestMove.from.col === col) ||
                        (bestMove.to.row === row && bestMove.to.col === col)) {
                        square.classList.add('ai-thinking-move');
                    }
                }
                
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
                    
                    // Add animation for AI thinking
                    if (gameState.aiThinking && piece.color === 'black') {
                        pieceElement.classList.add('ai-thinking-piece');
                    }
                    
                    square.appendChild(pieceElement);
                }
                
                square.addEventListener('click', () => handleSquareClick(row, col));
                boardElement.appendChild(square);
            }
        }
    }

    // Handle Square Click
    function handleSquareClick(row, col) {
        if (!gameState.gameActive || gameState.aiThinking) {
            if (gameState.aiThinking) {
                showAIMessage("AI is thinking... Please wait!");
            }
            return;
        }
        
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
                
                // If it's AI's turn, start AI thinking
                if (gameState.currentPlayer === 'black' && gameState.gameActive) {
                    startAIThinking();
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

    // Get All Possible Moves for a piece
    function getPossibleMoves(row, col, piece) {
        const moves = [];
        
        if (!piece) return moves;
        
        // Pawn moves
        if (piece.type === 'pawn') {
            const direction = piece.color === 'white' ? -1 : 1;
            const startRow = piece.color === 'white' ? 6 : 1;
            
            // Move forward one square
            if (row + direction >= 0 && row + direction < 8 && 
                !gameState.board[row + direction][col]) {
                moves.push({row: row + direction, col});
                
                // Move forward two squares from start position
                if (row === startRow && !gameState.board[row + 2 * direction][col] && 
                    !gameState.board[row + direction][col]) {
                    moves.push({row: row + 2 * direction, col});
                }
            }
            
            // Capture diagonally
            for (let dc = -1; dc <= 1; dc += 2) {
                const newCol = col + dc;
                if (newCol >= 0 && newCol < 8) {
                    const targetRow = row + direction;
                    if (targetRow >= 0 && targetRow < 8) {
                        const targetPiece = gameState.board[targetRow][newCol];
                        if (targetPiece && targetPiece.color !== piece.color) {
                            moves.push({row: targetRow, col: newCol});
                        }
                    }
                }
            }
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
        
        // King moves
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
        
        // Rook, Bishop, Queen moves
        if (['rook', 'bishop', 'queen'].includes(piece.type)) {
            const directions = [];
            
            if (piece.type === 'rook' || piece.type === 'queen') {
                directions.push(...[[-1, 0], [1, 0], [0, -1], [0, 1]]);
            }
            if (piece.type === 'bishop' || piece.type === 'queen') {
                directions.push(...[[-1, -1], [-1, 1], [1, -1], [1, 1]]);
            }
            
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
        
        return moves;
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
            
            // Add capture message
            addAIMessage(`♛ ${piece.color} captured ${capturedPiece.color} ${capturedPiece.type}!`);
        }
        
        // Move piece
        gameState.board[toRow][toCol] = piece;
        gameState.board[fromRow][fromCol] = null;
        
        // Pawn promotion
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            piece.type = 'queen';
            addAIMessage(`🎉 ${piece.color} pawn promoted to Queen!`);
        }
        
        // Update move history
        const fromPos = String.fromCharCode(97 + fromCol) + (8 - fromRow);
        const toPos = String.fromCharCode(97 + toCol) + (8 - toRow);
        const moveNotation = `${fromPos}-${toPos}`;
        gameState.moveHistory.push({
            move: moveNotation,
            piece: piece.type,
            color: piece.color,
            capture: !!capturedPiece
        });
        
        gameState.moveCount++;
        gameState.currentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
        
        updateGameStatus();
        updateMoveHistory();
        checkGameStatus();
    }

    // START AI THINKING PROCESS
    function startAIThinking() {
        gameState.aiThinking = true;
        gameState.aiThinkingTime = 0;
        gameState.aiBestMove = null;
        
        updateAIThinkingStatus();
        showAIMessage("🤖 AI is thinking... Analyzing positions");
        startThinkingAnimation();
        
        // Start thinking timer
        const thinkingTimer = setInterval(() => {
            gameState.aiThinkingTime++;
            updateAIThinkingTime();
            
            // Show different messages based on thinking time
            if (gameState.aiThinkingTime === 1) {
                showAIMessage("🤔 Calculating possible moves...");
            } else if (gameState.aiThinkingTime === 2) {
                showAIMessage("🧠 Evaluating positions...");
            } else if (gameState.aiThinkingTime === 3) {
                showAIMessage("⚡ Finding best strategy...");
            }
        }, 1000);
        
        // Calculate AI move based on difficulty
        setTimeout(() => {
            const bestMove = calculateBestMove();
            
            if (bestMove) {
                gameState.aiBestMove = bestMove;
                renderBoard();
                showAIMessage(`✅ AI found move: ${String.fromCharCode(97 + bestMove.from.col)}${8 - bestMove.from.row} → ${String.fromCharCode(97 + bestMove.to.col)}${8 - bestMove.to.row}`);
                
                // Execute move after showing best move
                setTimeout(() => {
                    clearInterval(thinkingTimer);
                    gameState.aiThinking = false;
                    movePiece(bestMove.from.row, bestMove.from.col, bestMove.to.row, bestMove.to.col);
                    renderBoard();
                    updateAIThinkingStatus();
                    
                    // Show AI's thought process
                    showAIThoughtProcess(bestMove);
                }, 1500);
            } else {
                clearInterval(thinkingTimer);
                gameState.aiThinking = false;
                updateAIThinkingStatus();
                showAIMessage("⚠️ AI couldn't find a valid move!");
            }
        }, getAIThinkingTime());
    }

    // Calculate Best Move using Minimax algorithm
    function calculateBestMove() {
        const depth = getSearchDepth();
        const moves = getAllPossibleMoves('black');
        
        if (moves.length === 0) return null;
        
        let bestMove = null;
        let bestScore = -Infinity;
        
        // Shuffle moves for variety
        shuffleArray(moves);
        
        // Evaluate each move
        for (const move of moves) {
            // Make the move
            const capturedPiece = gameState.board[move.to.row][move.to.col];
            const originalPiece = gameState.board[move.from.row][move.from.col];
            
            gameState.board[move.to.row][move.to.col] = originalPiece;
            gameState.board[move.from.row][move.from.col] = null;
            
            // Calculate score with minimax
            let score;
            if (depth > 0) {
                score = -minimax(depth - 1, -Infinity, Infinity, false);
            } else {
                score = evaluateBoard();
            }
            
            // Undo the move
            gameState.board[move.from.row][move.from.col] = originalPiece;
            gameState.board[move.to.row][move.to.col] = capturedPiece;
            
            // Update best move
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }

    // Minimax algorithm with Alpha-Beta pruning
    function minimax(depth, alpha, beta, isMaximizing) {
        if (depth === 0) {
            return evaluateBoard();
        }
        
        const player = isMaximizing ? 'black' : 'white';
        const moves = getAllPossibleMoves(player);
        
        if (moves.length === 0) {
            return evaluateBoard();
        }
        
        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of moves) {
                // Make move
                const capturedPiece = gameState.board[move.to.row][move.to.col];
                const originalPiece = gameState.board[move.from.row][move.from.col];
                
                gameState.board[move.to.row][move.to.col] = originalPiece;
                gameState.board[move.from.row][move.from.col] = null;
                
                // Pawn promotion for AI
                if (originalPiece.type === 'pawn' && (move.to.row === 0 || move.to.row === 7)) {
                    originalPiece.type = 'queen';
                }
                
                const evaluation = minimax(depth - 1, alpha, beta, false);
                
                // Undo move
                gameState.board[move.from.row][move.from.col] = originalPiece;
                gameState.board[move.to.row][move.to.col] = capturedPiece;
                if (originalPiece.type === 'queen' && originalPiece.type !== 'queen') {
                    originalPiece.type = 'pawn';
                }
                
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                // Make move
                const capturedPiece = gameState.board[move.to.row][move.to.col];
                const originalPiece = gameState.board[move.from.row][move.from.col];
                
                gameState.board[move.to.row][move.to.col] = originalPiece;
                gameState.board[move.from.row][move.from.col] = null;
                
                const evaluation = minimax(depth - 1, alpha, beta, true);
                
                // Undo move
                gameState.board[move.from.row][move.from.col] = originalPiece;
                gameState.board[move.to.row][move.to.col] = capturedPiece;
                
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            return minEval;
        }
    }

    // Evaluate board position
    function evaluateBoard() {
        let score = 0;
        
        // Material score
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                if (piece) {
                    const pieceScore = pieceValues[piece.type] || 0;
                    const positionScore = getPositionScore(piece, row, col);
                    
                    if (piece.color === 'black') {
                        score += pieceScore + positionScore;
                    } else {
                        score -= pieceScore + positionScore;
                    }
                }
            }
        }
        
        // Additional factors
        score += evaluateMobility('black') * 10;
        score -= evaluateMobility('white') * 10;
        
        score += evaluatePawnStructure('black') * 5;
        score -= evaluatePawnStructure('white') * 5;
        
        score += evaluateKingSafety('black') * 20;
        score -= evaluateKingSafety('white') * 20;
        
        return score;
    }

    // Get position score for piece
    function getPositionScore(piece, row, col) {
        // Simplified position tables
        const pawnTable = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5, 5, 10, 25, 25, 10, 5, 5],
            [0, 0, 0, 20, 20, 0, 0, 0],
            [5, -5, -10, 0, 0, -10, -5, 5],
            [5, 10, 10, -20, -20, 10, 10, 5],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];
        
        const knightTable = [
            [-50, -40, -30, -30, -30, -30, -40, -50],
            [-40, -20, 0, 0, 0, 0, -20, -40],
            [-30, 0, 10, 15, 15, 10, 0, -30],
            [-30, 5, 15, 20, 20, 15, 5, -30],
            [-30, 0, 15, 20, 20, 15, 0, -30],
            [-30, 5, 10, 15, 15, 10, 5, -30],
            [-40, -20, 0, 5, 5, 0, -20, -40],
            [-50, -40, -30, -30, -30, -30, -40, -50]
        ];
        
        // For black pieces, reverse the row
        const r = piece.color === 'black' ? row : 7 - row;
        
        switch (piece.type) {
            case 'pawn':
                return pawnTable[r][col];
            case 'knight':
                return knightTable[r][col];
            case 'bishop':
                return -30 + Math.abs(3.5 - col) * 10 + Math.abs(3.5 - r) * 10;
            case 'rook':
                return r > 4 ? 20 : 10;
            case 'queen':
                return -10;
            case 'king':
                return r < 2 ? -30 : 10;
            default:
                return 0;
        }
    }

    // Get all possible moves for a player
    function getAllPossibleMoves(color) {
        const allMoves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                if (piece && piece.color === color) {
                    const moves = getPossibleMoves(row, col, piece);
                    moves.forEach(move => {
                        allMoves.push({
                            from: {row, col},
                            to: {row: move.row, col: move.col},
                            piece: piece
                        });
                    });
                }
            }
        }
        
        return allMoves;
    }

    // Get search depth based on difficulty
    function getSearchDepth() {
        switch(gameState.aiDifficulty) {
            case 1: return 1; // Easy
            case 2: return 2; // Medium
            case 3: return 3; // Hard
            default: return 2;
        }
    }

    // Get thinking time based on difficulty
    function getAIThinkingTime() {
        switch(gameState.aiDifficulty) {
            case 1: return 1000 + Math.random() * 1000; // 1-2 seconds
            case 2: return 2000 + Math.random() * 2000; // 2-4 seconds
            case 3: return 3000 + Math.random() * 3000; // 3-6 seconds
            default: return 2000;
        }
    }

    // Start thinking animation
    function startThinkingAnimation() {
        const aiThinkingElement = document.getElementById('aiThinking');
        let dots = 0;
        
        const animationInterval = setInterval(() => {
            if (!gameState.aiThinking) {
                clearInterval(animationInterval);
                return;
            }
            
            dots = (dots + 1) % 4;
            aiThinkingElement.textContent = 'Thinking' + '.'.repeat(dots);
            aiThinkingElement.style.color = ['#ffd369', '#4ecdc4', '#00adb5', '#ff6b6b'][dots];
        }, 500);
    }

    // Show AI thought process
    function showAIThoughtProcess(move) {
        const thoughtProcess = [
            `Evaluated ${getAllPossibleMoves('black').length} possible moves`,
            `Searched ${getSearchDepth()} moves ahead`,
            `Move score: ${evaluateMove(move)}`,
            `Material advantage: ${calculateMaterialAdvantage()}`
        ];
        
        setTimeout(() => {
            showAIMessage("🧠 AI Analysis:");
            thoughtProcess.forEach((thought, index) => {
                setTimeout(() => {
                    addAIMessage(thought);
                }, index * 800);
            });
        }, 500);
    }

    // Evaluate a specific move
    function evaluateMove(move) {
        const targetPiece = gameState.board[move.to.row][move.to.col];
        let score = 0;
        
        if (targetPiece) {
            score += pieceValues[targetPiece.type] || 0;
        }
        
        // Center control bonus
        if ((move.to.row >= 3 && move.to.row <= 4) && 
            (move.to.col >= 3 && move.to.col <= 4)) {
            score += 20;
        }
        
        // Attack bonus
        if (isSquareAttacked(move.to.row, move.to.col, 'white')) {
            score += 10;
        }
        
        return score;
    }

    // Check if square is attacked
    function isSquareAttacked(row, col, byColor) {
        // Simplified attack check
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = gameState.board[r][c];
                if (piece && piece.color === byColor) {
                    const moves = getPossibleMoves(r, c, piece);
                    if (moves.some(m => m.row === row && m.col === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Calculate material advantage
    function calculateMaterialAdvantage() {
        let blackMaterial = 0;
        let whiteMaterial = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                if (piece) {
                    const value = pieceValues[piece.type] || 0;
                    if (piece.color === 'black') {
                        blackMaterial += value;
                    } else {
                        whiteMaterial += value;
                    }
                }
            }
        }
        
        return blackMaterial - whiteMaterial;
    }

    // Evaluate mobility (number of legal moves)
    function evaluateMobility(color) {
        return getAllPossibleMoves(color).length;
    }

    // Evaluate pawn structure
    function evaluatePawnStructure(color) {
        let score = 0;
        
        for (let col = 0; col < 8; col++) {
            for (let row = 0; row < 8; row++) {
                const piece = gameState.board[row][col];
                if (piece && piece.type === 'pawn' && piece.color === color) {
                    // Connected pawns
                    for (let dc = -1; dc <= 1; dc += 2) {
                        const neighborCol = col + dc;
                        if (neighborCol >= 0 && neighborCol < 8) {
                            const neighbor = gameState.board[row][neighborCol];
                            if (neighbor && neighbor.type === 'pawn' && neighbor.color === color) {
                                score += 10;
                            }
                        }
                    }
                    
                    // Isolated pawn penalty
                    let hasFriend = false;
                    for (let dc = -1; dc <= 1; dc += 2) {
                        const neighborCol = col + dc;
                        if (neighborCol >= 0 && neighborCol < 8) {
                            for (let r = 0; r < 8; r++) {
                                const pieceAt = gameState.board[r][neighborCol];
                                if (pieceAt && pieceAt.type === 'pawn' && pieceAt.color === color) {
                                    hasFriend = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (!hasFriend) score -= 20;
                }
            }
        }
        
        return score;
    }

    // Evaluate king safety
    function evaluateKingSafety(color) {
        let score = 0;
        
        // Find king
        let kingRow = -1, kingCol = -1;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    kingRow = row;
                    kingCol = col;
                    break;
                }
            }
        }
        
        if (kingRow === -1) return -1000;
        
        // Castled bonus
        if ((color === 'white' && kingRow === 7 && kingCol === 6) || 
            (color === 'black' && kingRow === 0 && kingCol === 6)) {
            score += 30;
        }
        
        // Pawn shield bonus
        const direction = color === 'white' ? -1 : 1;
        for (let dc = -1; dc <= 1; dc++) {
            const shieldRow = kingRow + direction;
            const shieldCol = kingCol + dc;
            if (shieldRow >= 0 && shieldRow < 8 && shieldCol >= 0 && shieldCol < 8) {
                const shieldPiece = gameState.board[shieldRow][shieldCol];
                if (shieldPiece && shieldPiece.type === 'pawn' && shieldPiece.color === color) {
                    score += 15;
                }
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
        const aiThinkingElement = document.getElementById('aiThinking');
        aiThinkingElement.textContent = gameState.aiThinking ? 'Thinking...' : 'No';
        aiThinkingElement.style.color = gameState.aiThinking ? '#ffd369' : '#4ecdc4';
        
        // Disable/Enable buttons
        const buttons = ['aiMoveBtn', 'resetBtn', 'hintBtn'];
        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.disabled = gameState.aiThinking;
                btn.style.opacity = gameState.aiThinking ? '0.5' : '1';
            }
        });
    }

    // Update AI Thinking Time
    function updateAIThinkingTime() {
        const thinkingTimeElement = document.getElementById('gameTime');
        if (gameState.aiThinking) {
            thinkingTimeElement.textContent = `AI: ${gameState.aiThinkingTime}s`;
            thinkingTimeElement.style.color = '#ffd369';
        } else {
            updateGameTime();
        }
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
        
        gameState.moveHistory.slice(-10).forEach((moveData, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const moveNumber = gameState.moveHistory.length - 10 + index + 1;
            const moveText = `${moveNumber}. ${moveData.move}`;
            const captureMark = moveData.capture ? 'x' : '';
            
            historyItem.innerHTML = `
                <span style="color: ${moveData.color === 'white' ? '#ffd369' : '#00adb5'}">
                    ${moveData.piece.toUpperCase()}
                </span>
                <span>${moveData.move} ${captureMark}</span>
            `;
            
            historyList.appendChild(historyItem);
        });
        
        // Scroll to bottom
        historyList.scrollTop = historyList.scrollHeight;
    }

    // Check Game Status
    function checkGameStatus() {
        // Check for checkmate/stalemate (simplified)
        const blackMoves = getAllPossibleMoves('black').length;
        const whiteMoves = getAllPossibleMoves('white').length;
        
        if (blackMoves === 0 || whiteMoves === 0) {
            gameState.gameActive = false;
            const winner = blackMoves === 0 ? 'White' : 'Black';
            document.getElementById('gameStatus').textContent = `Checkmate! ${winner} wins!`;
            document.getElementById('gameStatus').style.color = '#ff6b6b';
            
            showAIMessage(`🎉 ${winner} wins the game!`);
        }
    }

    // Helper functions
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function showAIMessage(message) {
        // Create or update AI message display
        let messageBox = document.getElementById('aiMessageBox');
        if (!messageBox) {
            messageBox = document.createElement('div');
            messageBox.id = 'aiMessageBox';
            messageBox.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: rgba(0, 173, 181, 0.9);
                color: white;
                padding: 15px;
                border-radius: 10px;
                max-width: 300px;
                z-index: 1000;
                box-shadow: 0 5px 20px rgba(0,0,0,0.3);
                backdrop-filter: blur(10px);
                display: none;
            `;
            document.body.appendChild(messageBox);
        }
        
        messageBox.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-robot" style="font-size: 1.2rem;"></i>
                <span>${message}</span>
            </div>
        `;
        messageBox.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 3000);
    }

    function addAIMessage(message) {
        const historyList = document.getElementById('historyList');
        const messageItem = document.createElement('div');
        messageItem.className = 'history-item ai-message';
        messageItem.innerHTML = `<span style="color: #00adb5">🤖 ${message}</span>`;
        historyList.appendChild(messageItem);
        
        // Scroll to bottom
        historyList.scrollTop = historyList.scrollHeight;
    }

    // Event Listeners
    document.getElementById('aiMoveBtn').addEventListener('click', function() {
        if (gameState.gameActive && gameState.currentPlayer === 'black' && !gameState.aiThinking) {
            startAIThinking();
        }
    });

    document.getElementById('resetBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the game?')) {
            resetGame();
        }
    });

    document.getElementById('hintBtn').addEventListener('click', function() {
        if (gameState.gameActive && gameState.currentPlayer === 'white' && !gameState.aiThinking) {
            showHint();
        }
    });

    // Difficulty Level Buttons
    document.querySelectorAll('.level-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            gameState.aiDifficulty = parseInt(this.dataset.level);
            
            // Show difficulty message
            const levels = ['Easy', 'Medium', 'Hard'];
            showAIMessage(`🎯 AI difficulty set to ${levels[gameState.aiDifficulty - 1]}`);
        });
    });

    // Toggle Menu for Mobile
    document.getElementById('menuToggle').addEventListener('click', function() {
        document.getElementById('navMenu').classList.toggle('active');
    });

    // Show Hint
    function showHint() {
        const whiteMoves = getAllPossibleMoves('white');
        if (whiteMoves.length > 0) {
            // Find move that captures a piece
            let captureMove = whiteMoves.find(move => 
                gameState.board[move.to.row][move.to.col]
            );
            
            const hintMove = captureMove || whiteMoves[0];
            
            // Highlight the suggested move
            gameState.selectedPiece = { 
                row: hintMove.from.row, 
                col: hintMove.from.col 
            };
            gameState.possibleMoves = [{row: hintMove.to.row, col: hintMove.to.col}];
            renderBoard();
            
            showAIMessage(`💡 Hint: Move ${hintMove.piece.type} from ${String.fromCharCode(97 + hintMove.from.col)}${8 - hintMove.from.row} to ${String.fromCharCode(97 + hintMove.to.col)}${8 - hintMove.to.row}`);
            
            // Remove highlight after 5 seconds
            setTimeout(() => {
                gameState.selectedPiece = null;
                gameState.possibleMoves = [];
                renderBoard();
            }, 5000);
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
        gameState.aiThinkingTime = 0;
        gameState.aiBestMove = null;
        gameState.gameStartTime = new Date();
        
        initializeBoard();
        updateCapturedPieces();
        updateMoveHistory();
        updateAIThinkingStatus();
        
        document.getElementById('gameStatus').textContent = 'Playing';
        document.getElementById('gameStatus').style.color = '#4ecdc4';
        
        showAIMessage("🔄 Game reset! You start first.");
    }

    // Update game time every second
    setInterval(updateGameTime, 1000);

    // Initialize the game
    initializeBoard();
});