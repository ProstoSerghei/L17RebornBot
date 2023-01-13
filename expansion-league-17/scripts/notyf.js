// Уведомления внутри игры (Замена alert))

// window.alert = console.log;

// var divNotyf = document.createElement('div');
// divNotyf.classList.add('notyf');
// divNotyf.style.display = 'none';
// divNotyf.addEventListener('click', () => {
//     divNotyf.style.display = 'none';
// });
// document.querySelector('frameset').insertAdjacentElement('beforebegin', divNotyf);

// function siteNotyf(text) {
//     divNotyf.innerHTML = text;
//     Promise.resolve()
//         .then(() => {
//             divNotyf.style.display = 'block';
//             divNotyf.classList.add('showNotyf');
//         })
//         .then(() => pauseNotyfe(10000))
//         .then(() => {
//             divNotyf.classList.remove('showNotyf');
//             divNotyf.classList.add('hideNotyf');
//         })
//         .then(() => pauseNotyfe(1100))
//         .then(() => {
//             divNotyf.classList.remove('hideNotyf');
//             divNotyf.style.display = 'none';
//             divNotyf.innerHTML = '';
//         })
// }

// var textScript = 'alert(\'privet\')';

// function pauseNotyfe(duration) {
//     return new Promise((resolve) => {
//         setTimeout(resolve, duration);
//     });
// }

