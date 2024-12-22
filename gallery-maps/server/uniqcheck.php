<?php
include '../../server/connect.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$login = $_POST['login'];
$name = $_POST['name'];

$stmt = $conn->prepare("select id from users where login = ?");
$stmt->bind_param("s", $login);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $user_id = $row['id'];
}

$stmt = $conn->prepare("select count(*) from maps where user_id = ? and name = ?");
$stmt->bind_param("is", $user_id, $name);
$stmt->execute();
$stmt->bind_result($count);
$stmt->fetch();
$stmt->close();

if ($count > 0) {
    echo json_encode(['success' => false, 'message' => 'Вы уже добавили локацию с названием '. $name]);
}
else {
    echo json_encode(['success' => true, 'message' => 'Вы уже добавили локацию с названием '. $name]);
}
?>