const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

const SELECTORS = {
    buttonIncrease: '.button_increase',
    buttonDecrease: '.button_decrease',
    gameFieldCell: '.game-field__cell',
}

const DOM = {
    gameField: document.querySelector('.game-field'),
    gameInfoStatus: document.querySelector('.game-info__status'),
    xScore: document.querySelector('.game-score__rounds-count-x'),
    oScore: document.querySelector('.game-score__rounds-count-o'),
    drawScore: document.querySelector('.game-score__rounds-count-draw'),
    resetButton: document.querySelector('.button_reset'),
    increaseButton: document.querySelector(SELECTORS.buttonIncrease),
    decreaseButton: document.querySelector(SELECTORS.buttonDecrease),
    scoreList: document.querySelector('.game-score__list'),

    get currentPlayerIcon() {
        return document.querySelector('.game-info__status-player-icon');
    },

    get infoText() {
        return document.querySelector('.game-info__text');
    }
};

class TicTacToe {
    constructor(fieldSize = 3) {
        this.board = Array(fieldSize ** 2).fill(null);
        this.currentPlayer = 'x';
        this.WINNING_COMBINATIONS = this.generateWinningCombinations(fieldSize);
        this.isOver = false;
    }

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
        for (let i = 0; i < fieldSize ** 2; i++) {
            const cell = document.createElement('div');
            cell.classList.add('game-field__cell');
            cell.dataset.index = String(i);
            DOM.gameField.appendChild(cell);
        }
    }

    makeMove(position) {
        const maxIndex = this.board.length - 1;
        if (this.board[position] !== null || position < 0 || position > maxIndex || this.isOver) {
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
            return { winner: 'Draw', combination: null };
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
    localStorage.setItem('x-score', DOM.xScore.innerText);
    localStorage.setItem('o-score', DOM.oScore.innerText);
    localStorage.setItem('draw-score', DOM.drawScore.innerText);
}

function syncScore() {
    const x = localStorage.getItem('x-score');
    const o = localStorage.getItem('o-score');
    const d = localStorage.getItem('draw-score');

    if (x !== null) DOM.xScore.innerText = x;
    if (o !== null) DOM.oScore.innerText = o;
    if (d !== null) DOM.drawScore.innerText = d;
}

function resetScore() {
    DOM.xScore.innerText = '0';
    DOM.oScore.innerText = '0';
    DOM.drawScore.innerText = '0';
    saveScore();
}

function updatePlayerIcon(player) {
    const icon = DOM.currentPlayerIcon;
    if (!icon) return;

    icon.innerHTML = '';
    if (!player) {
        icon.remove();
        return;
    }

    const use = document.createElementNS(SVG_NAMESPACE, 'use');
    use.setAttribute('href', `#icon-${player}`);
    icon.appendChild(use);
}

function updateStatusUI(player, isWin = false) {
    const status = DOM.gameInfoStatus;
    status.classList.remove('game-info__status_turn-x', 'game-info__status_turn-o', 'game-info__status_draw');

    if (player === 'x' || player === 'o') {
        status.classList.add(`game-info__status_turn-${player}`);
        if (isWin) {
            DOM.infoText.innerText = 'WON';
        } else {
            DOM.infoText.innerText = 'TURN';
        }
    } else {
        status.classList.add('game-info__status_draw');
        DOM.infoText.innerText = `IT'S A DRAW`;
    }
}

function incrementScore(player) {
    if (player === 'x') DOM.xScore.innerText = parseInt(DOM.xScore.innerText) + 1;
    else if (player === 'o') DOM.oScore.innerText = parseInt(DOM.oScore.innerText) + 1;
    else DOM.drawScore.innerText = parseInt(DOM.drawScore.innerText) + 1;
}

function highlightWinningCells(combo, winner) {
    const cells = DOM.gameField.querySelectorAll(SELECTORS.gameFieldCell);
    combo.forEach(i => cells[i].classList.add(`game-field__cell_winner-${winner}`));
}

function renderMove(cell, player) {
    cell.classList.add('game-field__cell_active', `game-field__cell_active-${player}`);

    const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
    svg.setAttribute('width', '70%');
    svg.setAttribute('height', '70%');
    svg.setAttribute('fill', 'currentColor');

    const use = document.createElementNS(SVG_NAMESPACE, 'use');
    use.setAttribute('href', `#icon-${player}`);
    svg.appendChild(use);

    cell.appendChild(svg);
}

function handleGameEnd(result) {
    if (result.winner === 'Draw') {
        updatePlayerIcon(null);
        updateStatusUI('draw');
        incrementScore('draw');
    } else {
        updatePlayerIcon(result.winner);
        updateStatusUI(result.winner, true);
        highlightWinningCells(result.combination, result.winner);
        incrementScore(result.winner);
    }
    saveScore();
}

function handleCellClick(cell) {
    const currentPlayer = ticTacToe.getCurrentPlayer();
    const nextPlayer = currentPlayer === 'x' ? 'o' : 'x';

    if (!ticTacToe.makeMove(Number(cell.dataset.index))) return;

    renderMove(cell, currentPlayer);
    updatePlayerIcon(nextPlayer);
    updateStatusUI(nextPlayer);

    const result = ticTacToe.checkWinner();
    if (result) handleGameEnd(result);
}

function initGameInfo() {
    DOM.gameInfoStatus.innerHTML = '';

    const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
    svg.classList.add('game-info__status-player-icon');
    svg.setAttribute('aria-hidden', 'true');

    const text = document.createElement('p');
    text.classList.add('game-info__text');
    text.textContent = 'TURN';

    DOM.gameInfoStatus.appendChild(svg);
    DOM.gameInfoStatus.appendChild(text);
}

function renderGameField(size) {
    DOM.gameField.innerHTML = '';
    DOM.gameField.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    ticTacToe = new TicTacToe(size);
    ticTacToe.generateGameField(size);

    const cells = DOM.gameField.querySelectorAll(SELECTORS.gameFieldCell);
    cells.forEach(cell => cell.addEventListener('click', () => handleCellClick(cell)));
}

function resetGame() {
    ticTacToe.resetGame();
    const cells = DOM.gameField.querySelectorAll(SELECTORS.gameFieldCell);
    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove(
            'game-field__cell_active',
            'game-field__cell_active-x',
            'game-field__cell_active-o',
            'game-field__cell_winner-x',
            'game-field__cell_winner-o'
        );
    });

    initGameInfo();
    updatePlayerIcon('x');
    updateStatusUI('x');
}

