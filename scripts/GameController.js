import { TicTacToe } from './TicTacToe.js';
import { WrongMoveError } from './Exceptions.js';

export class GameController {
    static SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

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

        const svgUseElement = document.createElementNS(
            GameController.SVG_NAMESPACE,
            'use'
        );
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
            player === this.ticTacToe.firstPlayer ||
            player === this.ticTacToe.secondPlayer
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

        const svg = document.createElementNS(
            GameController.SVG_NAMESPACE,
            'svg'
        );
        svg.setAttribute('width', '70%');
        svg.setAttribute('height', '70%');
        svg.setAttribute('fill', 'currentColor');

        const svgUseElement = document.createElementNS(
            GameController.SVG_NAMESPACE,
            'use'
        );
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
            this.ticTacToe.scoreBoard.incrementDrawScore();
        } else {
            this.updatePlayerIcon(result.winner);
            this.updateStatusUI(result.winner, true);
            this.highlightWinningCells(result.combination, result.winner);
            this.incrementScoreUI(result.winner);
            this.ticTacToe.scoreBoard.incrementPlayerScore(
                this.ticTacToe.currentPlayer
            );
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

        const svg = document.createElementNS(
            GameController.SVG_NAMESPACE,
            'svg'
        );
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
            this.ticTacToe.firstPlayer,
            this.ticTacToe.secondPlayer,
            this.ticTacToe.scoreBoard
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
