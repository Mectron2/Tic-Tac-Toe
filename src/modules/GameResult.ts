import type { Player } from './Player.js';

export default interface GameResult {
    winner: Player | 'Draw';
    combination: number[] | null;
}
