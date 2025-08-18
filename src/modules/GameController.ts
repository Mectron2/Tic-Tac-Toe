import { TicTacToe } from './TicTacToe.js';
import { WrongMoveError } from './Exceptions.js';
import { LocalStorageManager } from './LocalStorageManager.js';
import type { Player } from './Player.js';
import type GameResult from './GameResult.js';

export class GameController {
    static SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
    private gameItems: any;
    private ticTacToe: TicTacToe;
    private localStorageManager: LocalStorageManager;

    constructor(
        ticTacToe: TicTacToe,
        gameItems: any,
        localStorageManager: LocalStorageManager
    ) {
        this.gameItems = gameItems;
        this.ticTacToe = ticTacToe;
        this.localStorageManager = localStorageManager;
    }

    syncScoresUI(): void {
        const scores = this.ticTacToe.getScoreBoard().getScores();
        this.gameItems.firstPlayerScore.innerText = scores.firstPlayerScore;
        this.gameItems.secondPlayerScore.innerText = scores.secondPlayerScore;
        this.gameItems.drawScore.innerText = scores.drawScore;
    }

    resetScoresUI(): void {
        this.gameItems.firstPlayerScore.innerText = '0';
        this.gameItems.secondPlayerScore.innerText = '0';
        this.gameItems.drawScore.innerText = '0';
    }

    updatePlayerIcon(player: Player | null): void {
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

    updateStatusUI(player: Player | string, isWin = false): void {
        const status = this.gameItems.gameInfoStatus;
        status.classList.remove(
            'game-info__status_turn-x',
            'game-info__status_turn-o',
            'game-info__status_draw'
        );

        if (
            player === this.ticTacToe.getFirstPlayer() ||
            player === this.ticTacToe.getSecondPlayer()
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

    incrementScoreUI(player: Player | string): void {
        if (player === this.ticTacToe.getFirstPlayer()) {
            this.gameItems.firstPlayerScore.innerText =
                parseInt(this.gameItems.firstPlayerScore.innerText) + 1;
        } else if (player === this.ticTacToe.getSecondPlayer()) {
            this.gameItems.secondPlayerScore.innerText =
                parseInt(this.gameItems.secondPlayerScore.innerText) + 1;
        } else {
            this.gameItems.drawScore.innerText =
                parseInt(this.gameItems.drawScore.innerText) + 1;
        }
    }

    highlightWinningCells(combo: number[], winner: Player): void {
        const cells =
            this.gameItems.gameField.querySelectorAll('.game-field__cell');

        combo.forEach((cellIndex) =>
            cells[cellIndex].classList.add(
                `game-field__cell_winner-${winner.getSymbol()}`
            )
        );
    }

    generateGameField(fieldSize: number): void {
        const fieldFragment = document.createDocumentFragment();

        for (let i = 0; i < fieldSize ** 2; i++) {
            const cell = document.createElement('div');
            cell.classList.add('game-field__cell');

            if (this.ticTacToe.getFieldSize() > 10) {
                cell.classList.add('game-field__cell_large');
            }

            cell.dataset.index = String(i);
            fieldFragment.appendChild(cell);
        }

        this.gameItems.gameField.appendChild(fieldFragment);
    }

    renderMove(cell: HTMLElement, player: Player): void {
        cell.classList.add(`game-field__cell_active-${player.getSymbol()}`);

        if (this.ticTacToe.getFieldSize() <= 10) {
            cell.classList.add('game-field__cell_active');
        }

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

    handleGameEnd(result: GameResult): void {
        this.ticTacToe.setIsOver(true);

        if (result.winner === 'Draw' || !result.combination) {
            this.updatePlayerIcon(null);
            this.updateStatusUI('draw');
            this.incrementScoreUI('draw');
            this.ticTacToe.getScoreBoard().incrementDrawScore();
        } else {
            this.updatePlayerIcon(result.winner);
            this.updateStatusUI(result.winner, true);
            this.highlightWinningCells(result.combination, result.winner);
            this.incrementScoreUI(result.winner);
            this.ticTacToe
                .getScoreBoard()
                .incrementPlayerScore(this.ticTacToe.getCurrentPlayer());
        }

        this.localStorageManager.saveScores();
    }

    handleCellClick(cell: HTMLElement): void {
        const currentPlayer = this.ticTacToe.getCurrentPlayer();
        const nextPlayer =
            currentPlayer === this.ticTacToe.getFirstPlayer()
                ? this.ticTacToe.getSecondPlayer()
                : this.ticTacToe.getFirstPlayer();

        let winResult: GameResult | null = null;

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

    initGameInfo(): void {
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

    renderGameField(size: number): void {
        const start = performance.now();

        this.gameItems.gameField.innerHTML = '';
        this.gameItems.gameField.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        this.ticTacToe = new TicTacToe(
            size,
            this.ticTacToe.getFirstPlayer(),
            this.ticTacToe.getSecondPlayer(),
            this.ticTacToe.getScoreBoard()
        );

        this.generateGameField(this.ticTacToe.getFieldSize());

        this.gameItems.gameField.addEventListener(
            'click',
            (event: MouseEvent) => {
                const target = event.target as HTMLElement | null;
                const cell = target?.closest(
                    '.game-field__cell'
                ) as HTMLElement;
                if (cell) {
                    this.handleCellClick(cell);
                }
            }
        );

        const end = performance.now();
        console.log(`Field generated in: ${(end - start).toFixed(2)} ms`);
    }

    resetGameUI(): void {
        this.ticTacToe.resetGame();
        const cells =
            this.gameItems.gameField.querySelectorAll('.game-field__cell');

        cells.forEach((cell: HTMLElement) => {
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
        this.updatePlayerIcon(this.ticTacToe.getFirstPlayer());
        this.updateStatusUI(this.ticTacToe.getFirstPlayer());
    }

    initializeGame(fieldSize = this.ticTacToe.getFieldSize()): void {
        this.renderGameField(fieldSize);
        this.initGameInfo();
        this.updatePlayerIcon(this.ticTacToe.getFirstPlayer());
        this.updateStatusUI(this.ticTacToe.getFirstPlayer());
    }

    getTicTacToe(): TicTacToe {
        return this.ticTacToe;
    }
}
