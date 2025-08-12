export class ScoreBoard {
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