function initializeGame() {
    renderGameField(GAME_FIELD_SIZE);
    initGameInfo();
    updatePlayerIcon('x');
    updateStatusUI('x');
}

let GAME_FIELD_SIZE = 3;
let ticTacToe = new TicTacToe(GAME_FIELD_SIZE);
initializeGame();
updateButtonStates();

function updateButtonStates() {
    const isMax = GAME_FIELD_SIZE >= 7;
    const isMin = GAME_FIELD_SIZE <= 3;

    DOM.increaseButton.disabled = isMax;
    DOM.decreaseButton.disabled = isMin;

    DOM.increaseButton.classList.toggle('button_increase', !isMax);
    DOM.decreaseButton.classList.toggle('button_decrease', !isMin);
}

DOM.increaseButton.addEventListener('click', () => {
    if (GAME_FIELD_SIZE < 7) {
        GAME_FIELD_SIZE++;
        initializeGame();
        updateButtonStates();
    }
});

DOM.decreaseButton.addEventListener('click', () => {
    if (GAME_FIELD_SIZE > 3) {
        GAME_FIELD_SIZE--;
        initializeGame();
        updateButtonStates();
    }
});

DOM.resetButton.addEventListener('click', resetGame);
window.addEventListener('DOMContentLoaded', syncScore);

DOM.scoreList.addEventListener('click', () => {
    const isConfirmed = confirm('Are you sure you want to reset the score?');
    if (isConfirmed) {
        resetScore();
    }
});