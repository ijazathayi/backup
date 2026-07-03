document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const btnVsFriend = document.getElementById('btn-vs-friend');
    const btnVsAI = document.getElementById('btn-vs-ai');
    const btnBack = document.getElementById('btn-back');
    const btnReset = document.getElementById('btn-reset');
    const statusDisplay = document.getElementById('status-display');
    const cells = document.querySelectorAll('.cell');
    const overlay = document.getElementById('result-overlay');
    const resultMessage = document.getElementById('result-message');
    const btnPlayAgain = document.getElementById('btn-play-again');

    // Game State
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = false;
    let isAgainstAI = false;
    let aiPlayer = 'O';
    let humanPlayer = 'X';

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    // Navigation and Initialization
    btnVsFriend.addEventListener('click', () => startGame(false));
    btnVsAI.addEventListener('click', () => startGame(true));
    
    btnBack.addEventListener('click', () => {
        gameScreen.classList.remove('active');
        menuScreen.classList.add('active');
        resetGame();
    });

    btnReset.addEventListener('click', resetGame);
    btnPlayAgain.addEventListener('click', resetGame);

    function startGame(vsAI) {
        isAgainstAI = vsAI;
        menuScreen.classList.remove('active');
        gameScreen.classList.add('active');
        resetGame();
    }

    function resetGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        gameActive = true;
        
        cells.forEach(cell => {
            cell.innerText = '';
            cell.classList.remove('filled', 'x', 'o', 'winning-cell');
        });
        
        overlay.classList.add('hidden');
        updateStatusDisplay();

        if (isAgainstAI && currentPlayer === aiPlayer) {
            setTimeout(makeAIMove, 500);
        }
    }

    // Gameplay Logic
    cells.forEach(cell => {
        cell.addEventListener('click', () => handleCellClick(cell));
    });

    function handleCellClick(cell) {
        const index = parseInt(cell.getAttribute('data-index'));

        if (board[index] !== '' || !gameActive) {
            return;
        }

        makeMove(index, currentPlayer);

        if (gameActive && isAgainstAI && currentPlayer === aiPlayer) {
            // Prevent user from clicking during AI turn by small delay visually
            setTimeout(makeAIMove, 500);
        }
    }

    function makeMove(index, player) {
        board[index] = player;
        
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        cell.innerText = player;
        cell.classList.add('filled', player.toLowerCase());

        checkResult();

        if (gameActive) {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateStatusDisplay();
        }
    }

    function updateStatusDisplay() {
        if (!gameActive) return;
        
        if (isAgainstAI) {
            if (currentPlayer === humanPlayer) {
                statusDisplay.innerText = "Your Turn (X)";
            } else {
                statusDisplay.innerText = "AI is thinking...";
            }
        } else {
            statusDisplay.innerText = `Player ${currentPlayer}'s Turn`;
        }

        statusDisplay.className = 'status-badge ' + (currentPlayer === 'X' ? 'x-turn' : 'o-turn');
    }

    function checkResult() {
        let roundWon = false;
        let winningCells = [];

        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                roundWon = true;
                winningCells = [a, b, c];
                break;
            }
        }

        if (roundWon) {
            endGame(false, winningCells);
            return;
        }

        if (!board.includes('')) {
            endGame(true);
            return;
        }
    }

    function endGame(draw, winningCells = []) {
        gameActive = false;
        
        if (draw) {
            resultMessage.innerText = "It's a Draw!";
            resultMessage.style.background = 'linear-gradient(to right, #94a3b8, #cbd5e1)';
            resultMessage.style.webkitBackgroundClip = 'text';
        } else {
            const winner = currentPlayer;
            if (isAgainstAI) {
                resultMessage.innerText = winner === humanPlayer ? "You Win!" : "AI Wins!";
            } else {
                resultMessage.innerText = `Player ${winner} Wins!`;
            }

            // Set color based on winner
            const color1 = winner === 'X' ? '#ef4444' : '#3b82f6';
            const color2 = winner === 'X' ? '#f87171' : '#60a5fa';
            resultMessage.style.background = `linear-gradient(to right, ${color1}, ${color2})`;
            resultMessage.style.webkitBackgroundClip = 'text';

            // Highlight winning cells
            winningCells.forEach(index => {
                document.querySelector(`.cell[data-index="${index}"]`).classList.add('winning-cell');
            });
        }
        
        // Show overlay with slight delay
        setTimeout(() => {
            overlay.classList.remove('hidden');
        }, 800);
    }

    // AI Logic (Minimax Algorithm)
    function makeAIMove() {
        if (!gameActive) return;

        let bestScore = -Infinity;
        let move;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = aiPlayer;
                let score = minimax(board, 0, false);
                board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }

        if (move !== undefined) {
            makeMove(move, aiPlayer);
        }
    }

    let scores = {
        'X': -10, // Human wins
        'O': 10,  // AI wins
        'tie': 0
    };

    function minimax(boardState, depth, isMaximizing) {
        let result = checkWinnerForMinimax();
        if (result !== null) {
            return scores[result] - depth; // Prefer faster wins / slower losses
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < boardState.length; i++) {
                if (boardState[i] === '') {
                    boardState[i] = aiPlayer;
                    let score = minimax(boardState, depth + 1, false);
                    boardState[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < boardState.length; i++) {
                if (boardState[i] === '') {
                    boardState[i] = humanPlayer;
                    let score = minimax(boardState, depth + 1, true);
                    boardState[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    function checkWinnerForMinimax() {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        if (!board.includes('')) {
            return 'tie';
        }
        return null;
    }
});
