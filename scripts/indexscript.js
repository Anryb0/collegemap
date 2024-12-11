// определение переменных
const desc = document.getElementById('desc'); // описание
const desctext = document.querySelector('.desc-text'); // текст описания
const login = document.getElementById('login'); // форма входа
const details = document.querySelectorAll('.details'); // кнопки "подробнее" для открытия описания
const reg = document.getElementById('reg'); // кнопка "вход" для открытия формы входа
const log = document.getElementById('log'); // кнопка входа (внутри формы)
const logintext = document.getElementById('logintext'); // форма логина
const error = document.getElementById('errortext'); // ошибка в форме логина
const error2 = document.getElementById('errortext2'); // ошибка в форме отправки данных
const password = document.getElementById('password'); // форма пароля
const pnames = document.querySelectorAll('.pname'); // названия карт
const mapphotos = document.querySelectorAll('.mapphoto'); // фото карт
const close = document.querySelector('.close'); // крестик для закрытия описания
const close2 = document.querySelector('.close2'); // крестик для закрытия формы входа
const close3 = document.querySelector('.close3'); // крестик для закрытия поля редактирования
const num = details.length; // количество кнопок "подробнее" (соотв. и карт)
const edit = document.getElementById('edit'); // поле редактирования
const mapurls =  document.querySelectorAll('.mapurl'); // ссылки на карты
const send = document.getElementById('send'); // кнопка отправки данных

// формы для отправки на сервер
const smapid = document.getElementById('i1');
const sphotoid = document.getElementById('i2');
const sf = document.getElementById('i3');
const sb = document.getElementById('i4');
const sl = document.getElementById('i5');
const sr = document.getElementById('i6');
const file = document.getElementById('i7');


let names = []; // массив названий карт
let descriptions = []; // массив описаний карт
let urls = [] ; // массив ссылок на фото карт
let graphurls = []; // массив ссылок на фото, которые сзади таблицы будут
let ispanorams = []; // массив переменных, который определяет являетя ли карта панорманой 

let formData = new FormData(); // данные для сервера
formData.append('maxMapId', num);

// запрос на сервер, получение 3 массивов данных
fetch('server/getmapinfo.php', {
method: 'POST',
body: formData
})
.then(function(response) {
    if (!response.ok) {
        throw new Error('Сеть не сработала: ' + response.statusText);
    }
    return response.json();
})
.then(function(data) {
    if (data.success) {
        names = data.maps.map(function(map) {
            return map.name;
        });
        descriptions = data.maps.map(function(map) {
            return map.description;
        });
        urls = data.maps.map(function(map) {
            return map.photo_url;
        });
        ispanorams = data.maps.map(function(map) {
            return map.ispanoram;
        });
        graphurls = data.maps.map(function(map) {
            return map.graphurl;
        });
        // отображение имен, фото карт
        pnames.forEach(function(item,index) {
            item.innerText = names[index]
            if(ispanorams[index]){
                item.innerText += ' (панорамная)'
            }
        });
        mapphotos.forEach(function(item, index) {
            item.src = urls[index];
        });
        mapurls.forEach(function(item, index) {
            item.href += ('&graphurl='+graphurls[index]+'&ispanoram='+ispanorams[index]); 
        });
    } else {
        console.error(data.message);
    }
})
.catch(function(error) {
    console.error('Ошибка:', error);
});
// отображение описания при нажатии на кнопку "подробнее"
details.forEach(function(button, index) {
    button.addEventListener('click', function() {
        desctext.textContent = descriptions[index];
        desc.style.display = 'block';
    });
});
// отображение формы регистрации при нажатии на кнопку
reg.addEventListener('click', function() {
        login.style.display = 'block';
});
// обработчик плавного закрытия окон
function hide(element) {
    element.classList.add('fade-out'); 
    setTimeout(function() {
        element.style.display = 'none'; 
        element.classList.remove('fade-out');
    }, 500);
}
close.addEventListener('click', function() {
    hide(desc);
});
close2.addEventListener('click', function() {
    hide(login);
});
close3.addEventListener('click', function() {
    hide(edit);
});
close3.addEventListener('click', function() {
    hide(edit);
});
// при нажатии на нопку отправки данных
send.addEventListener('click', function() {
    error2.innerText = ''
    // будет функция отправки на сервер
    let formData = new FormData();
    formData.append('smapid', parseInt(smapid.value));
    formData.append('sphotoid', parseInt(sphotoid.value));
    formData.append('sf', parseInt(sf.value));
    formData.append('sb', parseInt(sb.value));
    formData.append('sl', parseInt(sl.value));
    formData.append('sr', parseInt(sr.value));
    if (file.files.length == 1  && smapid.value && sphotoid.value) {
            formData.append('file', file.files[0]);
                fetch('server/uploaddata.php', {
            method: 'POST',
            body: formData
        })
        .then(function(response) {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then(function(data) {
            if(data.success){
                error2.innerText = 'Данные отправлены'
                error2.style.background = 'green';
            }
            else{
                error2.innerText = data.message
                error2.style.background = 'red';
            }
        })
        
        .catch(function(error) {
            console.error('Ошибка:', error);
        });
    }
    else {
        error2.innerText = 'Пожалуйста, заполните обязательные поля. Для каждой записи необходимо добавить по 1 фото.'
        error2.style.background = 'red';
    }
});
// действия при нажатии на кнопку входа
log.addEventListener('click', function() {
    if (!logintext.value || !password.value) {
        error.innerText = 'Поля не заполнены';
        error.style.display = 'inline-block';
    }
    else {
        let formData1 = new FormData();
        formData1.append('login', logintext.value);
        formData1.append('password', password.value);
        fetch('server/auth.php', {
            method: 'POST',
            body: formData1
        })
        .then(function(response) {
        if (!response.ok) {
            throw new Error('Сеть не сработала: ' + response.statusText);
        }
        return response.json();
    })
    .then(function(data) {
        if (data.success) {
            error.style.display = 'none';
            hide(login);
            edit.style.display = 'inline-block';
        } else {
            error.innerText = data.message;
            error.style.display = 'inline-block';
        }
        })
        .catch(function(error) {
            console.error('Ошибка:', error);
        });
    }
});
// закрытие форм при нажатии на свободное место
window.addEventListener('click', function(event) {
    if (event.target === desc) {
        desc.style.display = 'none';
    }
    if (event.target === login) {
        login.style.display = 'none';
    }
});



