const urlParams = new URLSearchParams(window.location.search); // параметры url

const mapId = urlParams.get('mapId'); // номер карты

const map = document.getElementById('map'); // схема
const change = document.getElementById('switch'); // кнопка смена режима
const container = document.getElementById('container'); // контейнер для панорамы или фото
const errortext = document.getElementById('error'); // текст ошибки

let sf = '';
let sb = '';
let sr = '';
let sl = '';

// формы для отправки на сервер
const sphotoid = document.getElementById('i2');
const file = document.getElementById('i7');
const sname = document.getElementById('i8');
const sopisanie = document.getElementById('i9');

let currentphoto = 0; // картинка по умолчанию
let isInitialized = false; // флаг инициализации
let l, r, f, b; // фотографии, которые находятся в разных направлениях относительно данной
let isUserInteracting = false; // флаг взаимодействует ли пользователь с картой

let viewer, panorama; // объекты panolens

let ispanoram // флаг для переключения режимов отображения

// выбираем значение ispanoram
if(localStorage.getItem('viewmode') && !(localStorage.getItem('mapid') && mapId !== localStorage.getItem('mapid'))){
    ispanoram = localStorage.getItem('viewmode');
}
else {
    ispanoram = urlParams.get('ispanoram');
}

if(localStorage.getItem('curph') && localStorage.getItem('mapid') == mapId){
    currentphoto = parseInt(localStorage.getItem('curph'));
}

