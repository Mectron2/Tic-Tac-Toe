export class WrongMoveError extends Error {
    constructor(message) {
        super(message);
        this.name = WrongMoveError.name;
    }
}

export class WrongComboLengthError extends Error {
    constructor(message) {
        super(message);
        this.name = WrongComboLengthError.name;
    }
}
