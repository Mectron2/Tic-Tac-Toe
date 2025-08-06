const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const SELECTORS = {
    buttonIncrease: '.button_increase',
    buttonDecrease: '.button_decrease',
    gameFieldCell: '.game-field__cell',
};

const PLAYERS_SYMBOLS = {
    firstPlayerSymbol: 'x',
    secondPlayerSymbol: 'o',
};

const gameItems = {
    gameField: document.querySelector('.game-field'),
    gameInfoStatus: document.querySelector('.game-info__status'),
    firstPlayerScore: document.querySelector('.game-score__rounds-count-x'),
    secondPlayerScore: document.querySelector('.game-score__rounds-count-o'),
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
    },
};

class Player {
    constructor(symbol) {
        this.symbol = symbol;
        this.score = 0;
    }

    getScore() {
        return this.score;
    }

    getSymbol() {
        return this.symbol;
    }

    incrementScore() {
        this.score++;
    }

    resetScore() {
        this.score = 0;
    }

    setScore(score) {
        this.score = score;
    }
}

class ScoreBoard {
    constructor(firstPlayer, secondPlayer) {
        this.firstPlayer = firstPlayer;
        this.secondPlayer = secondPlayer;
        this.drawScore = 0;
    }

    incrementPlayerScore(player) {
        if (player === this.firstPlayer) {
            this.firstPlayer.incrementScore();
        } else if (player === this.secondPlayer) {
            this.secondPlayer.incrementScore();
        }
    }

    incrementDrawScore() {
        this.drawScore++;
    }

    resetScores() {
        this.firstPlayer.resetScore();
        this.secondPlayer.resetScore();
        this.drawScore = 0;
    }

    setScores(firstPlayerScore, secondPlayerScore, drawScore) {
        this.firstPlayer.setScore(firstPlayerScore);
        this.secondPlayer.setScore(secondPlayerScore);
        this.drawScore = drawScore;
    }

    getScores() {
        console.log('Getting scores:', {
            firstPlayerScore: this.firstPlayer.getScore(),
            secondPlayerScore: this.secondPlayer.getScore(),
            drawScore: this.drawScore,
        });

        return {
            firstPlayerScore: this.firstPlayer.getScore(),
            secondPlayerScore: this.secondPlayer.getScore(),
            drawScore: this.drawScore,
        };
    }
}

const firstPlayer = new Player(PLAYERS_SYMBOLS.firstPlayerSymbol, 0);
const secondPlayer = new Player(PLAYERS_SYMBOLS.secondPlayerSymbol, 0);
const scoreBoard = new ScoreBoard(firstPlayer, secondPlayer);

class TicTacToe {
    constructor(fieldSize = 3) {
        this.board = Array(fieldSize ** 2).fill(null);
        this.currentPlayer = firstPlayer;
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
            gameItems.gameField.appendChild(cell);
        }
    }

    makeMove(position) {
        const maxIndex = this.board.length - 1;

        if (
            this.board[position] !== null ||
            position < 0 ||
            position > maxIndex ||
            this.isOver
        ) {
            return false;
        }

        this.board[position] = this.currentPlayer;
        this.currentPlayer =
            this.currentPlayer === firstPlayer ? secondPlayer : firstPlayer;

        return true;
    }

    checkWinner() {
        for (const combo of this.WINNING_COMBINATIONS) {
            const firstPlayerInCombo = this.board[combo[0]];

            if (
                firstPlayerInCombo &&
                combo.every(
                    (comboIndex) =>
                        this.board[comboIndex] === firstPlayerInCombo
                )
            ) {
                this.isOver = true;
                scoreBoard.incrementPlayerScore(firstPlayerInCombo);

                return {
                    winner: firstPlayerInCombo,
                    combination: combo,
                };
            }
        }

        if (this.board.every((cell) => cell !== null)) {
            this.isOver = true;
            scoreBoard.incrementDrawScore();

            return { winner: 'Draw', combination: null };
        }

        return null;
    }

    resetGame() {
        this.board.fill(null);
        this.currentPlayer = firstPlayer;
        this.isOver = false;
    }

    getCurrentPlayer() {
        return this.currentPlayer;
    }
}

function saveScore() {
    const scores = scoreBoard.getScores();

    localStorage.setItem('firstPlayerScore', scores.firstPlayerScore);
    localStorage.setItem('secondPlayerScore', scores.secondPlayerScore);
    localStorage.setItem('drawScore', scores.drawScore);
}

function syncScore() {
    const rawFirst = localStorage.getItem('firstPlayerScore');
    const rawSecond = localStorage.getItem('secondPlayerScore');
    const rawDraw = localStorage.getItem('drawScore');

    const firstScore = rawFirst !== null ? parseInt(rawFirst, 10) : 0;
    const secondScore = rawSecond !== null ? parseInt(rawSecond, 10) : 0;
    const drawCount = rawDraw !== null ? parseInt(rawDraw, 10) : 0;

    scoreBoard.setScores(firstScore, secondScore, drawCount);

    gameItems.firstPlayerScore.innerText = firstScore;
    gameItems.secondPlayerScore.innerText = secondScore;
    gameItems.drawScore.innerText = drawCount;
}

function resetScore() {
    gameItems.firstPlayerScore.innerText = '0';
    gameItems.secondPlayerScore.innerText = '0';
    gameItems.drawScore.innerText = '0';
    scoreBoard.resetScores();
    saveScore();
}

function updatePlayerIcon(player) {
    const icon = gameItems.currentPlayerIcon;
    if (!icon) return;

    icon.innerHTML = '';

    if (!player) {
        icon.remove();
        return;
    }

    const svgUseElement = document.createElementNS(SVG_NAMESPACE, 'use');
    svgUseElement.setAttribute('href', `#icon-${player.getSymbol()}`);
    icon.appendChild(svgUseElement);
}

