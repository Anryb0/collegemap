<?php
$servername = "localhost";
$username = "u2860432_default";
$password = "jWrO051r8HBBL5e4";
$dbname = "u2860432_college-map";
$conn = new mysqli($servername, $username, $password, $dbname);
mysqli_set_charset($conn, "utf8mb4");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
