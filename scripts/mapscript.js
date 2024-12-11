const urlParams = new URLSearchParams(window.location.search); // параметры url

const mapId = urlParams.get('mapId'); // номер карты

const map = document.getElementById('map'); // схема
const change = document.getElementById('switch'); // кнопка смена режима
const container = document.getElementById('container'); // контейнер для панорамы или фото
const errortext = document.getElementById('error'); // текст ошибки

// формы для отправки на сервер
const sphotoid = document.getElementById('i2');
const sf = document.getElementById('i3');
const sb = document.getElementById('i4');
const sl = document.getElementById('i5');
const sr = document.getElementById('i6');
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

if(localStorage.getItem('login')){
    document.getElementById('loggedin').style.display = 'inline-block';
}
localStorage.setItem('mapid', mapId);
// выводим название текущей карты и рекомендованный режим просмотра
if(urlParams.get('ispanoram') == '0'){
    document.getElementById('mapname').innerText = 'Текущая карта: ' + urlParams.get('name') + '. Рекомендованный режим просмотра: фото.';
}
else{
    document.getElementById('mapname').innerText = 'Текущая карта: ' + urlParams.get('name') + '. Рекомендованный режим просмотра: панорама.';
}
function hide(element) {
    element.classList.add('fade-out'); 
    setTimeout(function() {
        element.style.display = 'none'; 
        element.classList.remove('fade-out');
    }, 300);
}

