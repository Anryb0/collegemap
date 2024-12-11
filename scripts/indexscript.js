// определение переменных
const desc = document.getElementById('desc'); // описание
const desctext = document.querySelector('.desc-text'); // текст описания
const login = document.getElementById('login'); // форма входа
const details = document.querySelectorAll('.details'); // кнопки "подробнее" для открытия описания
const logintext = document.getElementById('logintext'); // форма логина
const error = document.getElementById('errortext'); // ошибка в форме логина
const error2 = document.getElementById('errortext2'); // ошибка в форме отправки данных
const error3 = document.getElementById('errortext3'); // ошибка в форме регистрации
const password = document.getElementById('password'); // форма пароля
const pnames = document.querySelectorAll('.pname'); // названия карт
const mapphotos = document.querySelectorAll('.mapphoto'); // фото карт
const close = document.querySelectorAll('.close'); // крестик для закрытия описания
const num = details.length; // количество кнопок "подробнее" (соотв. и карт)
const edit = document.getElementById('edit'); // поле редактирования
const mapurls =  document.querySelectorAll('.mapurl'); // ссылки на карты
const register = document.getElementById('register'); // кнопка отправки данных
const currentlogin = document.getElementById('currentlogin'); // логин пользователя (который уже зашел)

// формы для отправки на сервер
const smapid = document.getElementById('i1');
const sphotoid = document.getElementById('i2');
const sf = document.getElementById('i3');
const sb = document.getElementById('i4');
const sl = document.getElementById('i5');
const sr = document.getElementById('i6');
const file = document.getElementById('i7');
const sname = document.getElementById('i8');


let names = []; // массив названий карт
let descriptions = []; // массив описаний карт
let urls = [] ; // массив ссылок на фото карт
let graphurls = []; // массив ссылок на фото, которые сзади таблицы будут
let ispanorams = []; // массив переменных, который определяет являетя ли карта панорманой 

let formData = new FormData(); // данные для сервера
formData.append('maxMapId', num);

// проверка зашел ли пользователь в систему
if(localStorage.getItem('login')){
    document.getElementById('breg').style.display = 'none';
    document.getElementById('reg').style.display = 'none';
    document.getElementById('bedit').style.display = 'inline-block';
    document.getElementById('logout').style.display = 'inline-block';
    currentlogin.innerText += 'Привет, ' +  localStorage.getItem('login');
}


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
document.getElementById('reg').addEventListener('click', function() {
        login.style.display = 'block';
});
document.getElementById('logout').addEventListener('click', function() {
        localStorage.removeItem('login');
        location.reload();
});
document.getElementById('breg').addEventListener('click', function() {
        register.style.display = 'block';
});
// обработчик плавного закрытия окон
function hide(element) {
    element.classList.add('fade-out'); 
    setTimeout(function() {
        element.style.display = 'none'; 
        element.classList.remove('fade-out');
    }, 500);
}
close.forEach(function(item){
   item.addEventListener('click', function() {
        hide(desc);
        hide(login);
        hide(register);
        hide(edit);
    }); 
});
// при нажатии на кнопку отправки данных
document.getElementById('send').addEventListener('click', function() {
    error2.innerText = ''
    // будет функция отправки на сервер
    let formData = new FormData();
    formData.append('smapid', parseInt(smapid.value));
    formData.append('sphotoid', parseInt(sphotoid.value));
    formData.append('sf', parseInt(sf.value));
    formData.append('sb', parseInt(sb.value));
    formData.append('sl', parseInt(sl.value));
    formData.append('sr', parseInt(sr.value));
    formData.append('login', localStorage.getItem('login'));
    formData.append('name', sname.value);
    if (file.files.length == 1  && smapid.value && sphotoid.value && sname.value) {
            formData.append('file', file.files[0]);
                fetch('server/uploaddata.php', {
            method: 'POST',
            body: formData
        })
        .then(function(response) {
            console.log(response.text())
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
document.getElementById('log').addEventListener('click', function() {
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
            localStorage.setItem('login', logintext.value);
            hide(login);
            currentlogin.innerText = 'Привет, ' +  localStorage.getItem('login');
            document.getElementById('bedit').style.display = 'inline-block';
            document.getElementById('logout').style.display = 'inline-block';
            document.getElementById('reg').style.display = 'none';
            document.getElementById('breg').style.display = 'none';
        } else {
            error.innerText = data.message;
            error.style.display = 'inline-block';
        }
    })
        .catch(function(error) {
            error.innerText = 'Ошибка:' + error;
        });
    }
});
document.getElementById('bedit').addEventListener('click', function() {
   edit.style.display = 'inline-block'; 
});
document.getElementById('bregister').addEventListener('click', function() {
    if (!document.getElementById('logintext1').value || !document.getElementById('password1').value || document.getElementById('password1').value !== document.getElementById('password2').value) {
        error3.innerText = 'Поля не заполнены';
        error3.style.backgorund = 'red';
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
            throw new Error('Сеть не сработала: ' + response.statusText);
        }
        return response.json();
    })
    .then(function(data) {
        if (data.success) {
            error3.innerText = 'пользователь добавлен';
            error3.style.background = 'green';
            setTimeout(function() {
                hide(register);
                localStorage.setItem('login', document.getElementById('logintext1').value)
                currentlogin.innerText = 'Привет, ' +  localStorage.getItem('login');
                document.getElementById('bedit').style.display = 'inline-block';
                document.getElementById('logout').style.display = 'inline-block';
                document.getElementById('reg').style.display = 'none';
                document.getElementById('breg').style.display = 'none';
            }, 1000);
        } else {
            error3.innerText = data.message;
            error3.style.background = 'red';
        }
        })
        .catch(function(error) {
            error3.innerText = error;
            error3.style.background = 'red';
        });
    }
    
});



