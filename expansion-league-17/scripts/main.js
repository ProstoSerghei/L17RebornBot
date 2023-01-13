"use strict";

var autoFightEnabled = false;

var autoCaptcha;

var minHealthPoints;
var needHeal = false;
var createMapToPCEnabled = false;
var userMapToPC = [];
var tempMapToPC = []; // for walker()

//Создаем AutoFight
const autoFight = new AutoFight();


var locationTitle = frames[0].document.title;

// Подгружаем настройки после входа в игру.
window.addEventListener('load', function () {
    getSettings().then(() => {
        setTimeout(() => {
            if (autoFightEnabled) {
                autoFight.huntBtnEnable('on');
                locationReload();
            } else if (createMapToPCEnabled) {
                createRoute();
            }
        }, 1000);
    });
});
// Слушаем изменение настроек
chrome.storage.onChanged.addListener(function () {
    getSettings().then(() => {
        setTimeout(() => {
            if (autoFightEnabled) {
                autoFight.huntBtnEnable('on');
                locationReload();
            } else if (createMapToPCEnabled) {
                createRoute();
            } else if (!autoFightEnabled) {
                locationReload();
            }
        }, 1000);
    });
});
// Слушаем обновление фрейма
var timer;
document.querySelector('#_location').addEventListener('load', () => {
    clearTimeout(timer);
    if (autoFightEnabled) {
        setTimeout(locationReload, 1000);
        timer = setTimeout(() => {
            frames[0].location.reload();
        }, 60 * 1000);
    }
});


function locationReload() {
    let captchaImageEl = frames[0].document.querySelector('img[src="/kp.php"]');
    let quitButtonEl = frames[0].document.querySelector('#exitFight');
    let movesBtnsEls = frames[0].document.querySelectorAll('a[id^="atk"]');
    locationTitle = frames[0].document.title;
    if (needHeal && locationTitle !== 'LEAGUE-17 FIGHT!') { // Если нужно лечиться
        var promise = new Promise(function (resolve, reject) {
            setTimeout(() => {
                autoFight.huntBtnEnable();
                resolve('');
            }, 500);
        }).then(result => { setTimeout(walker, 500) });
    } else if (needHeal &&
        locationTitle === 'LEAGUE-17 FIGHT!' &&
        !(autoFight.isEscapedPokemonsOrShine())) { // Если нужно лечиться, но мы в бою
        var surrender = fetch('https://league17reborn.ru/game.php?fun=fight&leave=1');
        surrender.then(() => { frames[0].location.reload() });
    } else if (locationTitle === 'LEAGUE-17 FIGHT!') { // Если мы в бою
        if (autoFight.isEscapedPokemonsOrShine()) { // Если сбег или шайни
            sendMessage('АвтоБой', 'На Вас напал редкий покемон');
        } else if (captchaImageEl) { // Если капча
            if (autoCaptcha.apiKey === '' || autoCaptcha.apiKey === undefined) {
                sendMessage('АвтоКапча', 'Введите капчу')
            } else {
                captchaImageEl.insertAdjacentHTML('afterend', '<p>Идет распознание капчи...</p>');
                let imgBase64 = autoCaptcha.creatImageBase64URL(captchaImageEl);
                autoCaptcha.createTask(imgBase64);
            }
        } else if (quitButtonEl) { // Если бой окончен
            let drop = frames[0].document.querySelectorAll('div#fight > table > tbody > tr > td > div')[2].innerText.split('\n')[2].split(',').slice(1).join('\n').trim();
            let currentHP = parseInt(frames[0].document.querySelector('table > tbody > tr > td > div').innerHTML);
            let checkPP = 0;
            if (drop.length > 1) {
                sendMessage('Вы выбили:', drop);
            }
            for (let i = 1; i < 5; i++) {
                let movePP = autoFight.moves[`move${i}`].count;
                let moveCanUse = autoFight.moves[`move${i}`].canUse;
                if (moveCanUse) {
                    if (movePP < 1) {
                        checkPP = true;
                    } else {
                        checkPP = false;
                    }
                }
            };

            if ((currentHP < minHealthPoints) || (checkPP)) {
                needHeal = true;
            }
            setTimeout(() => { autoFight.quitFight(); }, 1000);
        } else if (movesBtnsEls.length) { // Если бой продолжается
            var ppCountEls = frames[0].document.querySelectorAll('td > sup');

            let i = 1;
            let checker = true;
            ppCountEls.forEach(el => {
                let currentPP = parseInt(el.innerText);
                let currentMove = autoFight.moves[`move${i}`];
                currentMove.count = currentPP;
                if (currentMove.canUse) {
                    if (currentMove.count === 0) {
                        checker = true;
                    } else {
                        checker = false;
                    }
                }
                i++;
            });
            if (checker) {
                needHeal = true;
                var surrender = fetch('https://league17reborn.ru/game.php?fun=fight&leave=1');
                surrender.then(() => { frames[0].location.reload() });
            } else {
                setTimeout(() => { autoFight.kick(); }, 1000)
            }
        }
    }
}

