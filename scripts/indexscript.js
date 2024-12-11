// определение переменных
const desc = document.getElementById('desc'); // описание
const desctext = document.querySelector('.desc-text'); // текст описания
const details = document.querySelectorAll('.details'); // кнопки "подробнее" для открытия описания

const num = details.length; // количество карт
const pnames = document.querySelectorAll('.pname'); // названия карт
const mapphotos = document.querySelectorAll('.mapphoto'); // фото карт
const mapurls =  document.querySelectorAll('.mapurl'); // ссылки на карты

const login = document.getElementById('login'); // форма входа
const send = document.getElementById('send'); // форма отправки данных 
const edit = document.getElementById('edit'); // форма редактирования
const register = document.getElementById('register'); // форма регистрации

const logintext = document.getElementById('logintext'); // поле с логином
const password = document.getElementById('password'); // поле с паролем

const loginfo = document.getElementById('loginfo'); // информация в форме логина
const sendinfo = document.getElementById('sendinfo'); // информация в форме отправки данных
const reginfo = document.getElementById('reginfo'); // информация в форме регистрации

const close = document.querySelectorAll('.close'); // крестики для закрытия элементов

const currentlogin = document.getElementById('currentlogin'); // элемент, где выводится логин пользователя (который уже зашел)

// формы для отправки на сервер
const smapid = document.getElementById('i1');
const sphotoid = document.getElementById('i2');
const sf = document.getElementById('i3');
const sb = document.getElementById('i4');
const sl = document.getElementById('i5');
const sr = document.getElementById('i6');
const file = document.getElementById('i7');
const sname = document.getElementById('i8');
const sopisanie = document.getElementById('i9');


let names = []; // массив названий карт
let descriptions = []; // массив описаний карт
let urls = [] ; // массив ссылок на фото карт
let graphurls = []; // массив ссылок на фото, которые сзади таблицы будут
let ispanorams = []; // массив переменных, которые определяют является ли карта панорманой 
let num2;

let formData = new FormData(); // данные для сервера
formData.append('maxMapId', num);

// проверка зашел ли пользователь в систему
if(localStorage.getItem('login')){
    successlogin()
}

// запрос на сервер, получение 5 массивов данных
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
                item.innerText += ' (360)'
            }
        });
        mapphotos.forEach(function(item, index) {
            item.src = urls[index];
        });
        mapurls.forEach(function(item, index) {
            item.href += ('&graphurl='+graphurls[index]+'&ispanoram='+ispanorams[index]+'&name='+names[index] ); 
        });
    } else {
        console.log(data.message);
    }
})
.catch(function(error) {
    console.log(error);
});

// отображение описания при нажатии на кнопку "подробнее"
details.forEach(function(button, index) {
    button.addEventListener('click', function() {
        desctext.textContent = descriptions[index];
        desc.style.display = 'block';
    });
});

// отображение формы входа при нажатии на кнопку
reg.addEventListener('click', function() {
        login.style.display = 'block';
});
// отображение формы регистрации при нажатии на кнопку
document.getElementById('breg').addEventListener('click', function() {
        register.style.display = 'block';
});
// отображение вормы добавления фото при нажатии на кнопку
document.getElementById('bedit').addEventListener('click', function() {
   edit.style.display = 'inline-block'; 
});

// при нажатии на кнопку выхода удаляем login из хранилища, обновляем страницу 
document.getElementById('logout').addEventListener('click', function() {
        localStorage.removeItem('login');
        location.reload();
});

// обработчик плавного закрытия окон
function hide(element) {
    element.classList.add('fade-out'); 
    setTimeout(function() {
        element.style.display = 'none'; 
        element.classList.remove('fade-out');
    }, 500);
}

// закрытие всех окон при нажатии на любой крестик 
close.forEach(function(item){
   item.addEventListener('click', function() {
        hide(desc);
        hide(login);
        hide(register);
        hide(edit);
    }); 
});

// функция, которая срабатывает при успешном входе, изменяет параметры видимости элементов, выводит приветствие 
function successlogin(){
    currentlogin.innerText = 'Привет, ' +  localStorage.getItem('login');
    document.getElementById('bedit').style.display = 'inline-block';
    document.getElementById('logout').style.display = 'inline-block';
    document.getElementById('reg').style.display = 'none';
    document.getElementById('breg').style.display = 'none';  
}

