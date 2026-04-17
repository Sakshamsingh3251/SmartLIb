<?php
/**
 * SmartLib API - Authentication Endpoints
 * Login, logout, and session management
 */

session_start();
require_once '../backend/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST') {
    if ($action === 'login') {
        loginUser();
    } elseif ($action === 'logout') {
        logoutUser();
    } elseif ($action === 'signup') {
        signupStudent();
    }
} elseif ($method === 'GET') {
    if ($action === 'verify') {
        verifyToken();
    }
}

function loginUser() {
    global $conn;
    
    $data = getJSON();
    
    if (!isset($data['user_type']) || !isset($data['id']) || !isset($data['password'])) {
        respond(false, [], 'Missing required fields', 400);
    }
    
    $userType = sanitize($data['user_type']);
    $userId = sanitize($data['id']);
    $password = $data['password'];
    
    if ($userType === 'student') {
        loginStudent($userId, $password);
    } elseif ($userType === 'admin') {
        loginAdmin($userId, $password, $data['admin_key'] ?? '');
    } else {
        respond(false, [], 'Invalid user type', 400);
    }
}

function loginStudent($studentId, $password) {
    global $conn;
    
    $stmt = $conn->prepare("SELECT id, student_id, name, email, password_hash FROM students WHERE student_id = ?");
    $stmt->bind_param("s", $studentId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        respond(false, [], 'Invalid student ID or password', 401);
        return;
    }
    
    $student = $result->fetch_assoc();
    $passwordHash = $student['password_hash'];
    
    // Check password: either demo credentials or hashed password
    $passwordValid = false;
    
    // Demo credentials (for testing)
    if ($studentId === 'student' && $password === '1234') {
        $passwordValid = true;
    } elseif (in_array($studentId, ['STU001', 'STU002', 'STU003', 'STU004', 'STU005']) && $password === 'pass' . substr($studentId, -1)) {
        $passwordValid = true;
    } else {
        // Check hashed password (for new signups)
        $passwordValid = password_verify($password, $passwordHash);
    }
    
    if (!$passwordValid) {
        respond(false, [], 'Invalid student ID or password', 401);
        return;
    }
    
    // Password verified, create session
    $token = generateToken();
    $_SESSION['user_id'] = $student['id'];
    $_SESSION['user_type'] = 'student';
    $_SESSION['token'] = $token;
    
    respond(true, [
        'user_id' => $student['id'],
        'student_id' => $student['student_id'],
        'name' => $student['name'],
        'email' => $student['email'],
        'user_type' => 'student',
        'token' => $token
    ], 'Login successful', 200);
}

function loginAdmin($username, $password, $adminKey) {
    global $conn;
    
    $stmt = $conn->prepare("SELECT id, username, name, email, role FROM admins WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        respond(false, [], 'Invalid credentials', 401);
    }
    
    $admin = $result->fetch_assoc();
    
    // Hardcoded check for demo
    if ($username === 'admin' && $password === 'admin' && $adminKey === '123456') {
        $token = generateToken();
        $_SESSION['user_id'] = $admin['id'];
        $_SESSION['user_type'] = 'admin';
        $_SESSION['token'] = $token;
        
        respond(true, [
            'user_id' => $admin['id'],
            'username' => $admin['username'],
            'name' => $admin['name'],
            'email' => $admin['email'],
            'role' => $admin['role'],
            'user_type' => 'admin',
            'token' => $token
        ], 'Admin login successful', 200);
    } else {
        respond(false, [], 'Invalid credentials', 401);
    }
}

function logoutUser() {
    session_destroy();
    respond(true, [], 'Logged out successfully', 200);
}

function verifyToken() {
    if (!isset($_SESSION['user_id'])) {
        respond(false, [], 'No active session', 401);
    }
    
    respond(true, [
        'user_id' => $_SESSION['user_id'],
        'user_type' => $_SESSION['user_type']
    ], 'Session valid', 200);
}

function signupStudent() {
    global $conn;
    
    $data = getJSON();
    
    // Validate required fields
    $required = ['student_id', 'name', 'email', 'password', 'department', 'phone'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            respond(false, [], "Missing required field: $field", 400);
            return;
        }
    }
    
    $studentId = sanitize($data['student_id']);
    $name = sanitize($data['name']);
    $email = sanitize($data['email']);
    $password = $data['password'];
    $department = sanitize($data['department']);
    $phone = sanitize($data['phone']);
    
    // Check if student ID already exists
    $stmt = $conn->prepare("SELECT id FROM students WHERE student_id = ?");
    $stmt->bind_param("s", $studentId);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        respond(false, [], 'Student ID already exists', 400);
        return;
    }
    
    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM students WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        respond(false, [], 'Email already registered', 400);
        return;
    }
    
    // Hash password
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);
    
    // Insert new student
    $stmt = $conn->prepare("INSERT INTO students (student_id, name, email, password_hash, department, phone) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $studentId, $name, $email, $passwordHash, $department, $phone);
    
    if ($stmt->execute()) {
        respond(true, [
            'student_id' => $studentId,
            'name' => $name,
            'email' => $email
        ], 'Account created successfully! Please login.', 201);
    } else {
        respond(false, [], 'Registration failed. Please try again.', 500);
    }
}
?>
