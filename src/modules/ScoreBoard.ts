import type { Player } from './Player.js';
import type PlayersScore from './PlayersScore.js';

export class ScoreBoard {
    private readonly firstPlayer: Player;
    private readonly secondPlayer: Player;
    private drawScore: number;

    constructor(firstPlayer: Player, secondPlayer: Player) {
        this.firstPlayer = firstPlayer;
        this.secondPlayer = secondPlayer;
        this.drawScore = 0;
    }

    incrementPlayerScore(player: Player): void {
        if (player === this.firstPlayer) {
            this.firstPlayer.incrementScore();
        } else if (player === this.secondPlayer) {
            this.secondPlayer.incrementScore();
        }
    }

    incrementDrawScore(): void {
        this.drawScore++;
    }

    resetScores(): void {
        this.firstPlayer.resetScore();
        this.secondPlayer.resetScore();
        this.drawScore = 0;
    }

    setScores(
        firstPlayerScore: number,
        secondPlayerScore: number,
        drawScore: number
    ): void {
        this.firstPlayer.setScore(firstPlayerScore);
        this.secondPlayer.setScore(secondPlayerScore);
        this.drawScore = drawScore;
    }

    getScores(): PlayersScore {
        return {
            firstPlayerScore: this.firstPlayer.getScore(),
            secondPlayerScore: this.secondPlayer.getScore(),
            drawScore: this.drawScore,
        };
    }
}
