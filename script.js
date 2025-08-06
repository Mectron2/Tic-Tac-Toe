const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

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
    increaseButton: document.querySelector('.button_increase'),
    decreaseButton: document.querySelector('.button_decrease'),
    scoreList: document.querySelector('.game-score__list'),
    applyFieldSizeButton: document.querySelector('.button_apply-field-size'),

    get fieldSizeInput() {
        return document.querySelector('.game__control__field-size-input');
    },

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

class WrongMoveError extends Error {
    constructor(message) {
        super(message);
        this.name = 'WrongMoveError';
    }
}

class TicTacToe {
    constructor(fieldSize = 3, firstPlayer, secondPlayer, scoreBoard) {
        this.fieldSize = fieldSize;
        this.board = Array(fieldSize ** 2).fill(null);
        this.firstPlayer = firstPlayer;
        this.secondPlayer = secondPlayer;
        this.scoreBoard = scoreBoard;
        this.currentPlayer = this.firstPlayer;
        this.isOver = false;

        this.counts = {
            [firstPlayer.getSymbol()]: {
                rows: Array(fieldSize).fill(0),
                cols: Array(fieldSize).fill(0),
                diag: 0,
                anti: 0,
            },
            [secondPlayer.getSymbol()]: {
                rows: Array(fieldSize).fill(0),
                cols: Array(fieldSize).fill(0),
                diag: 0,
                anti: 0,
            },
        };
    }

    resetCounts() {
        this.counts = {
            [this.firstPlayer.getSymbol()]: {
                rows: Array(this.fieldSize).fill(0),
                cols: Array(this.fieldSize).fill(0),
                diag: 0,
                anti: 0,
            },
            [this.secondPlayer.getSymbol()]: {
                rows: Array(this.fieldSize).fill(0),
                cols: Array(this.fieldSize).fill(0),
                diag: 0,
                anti: 0,
            },
        };
    }

    _generateWinIndexesForRow(row) {
        const size = this.fieldSize;
        return Array.from({ length: size }, (_, col) => row * size + col);
    }

    _generateWinIndexesForCol(col) {
        const size = this.fieldSize;
        return Array.from({ length: size }, (_, row) => row * size + col);
    }

    _generateWinIndexesForDiag() {
        const size = this.fieldSize;
        return Array.from({ length: size }, (_, i) => i * (size + 1));
    }

    _generateWinIndexesForAntiDiag() {
        const size = this.fieldSize;
        return Array.from({ length: size }, (_, i) => (i + 1) * (size - 1));
    }

    checkForWin(position) {
        const symbol = this.currentPlayer.getSymbol();
        const counters = this.counts[symbol];
        const size = this.fieldSize;

        const row = Math.floor(position / size);
        const col = position % size;

        counters.rows[row]++;
        counters.cols[col]++;
        if (row === col) {
            counters.diag++;
        }

        if (row + col === size - 1) {
            counters.anti++;
        }

        const isRowWin = counters.rows[row] === size;
        const isColWin = counters.cols[col] === size;
        const isDiagWin = counters.diag === size;
        const isAntiWin = counters.anti === size;

        if (isRowWin || isColWin || isDiagWin || isAntiWin) {
            let combo;

            if (isRowWin) {
                combo = this._generateWinIndexesForRow(row);
            }
            if (isColWin) {
                combo = this._generateWinIndexesForCol(col);
            }
            if (isDiagWin) {
                combo = this._generateWinIndexesForDiag();
            }
            if (isAntiWin) {
                combo = this._generateWinIndexesForAntiDiag();
            }

            this.isOver = true;
            this.scoreBoard.incrementPlayerScore(this.currentPlayer);
            return { winner: this.currentPlayer, combination: combo };
        }

        if (!this.board.includes(null)) {
            this.isOver = true;
            this.scoreBoard.incrementDrawScore();
            return { winner: 'Draw', combination: null };
        }

        return null;
    }

    makeMove(position) {
        const maxIndex = this.board.length - 1;

        if (this.board[position] !== null) {
            throw new WrongMoveError('Cell is already occupied.');
        }

        if (position < 0 || position > maxIndex) {
            throw new WrongMoveError('Index out of bounds.');
        }

        if (this.isOver) {
            throw new WrongMoveError('Game is already over.');
        }

        this.board[position] = this.currentPlayer;

        const winResult = this.checkForWin(position);

        if (winResult) {
            return winResult;
        }

        this.currentPlayer =
            this.currentPlayer === this.firstPlayer
                ? this.secondPlayer
                : this.firstPlayer;
    }

    resetGame() {
        this.board.fill(null);
        this.currentPlayer = this.firstPlayer;
        this.isOver = false;
        this.resetCounts();
    }