// при нажатии на кнопку отправки данных
send.addEventListener('click', function() {
    // данные для отправки на сервер
    let formData = new FormData();
    formData.append('smapid', parseInt(smapid.value));
    formData.append('sf', parseInt(sf.value));
    formData.append('sb', parseInt(sb.value));
    formData.append('sl', parseInt(sl.value));
    formData.append('sr', parseInt(sr.value));
    formData.append('login', localStorage.getItem('login'));
    formData.append('name', sname.value);
    formData.append('opisanie', sopisanie.value);
    // запрос на сервер выполняется только если поля заполнены
    if (file.files.length == 1  && smapid.value && sname.value && sopisanie.value) {
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
                    sendinfo.innerText = 'Данные отправлены';
                    num2 = data.message;
                    sendinfo.style.background = 'green';
                    sendinfo.style.display = 'inline-block';
                    formData = new FormData();
                    formData.append('b', parseInt(sb.value));
                    formData.append('l', parseInt(sl.value));
                    formData.append('r', parseInt(sr.value));
                    formData.append('mapid', parseInt(smapid.value));
                    formData.append('num', num2);
                    // запрос для автоматического добавления перехода в другую сторону
                    fetch('server/autocomplete.php', {
                        method: 'POST',
                        body: formData
                    })
                }
            else {
                sendinfo.innerText = data.message
                sendinfo.style.background = 'red';
                sendinfo.style.display = 'inline-block';
            }
        })
        
        .catch(function(error) {
            sendinfo.innerText = 'Ошибка отправки. Возможно, данное фото уже добавлено.';
            sendinfo.style.background = 'red';
            sendinfo.style.display = 'inline-block';
        });
    }
    else {
        sendinfo.innerText = 'Пожалуйста, заполните обязательные поля. Для каждой записи необходимо добавить по 1 фото.'
        sendinfo.style.background = 'red';
        sendinfo.style.display = 'inline-block';
    }
});
// действия при нажатии на кнопку входа
document.getElementById('log').addEventListener('click', function() {
    if (!logintext.value || !password.value) {
        loginfo.innerText = 'Пожалуйста, заполните поля';
        loginfo.style.background = 'red';
        loginfo.style.display = 'inline-block';
    }
    else {
        // отправка запроса на сервер для авторизации если поля заполнены
        let formData1 = new FormData();
        formData1.append('login', logintext.value);
        formData1.append('password', password.value);
        fetch('server/auth.php', {
            method: 'POST',
            body: formData1
        })
        .then(function(response) {
        if (!response.ok) {
            throw new Error('ошибка: ' + response.statusText);
        }
        return response.json();
    })
    .then(function(data) {
        if (data.success) {
            localStorage.setItem('login', logintext.value);
            hide(login);
            successlogin();
        } else {
            loginfo.innerText = data.message;
            loginfo.style.display = 'inline-block';
        }
    })
        .catch(function(error) {
            loginfo.innerText = error;
            loginfo.style.display = 'inline-block';
        });
    }
});

// при нажатии на нопку регистрации
document.getElementById('bregister').addEventListener('click', function() {
    // проверка совпадения паролей + того, что все поля заполнены
    if (!document.getElementById('logintext1').value || !document.getElementById('password1').value || document.getElementById('password1').value !== document.getElementById('password2').value) {
        reginfo.innerText = 'Пожалуйста, заполните поля';
        reginfo.style.background = 'red';
        reginfo.style.display = 'inline-block';
    }
    else {
        let formData3 = new FormData();
        formData3.append('login', document.getElementById('logintext1').value);
        formData3.append('password', document.getElementById('password1').value);
        fetch('server/register.php', {
            method: 'POST',
            body: formData3
        })
        .then(function(response) {
        if (!response.ok) {
            throw new Error('ошибка: ' + response.statusText);
        }
        return response.json();
    })
    .then(function(data) {
        if (data.success) {
            reginfo.innerText = 'Пользователь добавлен';
            reginfo.style.background = 'green';
            reginfo.style.display = 'inline-block';
            // автовход при регистрации
            setTimeout(function() {
                hide(register);
                localStorage.setItem('login', document.getElementById('logintext1').value)
                successlogin()
            }, 1000);
        } else {
            reginfo.innerText = data.message;
            reginfo.style.background = 'red';
            reginfo.style.display = 'inline-block';
        }
        })
        .catch(function(error) {
            reginfo.innerText = error;
            reginfo.style.background = 'red';
            reginfo.style.display = 'inline-block';
        });
    }
});



