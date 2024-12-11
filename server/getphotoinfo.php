<?php
include 'connect.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$mapId = $_POST['mapId'];

$stmt = $conn->prepare("select p.num, p.photo_url, p.l, p.r, p.f, p.b, p.name, coalesce(u.login, 'Пользователь удален') as login
    from photos p left join users u on p.user_id = u.id where p.map_id = ?");
$stmt->bind_param("i", $mapId);
$stmt->execute();
$result = $stmt->get_result();

$photos = [];
if ($result->num_rows > 0) {
    while ($photo = $result->fetch_assoc()) {
        $photos[] = [
            'num' => $photo['num'],
            'photoUrl' => $photo['photo_url'],
            'l' => $photo['l'],
            'r' => $photo['r'],
            'f' => $photo['f'],
            'b' => $photo['b'],
            'name' => $photo['name'],
            'login' => $photo['login']
        ];
    }
    echo json_encode(['success' => true, 'photos' => $photos]);
} else {
    echo json_encode(['success' => false, 'message' => 'ошибка']);
}

$stmt->close();
$conn->close();
?>