document.getElementById('bedit').addEventListener('click', function() {
   edit.style.display = 'inline-block'; 
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
    formData.append('sf', parseInt(sf.value));
    formData.append('sb', parseInt(sb.value));
    formData.append('sl', parseInt(sl.value));
    formData.append('sr', parseInt(sr.value));
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
                    formData.append('b', parseInt(sb.value));
                    formData.append('l', parseInt(sl.value));
                    formData.append('r', parseInt(sr.value));
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
    document.getElementById('now').innerText = 'Текущий режим просмотра: фото. Переключится: '
    change.innerText = 'Панорама';
    change.addEventListener('click', function(){
        localStorage.setItem('viewmode','1')
        location.reload()
    })
    // очистка div
    while(container.firstChild){
        container.removeChild(container.firstChild);
    }
    // обновление фотографии  
    function photoupdate(photoId) {
        if (photosData[photoId]){
            const img = new Image();
            img.src = "images/" + photosData[photoId].photoUrl;
            img.onload = function() {
                const width = img.width;
                const height = img.height;
                createImage(img.src, width, height);
                l = photosData[photoId].l;
                r = photosData[photoId].r;
                f = photosData[photoId].f;
                b = photosData[photoId].b;
                renderButtons(l, r, f, b);
                errortext.innerText = 'Текущая позиция: ' + (photoId + 1) + ') ' + photosData[photoId].name + ', автор: ' + photosData[photoId].login + ', описание: ' + photosData[photoId].opisanie;
                errortext.style.background = 'green';
                localStorage.setItem('curph',photoId)
            }
        }
        else {
            errortext.innerText = "Информация о данном фото отсутствует.";
            errortext.style.background = 'red';
        }
    }
    
    // инициализация three.js
    function init() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 1000);
        camera.position.z = 800;
        renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);
        container.addEventListener('mousedown', onPointerStart);
        container.addEventListener('mousemove', onPointerMove);
        container.addEventListener('mouseup', onPointerUp);
        container.addEventListener('wheel', onDocumentMouseWheel);
        container.addEventListener('mouseenter', onMouseEnter);
        container.addEventListener('mouseleave', onMouseLeave);
        window.addEventListener('resize', onWindowResize);
        animate();
    }
    
    // изменение флага
    function onMouseEnter() {
        isMouseOverImage = true;
    }
    function onMouseLeave() {
        isMouseOverImage = false; 
    }
    
    // очистка сцены
    function clearScene(scene) {
    scene.children.forEach(function(child) {
        if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            child.material.dispose();
        }
            scene.remove(child);
        });
    }
    
    // добавление фото
    function createImage(imageUrl, width, height) {
        clearScene(scene);
        if(plane)
        {
            scene.remove(plane);
            plane.geometry.dispose();
            plane.material.dispose();
            plane = null;
        }
        const geometry = new THREE.PlaneGeometry(width, height);
        const textureLoader = new THREE.TextureLoader();
        
        textureLoader.load(
            imageUrl,
            function (texture) {
                const material = new THREE.MeshBasicMaterial({ map: texture });
                plane = new THREE.Mesh(geometry, material);
                plane.scale.set(scaleFactor, scaleFactor, 1); 
                scene.add(plane);
                onWindowResize();
            },
            undefined,
            function (error) {
                errortext.innerText = 'Ошибка при загрузке текстуры: ' + error;
            }
        );
    }
    
    // при изменении размеров окна
    function onWindowResize() {
        const container = document.getElementById('container');
        if (container.clientWidth && container.clientHeight) {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            if (plane) {
                if (!plane.initialized) {
                    plane.initialized = true;
                    plane.geometry = new THREE.PlaneGeometry(container.clientWidth, container.clientHeight);
                }
            }
        }
    }
    
    // перемещение фотографии мышью
    function onPointerStart(event) {
        isUserInteracting = true;
        onMouseDownMouseX = event.clientX;
        onMouseDownMouseY = event.clientY;
    }
    
    function onPointerMove(event) {
        if (isUserInteracting) {
            const deltaX = event.clientX - onMouseDownMouseX;
            const deltaY = event.clientY - onMouseDownMouseY;
            const newX = plane.position.x + deltaX;
            const newY = plane.position.y - deltaY;
            plane.position.x += deltaX;
            plane.position.y -= deltaY;
            const container = document.getElementById('container');
            const halfWidth = container.clientWidth / 2;
            const halfHeight = container.clientHeight / 2;
            const planeWidth = plane.geometry.parameters.width;
            const planeHeight = plane.geometry.parameters.height
            if (newX > halfWidth - planeWidth / 2 && newX < halfWidth + planeWidth / 2) {
                plane.position.x = newX;
            }
            if (newY > halfHeight - planeHeight / 2 && newY < halfHeight + planeHeight / 2) {
                plane.position.y = newY;
            }
            onMouseDownMouseX = event.clientX;
            onMouseDownMouseY = event.clientY;
        }
    }
    
    function onPointerUp() {
        isUserInteracting = false;
    }
    
    // изменение масштаба
    function onDocumentMouseWheel(event) {
        if (isMouseOverImage) {
            event.preventDefault();
            onWindowResize();
            scaleFactor -= event.deltaY * 0.001;
            scaleFactor = Math.max(0.5, Math.min(scaleFactor, 4));
            plane.scale.set(scaleFactor, scaleFactor, 1);
        }
    }
    
    // анимация
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
}

// код для панорамных карт
if (ispanoram == '1') { 
    
    // для переключения между режимами просмотра
    document.getElementById('now').innerText = 'Текущий режим просмотра: панорама. Переключится: ';
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
            errortext.innerText = 'Текущая позиция: ' + (photoId + 1) + ') ' + photosData[photoId].name + ', автор: ' + photosData[photoId].login + ', описание: ' + photosData[photoId].opisanie;
            errortext.style.background = 'green';
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
    document.getElementById('forward').style.display = 'none';
    document.getElementById('back').style.display = 'none';
    document.getElementById('left').style.display = 'none';
    document.getElementById('right').style.display = 'none';
    if (f) {
        document.getElementById('forward').style.display = 'inline';
    }
    if (b) {
        document.getElementById('back').style.display = 'inline';
    }
    if (l) {
        document.getElementById('left').style.display = 'inline';
    }
    if (r) {
        document.getElementById('right').style.display = 'inline';
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

        td.addEventListener('mouseover', function(currentRow, key) {
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
        currentRowIndex = row.f - 1; 
    }
}

// добавление обработчиков формы, кнопок
document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();
    photoupdate(parseInt(document.getElementById('inputPos').value)-1);
});

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


