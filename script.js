//для работы окон с описаниями панорам
const desc = document.getElementById('desc');
const details = document.querySelectorAll('.details');
const close = document.querySelector('.close');
const desctext = document.querySelector('.desc-text');

details.forEach(function(detail) {  
    detail.addEventListener('click', function (event) {
        desctext.textContent = detail.getAttribute('data-description');
        desc.style.display = 'block';
    });
});

function CloseDesc() {
    desc.style.display = 'none';
    desc.classList.remove('fade-out');
}

close.addEventListener('click', function () {
    desc.classList.add('fade-out'); 
    setTimeout(function ()  {
        desc.style.display = 'none'; 
        desc.classList.remove('fade-out');
    }, 500);
});

window.addEventListener('click', function (event) {
    if (event.target === desc) {
        desc.style.display = 'none';
    }
});
