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
        const variable = line.match(/거(어+)언(.+)/);
        const numlog = line.match(/^새끼(.+)야$/);
        const exit = line.match(/^나가뒤져라(.+)$/)
        const readline = line.match(/^시발(아+)$/);
        const textlog = line.match(/^병(.+)신$/);
        const goto = line.match(/^년.+$/);
        const conditi = line.match(/^씹덕(.+)아!(.+)/);
        if (variable) {
            console.log(variable[1], gunnumToNumber(line.replace(/거(어+)언/, '')));
            variables[variable[1].length] = gunnumToNumber(line.replace(/거(어+)언/, ''));
        }else if(numlog) {
            console.log(gunnumToNumber(line.split('새끼')[1].split('야')[0]));
        }else if(textlog) {
            console.log(String.fromCharCode(gunnumToNumber(line.split('병')[1].split('신')[0])));
        }else if(readline) {
            variables[readline[1].length] = readlineSync.question('');
        }else if(exit) {
            process.exit(gunnumToNumber(line.split('나가뒤져라')[1]));
        }else if(goto) {
            let tmp = gunnumToNumber(line.split('년')[1]) - 1;
            if(tmp >= 0) {
                i = tmp;
            }else{
                throw new Error('올바르지 않은 라인: "' + line + '"');
            }
        }else if(conditi) {
            const cond = gunnumToNumber(line.split('씹덕')[1].split('아!')[0]);
            const run = line.split('아!')[1];
            if(cond == 0) runGunwoo_lang(run);
        }else{
            throw new Error('예기치 않은 문자: "' + line + '"');
        }
    }
}

function gunnumToNumber(string) {
    let number = [];
    //console.log(`"${string}"`);
    string.split(' ').forEach(j => {
        if(j.length == 0) return;
        let tmp = 0;
        if(j.match(/^[~! ]+$/)) {
            j.split('').forEach(e => {
                switch(e) {
                    case '~':
                        tmp += 1;
                        break;
                    case '!':
                        tmp -= 1;
                        break;
                    default:
                        throw new Error('예기치 않은 문자: "' + e + '"');
                }
            });
        }else if(j.match(/(ㅇ+우)((([!~]ㅇ+우)([!~]ㅇ+우)?)+)?/)){
            // example for j : ㅇ우~ㅇ우!ㅇ우
            //console.log(j.split('우'));
            j.split('우').forEach(f => {
                //example input : ㅇ, ~ㅇ, !ㅇ
                if(f.length == 0) return;
                //console.log(`"${f.length}"`);
                if(f.startsWith('!')) {
                    tmp -= variables[f.length - 1 + ''];
                }else if(f.startsWith('~')) {
                    tmp += variables[f.length - 1 + ''];
                }else{
                    tmp += variables[f.length + ''];
                }
            })
        }else{
            throw new Error('예기치 않은 문자: "' + string + '"');
        }
        number.push(tmp);
    })
    return eval(number.join('*'));
}