class GunwooError extends Error {
    constructor(message, line) {
        super(line !== undefined ? `${message} (line ${line})` : message);
        this.name = this.constructor.name;
        this.line = line;
    }
}

class InvalidInputError extends GunwooError {
    constructor(input, line) {
        super(`올바르지 않은 입력: ${input}`, line);
    }
}

class InvalidLineError extends GunwooError {
    constructor(targetLine, line) {
        super(`올바르지 않은 라인: "${targetLine}"`, line);
    }
}

class UnknownStatementError extends GunwooError {
    constructor(rawLine, line) {
        super(`올바르지 않은 문자: "${rawLine}"`, line);
    }
}

class UndefinedVariableError extends GunwooError {
    constructor(varName) {
        super(`변수가 존재하지 않습니다: ${varName}`);
    }
}

class UnexpectedCharacterError extends GunwooError {
    constructor(char) {
        super(`예기치 않은 문자: "${char}"`);
    }
}

class InvalidExpressionError extends GunwooError {
    constructor(expr) {
        super(`올바르지 않은 식: "${expr}"`);
    }
}

module.exports = {
    GunwooError,
    InvalidInputError,
    InvalidLineError,
    UnknownStatementError,
    UndefinedVariableError,
    UnexpectedCharacterError,
    InvalidExpressionError,
};
