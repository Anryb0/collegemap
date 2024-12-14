// отображение описания при нажатии на кнопку "подробнее"
const details = document.querySelectorAll('.details');

const desctext = document.querySelector('.desc-text'); // текст описания


descriptions = ['На этом портале можно добавлять различные локации и загружать для них фотографии. Между фото можно перемещаться с помощью стрелок. Фото можно смотреть в обычном и панорамном режиме.'] 

details.forEach(function(button, index) {
    
    button.addEventListener('click', function() {
    event.preventDefault();
    desctext.textContent = descriptions[index];
    desc.style.display = 'block';
    
    });
});