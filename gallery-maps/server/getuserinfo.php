<?php
include '../../server/connect.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$login = $_POST['login'];

$stmt = $conn->prepare("SELECT p.num, p.photo_url, p.name, p.opisanie, p.b, p.f, p.r, p.l, m.name as mapname, m.ispanoram, m.id
    FROM photos p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN maps m ON p.map_id = m.id
    WHERE u.login = ?");
$stmt->bind_param("s", $login);
$stmt->execute();
$result = $stmt->get_result();
$photos = [];

if ($result->num_rows > 0) {
    while ($photo = $result->fetch_assoc()) {
        $photos[] = [
            'num' => $photo['num'],
            'photoUrl' => $photo['photo_url'],
            'name' => $photo['name'],
            'mapname' => $photo['mapname'],
            'opisanie' => $photo['opisanie'], 
            'ispanoram' => $photo['ispanoram'],
            'id' => $photo['id'],
            'f' => $photo['f'],
            'b' => $photo['b'],
            'l' => $photo['l'],
            'r' => $photo['r']
        ];
    }
}

$stmt->close();

$stmt = $conn->prepare("SELECT m.name, m.photo_url, m.id FROM maps m
    LEFT JOIN users u ON m.user_id = u.id
    WHERE u.login = ?");
$stmt->bind_param("s", $login);
$stmt->execute();
$result = $stmt->get_result();
$maps = [];

if ($result->num_rows > 0) {
    while ($map = $result->fetch_assoc()) {
        $maps[] = [
            'name' => $map['name'],
            'photourl' => $map['photo_url'],
            'id' => $map['id'],
        ];
    }
}

$stmt->close();
$conn->close();


$response = [
    'success' => true,
    'photos' => $photos,
    'maps' => $maps,
];

if (empty($photos) && empty($maps)) {
    $response['success'] = false;
    $response['message'] = 'Нет данных';
}

echo json_encode($response);
?>