const fs = require("fs");
const { stdin: input, stdout: output } = require("node:process");
const rl = require("readline").createInterface({ input, output });
const {
    InvalidInputError,
    InvalidLineError,
    UnknownStatementError,
    UndefinedVariableError,
    UnexpectedCharacterError,
    InvalidExpressionError,
} = require("./gunlang_error.js");

function readline(text) {
    return new Promise((resolve) => {
        rl.question(text, resolve);
    });
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
    const mul = expr.split(" ");
    let result = [];
    for (let e of mul) {
        let i = 0;
        let isLastOpVar = false;
        let currentOp = "";
        let value = 0;
        while (i < e.length) {
            switch (e[i]) {
                case "ㅇ":
                    i++;
                    let varNum = 0;
                    let gunNum = "";
                    while (e[i] !== "우") {
                        gunNum += e[i];
                        i++;
                    }

                    varNum = evalExpr(gunNum);

                    if (e[i] !== "우") throw new UnexpectedCharacterError(e);

                    if (variables[varNum - 1] === undefined)
                        throw new UndefinedVariableError("ㅇ" + gunNum + "우");

                    if (currentOp === "" || currentOp === "+")
                        value += variables[varNum - 1];
                    else if (currentOp === "-") value -= variables[varNum - 1];

                    if (currentOp !== "") currentOp = "";
                    isLastOpVar = true;
                    i++;
                    break;

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
            }
        }

        result.push(value);
    }
    const finalResult = result.reduce((acc, val) => acc * val, 1);
    // console.log(expr, "->", finalResult);
    return finalResult;
}

async function runGunwoo_lang(code, line) {
    const variable = code.match(/거(.+)언(.*)/);
    const numlog = code.match(/^새끼(.+)야$/);
    const exit = code.match(/^나가뒤져라(.*)$/);
    const userinput = code.match(/^시발(.+)아$/);
    const textlog = code.match(/^병(.*)신$/);
    const conditi = code.match(/^씹덕(.*)아!(.*)/);
    const goto = code.match(/^년.+$/);

    if (conditi) {
        // 조건문
        const cond = evalExpr(code.split("씹덕")[1].split("아!")[0], line);
        const run = code.split("아!")[1];
        if (cond == 0) return await runGunwoo_lang(run);
    } else if (variable) {
        // 변수
        variables[evalExpr(variable[1]) - 1] = evalExpr(variable[2], line);
        // console.log(variables); // debug: print current variables
        return null;
    } else if (numlog) {
        // 숫자 콘솔 출력
        console.log(evalExpr(numlog[1], line));
        return null;
    } else if (textlog) {
        // 텍스트 콘솔 출력
        output.write(
            String.fromCharCode(
                evalExpr(code.split("병")[1].split("신")[0], line),
            ),
        );
        return null;
    } else if (userinput) {
        // 사용자 입력
        const input = parseInt(await readline(""));
        if (!isNaN(input)) variables[evalExpr(userinput[1]) - 1] = input;
        else throw new InvalidInputError(input);
        return null;
    } else if (goto) {
        let tmp = evalExpr(code.split("년")[1], line);
        return { goto: tmp };
    } else if (exit) {
        // 종료
        let exitcode = evalExpr(code.split("나가뒤져라")[1], line);
        return { exit: exitcode };
    } else {
        throw new UnknownStatementError(code, line);
    }
}

async function main() {
    console.log(!!process.argv[2]);
    if (!!process.argv[2]) {
        const code = fs.readFileSync(process.argv[2]).toString().split("\n");
        for (let i = 0; i < code.length; i++) {
            const line = code[i].split("응아니야")[0].trim();
            if (line.length == 0) continue;
            // console.log(i + 1, line); // debug: print current line and command

            let result = await runGunwoo_lang(line, i + 1);
            if (result !== null) {
                if (result?.goto !== undefined) {
                    i = result.goto - 2;
                    continue;
                } else if (result?.exit !== undefined) {
                    process.exit(result.exit);
                }
            }
        }
    } else {
        while (true) {
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
        }
    }

    process.exit(0);
}

if (require.main === module) {
    main();
}
