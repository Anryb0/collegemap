// определение переменных
const pgbar = document.getElementById('pgbar'); // прогрессбар загрузки файла

const desc = document.getElementById('desc'); // описание
const desctext = document.querySelector('.desc-text'); // текст описания

const login = document.getElementById('login'); // форма входа
const send = document.getElementById('send'); // форма отправки данных 
const edit = document.getElementById('edit'); // форма редактирования
const register = document.getElementById('register'); // форма регистрации
const newver = document.getElementById('newver'); // история версий

const logintext = document.getElementById('logintext'); // поле с логином
const password = document.getElementById('password'); // поле с паролем

const loginfo = document.getElementById('loginfo'); // информация в форме логина
const sendinfo = document.getElementById('sendinfo'); // информация в форме отправки данных
const reginfo = document.getElementById('reginfo'); // информация в форме регистрации

const elements = document.getElementById('elements'); // список превьюшек

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
let newdiv, newimg, mapphotos, pnames, newname, newlink, details, newlink2, mapurls, newb; // переменные, которые будут нужны для генерации контента на странице

let formData = new FormData(); // данные для сервера

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
        // генерация превьюшек карт
        names.forEach(function(item,index) {
           newdiv = document.createElement('DIV');
           newdiv.classList.add('element');
           newimg = document.createElement('IMG');
           newimg.classList.add('mapphoto');
           newname = document.createElement('P');
           newname.classList.add('pname');
           newlink = document.createElement('A');
           newlink.innerText = 'Подробнее';
           newlink.classList.add('details');
           newlink2 = document.createElement('A');
           newlink2.innerText = 'Перейти';
           newlink2.classList.add('mapurl');
           newdiv.appendChild(newimg);
           newdiv.appendChild(newname);
           newdiv.appendChild(newlink);
           newdiv.appendChild(newlink2);
           elements.appendChild(newdiv);
           mapphotos = document.querySelectorAll('.mapphoto');
           pnames = document.querySelectorAll('.pname');
           details = document.querySelectorAll('.details');
           mapurls =  document.querySelectorAll('.mapurl');
        })
        // отображение описания при нажатии на кнопку "подробнее"
        details.forEach(function(button, index) {
            button.addEventListener('click', function() {
            desctext.textContent = descriptions[index];
            desc.style.display = 'block';
            });
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
            item.href = ('map.html?mapId=' + (index+1) + '&graphurl='+graphurls[index]+'&ispanoram='+ispanorams[index]+'&name='+names[index] ); 
        });
    } else {
        console.log(data.message);
    }
})
.catch(function(error) {
    console.log(error);
});

// отображение формы входа при нажатии на кнопку
reg.addEventListener('click', function() {
        login.style.display = 'block';
});
// отображение формы регистрации при нажатии на кнопку
document.getElementById('breg').addEventListener('click', function() {
        register.style.display = 'block';
});
// отображение истории версий
document.getElementById('bnew').addEventListener('click', function() {
    newver.style.display = 'inline-block'; 
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
    }, 300);
}

// закрытие всех окон при нажатии на любой крестик 
close.forEach(function(item){
   item.addEventListener('click', function() {
        hide(desc);
        hide(login);
        hide(register);
        hide(newver);
    }); 
});

// функция, которая срабатывает при успешном входе, изменяет параметры видимости элементов, выводит приветствие 
function successlogin(){
    currentlogin.innerText = 'Привет, ' +  localStorage.getItem('login');
    //document.getElementById('bedit').style.display = 'inline-block';
    document.getElementById('logout').style.display = 'inline-block';
    document.getElementById('reg').style.display = 'none';
    document.getElementById('breg').style.display = 'none';  
}

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



