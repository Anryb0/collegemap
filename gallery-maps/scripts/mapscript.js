const urlParams = new URLSearchParams(window.location.search); // параметры url

const mapId = urlParams.get('mapId'); // номер карты

const map = document.getElementById('map'); // схема
const change = document.getElementById('switch'); // кнопка смена режима
const container = document.getElementById('container'); // контейнер для панорамы или фото
const errortext = document.getElementById('error'); // текст ошибки

let sf = '', sb = '', sr = '', sl = '' ;

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
                //errortext.innerText = 'Ошибка при загрузке текстуры: ' + error;
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
            onMouseDownMouуseX = event.clientX;
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