function createRoute() {
    var location = frames[0].document.querySelector('div > span');
    userMapToPC = [];
    alert('Идет запись маршрута до ПЦ.\n\nНачальная локация: ' + location.innerHTML);
    var recordRoute = setInterval(() => {
        var location = frames[0].document.querySelector('div > span');
        if (location) {
            location = frames[0].document.querySelector('div > span').innerHTML;
            if (!userMapToPC.includes(location)) {
                userMapToPC.push(location);
            }
            if (location === 'Покецентр') {
                clearInterval(recordRoute);
                var userAnswer = confirm('Итоговый путь: \n' + userMapToPC.join(', ') + '\n\nВерно?');
                if (userAnswer) {
                    createMapToPCEnabled = false;
                    chrome.storage.local.set({ userMapToPC: userMapToPC, userMapToPCBool: false });
                } else {
                    userMapToPC = [];
                    createMapToPCEnabled = false;
                    chrome.storage.local.set({ userMapToPC: [], userMapToPCBool: false });
                    sendMessage('АвтоЛечение', 'Отмена записи маршрута...');
                }
            }
        }
    }, 1000);
}

// Зависима от внешних переменных!!!
function walker() {
    var location = frames[0].document.querySelector('div > span');
    var linksEls = frames[0].document.querySelectorAll('a');
    let nextStep;
    if (location && location.innerHTML === 'Покецентр') {
        var heal = fetch('https://league17reborn.ru/game.php?fun=m_npc&npc_id=8&answ_id=4&map=1');
        tempMapToPC = userMapToPC.slice(0, -1);
        nextStep = tempMapToPC.pop();
        linksEls.forEach(lnk => {
            if (lnk.innerHTML === nextStep) {
                setTimeout(() => { lnk.click(); }, 1000)
            }
        })
    } else if (location && location.innerHTML !== tempMapToPC.at(-1)) {
        nextStep = tempMapToPC.pop();
        if (nextStep === userMapToPC[0]) {
            needHeal = false;
            setTimeout(() => {
                tempMapToPC = structuredClone(userMapToPC).reverse().slice(0, -1);
                autoFight.huntBtnEnable('on');
            }, 3000);
        }
        linksEls.forEach(lnk => {
            if (lnk.innerHTML === nextStep) {
                lnk.click();
            }
        })
    }
}

function getSettings() {
    return chrome.storage.local.get().then(
        function (items) {
            if (Object.keys(items).length !== 0) {
                autoFight.moves.move1.canUse = items.moves.move1.canUse;
                autoFight.moves.move2.canUse = items.moves.move2.canUse;
                autoFight.moves.move3.canUse = items.moves.move3.canUse;
                autoFight.moves.move4.canUse = items.moves.move4.canUse;
                autoFightEnabled = items.startAutoFight;
                autoCaptcha = new AutoCaptcha(items.userApiKey);
                minHealthPoints = items.minHealthPoints;
                createMapToPCEnabled = items.userMapToPCBool;
                if (items.userMapToPC) {
                    userMapToPC = items.userMapToPC;
                }
                if (items.userMapToPC && items.userMapToPC.length > 0) {
                    tempMapToPC = structuredClone(userMapToPC).reverse().slice(0, -1);
                }
            }
        }
    );
}

function sendMessage(title, text) {
    var notification = new Notification(title, {
        body: text,
        dir: 'auto'
    });
}



// Слушаем сообщения...
var nickName = '';
getNickName();
async function getNickName() {
    var nickNameReq = await fetch('https://league17reborn.ru/game.php?fun=start');
    var startPageText = nickNameReq.text();
    var newDiv = document.createElement('div');
    startPageText.then(res => {
        newDiv.insertAdjacentHTML('afterbegin', res);
        nickName = newDiv.querySelector('td#n > h2 > font').innerText;
    });
}

document.querySelector('frame[name="_chat"]').addEventListener('load', () => {
    setTimeout(chat, 3000);
});

function chat() {
    let elem = frames[1].document.querySelector('#message_box');
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            var abotMesEl = mutation.addedNodes[1];
            if (abotMesEl.tagName === 'B') {
                var messFrom = abotMesEl.querySelectorAll('a')[0].innerText;
                if (messFrom !== nickName) {
                    sendMessage(`Сообщение от ${messFrom}`, mutation.addedNodes[3].innerText);
                    if (abotMesEl.querySelector('a').style.color === 'rgb(151, 0, 0)') {
                        chrome.storage.local.set({ startAutoFight: false });
                        sendMessage('Автобой', `Вам пишет ${messFrom}, АвтоБой отключен.`);
                    }
                }
            }
        });
    });
    observer.observe(
        elem,
        {
            childList: true,
            attributes: true,
            subtree: true,
            characterData: true,
            attributeOldValue: true,
            characterData: true,
        }
    );
}