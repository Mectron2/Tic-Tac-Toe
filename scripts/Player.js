export class Player {
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