    getCurrentPlayer() {
        return this.currentPlayer;
    }
}

class LocalStorageManager {
    constructor(scoreBoard) {
        this.scoreBoard = scoreBoard;
    }

    saveScores() {
        const scores = this.scoreBoard.getScores();

        localStorage.setItem('firstPlayerScore', scores.firstPlayerScore);
        localStorage.setItem('secondPlayerScore', scores.secondPlayerScore);
        localStorage.setItem('drawScore', scores.drawScore);
    }

    syncScores() {
        const rawFirst = localStorage.getItem('firstPlayerScore');
        const rawSecond = localStorage.getItem('secondPlayerScore');
        const rawDraw = localStorage.getItem('drawScore');

        const firstScore = rawFirst !== null ? parseInt(rawFirst, 10) : 0;
        const secondScore = rawSecond !== null ? parseInt(rawSecond, 10) : 0;
        const drawCount = rawDraw !== null ? parseInt(rawDraw, 10) : 0;

        console.log('Syncing scores:', {
            firstPlayerScore: firstScore,
            secondPlayerScore: secondScore,
            drawScore: drawCount,
        });

        this.scoreBoard.setScores(firstScore, secondScore, drawCount);
    }

    resetScores() {
        this.scoreBoard.resetScores();
        this.saveScores();
    }
}

class GameUI {
    constructor(ticTacToe, gameItems, localStorageManager) {
        this.gameItems = gameItems;
        this.ticTacToe = ticTacToe;
        this.localStorageManager = localStorageManager;
    }

    syncScoresUI() {
        const scores = this.ticTacToe.scoreBoard.getScores();
        this.gameItems.firstPlayerScore.innerText = scores.firstPlayerScore;
        this.gameItems.secondPlayerScore.innerText = scores.secondPlayerScore;
        this.gameItems.drawScore.innerText = scores.drawScore;
    }

    resetScoresUI() {
        this.gameItems.firstPlayerScore.innerText = '0';
        this.gameItems.secondPlayerScore.innerText = '0';
        this.gameItems.drawScore.innerText = '0';
    }

