export class Player {
    private readonly symbol: string;
    private score: number;

    constructor(symbol: string) {
        this.symbol = symbol;
        this.score = 0;
    }

    getScore(): number {
        return this.score;
    }

    getSymbol(): string {
        return this.symbol;
    }

    incrementScore(): void {
        this.score++;
    }

    resetScore(): void {
        this.score = 0;
    }

    setScore(score: number): void {
        this.score = score;
    }
}
