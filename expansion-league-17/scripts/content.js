"use strict";

const move1El = document.querySelector('#move1');
const move2El = document.querySelector('#move2');
const move3El = document.querySelector('#move3');
const move4El = document.querySelector('#move4');
const startAutoFightEl = document.querySelector('#startAutoFight');
const userApiKeyEl = document.querySelector('#userApiKey');
const minHealthPointsEl = document.querySelector('#minHealthPoints');
const userMapToPCBoolEl = document.querySelector('#userMapToPCBool');
const showCurrenRoute = document.querySelector('#showCurrenRoute');
const balanceCaptcha = document.querySelector('#balance');

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#save').addEventListener('click', saveOptions);
document.querySelector('#clearStorage').addEventListener('click', clearLocalStorage);
userApiKeyEl.addEventListener('change', () => {
    getBalance();
});

userMapToPCBoolEl.addEventListener('change', () => {
    if (userMapToPCBoolEl.checked) {
        startAutoFightEl.checked = false;
    }
})

startAutoFightEl.addEventListener('change', () => {
    if (startAutoFightEl.checked) {
        userMapToPCBoolEl.checked = false;
    }
})

document.body.addEventListener('click', function (e) {
    if (e.target.matches('a[href]')) {
        chrome.tabs.create({ url: e.target.href });
    }
});

function saveOptions() {
    chrome.storage.local.set({
        moves: {
            move1: { 'canUse': move1El.checked },
            move2: { 'canUse': move2El.checked },
            move3: { 'canUse': move3El.checked },
            move4: { 'canUse': move4El.checked }
        },
        startAutoFight: startAutoFightEl.checked,
        userApiKey: userApiKeyEl.value,
        minHealthPoints: minHealthPointsEl.value,
        userMapToPCBool: userMapToPCBoolEl.checked,
    }).then(
        function () {
            sendMessage('Настройки', 'Настройки сохранены!');
        }
    );
}

function restoreOptions() {
    chrome.storage.local.get({
        moves: {
            move1: { canUse: false },
            move2: { canUse: false },
            move3: { canUse: false },
            move4: { canUse: false }
        },
        startAutoFight: false,
        userApiKey: '',
        minHealthPoints: 100,
        userMapToPCBool: false,
        userMapToPC: []
    }).then(
        function (items) {
            move1El.checked = items.moves.move1['canUse'];
            move2El.checked = items.moves.move2['canUse'];
            move3El.checked = items.moves.move3['canUse'];
            move4El.checked = items.moves.move4['canUse'];
            startAutoFightEl.checked = items.startAutoFight;
            userApiKeyEl.value = items.userApiKey;
            minHealthPointsEl.value = items.minHealthPoints;
            userMapToPCBoolEl.checked = items.userMapToPCBool;
            showCurrenRoute.innerHTML = items.userMapToPC.join(', ');
            getBalance();
        }
    );
}

function clearLocalStorage() {
    chrome.storage.local.clear(function () {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
        restoreOptions();
        location.reload();
    });
}

function sendMessage(title, text) {
    var notification = new Notification(title, {
        body: text,
        dir: 'auto'
    });
}

async function getBalance() {
    balanceCaptcha.innerHTML = '';
    if (userApiKeyEl.value !== '') {
        var data = {
            'clientKey': userApiKeyEl.value
        };
        var request = await fetch('https://api.anti-captcha.com/getBalance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json, charset=utf-8'
            },
            body: JSON.stringify(data)
        }).then(res => {
            return res.json();
        }).then(resOnj => {
            if (resOnj.errorId === 0) {
                let currentBalance = resOnj.balance;
                balanceCaptcha.innerHTML = `Текущий баланс: ${currentBalance.toFixed(2)}\$<br>(Примерно: <b>${Math.floor(currentBalance / 0.001)}</b> капч)`;
            }
        })
    } else {
        balanceCaptcha.innerHTML = '<b>Не задан API-key!</b>';
    }
}