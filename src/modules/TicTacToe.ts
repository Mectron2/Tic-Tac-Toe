import { WrongComboLengthError, WrongMoveError } from './Exceptions.js';
import type { Player } from './Player.js';
import type { ScoreBoard } from './ScoreBoard.js';
import type GameResult from './GameResult.js';

export class TicTacToe {
    private readonly fieldSize: number;
    private readonly board: any[];
    private readonly firstPlayer: any;
    private readonly secondPlayer: any;
    private readonly scoreBoard: any;
    private currentPlayer: any;
    private isOver: boolean;
    private emptyCells: number;
    private winComboLength: number;
    private counts: {
        [p: number]: {
            rows: number[];
            cols: number[];
            diag: number;
            anti: number;
        };
    };

    constructor(
        fieldSize = 3,
        firstPlayer: Player,
        secondPlayer: Player,
        scoreBoard: ScoreBoard
    ) {
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

    setWinComboLength(length: number): void {
        if (length < 3 || length > this.fieldSize) {
            throw new WrongComboLengthError(
                'Invalid win combo length. Must be between 3 and field size.'
            );
        }
        this.winComboLength = length;
    }

    resetCounts(): void {
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

    _generateWinIndexesForRow(row: number): number[] {
        const size = this.fieldSize;
        return Array.from({ length: size }, (_, col) => row * size + col);
    }

    _generateWinIndexesForCol(col: number): number[] {
        const size = this.fieldSize;
        return Array.from({ length: size }, (_, row) => row * size + col);
    }

    _generateWinIndexesForDiag(): number[] {
        const size = this.fieldSize;
        return Array.from({ length: size }, (_, i) => i * (size + 1));
    }

    _generateWinIndexesForAntiDiag(): number[] {
        const size = this.fieldSize;
        return Array.from({ length: size }, (_, i) => (i + 1) * (size - 1));
    }

    checkForWinMaxLength(position: number): GameResult | null {
        const symbol = this.currentPlayer.getSymbol();
        const counters = this.counts[symbol]!;
        const size = this.fieldSize;

        const row = Math.floor(position / size);
        const col = position % size;

        counters.rows[row]!++;
        counters.cols[col]!++;
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
            let combo: number[] | null = null;

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
            return { winner: this.currentPlayer, combination: combo };
        }

        if (this.emptyCells === 0) {
            this.isOver = true;
            return { winner: 'Draw', combination: null };
        }

        return null;
    }

    checkForWin(
        gameField: Player[],
        fieldSize: number,
        winLength: number,
        lastMoveIndex: number
    ): GameResult | null {
        const currentSymbol = this.currentPlayer.getSymbol();

        const lastMoveRow = Math.floor(lastMoveIndex / fieldSize);
        const lastMoveCol = lastMoveIndex % fieldSize;

        const directions: [number, number][] = [
            [0, 1], // →
            [1, 0], // ↓
            [1, 1], // ↘
            [1, -1], // ↙
        ];

        function collectPositions(rowStep: number, colStep: number): number[] {
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

    makeMove(position: number): GameResult | null {
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

        return null;
    }

    resetGame(): void {
        this.board.fill(null);
        this.currentPlayer = this.firstPlayer;
        this.isOver = false;
        this.resetCounts();
        this.emptyCells = this.fieldSize ** 2;
    }

    getCurrentPlayer(): Player {
        return this.currentPlayer;
    }

    getScoreBoard(): ScoreBoard {
        return this.scoreBoard;
    }

    getFirstPlayer(): Player {
        return this.firstPlayer;
    }

    getSecondPlayer(): Player {
        return this.secondPlayer;
    }

    getFieldSize(): number {
        return this.fieldSize;
    }

    setIsOver(isOver: boolean): void {
        this.isOver = isOver;
    }

    getIsOver(): boolean {
        return this.isOver;
    }

    getEmptyCells(): number {
        return this.emptyCells;
    }
}
