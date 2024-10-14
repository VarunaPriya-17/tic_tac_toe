let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let isGameActive = true;
let isVsAI = false;
let difficulty = 'easy'; // Difficulty: 'easy' or 'impossible'
const statusDisplay = document.querySelector('#status');
const cells = document.querySelectorAll('.cell');
const leaderboard = document.querySelector('#leaderboardList');
let aiPlayer = 'O'; // AI's mark

// Winning conditions
const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

// Handle theme selection
document.querySelector('#theme').addEventListener('change', (e) => {
    document.body.className = e.target.value;
});

// Handle game mode selection (Player vs Player or AI)
document.getElementById('vsPlayer').addEventListener('click', () => {
    isVsAI = false;
    startNewGame();
});

document.getElementById('vsAI').addEventListener('click', () => {
    isVsAI = true;
    difficulty = prompt('Select Difficulty: easy or impossible', 'easy').toLowerCase();
    aiPlayer = 'O';
    startNewGame();
});

// Check if player has won or it's a draw
const handleResultValidation = () => {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = `Player ${currentPlayer} has won!`;
        isGameActive = false;
        updateLeaderboard(currentPlayer);
        return;
    }

    const roundDraw = !gameBoard.includes('');
    if (roundDraw) {
        statusDisplay.innerHTML = 'Game is a draw!';
        isGameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.innerHTML = `It's ${currentPlayer}'s turn`;

    if (isVsAI && currentPlayer === aiPlayer) {
        setTimeout(aiMove, 500); // AI makes a move
    }
};

// AI Move Logic (Minimax for Impossible Level, Random for Easy)
const aiMove = () => {
    let move;
    if (difficulty === 'impossible') {
        move = minimax(gameBoard, aiPlayer).index; // Minimax AI move
    } else {
        // Random move for easy level
        let availableCells = gameBoard.map((val, index) => val === '' ? index : null).filter(val => val !== null);
        move = availableCells[Math.floor(Math.random() * availableCells.length)];
    }
    gameBoard[move] = aiPlayer;
    cells[move].innerHTML = aiPlayer;

    handleResultValidation();
};

// Minimax Algorithm for unbeatable AI
const minimax = (newBoard, player) => {
    const availSpots = newBoard.map((val, index) => val === '' ? index : null).filter(val => val !== null);

    // Check for terminal state: win, lose, or draw
    if (checkWinner(newBoard, 'X')) {
        return { score: -10 };
    } else if (checkWinner(newBoard, 'O')) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    // Array to store all possible moves
    let moves = [];

    // Loop through available spots
    for (let i = 0; i < availSpots.length; i++) {
        let move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === 'O') {
            move.score = minimax(newBoard, 'X').score;
        } else {
            move.score = minimax(newBoard, 'O').score;
        }

        // Reset the spot
        newBoard[availSpots[i]] = '';
        moves.push(move);
    }

    // Choose the best move
    let bestMove;
    if (player === 'O') {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
};

// Check if a player has won
const checkWinner = (board, player) => {
    return winningConditions.some((condition) => {
        return condition.every((index) => board[index] === player);
    });
};

// Handle cell click for players
const handleCellClick = (e) => {
    const clickedCell = e.target;
    const clickedIndex = clickedCell.getAttribute('data-index');

    if (gameBoard[clickedIndex] !== '' || !isGameActive) {
        return;
    }

    gameBoard[clickedIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;

    handleResultValidation();
};

// Restart game
const startNewGame = () => {
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    statusDisplay.innerHTML = `It's ${currentPlayer}'s turn`;

    cells.forEach(cell => {
        cell.innerHTML = '';
    });
};

// Handle leaderboard
const updateLeaderboard = (winner) => {
    let leaderboardData = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboardData.push(`Winner: Player ${winner}`);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboardData));
    displayLeaderboard();
};

// Display leaderboard
const displayLeaderboard = () => {
    leaderboard.innerHTML = '';
    let leaderboardData = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboardData.forEach((entry) => {
        let li = document.createElement('li');
        li.innerHTML = entry;
        leaderboard.appendChild(li);
    });
};

// Restart game button
document.getElementById('restartBtn').addEventListener('click', startNewGame);

// Set up the initial game state
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

// Load leaderboard on page load
displayLeaderboard();
// Delete the last leaderboard entry
const deleteLastEntry = () => {
    let leaderboardData = JSON.parse(localStorage.getItem('leaderboard')) || [];
    if (leaderboardData.length > 0) {
        leaderboardData.pop(); // Remove the last entry
        localStorage.setItem('leaderboard', JSON.stringify(leaderboardData)); // Update localStorage
        displayLeaderboard(); // Refresh the leaderboard display
    } else {
        alert('No entries to delete.');
    }
};

// Delete all leaderboard entries
const deleteAllEntries = () => {
    if (confirm('Are you sure you want to delete all entries?')) {
        localStorage.removeItem('leaderboard'); // Clear the leaderboard in localStorage
        displayLeaderboard(); // Refresh the leaderboard display
    }
};

// Attach event listeners to the delete buttons
document.getElementById('deleteLastEntry').addEventListener('click', deleteLastEntry);
document.getElementById('deleteAllEntries').addEventListener('click', deleteAllEntries);
