export class LocalStorageManager {
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
