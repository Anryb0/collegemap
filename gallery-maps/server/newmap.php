<?php
include '../../server/connect.php';
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
        if ($fileType != 'jpg' && $fileType != 'jpeg' && $fileType !== 'png') {
            echo json_encode(['success' => false, 'message' => 'Допустимы только JPG или PNG файлы.']);
            exit;
        }
        if (move_uploaded_file($_FILES['file']['tmp_name'], $filePath)) {
            $compressedFileName = '_compressed' . $fileName;
            $compressedFilePath = __DIR__ . '/../mapimages/' . $compressedFileName;
             if ($fileType == 'jpg' || $fileType == 'jpeg') {
                $sourceImage = imagecreatefromjpeg($filePath);
            } else if ($fileType == 'png') {
                $sourceImage = imagecreatefrompng($filePath);
            } else {
                echo json_encode(['success' => false, 'message' => 'Неподдерживаемый формат изображения.']);
                exit;
            }
            
            $width = imagesx($sourceImage);
            $height = imagesy($sourceImage);
            $newWidth = 240;
            $newHeight = (int)($height * ($newWidth / $width));
    
            $compressedImage = imagecreatetruecolor($newWidth, $newHeight);
    
            if ($fileType == 'png') {
                imagealphablending($compressedImage, false);
                imagesavealpha($compressedImage, true);
                $transparent = imagecolorallocatealpha($compressedImage, 255, 255, 255, 127);
                imagefilledrectangle($compressedImage, 0, 0, $newWidth, $newHeight, $transparent);
            }
    
            imagecopyresampled($compressedImage, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
    
            if ($fileType == 'jpg' || $fileType == 'jpeg') {
                imagejpeg($compressedImage, $compressedFilePath, 75);
            } else if ($fileType == 'png') {
                imagepng($compressedImage, $compressedFilePath, 6); // уровень сжатия 0-9
            }
            imagedestroy($sourceImage);
            imagedestroy($compressedImage);
             if (file_exists($filePath)) {
                unlink($filePath);
            }
            $stmt = $conn->prepare("insert into maps (name,description, photo_url, ispanoram, user_id) values (?, ?, ?, ?, ?)");
            $stmt->bind_param("sssii", $name, $opisanie, $compressedFileName, $isp, $user_id);
    
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