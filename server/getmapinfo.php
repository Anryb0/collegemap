<?php
include 'connect.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$maxMapId = $_POST['maxMapId'];

$stmt = $conn->prepare("SELECT name, description, photo_url, graphurl, ispanoram FROM maps WHERE id between 1 and ?");
$stmt->bind_param("i", $maxMapId);
$stmt->execute();
$result = $stmt->get_result();
$data = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = [
            'name' => $row['name'],
            'description' => $row['description'],
            'photo_url' => $row['photo_url'],
            'graphurl' => $row['graphurl'],
            'ispanoram' => $row['ispanoram'],
        ];
    }
    echo json_encode(['success' => true, 'maps' => $data]);
} else {
    echo json_encode(['success' => false, 'message' => 'Карт не найдено.']);
}
$stmt->close();
$conn->close();
?>