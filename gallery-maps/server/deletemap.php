<?php
include '../../server/connect.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$mapid = $_POST['mapid'];

$stmt = $conn->prepare("delete from maps where id = ?");
$stmt->bind_param("i", $mapid);

$dir = __DIR__ . '/../images/' .$mapid;
if ($stmt->execute()) {
    if(is_dir($dir)){
        $items = scandir($dir);
    }
    else {
        echo json_encode(['success' => true]);
        exit;
    }
    foreach ($items as $item) {
        if ($item == '.' || $item == '..') {
            continue;
        }
        $path = $dir . DIRECTORY_SEPARATOR . $item;
        unlink($path);
    }
    rmdir($dir);
    echo json_encode(['success' => true]);
} 
 
else {
        echo json_encode(['success' => false, 'message' => 'ошибка']);
}
$conn->close();
?>
