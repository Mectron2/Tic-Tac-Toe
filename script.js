const gameField = document.querySelector('.game-field');
const gameInfoStatus = document.querySelector('.game-info__status');
const gameResetButton = document.querySelector('.game-info__reset');

class TicTacToe {
    generateWinningCombinations(fieldSize) {
        const horizontal = [];
        for (let row = 0; row < fieldSize; row++) {
            let combination = [];
            for (let col = 0; col < fieldSize; col++) {
                combination.push(row * fieldSize + col);
            }
            horizontal.push(combination);
        }

        const vertical = [];
        for (let col = 0; col < fieldSize; col++) {
            let combination = [];
            for (let row = 0; row < fieldSize; row++) {
                combination.push(row * fieldSize + col);
            }
            vertical.push(combination);
        }

        const mainDiagonal = [];
        for (let i = 0; i < fieldSize; i++) {
            mainDiagonal.push(i * fieldSize + i);
        }

        const secondaryDiagonal = [];
        for (let i = 0; i < fieldSize; i++) {
            secondaryDiagonal.push((i + 1) * (fieldSize - 1));
        }

        return [...horizontal, ...vertical, mainDiagonal, secondaryDiagonal];
    }

    generateGameField(fieldSize) {
        for (let i = 0; i < fieldSize * fieldSize; i++) {
            const cell = document.createElement('div');
            cell.classList.add('game-field__cell');
            cell.dataset.index = String(i);
            gameField.appendChild(cell);
        }
    }

    constructor(fieldSize = 3) {
        this.board = Array(fieldSize * fieldSize).fill(null);
        this.currentPlayer = 'X';
        this.WINNING_COMBINATIONS = this.generateWinningCombinations(fieldSize);
        this.generateGameField(fieldSize);
        this.isOver = false;
    }

    makeMove(position) {
        const maxIndex = this.board.length - 1;
        if (this.board[position] !== null ||
            position < 0 ||
            position > maxIndex ||
            this.isOver) {
            return false;
        }

        this.board[position] = this.currentPlayer;
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        return true;
    }

    checkWinner() {
        for (const combo of this.WINNING_COMBINATIONS) {
            const first = this.board[combo[0]];
            if (first && combo.every(idx => this.board[idx] === first)) {
                this.isOver = true;
                return { winner: first, combination: combo };
            }
        }

        if (this.board.every(cell => cell !== null)) {
            this.isOver = true;
            return {winner: 'Draw', combination: null};
        }

        return null;
    }

    resetGame() {
        this.board.fill(null);
        this.currentPlayer = 'X';
        this.isOver = false;
    }

    getCurrentPlayer() {
        return this.currentPlayer;
    }
}

const ticTacToe = new TicTacToe(5);
const gameFieldCells = document.querySelectorAll('.game-field__cell');

function processGameField(cell) {
    const currentPlayer = ticTacToe.getCurrentPlayer();
    const move = ticTacToe.makeMove(Number(cell.dataset.index));
    if (move) {
        cell.innerText = currentPlayer;
        gameInfoStatus.innerText = `Current Player: ${ticTacToe.getCurrentPlayer()}`;
        const winnerInfo = ticTacToe.checkWinner();
        if (winnerInfo) {
            if (winnerInfo.winner === 'Draw') {
                gameInfoStatus.innerText = "It's a Draw!";
            } else {
                gameInfoStatus.innerText = `Winner: ${winnerInfo.winner}`;
                winnerInfo.combination.forEach(index => {
                    gameFieldCells[index].classList.add('game-field__cell_winner');
                });
            }
        }
    }
}

function resetGame() {
    ticTacToe.resetGame();
    gameFieldCells.forEach(cell => {
        cell.innerText = '';
        cell.classList.remove('game-field__cell_winner');
    });
    gameInfoStatus.innerText = `Current Player: ${ticTacToe.getCurrentPlayer()}`;
}

gameFieldCells.forEach(cell => {
    cell.addEventListener('click', () => processGameField(cell));
});

gameResetButton.addEventListener('click', resetGame);