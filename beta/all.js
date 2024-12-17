// блоки кнопок
const notlogged = document.getElementById('logbuttons');
const logged = document.getElementById('loggedin');

const desc = document.getElementById('desc'); // описание
const login = document.getElementById('login'); // форма входа
const register = document.getElementById('register'); // форма регистрации

const desctext2 = document.querySelector('.desc-text'); // текст описания

const closex = document.querySelectorAll('.close'); // крестики для закрытия элементов

const currentlogin = document.getElementById('currentlogin'); // элемент, где выводится логин пользователя (который уже зашел)

const bedit =  document.getElementById('bedit'); // кнопка чтобы добавить локацию 

const edit = document.getElementById('edit'); // форма редактирования

const newver = document.getElementById('newver'); // история версий

const pgbar = document.getElementById('pgbar'); // прогрессбар загрузки файла

const logintext = document.getElementById('logintext'); // поле с логином
const password = document.getElementById('password'); // поле с паролем

const loginfo = document.getElementById('loginfo'); // информация в форме логина
const reginfo = document.getElementById('reginfo'); // информация в форме регистрации

// проверка зашел ли пользователь в систему
if(localStorage.getItem('login')){
    successlogin()
}
// функция, которая срабатывает при успешном входе, изменяет параметры видимости элементов, выводит приветствие 
function successlogin(){
    if(localStorage.getItem('login')){
        currentlogin.innerText = 'Привет, ' +  localStorage.getItem('login');
        logged.style.display = 'inline-block';
        notlogged.style.display = 'none';
        if(document.getElementById('bedit')){
            document.getElementById('bedit').style.display = 'inline-block'
        }
    }
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
        fetch('https://anryb0.online/server/auth.php', {
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

// закрытие всех окон при нажатии на любой крестик 
closex.forEach(function(item){
   item.addEventListener('click', function() {
            if(desc){
                hide(desc);
            }
            if(login){
                hide(login);
            }
            if(register){
                hide(register);
            }
            if(newver){
                hide(newver);
            }
            if(edit){
                hide(edit);
            }
    }); 
});

// отображение формы входа при нажатии на кнопку
reg.addEventListener('click', function() {
        login.style.display = 'block';
});

// обработчик плавного закрытия окон
function hide(element) {
    element.classList.add('fade-out'); 
    setTimeout(function() {
        element.style.display = 'none'; 
        element.classList.remove('fade-out');
    }, 300);
}

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
        fetch('https://anryb0.online/beta/server/register.php', {
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
// при нажатии на кнопку выхода удаляем login из хранилища, обновляем страницу 
document.getElementById('logout').addEventListener('click', function() {
        localStorage.removeItem('login');
        location.reload();
});
// отображение формы регистрации при нажатии на кнопку
document.getElementById('breg').addEventListener('click', function() {
        register.style.display = 'block';
});
