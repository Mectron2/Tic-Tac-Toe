import { TicTacToe } from './TicTacToe.js';
import { Player } from './Player.js';
import { ScoreBoard } from './ScoreBoard.js';
import { LocalStorageManager } from './LocalStorageManager.js';
import { GameController } from './GameController.js';
import { WrongComboLengthError } from './Exceptions.js';

const gameItems = {
    page: document.querySelector('.page'),
    gameField: document.querySelector('.game-field'),
    gameInfoStatus: document.querySelector('.game-info__status'),
    firstPlayerScore: document.querySelector('.game-score__rounds-count-x'),
    secondPlayerScore: document.querySelector('.game-score__rounds-count-o'),
    drawScore: document.querySelector('.game-score__rounds-count-draw'),
    resetButton: document.querySelector('.button_reset'),
    scoreList: document.querySelector('.game-score__list'),
    applyFieldSizeButton: document.querySelector('.button_apply-field-size'),
    game: document.querySelector('.game'),
    settingsPanel: document.querySelector('.game__control-modal'),
    gameFieldSizeInput: document.querySelector(
        '.game__control__field-size-input'
    ),
    comboToWinInput: document.querySelector(
        '.game__control__combo-to-win-input'
    ),
    applyComboToWinButton: document.querySelector('.button_apply-combo-to-win'),
    settingsButton: document.querySelector('.button_settings'),
    modalOverlay: document.querySelector('.game__control-modal'),

    get currentPlayerIcon() {
        return document.querySelector('.game-info__status-player-icon');
    },

    get infoText() {
        return document.querySelector('.game-info__text');
    },
};

const PLAYERS_SYMBOLS = {
    firstPlayerSymbol: 'x',
    secondPlayerSymbol: 'o',
};

let gameFieldSize = 3;

const firstPlayer = new Player(PLAYERS_SYMBOLS.firstPlayerSymbol);
const secondPlayer = new Player(PLAYERS_SYMBOLS.secondPlayerSymbol);

const scoreBoard = new ScoreBoard(firstPlayer, secondPlayer);
const ticTacToe = new TicTacToe(
    gameFieldSize,
    firstPlayer,
    secondPlayer,
    scoreBoard
);
const localStorageManager = new LocalStorageManager(scoreBoard);
const gameController = new GameController(
    ticTacToe,
    gameItems,
    localStorageManager
);

gameController.initializeGame();

gameItems.applyFieldSizeButton.addEventListener('click', () => {
    const inputValue = parseInt(gameItems.gameFieldSizeInput.value, 10);

    if (
        gameController.ticTacToe.emptyCells ===
            gameController.ticTacToe.fieldSize ** 2 ||
        gameController.ticTacToe.isOver
    ) {
        if (inputValue >= 3 && inputValue <= 100) {
            gameFieldSize = inputValue;
            gameController.initializeGame(gameFieldSize);

            if (inputValue > 10) {
                gameItems.gameField.classList.add('game-field_large');
                gameItems.game.classList.add('game_large');
                gameItems.page.style.setProperty('height', 'auto');
                gameItems.page.style.setProperty('padding', '40px 0 40px 0');
            } else {
                gameItems.page.style.setProperty('height', '100%');
                gameItems.page.style.setProperty('padding', '0');
                gameItems.gameField.classList.remove('game-field_large');
                gameItems.game.classList.remove('game_large');
            }
        } else {
            alert('Please enter a field size between 3 and 100.');
        }
    } else {
        alert('Please finish the current game before changing the field size.');
    }
});

gameItems.resetButton.addEventListener('click', () => {
    gameController.resetGameUI();
});

window.addEventListener('DOMContentLoaded', () => {
    localStorageManager.syncScores();
    gameController.syncScoresUI(ticTacToe);
});

gameItems.scoreList.addEventListener('click', () => {
    const isConfirmed = confirm('Are you sure you want to reset the score?');
    if (isConfirmed) {
        localStorageManager.resetScores();
        gameController.resetScoresUI();
    }
});

gameItems.applyComboToWinButton.addEventListener('click', () => {
    const inputValue = parseInt(gameItems.comboToWinInput.value, 10);

    if (
        gameController.ticTacToe.emptyCells ===
            gameController.ticTacToe.fieldSize ** 2 ||
        gameController.ticTacToe.isOver
    ) {
        try {
            gameController.ticTacToe.setWinComboLength(inputValue);
        } catch (error) {
            if (error instanceof WrongComboLengthError) {
                alert(error.message);
            } else {
                throw error;
            }
        }
    } else {
        alert(
            'Please finish the current game before changing the combo length.'
        );
    }
});

gameItems.settingsButton.addEventListener('click', () => {
    gameItems.settingsPanel.classList.toggle('game__control-modal_active');
});

gameItems.modalOverlay.addEventListener('click', (e) => {
    if (e.target === gameItems.modalOverlay) {
        gameItems.modalOverlay.classList.remove('game__control-modal_active');
    }
});