function updateStatusUI(player, isWin = false) {
    const status = gameItems.gameInfoStatus;
    status.classList.remove(
        'game-info__status_turn-x',
        'game-info__status_turn-o',
        'game-info__status_draw'
    );

    if (player === firstPlayer || player === secondPlayer) {
        status.classList.add(`game-info__status_turn-${player.getSymbol()}`);
        isWin
            ? (gameItems.infoText.innerText = 'WON')
            : (gameItems.infoText.innerText = 'TURN');
    } else {
        status.classList.add('game-info__status_draw');
        gameItems.infoText.innerText = `IT'S A DRAW`;
    }
}

function incrementScoreUI(player) {
    if (player === firstPlayer) {
        gameItems.firstPlayerScore.innerText =
            parseInt(gameItems.firstPlayerScore.innerText) + 1;
    } else if (player === secondPlayer) {
        gameItems.secondPlayerScore.innerText =
            parseInt(gameItems.secondPlayerScore.innerText) + 1;
    } else {
        gameItems.drawScore.innerText =
            parseInt(gameItems.drawScore.innerText) + 1;
    }
}

function highlightWinningCells(combo, winner) {
    const cells = gameItems.gameField.querySelectorAll(SELECTORS.gameFieldCell);

    combo.forEach((cellIndex) =>
        cells[cellIndex].classList.add(
            `game-field__cell_winner-${winner.getSymbol()}`
        )
    );
}

function renderMove(cell, player) {
    cell.classList.add(
        'game-field__cell_active',
        `game-field__cell_active-${player.getSymbol()}`
    );

    const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
    svg.setAttribute('width', '70%');
    svg.setAttribute('height', '70%');
    svg.setAttribute('fill', 'currentColor');

    const svgUseElement = document.createElementNS(SVG_NAMESPACE, 'use');
    svgUseElement.setAttribute('href', `#icon-${player.getSymbol()}`);
    svg.appendChild(svgUseElement);

    cell.appendChild(svg);
}

function handleGameEnd(result) {
    if (result.winner === 'Draw') {
        updatePlayerIcon(null);
        updateStatusUI('draw');
        incrementScoreUI('draw');
    } else {
        updatePlayerIcon(result.winner);
        updateStatusUI(result.winner, true);
        highlightWinningCells(result.combination, result.winner);
        incrementScoreUI(result.winner);
    }

    saveScore();
}

function handleCellClick(cell) {
    const currentPlayer = ticTacToe.getCurrentPlayer();
    const nextPlayer =
        currentPlayer === firstPlayer ? secondPlayer : firstPlayer;

    if (!ticTacToe.makeMove(Number(cell.dataset.index))) return;

    renderMove(cell, currentPlayer);
    updatePlayerIcon(nextPlayer);
    updateStatusUI(nextPlayer);

    const result = ticTacToe.checkWinner();

    if (result) handleGameEnd(result);
}

function initGameInfo() {
    gameItems.gameInfoStatus.innerHTML = '';

    const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
    svg.classList.add('game-info__status-player-icon');
    svg.setAttribute('aria-hidden', 'true');

    const text = document.createElement('p');
    text.classList.add('game-info__text');
    text.textContent = 'TURN';

    gameItems.gameInfoStatus.appendChild(svg);
    gameItems.gameInfoStatus.appendChild(text);
}

function renderGameField(size) {
    gameItems.gameField.innerHTML = '';
    gameItems.gameField.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    ticTacToe = new TicTacToe(size);
    ticTacToe.generateGameField(size);

    const cells = gameItems.gameField.querySelectorAll(SELECTORS.gameFieldCell);
    cells.forEach((cell) =>
        cell.addEventListener('click', () => handleCellClick(cell))
    );
}

function resetGame() {
    ticTacToe.resetGame();
    const cells = gameItems.gameField.querySelectorAll(SELECTORS.gameFieldCell);
    cells.forEach((cell) => {
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
    updatePlayerIcon(firstPlayer);
    updateStatusUI(firstPlayer);
}

function initializeGame() {
    renderGameField(GAME_FIELD_SIZE);
    initGameInfo();
    updatePlayerIcon(firstPlayer);
    updateStatusUI(firstPlayer);
}

let GAME_FIELD_SIZE = 3;
let ticTacToe = new TicTacToe(GAME_FIELD_SIZE);
initializeGame();
updateButtonStates();

function updateButtonStates() {
    const isMax = GAME_FIELD_SIZE >= 7;
    const isMin = GAME_FIELD_SIZE <= 3;

    gameItems.increaseButton.disabled = isMax;
    gameItems.decreaseButton.disabled = isMin;

    gameItems.increaseButton.classList.toggle('button_increase', !isMax);
    gameItems.decreaseButton.classList.toggle('button_decrease', !isMin);
}

gameItems.increaseButton.addEventListener('click', () => {
    if (GAME_FIELD_SIZE < 7) {
        GAME_FIELD_SIZE++;
        initializeGame();
        updateButtonStates();
    }
});

gameItems.decreaseButton.addEventListener('click', () => {
    if (GAME_FIELD_SIZE > 3) {
        GAME_FIELD_SIZE--;
        initializeGame();
        updateButtonStates();
    }
});

gameItems.resetButton.addEventListener('click', resetGame);
window.addEventListener('DOMContentLoaded', syncScore);

gameItems.scoreList.addEventListener('click', () => {
    const isConfirmed = confirm('Are you sure you want to reset the score?');
    if (isConfirmed) {
        resetScore();
    }
});
