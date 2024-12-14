// определение переменных
const desctext = document.querySelector('.desc-text'); // текст описания

const send = document.getElementById('send'); // форма отправки данных 

const sendinfo = document.getElementById('sendinfo'); // информация в форме отправки данных

const elements = document.getElementById('elements'); // список превьюшек

// формы для отправки на сервер
const locname = document.getElementById('i1');
const locdesc = document.getElementById('i2');
const file = document.getElementById('i3');

let names = []; // массив названий карт
let descriptions = []; // массив описаний карт
let urls = [] ; // массив ссылок на фото карт
let ispanorams = []; // массив переменных, которые определяют является ли карта панорманой 
let mapids = []; // массив идентификаторов фото 
let newlogins = [] // все логины авторов
let newdiv, newimg, mapphotos, pnames, newname, newlink, details, newlink2, mapurls, newb, newlogin, par; // переменные, которые будут нужны для генерации контента на странице

let formData = new FormData(); // данные для сервера

// запрос на сервер, получение массивов данных
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
        mapids = data.maps.map(function(map) {
            return map.id;
        });
        newlogins = data.maps.map(function(map) {
            return map.login;
        });
        // генерация превьюшек карт
        names.forEach(function(item,index) {
           newdiv = document.createElement('A');
           newdiv.classList.add('element');
           newimg = document.createElement('IMG');
           newimg.classList.add('mapphoto');
           newname = document.createElement('P');
           newname.classList.add('pname');
           newlogin = document.createElement('SPAN');
           newlogin.classList.add('plogin');
           newlink = document.createElement('A');
           par = document.createElement('P');
           par.classList.add('par');
           newlink.innerText = 'Подробнее';
           newlink.classList.add('details');
           par.appendChild(newlogin)
           par.appendChild(newlink)
           newdiv.appendChild(newimg);
           newdiv.appendChild(newname);
           newdiv.appendChild(par);
           elements.appendChild(newdiv);
           mapphotos = document.querySelectorAll('.mapphoto');
           pnames = document.querySelectorAll('.pname');
           details = document.querySelectorAll('.details');
           mapurls =  document.querySelectorAll('.element');
           plogins =  document.querySelectorAll('.plogin');
        })
        // отображение описания при нажатии на кнопку "подробнее"
        details.forEach(function(button, index) {
            button.addEventListener('click', function() {
            event.preventDefault(); 
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
            item.src = 'mapimages/' + urls[index];
        });
        plogins.forEach(function(item, index) {
            item.innerText = 'Автор: ' + newlogins[index];
        });
        mapurls.forEach(function(item, index) {
            item.href = ('map.html?mapId=' + mapids[index] +'&ispanoram='+ispanorams[index]+'&name='+names[index] ); 
        });
    } else {
        console.log(data.message);
    }
})
.catch(function(error) {
    console.log(error);
});

// отображение формы регистрации при нажатии на кнопку
document.getElementById('breg').addEventListener('click', function() {
        register.style.display = 'block';
});

send.addEventListener('click', function() {
    // данные для отправки на сервер
    let formData = new FormData();
    formData.append('login', localStorage.getItem('login'));
    formData.append('name', locname.value);
    formData.append('opisanie', locdesc.value);
    formData.append('isp',document.getElementById('ispanoram').value)
    document.getElementById('percent').style.display = 'none'
    pgbar.style.display = 'none';
    sendinfo.style.display = 'none';
    // запрос на сервер выполняется только если поля заполнены
    if (file.files.length === 1 && locname.value && locdesc.value) {
        formData.append('file', file.files[0]);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'server/newmap.php', true);
        pgbar.style.display = 'inline-block';
        document.getElementById('percent').style.display = 'inline'
        xhr.upload.onprogress = function(event) {
            if (event.lengthComputable) {
                var percent = (event.loaded / event.total) * 100;
                pgbar.value = percent;
                document.getElementById('percent').innerText = Math.round(percent) + ' %'
            }
        };
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log(xhr.responseText)
                var data = JSON.parse(xhr.responseText);
                if (data.success) {
                    document.getElementById('percent').style.display = 'none'
                    sendinfo.innerText = '✔';
                    sendinfo.style.background = 'green';
                    sendinfo.style.display = 'inline-block';
                    setTimeout(function() {
                        location.reload();
                    }, 300);
                } else {
                    sendinfo.innerText = data.message;
                    sendinfo.style.background = 'red';
                    sendinfo.style.display = 'inline-block';
                }
            } else {
                sendinfo.innerText = 'Ошибка загрузки: ' + xhr.status;
                sendinfo.style.background = 'red';
                sendinfo.style.display = 'inline-block';
            }
            pgbar.style.display = 'none';
        };
        xhr.send(formData);
    } else {
        sendinfo.innerText = 'Пожалуйста, заполните обязательные поля. Для каждой записи необходимо добавить по 1 фото.';
        sendinfo.style.background = 'red';
        sendinfo.style.display = 'inline-block';
    }
});

bedit.addEventListener('click', function() {
        edit.style.display = 'inline-block';
});



