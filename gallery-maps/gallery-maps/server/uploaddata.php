<?php
include '../../server/connect.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$smapid = $_POST['smapid'];
$login = $_POST['login'];
$name = $_POST['name'];
$opisanie = $_POST['opisanie'];
$sf = ($_POST['sf'] == '') ? null : $_POST['sf'];
$sb = ($_POST['sb'] == '') ? null : $_POST['sb'];
$sl = ($_POST['sl'] == '') ? null : $_POST['sl'];
$sr = ($_POST['sr'] == '') ? null : $_POST['sr'];

$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
$randomString = substr(str_shuffle($characters), 0, 10);

$uploadDir = 'images/';
$fileName = $randomString . basename($_FILES['file']['name']);
$filePath = __DIR__ . '/../images/' . $fileName;
$fileType = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

$stmt = $conn->prepare("select id from users where login = ?");
$stmt->bind_param("s", $login);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $user_id = $row['id'];
}

$stmt->close();

$stmt = $conn->prepare("select max(num) as max_num from photos where map_id = ?");
$stmt->bind_param("i", $smapid);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $sphotoid = $row['max_num'] + 1;
}

$stmt->close();

if (isset($_FILES['file']) && $_FILES['file']['error'] == UPLOAD_ERR_OK) {
    if ($fileType != 'jpg' && $fileType != 'jpeg') {
        echo json_encode(['success' => false, 'message' => 'Допустимы только JPG файлы.']);
        exit;
    }
    if (move_uploaded_file($_FILES['file']['tmp_name'], $filePath)) {
        $compressedFileName = '_compressed' . $fileName;
        $compressedFilePath = __DIR__ . '/../images/' . $compressedFileName;
        $sourceImage = imagecreatefromjpeg($filePath); 
        $width = imagesx($sourceImage);
        $height = imagesy($sourceImage);
        $newWidth = 240;
        $newHeight = (int)($height * ($newWidth / $width));
        $compressedImage = imagecreatetruecolor($newWidth, $newHeight);
        imagecopyresampled($compressedImage, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
        imagejpeg($compressedImage, $compressedFilePath, 75); 
        imagedestroy($sourceImage);
        imagedestroy($compressedImage);
        $stmt = $conn->prepare("insert into photos (map_id, num, l, r, f, b, photo_url, name, user_id, opisanie) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("iiiiiissis", $smapid, $sphotoid, $sl, $sr, $sf, $sb, $fileName, $name, $user_id, $opisanie);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => $sphotoid]);
            exit;
        } else {
            echo json_encode(['success' => false, 'message' => 'Ошибка отправки данных']);
            exit;
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Ошибка при загрузке файла.']);
    }
}
$stmt->close();
$conn->close();
?>