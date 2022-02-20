const fs = require('fs');
const readlineSync = require('readline-sync');
let variables = {};

const code = fs.readFileSync('./helloworld.gunwoo').toString();

runGunwoo_lang(code);



function runGunwoo_lang(code) {
    //CRLF LF 구분 없이 읽어오기
    if(code.includes('\r\n')) code = code.split('\r\n');
    else code = code.split('\n');
    for(let i = 0; i < code.length; i++) {
        const line = code[i].split('응아니야')[0];
        if(line.length == 0) continue;
        //console.log(i+1, line);
        const variable = line.match(/거(어+)언(.+)/);
        const numlog = line.match(/^새끼(.+)야$/);
        const exit = line.match(/^나가뒤져라(.+)$/)
        const readline = line.match(/^시발(아+)$/);
        const textlog = line.match(/^병(.+)신$/);
        const goto = line.match(/^년.+$/);
        const conditi = line.match(/^씹덕(.+)아!(.+)/);
        if(conditi) { // 조건문
            const cond = gunnumToNumber(line.split('씹덕')[1].split('아!')[0]);
            const run = line.split('아!')[1];
            if(cond == 0) {
                runGunwoo_lang(run);
            }
        }else if (variable) { // 변수
            variables[variable[1].length] = gunnumToNumber(line.replace(/거(어+)언/, ''));
        }else if(numlog) { // 숫자 콘솔 출력
            console.log(gunnumToNumber(line.split('새끼')[1].split('야')[0]));
        }else if(textlog) { // 텍스트 콘솔 출력
            console.log(String.fromCharCode(gunnumToNumber(line.split('병')[1].split('신')[0])));
        }else if(readline) { // 사용자 입력
            const input = parseInt(readlineSync.question(''));
            if(!isNaN(input)) variables[readline[1].length] = input;
            else throw new Error('올바르지 않은 입력: ' + input);
        }else if(exit) { // 종료
            process.exit(gunnumToNumber(line.split('나가뒤져라')[1]));
        }else if(goto) { // 줄 이동
            let tmp = gunnumToNumber(line.split('년')[1]) - 2;
            console.log(tmp)
            if(tmp + 2 >= 1 && tmp + 2 <= code.length) {
                i = tmp;
            }else{
                throw new Error('올바르지 않은 라인: "' + (tmp + 2) + '":' + (i+1));
            }
        }else{
            throw new Error('올바르지 않은 문자: "' + line + '":' + (i+1));
        }
    }
}

function gunnumToNumber(string) {
    let number = [];
    //console.log(`"${string}"`);
    if(string.match(/^[~! ]+$/)) {
        let tmp = 0;
        string.split('').forEach(e => {
            switch(e) {
                case '~':
                    tmp += 1;
                    break;
                case '!':
                    tmp -= 1;
                    break;
                case ' ':
                    number.push(tmp);
                    tmp = 0;
                    break
                default:
                    throw new Error('예기치 않은 문자: "' + e + '"');
            }
        });
        number.push(tmp);
    }else if(string.match(/(ㅇ+우)((([! ~]ㅇ+우)([! ~]ㅇ+우)?)+)?/)){
        // example for j : ㅇ우~ㅇ우!ㅇ우
        //console.log(j.split('우'));
        let variableCount = 0;
        let calc = 0;
        let sign = '';
        let ismultiply = false;
        string.split('').forEach(e => {
            switch(e) {
                case 'ㅇ':
                    ismultiply = false;
                    variableCount += 1;
                    break;
                case '우':
                    if(!variables[variableCount]) throw new Error('변수가 존재하지 않습니다: ' + 'ㅇ'.repeat(variableCount) + '우');
                    ismultiply = false;
                    if(sign == '') {
                        calc = variables[variableCount];
                    }else if(sign == '+') {
                        calc += variables[variableCount];
                    }else if(sign == '-') {
                        calc -= variables[variableCount];
                    }
                    sign = '';
                    variableCount = 0;
                    break;
                case '~':
                    ismultiply = true;
                    sign += '+';
                    break;
                case '!':
                    ismultiply = true;
                    calc += '-';
                    break;
                case ' ':
                    number.push(calc);
                    calc = 0;
                    sign = '';
                    variableCount = 0;
                    ismultiply = true;
                    break;
            }
        });
        if(ismultiply) throw new Error('올바르지 않은 식: "' + string + '"');
        number.push((calc.length == 0) ? tmp : calc)
    }else{
        throw new Error('예기치 않은 문자: "' + string + '"');
    }
    //console.log(number)
    return eval(number.join('*'));
}