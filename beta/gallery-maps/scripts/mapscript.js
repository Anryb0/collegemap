const urlParams = new URLSearchParams(window.location.search); // параметры url

const mapId = urlParams.get('mapId'); // номер карты

const map = document.getElementById('map'); // схема
const change = document.getElementById('switch'); // кнопка смена режима
const container = document.getElementById('container'); // контейнер для панорамы или фото
const errortext = document.getElementById('error'); // текст ошибки

let sf, sb, sr, sl = '' ;

// формы для отправки на сервер
const sphotoid = document.getElementById('i2');
const file = document.getElementById('i7');
const sname = document.getElementById('i8');
const sopisanie = document.getElementById('i9');

let currentphoto = 0; // картинка по умолчанию
let isInitialized = false; // флаг инициализации
let l, r, f, b; // фотографии, которые находятся в разных направлениях относительно данной
let scene, camera, renderer, plane; // объекты three.js
let isUserInteracting = false; // флаг взаимодействует ли пользователь с картой

let onMouseDownMouseX = 0, onMouseDownMouseY = 0; // для работы мыши
let scaleFactor = 2.2, isMouseOverImage = 1; // масштаб, флаг мыши над картой

let viewer, panorama; // объекты panolens

let ispanoram // флаг для переключения режимов отображения

// выбираем значение ispanoram
if(localStorage.getItem('viewmode') && !(localStorage.getItem('mapid') && mapId !== localStorage.getItem('mapid'))){
    ispanoram = localStorage.getItem('viewmode');
}
else {
    ispanoram = urlParams.get('ispanoram');
}

if(urlParams.get('photo')){
    currentphoto = parseInt(urlParams.get('photo') - 1)
}

if(localStorage.getItem('login')){
    document.getElementById('loggedin').style.display = 'inline-block';
}
localStorage.setItem('mapid', mapId);
// выводим название текущей карты и рекомендованный режим просмотра
if(urlParams.get('ispanoram') == '0'){
    ispan.style.display = 'none';
    document.getElementById('mapname').innerText = urlParams.get('name');
}
else{
    document.getElementById('mapname').innerText = urlParams.get('name');
}

