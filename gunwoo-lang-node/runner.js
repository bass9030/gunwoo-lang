const fs = require("fs");
const { stdin: input, stdout: output } = require("node:process");
const rl = require("readline").createInterface({ input, output });
const { parseArgs } = require("node:util");
const {
    GunwooError,
    InvalidInputError,
    InvalidLineError,
    UnknownStatementError,
    UndefinedVariableError,
    InvalidJumpTargetError,
    UnexpectedCharacterError,
    InvalidExpressionError,
} = require("./gunlang_error.js");

const options = {
    debug: { type: "boolean", short: "d" },
    file: { type: "string" },
};
const { values, positionals } = parseArgs({ options, allowPositionals: true });

function readline(text) {
    return new Promise((resolve) => {
        rl.question(text, resolve);
    });
}

class Debug {
    static log(...args) {
        if (values.debug) console.log(...args);
    }
}

let variables = [];

/*
 가능한 경우
 ~~ -> 2
 !! -> -2
 ~~ !! -> -4
 ㅇ우~~ -> 변수 1번에 2 더하기
 ~~ㅇ우 -> 2 더하기 변수 1번
 ㅇ우~ㅇㅇ우 -> 변수 1번에 변수 2번 더하기
 ㅇ우!ㅇㅇ우 -> 변수 1번에 변수 2번 빼기
 ㅇ우 ㅇㅇ우 -> 변수 1번에 변수 2번 곱하기
*/
function evalExpr(expr, line) {
    Debug.log("request evalExpr:", expr);
    const mul = expr.split(/\s/g);
    let result = [];
    for (let e of mul) {
        let i = 0;
        let isLastOpVar = false;
        let currentOp = "";
        let value = 0;
        while (i < e.length) {
            switch (e[i]) {
                case "ㅇ": {
                    i++;
                    let gunNum = "";
                    let depth = 1; // 내가 이미 ㅇ 하나를 열었으니 우 하나를 찾아야 함
                    while (depth > 0) {
                        if (e[i] === undefined)
                            throw new UnexpectedCharacterError(e);
                        if (e[i] === "ㅇ") depth++;
                        else if (e[i] === "우") {
                            depth--;
                            if (depth === 0) break; // 짝 맞는 우는 gunNum에 포함 안 함
                        }
                        gunNum += e[i];
                        i++;
                    }

                    const varNum = evalExpr(gunNum, line);

                    if (e[i] !== "우") throw new UnexpectedCharacterError(e);

                    if (variables[varNum - 1] === undefined)
                        throw new UndefinedVariableError(
                            "ㅇ" + gunNum + "우",
                            line,
                        );

                    if (currentOp === "" || currentOp === "+")
                        value += variables[varNum - 1];
                    else if (currentOp === "-") value -= variables[varNum - 1];

                    if (currentOp !== "") currentOp = "";
                    isLastOpVar = true;
                    i++;
                    break;
                }

                case "~":
                    if (isLastOpVar && e[i + 1] === "ㅇ") {
                        currentOp = "+";
                        i++;
                        isLastOpVar = false;
                        continue;
                    }

                    value++;
                    i++;
                    break;

                case "!":
                    if (isLastOpVar && e[i + 1] === "ㅇ") {
                        currentOp = "-";
                        i++;
                        isLastOpVar = false;
                        continue;
                    }
                    value--;
                    i++;
                    break;

                default:
                    throw new UnexpectedCharacterError(e);
            }
        }

        result.push(value);
    }
    const finalResult = result.reduce((acc, val) => acc * val, 1);
    Debug.log(expr, "->", finalResult);
    return finalResult;
}

async function runGunwoo_lang(code, line) {
    code = code.split("응아니야")[0].trim(); // Remove comments

    if (code.length === 0) return null; // Skip empty lines

    Debug.log(line, code);

    const variable = code.match(/거(.+)언(.*)/);
    const numlog = code.match(/^새끼(.+)야$/);
    const exit = code.match(/^나가뒤져라(.*)$/);
    const userinput = code.match(/^시발(.+)아$/);
    const textlog = code.match(/^병(.*)신$/);
    const conditi = code.match(/^씹덕(.*)아!(.*)/);
    const goto = code.match(/^년(.+)$/);

    if (conditi) {
        // 조건문
        const cond = evalExpr(conditi[1], line);
        const run = conditi[2];
        if (cond == 0) return await runGunwoo_lang(run);
    } else if (variable) {
        // 변수
        variables[evalExpr(variable[1], line) - 1] = evalExpr(
            variable[2],
            line,
        );
        Debug.log(variables); // debug: print current variables
        return null;
    } else if (numlog) {
        // 숫자 콘솔 출력
        console.log(evalExpr(numlog[1], line));
        return null;
    } else if (textlog) {
        // 텍스트 콘솔 출력
        output.write(String.fromCharCode(evalExpr(textlog[1], line)));
        return null;
    } else if (userinput) {
        // 사용자 입력
        const input = await readline("");
        if (!isNaN(input))
            variables[evalExpr(userinput[1], line) - 1] = parseInt(input);
        else throw new InvalidInputError(input, line);
        return null;
    } else if (goto) {
        let tmp = evalExpr(goto[1], line);
        return { goto: tmp };
    } else if (exit) {
        // 종료
        let exitcode = evalExpr(exit[1], line);
        return { exit: exitcode };
    } else {
        throw new UnknownStatementError(code, line);
    }
}

async function main() {
    if (!!positionals[0]) {
        const code = fs.readFileSync(positionals[0]).toString().split("\n");
        for (let i = 0; i < code.length; i++) {
            const line = code[i];
            if (line.length == 0) continue;

            let result = await runGunwoo_lang(line, i + 1);
            if (result !== null) {
                if (result?.goto !== undefined) {
                    if (result.goto < 1 || result.goto > code.length)
                        throw new InvalidJumpTargetError(result.goto, i + 1);

                    i = result.goto - 2;
                    continue;
                } else if (result?.exit !== undefined) {
                    process.exit(result.exit);
                }
            }
        }
    } else {
        while (true) {
            try {
                const code = await readline("> ");
                let result = await runGunwoo_lang(code, 1);
                if (result !== null) {
                    if (result?.goto !== undefined) {
                        console.log("goto is not supported in REPL mode.");
                        continue;
                    } else if (result?.exit !== undefined) {
                        process.exit(result.exit);
                    }
                }
            } catch (e) {
                if (e instanceof GunwooError) {
                    console.error(e.message);
                } else {
                    console.error("알 수 없는 오류가 발생했습니다:", e);
                }
            }
        }
    }

    process.exit(0);
}

if (require.main === module) {
    main();
}
