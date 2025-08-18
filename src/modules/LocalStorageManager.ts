import type { ScoreBoard } from './ScoreBoard.js';

export class LocalStorageManager {
    private scoreBoard: ScoreBoard;

    constructor(scoreBoard: ScoreBoard) {
        this.scoreBoard = scoreBoard;
    }

    saveScores(): void {
        const scores = this.scoreBoard.getScores();

        localStorage.setItem(
            'firstPlayerScore',
            String(scores.firstPlayerScore)
        );
        localStorage.setItem(
            'secondPlayerScore',
            String(scores.secondPlayerScore)
        );
        localStorage.setItem('drawScore', String(scores.drawScore));
    }

    syncScores(): void {
        const rawFirst = localStorage.getItem('firstPlayerScore');
        const rawSecond = localStorage.getItem('secondPlayerScore');
        const rawDraw = localStorage.getItem('drawScore');

        const firstScore = rawFirst !== null ? parseInt(rawFirst, 10) : 0;
        const secondScore = rawSecond !== null ? parseInt(rawSecond, 10) : 0;
        const drawCount = rawDraw !== null ? parseInt(rawDraw, 10) : 0;

        this.scoreBoard.setScores(firstScore, secondScore, drawCount);
    }

    resetScores(): void {
        this.scoreBoard.resetScores();
        this.saveScores();
    }
}
