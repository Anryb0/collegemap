<?php
include 'connect.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$smapid = $_POST['smapid'];
$sphotoid = $_POST['sphotoid'];
$sf = ($_POST['sf'] == 'NaN') ? null : $_POST['sf'];
$sb = ($_POST['sb'] == 'NaN') ? null : $_POST['sb'];
$sl = ($_POST['sl'] == 'NaN') ? null : $_POST['sl'];
$sr = ($_POST['sr'] == 'NaN') ? null : $_POST['sr'];

$uploadDir = 'images/';
$fileName = basename($_FILES['file']['name']);
$filePath = __DIR__ . '/../images/' . $fileName;;
$fileType = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

$stmt = $conn->prepare("insert into photos (map_id, num, l, r, f, b, photo_url) values (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("iiiiiii", $smapid, $sphotoid, $sl, $sr, $sf, $sb, $fileName);

if (isset($_FILES['file']) && $_FILES['file']['error'] == UPLOAD_ERR_OK) {
    // Проверяем, что файл имеет формат JPG
    if ($fileType != 'jpg' && $fileType != 'jpeg') {
        echo json_encode(['success' => false, 'message' => 'Допустимы только JPG файлы.']);
        exit;
    }

    // Перемещаем загруженный файл в нужный каталог
    if (move_uploaded_file($_FILES['file']['tmp_name'], $filePath)) {
        // Записываем информацию в базу данных
        $stmt = $conn->prepare("INSERT INTO photos (map_id, num, l, r, f, b, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("iiiiiis", $smapid, $sphotoid, $sl, $sr, $sf, $sb, $fileName);

        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'не отправились данные.']);
        }

        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Ошибка при загрузке файла.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Файл не загружен или произошла ошибка.']);
}
$conn->close();
?>