document.getElementById('bedit').addEventListener('click', function() {
   edit.style.display = 'flex'; 
});
// при нажатии на кнопку выхода удаляем login из хранилища, обновляем страницу 
document.getElementById('logout').addEventListener('click', function() {
        localStorage.removeItem('login');
        location.reload();
});
// при нажатии на кнопку отправки данных
send.addEventListener('click', function() {
    // данные для отправки на сервер
    let formData = new FormData();
    formData.append('smapid', mapId);
    formData.append('sf', sf);
    formData.append('sb', sb);
    formData.append('sl', sl);
    formData.append('sr', sr);
    formData.append('login', localStorage.getItem('login'));
    formData.append('name', sname.value);
    formData.append('opisanie', sopisanie.value);
    document.getElementById('percent').style.display = 'none'
    pgbar.style.display = 'none';
    sendinfo.style.display = 'none';
    // запрос на сервер выполняется только если поля заполнены
    if (file.files.length === 1 && sname.value && sopisanie.value) {
        formData.append('file', file.files[0]);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'server/uploaddata.php', true);
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
                    num2 = data.message;
                    sendinfo.style.background = 'green';
                    sendinfo.style.display = 'inline-block';
                    formData = new FormData();
                    formData.append('b', sb);
                    formData.append('l', sl);
                    formData.append('r', sr);
                    formData.append('mapid', mapId);
                    formData.append('num', num2);

                    fetch('server/autocomplete.php', {
                        method: 'POST',
                        body: formData
                    });
                    location.reload();
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

// код для непанорамных карт 
if(ispanoram == '0'){
    // для переключения между режимами просмотра
    document.getElementById('now').innerText = 'Режим просмотра: фото.'
    change.innerText = 'Панорама';
    change.addEventListener('click', function(){
        localStorage.setItem('viewmode','1')
        location.reload()
    })
    // обновление фотографии  
    function photoupdate(photoId) {
        if (photosData[photoId]){
            const img = new Image();
            img.src = "https://anryb0.online/gallery-maps/images/" + photosData[photoId].photoUrl;
            img.onload = function() {
                const width = container.width;
                const height = container.height;
                createImage(img.src, width, height);
                l = photosData[photoId].l;
                r = photosData[photoId].r;
                f = photosData[photoId].f;
                b = photosData[photoId].b;
                renderButtons(l, r, f, b);
                document.getElementById('pos').innerText = 'Позиция: ' + (photoId + 1) + ') ' + photosData[photoId].name
                document.getElementById('creator').innerText = 'Автор: ' + photosData[photoId].login
                document.getElementById('tdesc').innerText = 'Описание: ' + photosData[photoId].opisanie
                localStorage.setItem('curph',photoId)
            }
        }
        else {
            errortext.innerText = "Информация о данном фото отсутствует.";
            errortext.style.background = 'red';
        }
    }
    
    // нужные переменые 
    let newimage = document.createElement('IMG');
    let scale = 1;
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    // инициализация чего-то 
    function init() {
        
    }
    // добавление фото
    function createImage(imageUrl, width, height) {
        // очистка div
        while(container.firstChild){
            container.removeChild(container.firstChild);
        }
        
        // добавляем элемент 
        container.appendChild(newimage);
        
        // установка стилей и атрибутов
        newimage.src = imageUrl;
        newimage.style.width = width + 'px';
        newimage.style.height = height + 'px';
        newimage.draggable = false;
        container.style.position = 'relative';
        newimage.style.position = 'absolute';
        
        // изменение масштаба
        newimage.addEventListener('wheel', function(event) {
            event.preventDefault();
            scale += event.deltaY * -0.0003; // это влияет на скорость масштабирования 
            scale = Math.min(Math.max(0.125, scale), 4);
            newimage.style.transformOrigin = 'center center';
            newimage.style.transform = 'scale(' + scale + ')';
        });
        
        // перемещение картинки (начало, захват первых координат)
        var handleMouseDown = function(event) {
            isDragging = true;
            startX = event.clientX;
            startY = event.clientY;
            initialX = newimage.offsetLeft;
            initialY = newimage.offsetTop;
            newimage.style.cursor = 'grabbing';
        };
        
        // изменение координат - середина
        var setPosition = function(x, y) {
            newimage.style.left = x + 'px';
            newimage.style.top = y + 'px';
        };

        var handleMouseMove = function(event) {
            if (isDragging) {
                var dx = event.clientX - startX;
                var dy = event.clientY - startY;
                setPosition(initialX + dx, initialY + dy);
            }
        };
        
        // конец перемещения
        var handleMouseUp = function() {
            isDragging = false;
            newimage.style.cursor = 'grab';
        };

        // обработчики событий
        newimage.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);

        // для тачскринов
        newimage.addEventListener('touchstart', function(event) {
            isDragging = true;
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
            initialX = newimage.offsetLeft;
            initialY = newimage.offsetTop;
            newimage.style.cursor = 'grabbing';
        });
        
        newimage.addEventListener('touchmove', function(event) {
            if (isDragging) {
                var dx = event.touches[0].clientX - startX;
                var dy = event.touches[0].clientY - startY;
                setPosition(initialX + dx, initialY + dy);
                if(event.touches.length < 2){
                    event.preventDefault();
                }
            }
        });
        
        newimage.addEventListener('touchend', function() {
            isDragging = false;
            newimage.style.cursor = 'grab';
        });
    };
}
// код для панорамных карт
if (ispanoram == '1') { 
    
    // для переключения между режимами просмотра
    document.getElementById('now').innerText = 'Режим просмотра: панорама.';
    change.innerText = 'Фото';
    change.addEventListener('click', function(){
        localStorage.setItem('viewmode','0')
        location.reload()
    })
    
    // обновление фото
    function photoupdate(photoId) {
        if (photosData[photoId]){
            createImage('images/' + photosData[photoId].photoUrl);
            l = photosData[photoId].l;
            r = photosData[photoId].r;
            f = photosData[photoId].f;
            b = photosData[photoId].b;
            renderButtons(l, r, f, b);
            document.getElementById('pos').innerText = 'Позиция: ' + (photoId + 1) + ') ' + photosData[photoId].name
            document.getElementById('creator').innerText = 'Автор: ' + photosData[photoId].login
            document.getElementById('tdesc').innerText = 'Описание: ' + photosData[photoId].opisanie
            localStorage.setItem('curph',photoId)
        }
        else {
            errortext.innerText = "Информация о данном фото отсутствует";
            errortext.style.background = 'red';
        }
    }
    
    // инициализация с задержкой чтобы не было ошибок
    function init() {
        setTimeout(function() {
        }, 1000);
    }
    
    // создание панорамы по ссылке
    function createImage(url) {
        if(panorama) {
            viewer.remove(panorama);
        }
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        panorama = new PANOLENS.ImagePanorama(url);
        viewer = new PANOLENS.Viewer({
		    container: container
        });
	    viewer.add(panorama);
    }
}


function relatedPhotos(photosData){
    if (photosData && photosData.length > 0) {
        for(let i=0;i<photosData.length; i+=1){
           elements.style.display = 'grid'
           let newdiv = document.createElement('A');
           newdiv.classList.add('element');
           let newimg = document.createElement('IMG');
           newimg.src = 'images/_compressed'+ photosData[i].photoUrl;
           newimg.alt = 'Превью недоступно';
           let newname = document.createElement('P');
           newname.innerText= photosData[i].name;
           newdiv.appendChild(newimg);
           newdiv.appendChild(newname);
           if(!photosData[i].b){
               let bf = document.createElement('BUTTON');
               bf.innerText = 'Спереди';
               bf.classList.add('fbuttons');
               let bfflag = false;
               newdiv.appendChild(bf);
                bf.addEventListener('click', (function(index) {
                    return function() {
                        if (bfflag) {
                            bfflag = false;
                            sf = ''; 
                            bf.style.background = 'green';
                        } else {
                            bfflag = true;
                            document.querySelectorAll('.fbuttons').forEach(button => button.style.background = 'green');
                            bf.style.background = 'black';
                            sf = photosData[index].num;
                        }
                    };
                })(i));
           }
           if(!photosData[i].r){
               let bl = document.createElement('BUTTON');
               bl.innerText = 'Слева';
               bl.classList.add('lbuttons');
               let blflag = false;
               newdiv.appendChild(bl);
               bl.addEventListener('click', (function(index) {
                    return function() {
                        if (blflag) {
                            blflag = false;
                            sl = ''; 
                            bl.style.background = 'green';
                        } else {
                            blflag = true;
                            document.querySelectorAll('.lbuttons').forEach(button => button.style.background = 'green');
                            bl.style.background = 'black';
                            sl = photosData[index].num;
                        }
                    };
                })(i));
           }
           if(!photosData[i].f){
               let bb = document.createElement('BUTTON');
               bb.innerText = 'Сзади';
               bb.classList.add('bbuttons');
               newdiv.appendChild(bb); 
               let bbflag = false;
               bb.addEventListener('click', (function(index) {
                    return function() {
                        if (bbflag) {
                            bbflag = false;
                            sb = ''; 
                            bb.style.background = 'green';
                        } else {
                            bbflag = true;
                            document.querySelectorAll('.bbuttons').forEach(button => button.style.background = 'green');
                            bb.style.background = 'black';
                            sb = photosData[index].num;
                        }
                    };
                })(i));
           }
           if(!photosData[i].l){
               let br = document.createElement('BUTTON');
               br.innerText = 'Справа';
               br.classList.add('rbuttons');
               newdiv.appendChild(br);
               let brflag = false;
               br.addEventListener('click', (function(index) {
                    return function() {
                        if (brflag) {
                            brflag = false;
                            sr = ''; 
                            br.style.background = 'green';
                        } else {
                            brflag = true;
                            document.querySelectorAll('.rbuttons').forEach(button => button.style.background = 'green');
                            br.style.background = 'black';
                            sr = photosData[index].num;
                        }
                    };
                })(i));
           }
           document.getElementById('elements').appendChild(newdiv);
        }
    } 
    else {
        document.getElementById('opterror').innerText = "Пока у вас нет загруженных фото.";
        elements.style.display = 'none';
    }
}

// код, который не зависит от того, панорамная карта или нет

// отправка запроса на сервер, получение данных и их запись в объект
let formData = new FormData();
formData.append('mapId', mapId);
fetch('server/getphotoinfo.php', {
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
    relatedPhotos(data.photos);
    if (data.photos && data.photos.length > 0) {
        photosData = data.photos;
        isInitialized = true;
        init();
        photoupdate(currentphoto);
        createtable(photosData);
    } else {
        errortext.innerText = "Пока фото этой локации нет. Вы можете загрузить фото с помощью кнопки '+' в начале страницы.";
    }
})


// отрисовка нужных кнопок
function renderButtons(l, r, f, b) {
    document.getElementById('forward').style.visibility = 'hidden';
    document.getElementById('back').style.visibility = 'hidden';
    document.getElementById('left').style.visibility = 'hidden';
    document.getElementById('right').style.visibility = 'hidden';
    if (f) {
        document.getElementById('forward').style.visibility = 'visible';
    }
    if (b) {
        document.getElementById('back').style.visibility = 'visible';
    }
    if (l) {
        document.getElementById('left').style.visibility = 'visible';
    }
    if (r) {
        document.getElementById('right').style.visibility = 'visible';
    }
}
// создание таблицы
function createtable (data) {
   function createtable(data) {
    const table = document.createElement('table'); // Создаем новую таблицу
    const headerRow = table.insertRow(); // Создаем строку для заголовков

    // Создаем заголовки таблицы в нужном порядке
    const headerKeys = ['l', 'num', 'r', 'f', 'b'];
    
    headerKeys.forEach(function(key) {
        const th = document.createElement('th');
        th.innerText = key; // Заголовок будет именем поля
        headerRow.appendChild(th);
    });

    // Заполнение таблицы данными
    for (let i = 0; i < data.length; i++) {
        const tr = table.insertRow();
        const row = data[i];
        
        headerKeys.forEach(function(key) {
            const td = document.createElement('td');
            if (row[key] !== null) {
                const relatedRow = data[parseInt(row[key]) - 1];
                if (relatedRow) {
                    td.innerText = relatedRow.name; // Выводит имя связанной строки
                } else {
                    td.innerText = row[key]; // Если связанной строки нет, выводим значение ключа
                }
            } else {
                td.innerText = ''; // Если значение null, оставляем ячейку пустой
            }

            // Добавляем обработчик событий для ячейки
            td.addEventListener('mouseover', function() {
                photoupdate(row[key] - 1);
            });

            tr.appendChild(td);
        });
    }
    
    document.body.appendChild(table); // Добавляем таблицу в тело документа
}
}

// добавление обработчиков кнопок
document.getElementById('forward').addEventListener('click', function() {
    photoupdate(f-1);
});
document.getElementById('back').addEventListener('click', function() {
    photoupdate(b-1);
});
document.getElementById('left').addEventListener('click', function() {
    photoupdate(l-1);
});
document.getElementById('right').addEventListener('click', function() {
    photoupdate(r-1);
});

document.getElementById('fpos').addEventListener('click', function() {
    photoupdate(0);
});


