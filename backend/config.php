<?php
/**
 * SmartLib - Library Seat & Rack Management System
 * Database Configuration
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');  // Default XAMPP password is empty
define('DB_NAME', 'smartlib_v2');
define('DB_PORT', 3306);

// API Configuration
define('API_VERSION', '1.0');
define('API_TIMEOUT', 600); // 10 minutes in seconds
define('BOOKING_DURATION', 600); // 10 minutes booking hold time

// Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Connection
try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    $conn->set_charset("utf8");
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database connection error: ' . $e->getMessage()
    ]);
    exit();
}

// Helper Functions
function respond($success, $data = [], $message = '', $statusCode = 200) {
    http_response_code($statusCode);
    $response = [
        'success' => $success,
        'data' => $data,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    echo json_encode($response);
    exit();
}

function sanitize($str) {
    return htmlspecialchars(stripslashes(trim($str)));
}

function getJSON() {
    return json_decode(file_get_contents('php://input'), true);
}

function verifySession() {
    if (!isset($_SESSION['user_id'])) {
        respond(false, [], 'Unauthorized: Session not found', 401);
    }
    return $_SESSION;
}

function generateToken() {
    return bin2hex(random_bytes(32));
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}
?>
