<?php
include '../../server/connect.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$stmt = $conn->prepare("select m.id, m.name, m.description, m.photo_url, m.ispanoram, u.login as login from maps m left join users u on m.user_id = u.id");
$stmt->execute();
$result = $stmt->get_result();
$data = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = [
            'name' => $row['name'],
            'description' => $row['description'],
            'photo_url' => $row['photo_url'],
            'ispanoram' => $row['ispanoram'],
            'id' => $row['id'], 
            'login' => $row['login']
        ];
    }
    echo json_encode(['success' => true, 'maps' => $data]);
} else {
    echo json_encode(['success' => false, 'message' => 'Локации отсутствуют.']);
}
$stmt->close();
$conn->close();
?>