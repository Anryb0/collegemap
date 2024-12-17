<?php
include '../../server/connect.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$file = $_POST['file'];
$mapid = $_POST['mapid'];
$num = $_POST['num'];
$b = $_POST['b'];
$f = $_POST['f'];
$r = $_POST['r'];
$l = $_POST['l'];

$stmt = $conn->prepare("delete from photos where map_id = ? and num = ?");
$stmt->bind_param("ii", $mapid, $num);

if ($stmt->execute()) {
        echo json_encode(['success' => true]);
        if(file_exists(__DIR__ . '/../images/'. $file)) {
            unlink(__DIR__ . '/../images/'. $file);
            unlink(__DIR__ . '/../images/_compressed'. $file);
        }
        if($b !== "null"){
            $stmt = $conn->prepare("update photos set f = null where num = ? and map_id = ?");
            $stmt->bind_param("ii", $b, $mapid);
            if ($stmt->execute()) {

            } 
            else {
                echo json_encode(['success' => false, 'message' => 'не отправились данные.']);
            }
            $stmt->close();
        }
        if($f !== "null"){
            $stmt = $conn->prepare("update photos set b = null where num = ? and map_id = ?");
            $stmt->bind_param("ii", $f, $mapid);
            if ($stmt->execute()) {

            } 
            else {
                echo json_encode(['success' => false, 'message' => 'не отправились данные.']);
            }
            $stmt->close();
        }
        if($l !== "null"){
            $stmt = $conn->prepare("update photos set r = null where num = ? and map_id = ?");
            $stmt->bind_param("ii", $l, $mapid);
            if ($stmt->execute()) {
                
            } 
            else {
                echo json_encode(['success' => false, 'message' => 'не отправились данные.']);
            }
            $stmt->close();
        }
        if($r !== "null"){
            $stmt = $conn->prepare("update photos set l = null where num = ? and map_id = ?");
            $stmt->bind_param("ii", $r, $mapid);
            if ($stmt->execute()) {
                
            } 
            else {
                echo json_encode(['success' => false, 'message' => 'не отправились данные.']);
            }
            $stmt->close();
        }
        if($r == 'null' && $l == 'null' && $f == 'null' && $b == 'null') {
            $stmt->close();
        }
} 
 
else {
        echo json_encode(['success' => false, 'message' => 'ошибка']);
}
$conn->close();
?>
