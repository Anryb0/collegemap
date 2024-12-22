<?php
include '../../server/connect.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$mapid = $_POST['mapid'];
$name = $_POST['name'];

$stmt = $conn->prepare("select count(*) from photos where map_id = ? and name = ?");
$stmt->bind_param("is", $mapid, $name);
$stmt->execute();
$stmt->bind_result($count);
$stmt->fetch();
$stmt->close();

if ($count > 0) {
    echo json_encode(['success' => false, 'message' => 'Фото с названием '. $name. ' уже добавлено']);
}
else {
    echo json_encode(['success' => true]);
}
?>