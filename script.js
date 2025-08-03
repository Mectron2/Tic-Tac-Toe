const gameField = document.querySelector('.game-field');
const gameInfoStatus = document.querySelector('.game-info__status');
const gameResetButton = document.querySelector('.button_reset');
const xScore = document.querySelector('.game-score__rounds-count-x');
const oScore = document.querySelector('.game-score__rounds-count-o');
const drawScore = document.querySelector('.game-score__rounds-count-draw');

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

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
        this.currentPlayer = 'x';
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
        this.currentPlayer = this.currentPlayer === 'x' ? 'o' : 'x';
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
        this.currentPlayer = 'x';
        this.isOver = false;
    }

    getCurrentPlayer() {
        return this.currentPlayer;
    }
}

function saveScore() {
    const xScoreValue = parseInt(xScore.innerText);
    const oScoreValue = parseInt(oScore.innerText);
    const drawScoreValue = parseInt(drawScore.innerText);

    localStorage.setItem('x-score', String(xScoreValue));
    localStorage.setItem('o-score', String(oScoreValue));
    localStorage.setItem('draw-score', String(drawScoreValue));
}

function syncScore() {
    const xScoreValue = localStorage.getItem('x-score');
    const oScoreValue = localStorage.getItem('o-score');
    const drawScoreValue = localStorage.getItem('draw-score');

    if (xScoreValue !== null) {
        xScore.innerText = xScoreValue;
    }
    if (oScoreValue !== null) {
        oScore.innerText = oScoreValue;
    }
    if (drawScoreValue !== null) {
        drawScore.innerText = drawScoreValue;
    }
}

const GAME_FIELD_SIZE = 3;
const ticTacToe = new TicTacToe(GAME_FIELD_SIZE);
gameField.style.gridTemplateColumns = `repeat(${GAME_FIELD_SIZE}, 1fr)`;
const gameFieldCells = document.querySelectorAll('.game-field__cell');

function initGameInfo() {
    gameInfoStatus.innerText = '';
    gameInfoStatus.classList.remove('game-info__status_turn-x', 'game-info__status_turn-o', 'game-info__status_draw');
    gameInfoStatus.classList.add('game-info__status', 'game-info__status_turn-x');

    const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
    svg.classList.add('game-info__status-player-icon');
    svg.setAttribute('aria-hidden', 'true');

    const text = document.createElement('p');
    text.classList.add('game-info__text');
    text.textContent = 'TURN';

    gameInfoStatus.appendChild(svg);
    gameInfoStatus.appendChild(text);
}

function addOrRemoveCurrentPlayerIcon(shouldRemove, player) {
    const gameInfoCurrentPlayer = document.querySelector('.game-info__status-player-icon');

    if (shouldRemove) {
        gameInfoCurrentPlayer?.remove();
    }

    gameInfoCurrentPlayer.innerHTML = '';
    const use = document.createElementNS(SVG_NAMESPACE, "use");
    use.setAttribute("href", `#icon-${player}`);
    gameInfoCurrentPlayer.appendChild(use);
}

function addSymbolToCell(cell, player) {
    cell.classList.add(`game-field__cell_active-${player}`);

    const svg = document.createElementNS(SVG_NAMESPACE, "svg");
    svg.setAttribute("width", "70%");
    svg.setAttribute("height", "70%");
    svg.setAttribute("fill", "currentColor");

    const use = document.createElementNS(SVG_NAMESPACE, "use");

    use.setAttribute("href", `#icon-${player}`);

    svg.appendChild(use);

    cell.appendChild(svg);
}

function processGameField(cell) {
    const gameInfoText = document.querySelector('.game-info__text');

    const currentPlayer = ticTacToe.getCurrentPlayer();
    const nextPlayer = currentPlayer === 'x' ? 'o' : 'x';
    const move = ticTacToe.makeMove(Number(cell.dataset.index));
    if (move) {
        cell.classList.toggle('game-field__cell_active');
        addOrRemoveCurrentPlayerIcon(false, nextPlayer);
        gameInfoStatus.classList.toggle('game-info__status_turn-x', nextPlayer === 'x');
        gameInfoStatus.classList.toggle('game-info__status_turn-o', nextPlayer === 'o');
        addSymbolToCell(cell, currentPlayer);
        const winnerInfo = ticTacToe.checkWinner();
        if (winnerInfo) {
            if (winnerInfo.winner === 'Draw') {
                addOrRemoveCurrentPlayerIcon(true);
                gameInfoStatus.classList.toggle('game-info__status_draw');
                gameInfoText.innerText = "IT'S A DRAW";
                drawScore.innerText = parseInt(drawScore.innerText) + 1;
            } else {
                const winnerSymbol = winnerInfo.winner;
                addOrRemoveCurrentPlayerIcon(false, winnerSymbol);
                gameInfoText.innerText = `WON`;
                gameInfoStatus.classList.toggle('game-info__status_turn-x', winnerSymbol === 'x');
                gameInfoStatus.classList.toggle('game-info__status_turn-o', winnerSymbol === 'o');
                winnerInfo.combination.forEach(index => {
                    gameFieldCells[index].classList.add(`game-field__cell_winner-${winnerSymbol}`);
                });

                if (winnerSymbol === 'x') {
                    xScore.innerText = parseInt(xScore.innerText) + 1;
                } else {
                    oScore.innerText = parseInt(oScore.innerText) + 1;
                }
            }
            saveScore();
        }
    }
}

function resetGame() {
    ticTacToe.resetGame();
    gameFieldCells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('game-field__cell_winner-x',
                                     'game-field__cell_winner-o',
                                     'game-field__cell_active',
                                     'game-field__cell_active-x',
                                     'game-field__cell_active-o');
    });
    initGameInfo();
    addOrRemoveCurrentPlayerIcon(false, 'x');
}

gameFieldCells.forEach(cell => {
    cell.addEventListener('click', () => processGameField(cell));
});

gameResetButton.addEventListener('click', resetGame);

window.addEventListener('DOMContentLoaded', syncScore);