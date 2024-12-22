let newdiv, newimg, mapphotos, pnames, newname, newlink, details, newlink2, mapurls, newb, newlogin, newloc; // переменные, которые будут нужны для генерации контента на странице
const posts = document.getElementById('posts');
const posts2 = document.getElementById('posts2');

let formData = new FormData(); // данные для сервера

let delmapid, delid;

formData.append('login', localStorage.getItem('login'));
// отправка запроса на сервер, получение данных
fetch('server/getuserinfo.php', {
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
        userPhotos = data.photos;
        let mapnames = []
        for(var i=0;i<userPhotos.length; i+=1){
           newdiv = document.createElement('A');
           newdiv.classList.add('element');
           newdiv.href = 'map.html?mapId=' + userPhotos[i].id + '&ispanoram=' + userPhotos[i].ispanoram + '&name=' + userPhotos[i].mapname + '&photo=' + (parseInt(userPhotos[i].num));
           newimg = document.createElement('IMG');
           newimg.src = '../gallery-maps/images/' + userPhotos[i].id + '/_compressed' + userPhotos[i].photoUrl;
           newimg.alt = 'Превью недоступно';
           newname = document.createElement('P');
           newname.innerText= userPhotos[i].name;
           delbut = document.createElement('BUTTON');
           delbut.classList.add('delbut');
           delbut.innerText = 'Удалить';
           delbut.setAttribute('id', userPhotos[i].num);
           delbut.setAttribute('mapid', userPhotos[i].id);
           delbut.setAttribute('file', userPhotos[i].photoUrl);
           delbut.setAttribute('l', userPhotos[i].l);
           delbut.setAttribute('r', userPhotos[i].r);
           delbut.setAttribute('b', userPhotos[i].b);
           delbut.setAttribute('f', userPhotos[i].f);
           newdiv.setAttribute('id', 'p' + userPhotos[i].num.toString() + '_' + userPhotos[i].id.toString());
           newdiv.appendChild(newimg);
           newdiv.appendChild(newname);
           newdiv.appendChild(delbut);
           if(!mapnames.includes(userPhotos[i].id)){
               mapname = document.createElement('P');
               mapname.innerText = 'Локация: ' + userPhotos[i].mapname;
               mapname.setAttribute('id', 't' + userPhotos[i].id.toString());
               posts.appendChild(mapname);
               newloc = document.createElement('DIV');
               newloc.classList.add('elements');
               newloc.setAttribute('id','p' + userPhotos[i].id.toString());
               mapnames.push(userPhotos[i].id);
               posts.appendChild(newloc);
           }
           document.getElementById('p' + userPhotos[i].id.toString()).appendChild(newdiv);
          
        }
        document.querySelectorAll(".delbut").forEach(function(button) {
          button.addEventListener("click", function(event) {
            event.preventDefault();
            let formData = new FormData();
            formData.append('mapid', button.getAttribute('mapid'));
            formData.append('num', button.id);
            formData.append('file', button.getAttribute('file'));
            formData.append('f', button.getAttribute('f'));
            formData.append('b', button.getAttribute('b'));
            formData.append('l', button.getAttribute('l'));
            formData.append('r', button.getAttribute('r'));
            // удаление фото
            fetch('server/deletephoto.php', {
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
                   document.getElementById('p'+button.getAttribute('mapid')).removeChild(document.getElementById('p' + button.id.toString() + '_' + button.getAttribute('mapid').toString()))
                   if (document.querySelectorAll('#p' + button.getAttribute('mapid') + ' ' + '.element').length == 0){
                       document.getElementById('posts').removeChild(document.getElementById('p' + button.getAttribute('mapid')));
                       document.getElementById('t' + button.getAttribute('mapid')).style.display = 'none';
                       if(document.querySelectorAll('#posts div').length == 0){
                           document.getElementById('useritems').innerText = "Пока у вас нет загруженных фото."
                       }
                   }
                } else {
                    document.getElementById('useritems').innerText = data.message;
                }
            })
            .catch(function(error) {
                document.getElementById('useritems').innerText = error;
            });
        });
});
        
    } else {
        document.getElementById('useritems').innerText = "Пока у вас нет загруженных фото.";
    }
    if (data.maps && data.maps.length > 0) {
    userMaps = data.maps;
    posts2.style.display = 'grid'
    for (var y = 0; y < userMaps.length; y += 1) {
        newdiv = document.createElement('A');
        newdiv.classList.add('element');
        newdiv.href = 'map.html?mapId=' + userMaps[y].id + '&name=' + userMaps[y].name + '&ispanoram="0"';

        newimg = document.createElement('IMG');
        newimg.src = '../gallery-maps/mapimages/' + userMaps[y].photourl;
        newimg.alt = 'Превью недоступно';

        delbut = document.createElement('BUTTON');
        delbut.classList.add('delbut2');
        delbut.setAttribute('id', userMaps[y].id);
        delbut.innerText = 'Удалить';

        newname = document.createElement('P');
        newname.innerText = userMaps[y].name;

        newdiv.appendChild(newimg);
        newdiv.appendChild(newname);
        newdiv.appendChild(delbut);
        
        posts2.appendChild(newdiv);
        
        document.querySelectorAll(".delbut2").forEach(function(button) {
        button.addEventListener("click", function(event) {
           event.preventDefault();
            let formData = new FormData();
            formData.append('mapid', button.getAttribute('id')); 

            // удаление локации
            fetch('server/deletemap.php', {
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
                    location.reload()
                } else {
                    document.getElementById('useritems2').innerText = data.message;
                }
            })
            .catch(function(error) {
                document.getElementById('useritems2').innerText = error;
            }); 
        });
    });
    }
} else {
    document.getElementById('useritems2').innerText = "Пока у вас нет добавленных локаций.";
}
})