if(urlParams.get('photo')){
    currentphoto = parseInt(urlParams.get('photo') - 1);
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
    let formData = new FormData();
    formData.append('mapid', mapId);
    formData.append('name', sname.value);
    fetch('server/uniqcheck2.php', {
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
        if (!data.success) {
            sendinfo.innerText = data.message;
            sendinfo.style.background = 'red';
            sendinfo.style.display = 'inline-block';
        }
        else {
            // данные для отправки на сервер
            formData = new FormData();
            formData.append('smapid', mapId);
            formData.append('sf', sf);
            formData.append('sb', sb);
            formData.append('sl', sl);
            formData.append('sr', sr);
            formData.append('login', localStorage.getItem('login'));
            formData.append('name', sname.value);
            formData.append('opisanie', sopisanie.value);
            formData.append('mapname' , urlParams.get('name'))
            document.getElementById('percent').style.display = 'none'
            pgbar.style.display = 'none';
            sendinfo.style.display = 'none';
            // запрос на сервер выполняется только если поля заполнены
            if (file.files.length === 1 && sname.value && sopisanie.value && (file.files[0].type == 'image/jpeg' || file.files[0].type == 'image/png')) {
                formData.append('file', file.files[0]);
                var xhr = new XMLHttpRequest();
                xhr.open('POST', 'server/uploaddata.php', true);
                pgbar.style.display = 'inline-block';
                document.getElementById('percent').style.display = 'inline'
                xhr.upload.onprogress = function(event) {
                   var percent = (event.loaded / event.total) * 100;
                        pgbar.value = percent;
                        document.getElementById('percent').innerText = Math.round(percent) + ' %'
                        if (percent >= 100) {
                            pgbar.style.display = 'none';
                            document.getElementById('percent').innerText = 'Обработка...';
                        }
                }
                xhr.onload = function() {
                    if (xhr.status === 200) {
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
                            formData.append('f', sf);
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
                sendinfo.innerText = 'Пожалуйста, заполните обязательные поля. Для каждой записи необходимо добавить по 1 фото PNG или JPG';
                sendinfo.style.background = 'red';
                sendinfo.style.display = 'inline-block';
            }
        }
    })
   
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
       scale = 1;
       newimage.style.left = 0;
       newimage.style.top = 0;
       init()
        if (photosData[photoId]){
            const img = new Image();
            img.src = "images/" + urlParams.get('mapId') + '/' + photosData[photoId].photoUrl;
            img.onload = function() {
                currentphoto = photoId
                console.log(currentphoto)
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
            photoupdate(0);
        }
    }
    
    // инициализация чего-то 
    function init() {
        // нужные переменые 
        window.newimage = document.createElement('IMG');
        window.scale = 1;
        window.isDragging = false;
        window.startX, window.startY, window.initialX, window.initialY;
    }
    
    // добавление фото
    function createImage(imageUrl, width, height) {
        // очистка div
        while(container.firstChild){
            container.removeChild(container.firstChild);
        }
        scale = 1
        
        // добавляем элемент 
        container.appendChild(newimage);
        
        // установка стилей и атрибутов
        newimage.src = imageUrl;
        newimage.style.width = width ;
        newimage.style.height = height ;
        newimage.draggable = false;
        container.style.position = 'relative';
        newimage.style.position = 'absolute';
        
        // изменение масштаба
        newimage.addEventListener('wheel', function(event) {
            event.preventDefault();
            scale += event.deltaY * -0.001; 
            scale = Math.min(Math.max(0.2, scale), 4);
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

        let initialDistance = null;
        
        // для тачскринов
        newimage.addEventListener('touchstart', function(event) {
            if (event.touches.length === 2) {
                initialDistance = Math.hypot(
                event.touches[0].clientX - event.touches[1].clientX,
                event.touches[0].clientY - event.touches[1].clientY
                );
            } else if (event.touches.length === 1) {
                 event.preventDefault();
                isDragging = true;
                startX = event.touches[0].clientX;
                startY = event.touches[0].clientY;
                initialX = newimage.offsetLeft;
                initialY = newimage.offsetTop;
                newimage.style.cursor = 'grabbing';
            }
        });
        
        newimage.addEventListener('touchmove', function(event) {
            if (event.touches.length === 2 && initialDistance) {
                event.preventDefault();
                const currentDistance = Math.hypot(
                event.touches[0].clientX - event.touches[1].clientX,
                event.touches[0].clientY - event.touches[1].clientY
                );
                scale *= currentDistance / initialDistance;
                initialDistance = currentDistance;
                scale = Math.min(Math.max(0.2, scale), 4);
                newimage.style.transform = 'scale(' + scale + ')';
            } else if (isDragging) {
                const dx = event.touches[0].clientX - startX;
                const dy = event.touches[0].clientY - startY;
                newimage.style.left = `${initialX + dx}px`;
                newimage.style.top = `${initialY + dy}px`;
            }
        });
        
        newimage.addEventListener('touchend', function() {
            isDragging = false;
            initialDistance = null;
            newimage.style.cursor = 'grab';
        });
    };
    
    // кнопка обновления
    document.getElementById('refresh').addEventListener('click', function() {
       scale = 1;
       newimage.style.left = 0;
       newimage.style.top = 0;
       init()
       photoupdate(currentphoto)
    });
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
        currentphoto = photoId
        console.log(currentphoto)
        if (photosData[photoId]){
            createImage("images/" + urlParams.get('mapId') + '/' + photosData[photoId].photoUrl);
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
            photoupdate(0)
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
     document.getElementById('refresh').addEventListener('click', function() {
       photoupdate(currentphoto)
    });
}

// код, который не зависит от того, панорамная карта или нет

let selectedButton = null; 

function relatedPhotos(photosData){
    if (photosData && photosData.length > 0) {
        for (let i = 0; i < photosData.length; i += 1) {
            elements.style.display = 'grid';
            let newdiv = document.createElement('A');
            newdiv.classList.add('element');

            let newimg = document.createElement('IMG');
            newimg.src = 'images/' + mapId + '/_compressed' + photosData[i].photoUrl;
            newimg.alt = 'Превью недоступно';

            let newname = document.createElement('P');
            newname.innerText= photosData[i].name;

            newdiv.appendChild(newimg);
            newdiv.appendChild(newname);


            function toggleButton(button, index, direction) {

                if (selectedButton) {
                    selectedButton.style.background = 'green'; и
                }

                selectedButton = button;
                button.style.background = 'black';

                if (direction === 'b') {
                    sf = photosData[index].num;
                    sl = sr = sb = ''; 
                } else if (direction === 'r') {
                    sl = photosData[index].num;
                    sf = sr = sb = '';
                } else if (direction === 'f') {
                    sb = photosData[index].num;
                    sf = sl = sr = '';
                } else if (direction === 'l') {
                    sr = photosData[index].num;
                    sf = sl = sb = '';
                }
            }

            if (!photosData[i].b) {
                let bf = document.createElement('BUTTON');
                bf.innerText = 'Сзади';
                bf.classList.add('fbuttons', 'dbuttons');
                newdiv.appendChild(bf);
                bf.addEventListener('click', (function(index) {
                    return function() {
                        toggleButton(bf, index, 'b');
                    };
                })(i));
            }

            if (!photosData[i].r) {
                let bl = document.createElement('BUTTON');
                bl.innerText = 'Справа';
                bl.classList.add('lbuttons', 'dbuttons');
                newdiv.appendChild(bl);
                bl.addEventListener('click', (function(index) {
                    return function() {
                        toggleButton(bl, index, 'r');
                    };
                })(i));
            }

            if (!photosData[i].f) {
                let bb = document.createElement('BUTTON');
                bb.innerText = 'Спереди';
                bb.classList.add('bbuttons', 'dbuttons');
                newdiv.appendChild(bb);
                bb.addEventListener('click', (function(index) {
                    return function() {
                        toggleButton(bb, index, 'f');
                    };
                })(i));
            }

            if (!photosData[i].l) {
                let br = document.createElement('BUTTON');
                br.innerText = 'Слева';
                br.classList.add('rbuttons', 'dbuttons');
                newdiv.appendChild(br);
                br.addEventListener('click', (function(index) {
                    return function() {
                        toggleButton(br, index, 'l');
                    };
                })(i));
            }

            document.getElementById('elements').appendChild(newdiv);
        }
    } else {
        document.getElementById('opterror').innerText = "Пока у вас нет загруженных фото.";
        elements.style.display = 'none';
    }
}

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
    if (b) {
        document.getElementById('forward').style.visibility = 'visible';
    }
    if (f) {
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
    var currentRowIndex = 0; 
    while (currentRowIndex !== null) { 
    var row = data[currentRowIndex]; 
    var tr = table.insertRow(); 
    var keys = ['l', 'num', 'r'];
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var td = document.createElement('td'); 
        if (row[key] == null) {
            td.innerText = '';
        } else {
            var relatedRow = data[parseInt(row[key]) - 1];
            if (relatedRow) {
                td.innerText = relatedRow.name; 
            } else {
                td.innerText = row[key]; 
        }

        td.addEventListener('click', function(currentRow, key) {
            return function() {
            if (key == 'l') {
                photoupdate(currentRow.l - 1);
            } else if (key == 'num') {
                photoupdate(currentRow.num - 1);
            } else if (key == 'r') {
                photoupdate(currentRow.r - 1);
            }
        };
        } (row, key));
        }
        tr.appendChild(td); 
    }
        currentRowIndex = row.f - 1;1 
    }
    document.body.appendChild(table); // Добавляем таблицу в тело документа
}
    




// добавление обработчиков кнопок
document.getElementById('forward').addEventListener('click', function() {
    photoupdate(b-1);
});
document.getElementById('back').addEventListener('click', function() {
    photoupdate(f-1);
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