    updatePlayerIcon(player) {
        const icon = this.gameItems.currentPlayerIcon;
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

    updateStatusUI(player, isWin = false) {
        const status = this.gameItems.gameInfoStatus;
        status.classList.remove(
            'game-info__status_turn-x',
            'game-info__status_turn-o',
            'game-info__status_draw'
        );

        if (
            player === ticTacToe.firstPlayer ||
            player === ticTacToe.secondPlayer
        ) {
            status.classList.add(
                `game-info__status_turn-${player.getSymbol()}`
            );
            isWin
                ? (this.gameItems.infoText.innerText = 'WON')
                : (this.gameItems.infoText.innerText = 'TURN');
        } else {
            status.classList.add('game-info__status_draw');
            this.gameItems.infoText.innerText = `IT'S A DRAW`;
        }
    }

    incrementScoreUI(player) {
        if (player === this.ticTacToe.firstPlayer) {
            this.gameItems.firstPlayerScore.innerText =
                parseInt(this.gameItems.firstPlayerScore.innerText) + 1;
        } else if (player === this.ticTacToe.secondPlayer) {
            this.gameItems.secondPlayerScore.innerText =
                parseInt(this.gameItems.secondPlayerScore.innerText) + 1;
        } else {
            this.gameItems.drawScore.innerText =
                parseInt(this.gameItems.drawScore.innerText) + 1;
        }
    }

    updateButtonStates() {
        const isMax = this.ticTacToe.fieldSize >= 7;
        const isMin = this.ticTacToe.fieldSize <= 3;

        this.gameItems.increaseButton.disabled = isMax;
        this.gameItems.decreaseButton.disabled = isMin;

        this.gameItems.increaseButton.classList.toggle(
            'button_increase',
            !isMax
        );
        this.gameItems.decreaseButton.classList.toggle(
            'button_decrease',
            !isMin
        );
    }

    highlightWinningCells(combo, winner) {
        const cells =
            this.gameItems.gameField.querySelectorAll('.game-field__cell');

        combo.forEach((cellIndex) =>
            cells[cellIndex].classList.add(
                `game-field__cell_winner-${winner.getSymbol()}`
            )
        );
    }

    generateGameField(fieldSize) {
        for (let i = 0; i < fieldSize ** 2; i++) {
            const cell = document.createElement('div');
            cell.classList.add('game-field__cell');
            cell.dataset.index = String(i);
            this.gameItems.gameField.appendChild(cell);
        }
    }

    renderMove(cell, player) {
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

    handleGameEnd(result) {
        if (result.winner === 'Draw') {
            this.updatePlayerIcon(null);
            this.updateStatusUI('draw');
            this.incrementScoreUI('draw');
        } else {
            this.updatePlayerIcon(result.winner);
            this.updateStatusUI(result.winner, true);
            this.highlightWinningCells(result.combination, result.winner);
            this.incrementScoreUI(result.winner);
        }

        this.localStorageManager.saveScores();
    }

    handleCellClick(cell) {
        const currentPlayer = this.ticTacToe.getCurrentPlayer();
        const nextPlayer =
            currentPlayer === this.ticTacToe.firstPlayer
                ? this.ticTacToe.secondPlayer
                : this.ticTacToe.firstPlayer;

        let winResult;

        try {
            winResult = this.ticTacToe.makeMove(Number(cell.dataset.index));
        } catch (error) {
            if (error instanceof WrongMoveError) {
                console.log(error.message);
                return;
            } else {
                throw error;
            }
        }

        this.renderMove(cell, currentPlayer);
        this.updatePlayerIcon(nextPlayer);
        this.updateStatusUI(nextPlayer);

        if (winResult) this.handleGameEnd(winResult);
    }

    initGameInfo() {
        this.gameItems.gameInfoStatus.innerHTML = '';

        const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
        svg.classList.add('game-info__status-player-icon');
        svg.setAttribute('aria-hidden', 'true');

        const text = document.createElement('p');
        text.classList.add('game-info__text');
        text.textContent = 'TURN';

        this.gameItems.gameInfoStatus.appendChild(svg);
        this.gameItems.gameInfoStatus.appendChild(text);
    }

    renderGameField(size) {
        this.gameItems.gameField.innerHTML = '';
        this.gameItems.gameField.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        this.ticTacToe = new TicTacToe(
            size,
            firstPlayer,
            secondPlayer,
            scoreBoard
        );

        this.generateGameField(this.ticTacToe.fieldSize);

        const cells =
            this.gameItems.gameField.querySelectorAll('.game-field__cell');

        cells.forEach((cell) =>
            cell.addEventListener('click', () => this.handleCellClick(cell))
        );
    }

    resetGameUI() {
        this.ticTacToe.resetGame();
        const cells =
            this.gameItems.gameField.querySelectorAll('.game-field__cell');

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

        this.initGameInfo();
        this.updatePlayerIcon(this.ticTacToe.firstPlayer);
        this.updateStatusUI(this.ticTacToe.firstPlayer);
    }

    initializeGame(fieldSize = this.ticTacToe.fieldSize) {
        this.renderGameField(fieldSize);
        this.initGameInfo();
        this.updatePlayerIcon(this.ticTacToe.firstPlayer);
        this.updateStatusUI(this.ticTacToe.firstPlayer);
    }
}

let gameFieldSize = 3;

const firstPlayer = new Player(PLAYERS_SYMBOLS.firstPlayerSymbol);
const secondPlayer = new Player(PLAYERS_SYMBOLS.secondPlayerSymbol);

const scoreBoard = new ScoreBoard(firstPlayer, secondPlayer);
const ticTacToe = new TicTacToe(
    gameFieldSize,
    firstPlayer,
    secondPlayer,
    scoreBoard
);
const localStorageManager = new LocalStorageManager(scoreBoard);
const gameUI = new GameUI(ticTacToe, gameItems, localStorageManager);

gameUI.initializeGame();
gameUI.updateButtonStates();

gameItems.increaseButton.addEventListener('click', () => {
    if (gameFieldSize < 7) {
        gameFieldSize++;
        gameUI.initializeGame(gameFieldSize);
        gameUI.updateButtonStates();
    }
});

gameItems.decreaseButton.addEventListener('click', () => {
    if (gameFieldSize > 3) {
        gameFieldSize--;
        gameUI.initializeGame(gameFieldSize);
        gameUI.updateButtonStates();
    }
});

gameItems.applyFieldSizeButton.addEventListener('click', () => {
    const inputValue = parseInt(gameItems.fieldSizeInput.value, 10);
    if (inputValue >= 3 && inputValue <= 100) {
        gameFieldSize = inputValue;
        gameUI.initializeGame(gameFieldSize);
        gameUI.updateButtonStates();
    } else {
        alert('Please enter a field size between 3 and 100.');
    }
});

gameItems.resetButton.addEventListener('click', () => {
    gameUI.resetGameUI();
});

window.addEventListener('DOMContentLoaded', () => {
    localStorageManager.syncScores();
    gameUI.syncScoresUI(ticTacToe);
});

gameItems.scoreList.addEventListener('click', () => {
    const isConfirmed = confirm('Are you sure you want to reset the score?');
    if (isConfirmed) {
        localStorageManager.resetScores();
        gameUI.resetScoresUI();
    }
});
