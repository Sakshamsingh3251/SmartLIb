<?php
/**
 * SmartLib API - Bookings and User Management
 * Get bookings, user info, activity logs
 */

session_start();
require_once '../backend/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    if ($action === 'my_bookings') {
        getMyBookings();
    } elseif ($action === 'all_bookings') {
        getAllBookings();
    } elseif ($action === 'active_users') {
        getActiveUsers();
    } elseif ($action === 'booking_stats') {
        getBookingStats();
    } elseif ($action === 'user_profile') {
        getUserProfile();
    }
}

function getMyBookings() {
    global $conn;
    
    if (!isset($_SESSION['user_id'])) {
        respond(false, [], 'Unauthorized', 401);
    }
    
    $studentId = $_SESSION['user_id'];
    
    $stmt = $conn->prepare("SELECT b.id, b.booking_id, s.seat_id, s.zone, s.amenities, b.status, 
                           b.reserved_at, b.expires_at, b.checked_in_at, b.checked_out_at,
                           TIME_FORMAT(SEC_TO_TIME(UNIX_TIMESTAMP(b.expires_at) - UNIX_TIMESTAMP(NOW())), '%i:%s') as time_left
                           FROM bookings b
                           JOIN seats s ON b.seat_id = s.id
                           WHERE b.student_id = ? 
                           ORDER BY b.reserved_at DESC
                           LIMIT 50");
    $stmt->bind_param("i", $studentId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        $bookings[] = [
            'booking_id' => $row['booking_id'],
            'seat_id' => $row['seat_id'],
            'zone' => $row['zone'],
            'amenities' => $row['amenities'],
            'status' => $row['status'],
            'reserved_at' => $row['reserved_at'],
            'expires_at' => $row['expires_at'],
            'checked_in_at' => $row['checked_in_at'],
            'checked_out_at' => $row['checked_out_at'],
            'time_left' => $row['time_left']
        ];
    }
    
    respond(true, ['bookings' => $bookings], 'Bookings retrieved', 200);
}

function getAllBookings() {
    global $conn;
    
    if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
        respond(false, [], 'Admin access required', 403);
    }
    
    $query = "SELECT b.id, b.booking_id, s.seat_id, s.zone, st.name as student_name, st.student_id, 
              b.status, b.reserved_at, b.expires_at, b.checked_in_at, b.checked_out_at
              FROM bookings b
              JOIN seats s ON b.seat_id = s.id
              JOIN students st ON b.student_id = st.id
              ORDER BY b.reserved_at DESC
              LIMIT 200";
    
    $result = $conn->query($query);
    
    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        $bookings[] = [
            'booking_id' => $row['booking_id'],
            'student_name' => $row['student_name'],
            'student_id' => $row['student_id'],
            'seat_id' => $row['seat_id'],
            'zone' => $row['zone'],
            'status' => $row['status'],
            'reserved_at' => $row['reserved_at'],
            'expires_at' => $row['expires_at'],
            'checked_in_at' => $row['checked_in_at'],
            'checked_out_at' => $row['checked_out_at']
        ];
    }
    
    respond(true, ['bookings' => $bookings], 'All bookings retrieved', 200);
}

function getActiveUsers() {
    global $conn;
    
    if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
        respond(false, [], 'Admin access required', 403);
    }
    
    $query = "SELECT DISTINCT st.id, st.student_id, st.name, s.seat_id, s.zone, b.checked_in_at
              FROM bookings b
              JOIN seats s ON b.seat_id = s.id
              JOIN students st ON b.student_id = st.id
              WHERE b.status = 'checked_in'
              ORDER BY b.checked_in_at DESC";
    
    $result = $conn->query($query);
    
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = [
            'student_id' => $row['student_id'],
            'name' => $row['name'],
            'seat_id' => $row['seat_id'],
            'zone' => $row['zone'],
            'checked_in_at' => $row['checked_in_at']
        ];
    }
    
    respond(true, ['active_users' => $users, 'count' => count($users)], 'Active users retrieved', 200);
}

function getBookingStats() {
    global $conn;
    
    if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
        respond(false, [], 'Admin access required', 403);
    }
    
    // Total bookings today
    $todayResult = $conn->query("SELECT COUNT(*) as count FROM bookings WHERE DATE(created_at) = CURDATE()")->fetch_assoc();
    
    // Active bookings
    $activeResult = $conn->query("SELECT COUNT(*) as count FROM bookings WHERE status IN ('reserved', 'checked_in')")->fetch_assoc();
    
    // Completed bookings today
    $completedResult = $conn->query("SELECT COUNT(*) as count FROM bookings WHERE status = 'checked_out' AND DATE(checked_out_at) = CURDATE()")->fetch_assoc();
    
    // Expired bookings
    $expiredResult = $conn->query("SELECT COUNT(*) as count FROM bookings WHERE status = 'expired' AND DATE(created_at) = CURDATE()")->fetch_assoc();
    
    respond(true, [
        'bookings_today' => $todayResult['count'],
        'active_bookings' => $activeResult['count'],
        'completed_today' => $completedResult['count'],
        'expired_today' => $expiredResult['count']
    ], 'Stats retrieved', 200);
}

function getUserProfile() {
    global $conn;
    
    if (!isset($_SESSION['user_id'])) {
        respond(false, [], 'Unauthorized', 401);
    }
    
    $userId = $_SESSION['user_id'];
    $userType = $_SESSION['user_type'];
    
    if ($userType === 'student') {
        $stmt = $conn->prepare("SELECT id, student_id, name, email, department, phone, created_at FROM students WHERE id = ?");
    } else {
        $stmt = $conn->prepare("SELECT id, username, name, email, role, created_at FROM admins WHERE id = ?");
    }
    
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        respond(false, [], 'User not found', 404);
    }
    
    $user = $result->fetch_assoc();
    
    respond(true, ['user' => $user], 'User profile retrieved', 200);
}
?>
