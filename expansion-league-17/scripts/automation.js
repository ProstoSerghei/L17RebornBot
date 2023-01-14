"use strict";

// АвтоБой
class AutoFight {
    constructor() {
        this.moves = {
            move1: {
                canUse: false,
                link: 'a[href*="num=1"]',
                count: 0,
                PPIndex: 0
            },
            move2: {
                canUse: false,
                link: 'a[href*="num=2"]',
                count: 0,
                PPIndex: 1
            },
            move3: {
                canUse: false,
                link: 'a[href*="num=3"]',
                count: 0,
                PPIndex: 2
            },
            move4: {
                canUse: false,
                link: 'a[href*="num=4"]',
                count: 0,
                PPIndex: 3
            },
        };
        this.escapedPokemons = ['#412', '#515', '#588', '#627', '#631', '#641', '#708', '#744', '#765', '#280', '#333', '#420', '#403', '#616', '#629', '#632', '#642', '#710', '#744', '#766', '#214', '#328', '#412', '#513', '#588', '#627', '#631', '#641', '#708', '#744', '#765', '#280', '#333', '#413', '#511', '#616', '#629', '#632', '#642', '#710', '#744', '#766', '#214', '#328'];

    }

    kick() {
        for (let i = 1; i < 5; i++) {
            let move = this.moves['move' + i];
            if (move.canUse && move.count > 0) {
                move.count -= 1;
                frames[0].document.querySelector(move.link).click();
                break;
            }
        }
    }

    quitFight() {
        let quitButton = frames[0].document.querySelector('#exitFight');;
        if (quitButton) {
            quitButton.click();
        }
    }

    huntBtnEnable(state) {
        var huntBtnEl = frames[3].document.querySelector('a[href*="hunt=1"] > img');
        var buttonState = parseInt(huntBtnEl.src.slice(-5));
        if (state == 'on') {
            if (buttonState == 1) {
                huntBtnEl.click();
            }
        } else {
            if (buttonState == 2) {
                huntBtnEl.click();
            }
        }
    }

    isEscapedPokemonsOrShine() {
        var enemyPokemonTitle = frames[0].document.querySelectorAll('td[class="title"] > span')[1].className;
        var regPokeNumber = /\#\d{3}\.{0,1}\d{0,1}/g;
        var enemyPokemonNumber = frames[0].document.querySelectorAll('td[class="title"] > span')[1].innerHTML.slice('</a>').match(regPokeNumber)[0];
        if (enemyPokemonTitle !== 'poketitle' || this.escapedPokemons.includes(enemyPokemonNumber)) {
            return true;
        } else {
            return false;
        }
    }
}




// АвтоКапча
class AutoCaptcha {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async createTask(image) {
        var createTaskURL = 'https://api.anti-captcha.com/createTask';
        var createTaskData = {
            'clientKey': this.apiKey,
            'task': {
                "type": "ImageToTextTask",
                "body": image,
                "numeric": 1,
                "minLength": 4,
                "maxLength": 4
            },
            "softId": 1077
        };
        var createTask = await fetch(createTaskURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json, charset=utf-8'
            },
            body: JSON.stringify(createTaskData)
        });
        var resultJson = await createTask.json();
        if (resultJson.errorId === 0) {
            setTimeout(() => { this.getTaskResult(resultJson.taskId) }, 5000);
        } else {
            console.log('Ошибка API: ' + resultJson.errorCode + ', ' + resultJson.errorDescription);
        }
    }

    async getTaskResult(taskId) {
        var getTaskResultURL = 'https://api.anti-captcha.com/getTaskResult';
        let getTaskResultData = {
            'clientKey': this.apiKey,
            'taskId': taskId
        };
        var result = '';
        var getTaskResult = await fetch(getTaskResultURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json, charset=utf-8'
            },
            body: JSON.stringify(getTaskResultData)
        });
        var resultJson = await getTaskResult.json();

        if (resultJson.errorId == 0) {
            // Получаем рузультат...
            if (resultJson.status == 'ready') {
                frames[0].document.querySelector('input[name="keystring"]').value = resultJson.solution.text;
                setTimeout(() => { frames[0].document.querySelector('input[value="Отправить"]').click(); }, 2000)
            } else {
                setTimeout(() => { this.getTaskResult(taskId) }, 2000);
            }
        } else {
            console.log('Ошибка API: ' + resultJson.errorCode + ', ' + resultJson.errorDescription);
        }
    }

    creatImageBase64URL(imageEl) {
        var canvas = document.createElement('canvas');
        canvas.width = imageEl.width;
        canvas.height = imageEl.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(imageEl, 0, 0);
        var dataURL = canvas.toDataURL('image, png').replace('data:image/png;base64,', '');
        return dataURL;
    }
}
