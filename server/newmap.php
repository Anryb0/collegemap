<?php
include 'connect.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$login = $_POST['login'];
$name = $_POST['name'];
$opisanie = $_POST['opisanie'];
$isp = $_POST['isp'];

$stmt = $conn->prepare("select id from users where login = ?");
$stmt->bind_param("s", $login);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $user_id = $row['id'];
}

$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
$randomString = substr(str_shuffle($characters), 0, 10);

$uploadDir = 'mapimages/';
$fileName = $randomString . basename($_FILES['file']['name']) ;
$filePath = __DIR__ . '/../mapimages/' . $fileName;
$fileType = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

if (isset($_FILES['file']) && $_FILES['file']['error'] == UPLOAD_ERR_OK) {
    if ($fileType != 'jpg' && $fileType != 'jpeg') {
        echo json_encode(['success' => false, 'message' => 'Допустимы только JPG файлы.']);
        exit;
    }
    if (move_uploaded_file($_FILES['file']['tmp_name'], $filePath)) {
        $stmt = $conn->prepare("insert into maps (name,description, photo_url, ispanoram, user_id) values (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssii", $name, $opisanie, $fileName, $isp, $user_id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Успешно']);
            exit;
        }
        else {
            echo json_encode(['success' => false, 'message' => 'Ошибка отправки данных']);
            exit;
        }
    }
    else {
        echo json_encode(['success' => false, 'message' => 'Ошибка при загрузке файла.']);
    }
}
$stmt->close();
$conn->close();
?>