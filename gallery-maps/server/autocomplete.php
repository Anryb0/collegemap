<?php
include '../../server/connect.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$b = $_POST['b'];
$r = $_POST['r'];
$l = $_POST['l'];
$f = $_POST['f'];
$num = $_POST['num'];
$mapid = $_POST['mapid'];

if($b !== ''){
    $stmt = $conn->prepare("update photos set f = ? where num = ? and map_id = ?");
    $stmt->bind_param("iii", $num, $b, $mapid);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } 
    else {
        echo json_encode(['success' => false, 'message' => 'не отправились данные.']);
    }
    $stmt->close();
}
if($r !== ''){
    $stmt = $conn->prepare("update photos set l = ? where num = ? and map_id = ?");
    $stmt->bind_param("iii", $num, $r, $mapid);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } 
    else {
        echo json_encode(['success' => false, 'message' => 'не отправились данные.']);
    }
    $stmt->close();
}
if($l !== ''){
    $stmt = $conn->prepare("update photos set r = ? where num = ? and map_id = ?");
    $stmt->bind_param("iii", $num, $l, $mapid);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } 
    else {
        echo json_encode(['success' => false, 'message' => 'не отправились данные.']);
    }
    $stmt->close();
}
if($f !== ''){
    $stmt = $conn->prepare("update photos set b = ? where num = ? and map_id = ?");
    $stmt->bind_param("iii", $num, $f, $mapid);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } 
    else {
        echo json_encode(['success' => false, 'message' => 'не отправились данные.']);
    }
    $stmt->close();
}
$conn->close();
?>
