const img = document.getElementById('image');
let scale = 1;
let isDragging = false;
let startX, startY, initialX, initialY;

const setPosition = (x, y) => {
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;
};

img.addEventListener('wheel', (event) => {
    event.preventDefault();
    scale += event.deltaY * -0.001;

    // Устанавливаем пределы масштабирования
    scale = Math.min(Math.max(0.125, scale), 4);
    img.style.transform = `scale(${scale})`;
});

const handleMouseDown = (event) => {
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    initialX = img.offsetLeft;
    initialY = img.offsetTop;
    img.style.cursor = 'grabbing';
};

const handleMouseMove = (event) => {
    if (isDragging) {
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        setPosition(initialX + dx, initialY + dy);
    }
};

const handleMouseUp = () => {
    isDragging = false;
    img.style.cursor = 'grab';
};

// Обработка событий мыши
img.addEventListener('mousedown', handleMouseDown);
window.addEventListener('mouseup', handleMouseUp);
window.addEventListener('mousemove', handleMouseMove);

// Обработка касаний для сенсорных экранов
img.addEventListener('touchstart', (event) => {
    isDragging = true;
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    initialX = img.offsetLeft;
    initialY = img.offsetTop;
    img.style.cursor = 'grabbing';
});

img.addEventListener('touchmove', (event) => {
    if (isDragging) {
        const dx = event.touches[0].clientX - startX;
        const dy = event.touches[0].clientY - startY;
        setPosition(initialX + dx, initialY + dy);
    }
});

img.addEventListener('touchend', () => {
    isDragging = false;
    img.style.cursor = 'grab';
});