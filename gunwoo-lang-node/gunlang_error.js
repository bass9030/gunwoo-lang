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

class UnknownStatementError extends GunwooError {
    constructor(rawLine, line) {
        super(`올바르지 않은 문자: "${rawLine}"`, line);
    }
}

class UndefinedVariableError extends GunwooError {
    constructor(varName, line) {
        super(`변수가 존재하지 않습니다: ${varName}`, line);
    }
}

class UnexpectedCharacterError extends GunwooError {
    constructor(char, line) {
        super(`예기치 않은 문자: "${char}"`, line);
    }
}

class InvalidJumpTargetError extends GunwooError {
    constructor(targetLine, line) {
        super(`올바르지 않은 점프 대상: "${targetLine}"`, line);
    }
}

class InvalidExpressionError extends GunwooError {
    constructor(expr, line) {
        super(`올바르지 않은 식: "${expr}"`, line);
    }
}

module.exports = {
    GunwooError,
    InvalidInputError,
    InvalidJumpTargetError,
    UnknownStatementError,
    UndefinedVariableError,
    UnexpectedCharacterError,
    InvalidExpressionError,
};
