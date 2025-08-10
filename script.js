const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const PLAYERS_SYMBOLS = {
    firstPlayerSymbol: 'x',
    secondPlayerSymbol: 'o',
};

const gameItems = {
    page: document.querySelector('.page'),
    gameField: document.querySelector('.game-field'),
    gameInfoStatus: document.querySelector('.game-info__status'),
    firstPlayerScore: document.querySelector('.game-score__rounds-count-x'),
    secondPlayerScore: document.querySelector('.game-score__rounds-count-o'),
    drawScore: document.querySelector('.game-score__rounds-count-draw'),
    resetButton: document.querySelector('.button_reset'),
    scoreList: document.querySelector('.game-score__list'),
    applyFieldSizeButton: document.querySelector('.button_apply-field-size'),
    game: document.querySelector('.game'),
    settingsPanel: document.querySelector('.game__control-modal'),
    gameFieldSizeInput: document.querySelector(
        '.game__control__field-size-input'
    ),
    comboToWinInput: document.querySelector(
        '.game__control__combo-to-win-input'
    ),
    applyComboToWinButton: document.querySelector('.button_apply-combo-to-win'),
    settingsButton: document.querySelector('.button_settings'),
    modalOverlay: document.querySelector('.game__control-modal'),

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
        this.name = WrongMoveError.name;
    }
}

class WrongComboLengthError extends Error {
    constructor(message) {
        super(message);
        this.name = WrongComboLengthError.name;
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
        this.emptyCells = fieldSize ** 2;
        this.winComboLength = this.fieldSize;

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

    setWinComboLength(length) {
        if (length < 3 || length > this.fieldSize) {
            throw new WrongComboLengthError(
                'Invalid win combo length. Must be between 3 and field size.'
            );
        }
        this.winComboLength = length;
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

    checkForWinMaxLength(position) {
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

        if (this.emptyCells === 0) {
            this.isOver = true;
            this.scoreBoard.incrementDrawScore();
            return { winner: 'Draw', combination: null };
        }

        return null;
    }

    checkForWin(gameField, fieldSize, winLength, lastMoveIndex) {
        const currentSymbol = this.currentPlayer.getSymbol();

        const lastMoveRow = Math.floor(lastMoveIndex / fieldSize);
        const lastMoveCol = lastMoveIndex % fieldSize;

        const directions = [
            [0, 1], // →
            [1, 0], // ↓
            [1, 1], // ↘
            [1, -1], // ↙
        ];

        function collectPositions(rowStep, colStep) {
            const positions = [];
            let currentRow = lastMoveRow + rowStep;
            let currentCol = lastMoveCol + colStep;

            while (
                currentRow >= 0 &&
                currentRow < fieldSize &&
                currentCol >= 0 &&
                currentCol < fieldSize &&
                gameField[currentRow * fieldSize + currentCol]?.getSymbol() ===
                    currentSymbol
            ) {
                positions.push(currentRow * fieldSize + currentCol);
                currentRow += rowStep;
                currentCol += colStep;
            }
            return positions;
        }

        for (const [rowStep, colStep] of directions) {
            const forwardPositions = collectPositions(rowStep, colStep);
            const backwardPositions = collectPositions(-rowStep, -colStep);

            const totalInLine =
                1 + forwardPositions.length + backwardPositions.length;

            if (totalInLine >= winLength) {
                return {
                    winner: this.currentPlayer,
                    combination: [
                        lastMoveIndex,
                        ...forwardPositions,
                        ...backwardPositions,
                    ],
                };
            }
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
        this.emptyCells--;

        const winResult =
            this.winComboLength === this.fieldSize
                ? this.checkForWinMaxLength(position)
                : this.checkForWin(
                      this.board,
                      this.fieldSize,
                      this.winComboLength,
                      position
                  );

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
        this.emptyCells = this.fieldSize ** 2;
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
        const fieldFragment = document.createDocumentFragment();

        for (let i = 0; i < fieldSize ** 2; i++) {
            const cell = document.createElement('div');
            cell.classList.add(
                'game-field__cell',
                this.ticTacToe.fieldSize > 10 ? 'game-field__cell_large' : null
            );
            cell.dataset.index = String(i);
            fieldFragment.appendChild(cell);
        }

        this.gameItems.gameField.appendChild(fieldFragment);
    }

    renderMove(cell, player) {
        cell.classList.add(
            this.ticTacToe.fieldSize <= 10 ? 'game-field__cell_active' : null,
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
        this.ticTacToe.isOver = true;

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
        const start = performance.now();

        this.gameItems.gameField.innerHTML = '';
        this.gameItems.gameField.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        this.ticTacToe = new TicTacToe(
            size,
            firstPlayer,
            secondPlayer,
            scoreBoard
        );

        this.generateGameField(this.ticTacToe.fieldSize);

        this.gameItems.gameField.addEventListener('click', (event) => {
            const cell = event.target.closest('.game-field__cell');
            if (cell) {
                this.handleCellClick(cell);
            }
        });

        const end = performance.now();
        console.log(`Field generated in: ${(end - start).toFixed(2)} ms`);
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

gameItems.applyFieldSizeButton.addEventListener('click', () => {
    const inputValue = parseInt(gameItems.gameFieldSizeInput.value, 10);

    if (
        gameUI.ticTacToe.emptyCells === gameUI.ticTacToe.fieldSize ** 2 ||
        gameUI.ticTacToe.isOver
    ) {
        if (inputValue >= 3 && inputValue <= 100) {
            gameFieldSize = inputValue;
            gameUI.initializeGame(gameFieldSize);

            if (inputValue > 10) {
                gameItems.gameField.classList.add('game-field_large');
                gameItems.game.classList.add('game_large');
                gameItems.page.style.setProperty('height', 'auto');
                gameItems.page.style.setProperty('padding', '40px 0 40px 0');
            } else {
                gameItems.page.style.setProperty('height', '100%');
                gameItems.page.style.setProperty('padding', '0');
                gameItems.gameField.classList.remove('game-field_large');
                gameItems.game.classList.remove('game_large');
            }
        } else {
            alert('Please enter a field size between 3 and 100.');
        }
    } else {
        alert('Please finish the current game before changing the field size.');
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

gameItems.applyComboToWinButton.addEventListener('click', () => {
    const inputValue = parseInt(gameItems.comboToWinInput.value, 10);

    if (
        gameUI.ticTacToe.emptyCells === gameUI.ticTacToe.fieldSize ** 2 ||
        gameUI.ticTacToe.isOver
    ) {
        try {
            gameUI.ticTacToe.setWinComboLength(inputValue);
        } catch (error) {
            if (error instanceof WrongComboLengthError) {
                alert(error.message);
            } else {
                throw error;
            }
        }
    } else {
        alert(
            'Please finish the current game before changing the combo length.'
        );
    }
});

gameItems.settingsButton.addEventListener('click', () => {
    gameItems.settingsPanel.classList.toggle('game__control-modal_active');
});

gameItems.modalOverlay.addEventListener('click', (e) => {
    if (e.target === gameItems.modalOverlay) {
        gameItems.modalOverlay.classList.remove('game__control-modal_active');
    }
});
