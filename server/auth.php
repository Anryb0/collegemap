<?php
include 'connect.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$login = $_POST['login'];
$password = $_POST['password'];

$stmt = $conn->prepare("SELECT password from users where login = ?");
$stmt->bind_param("s", $login);
$stmt->execute();
$result = $stmt->get_result();
$data = [];
if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    if (password_verify($password, $user['password'])) {
    echo json_encode(['success' => true, 'log' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'неправильный пароль']);
}
}
else {
    echo json_encode(['success' => false, 'message' => 'нет такого']);
}
$stmt->close();
$conn->close();
?>