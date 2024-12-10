<?php

include 'connect.php';

error_reporting(E_ALL);

ini_set('display_errors', 1);

header('Content-Type: application/json');

$login = $_POST['login'];

$password = $_POST['password'];
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("insert into users (login, password) values (?, ?)");

$stmt->bind_param("ss", $login, $hashedPassword);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'не отправились данные.']);
}

$stmt->close();
$conn->close();
?>


