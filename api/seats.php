<?php
/**
 * SmartLib API - Seats Management
 */

session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../backend/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    if ($action === 'get') {
        getSeats();
    } elseif ($action === 'get_single') {
        getSingleSeat();
    } elseif ($action === 'get_zones') {
        getZones();
    } elseif ($action === 'get_available') {
        getAvailableSeats();
    }
} elseif ($method === 'POST') {
    if ($action === 'book') {
        bookSeat();
    } elseif ($action === 'check_in') {
        checkInSeat();
    } elseif ($action === 'check_out') {
        checkOutSeat();
    } elseif ($action === 'release') {
        releaseSeat();
    }
}

function getSeats() {
    global $conn;
    
    $query = "SELECT s.*, st.name as reserved_by_name, ot.name as occupied_by_name
              FROM seats s
              LEFT JOIN students st ON s.reserved_by = st.id
              LEFT JOIN students ot ON s.occupied_by = ot.id
              ORDER BY s.zone, s.seat_id";
    
    $result = $conn->query($query);
    
    if (!$result) {
        respond(false, [], 'Query failed: ' . $conn->error, 500);
    }
    
    $seats = [];
    while ($row = $result->fetch_assoc()) {
        $seats[] = [
            'id' => $row['id'],
            'seat_id' => $row['seat_id'],
            'zone' => $row['zone'],
            'amenities' => $row['amenities'],
            'status' => $row['status'],
            'reserved_by' => $row['reserved_by_name'],
            'occupied_by' => $row['occupied_by_name'],
            'reserved_at' => $row['reserved_at'],
            'occupied_at' => $row['occupied_at'],
            'booking_expires_at' => $row['booking_expires_at']
        ];
    }
    
    respond(true, ['seats' => $seats], 'Seats retrieved successfully', 200);
}

function getSingleSeat() {
    global $conn;
    
    if (!isset($_GET['seat_id'])) {
        respond(false, [], 'Seat ID required', 400);
    }
    
    $seatId = sanitize($_GET['seat_id']);
    
    $stmt = $conn->prepare("SELECT s.*, st.name as reserved_by_name
                           FROM seats s
                           LEFT JOIN students st ON s.reserved_by = st.id
                           WHERE s.seat_id = ?");
    $stmt->bind_param("s", $seatId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        respond(false, [], 'Seat not found', 404);
    }
    
    $seat = $result->fetch_assoc();
    
    $seatData = [
        'id' => $seat['id'],
        'seat_id' => $seat['seat_id'],
        'zone' => $seat['zone'],
        'amenities' => $seat['amenities'],
        'status' => $seat['status'],
        'reserved_by' => $seat['reserved_by_name'],
        'reserved_at' => $seat['reserved_at'],
        'booking_expires_at' => $seat['booking_expires_at']
    ];
    
    respond(true, ['seat' => $seatData], 'Seat retrieved', 200);
}

function getZones() {
    global $conn;
    
    $result = $conn->query("SELECT DISTINCT zone FROM seats ORDER BY zone");
    $zones = [];
    
    while ($row = $result->fetch_assoc()) {
        $zones[] = $row['zone'];
    }
    
    respond(true, ['zones' => $zones], 'Zones retrieved', 200);
}

function getAvailableSeats() {
    global $conn;
    
    if (!isset($_GET['zone']) || $_GET['zone'] === 'All') {
        $result = $conn->query("SELECT * FROM seats WHERE status = 'available' ORDER BY zone, seat_id");
    } else {
        $zone = sanitize($_GET['zone']);
        $stmt = $conn->prepare("SELECT * FROM seats WHERE zone = ? AND status = 'available' ORDER BY seat_id");
        $stmt->bind_param("s", $zone);
        $stmt->execute();
        $result = $stmt->get_result();
    }
    
    $seats = [];
    while ($row = $result->fetch_assoc()) {
        $seats[] = $row;
    }
    
    respond(true, ['seats' => $seats], 'Available seats retrieved', 200);
}

function bookSeat() {
    global $conn;
    
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $studentId = (int)($_SESSION['user_id'] ?? $data['student_id'] ?? 0);
    $seatId = $data['seat_id'] ?? '';
    
    if (!$studentId || !$seatId) {
        respond(false, [], 'Missing user or seat ID', 400);
    }
    
    // Check active bookings
    $q1 = $conn->prepare("SELECT COUNT(*) as c FROM bookings WHERE student_id=? AND status IN ('reserved','checked_in')");
    $q1->bind_param("i", $studentId);
    $q1->execute();
    $r1 = $q1->get_result()->fetch_assoc();
    if ($r1['c'] > 0) {
        respond(false, [], 'Already have active booking', 400);
    }
    
    // Get seat
    $q2 = $conn->prepare("SELECT id FROM seats WHERE seat_id=? AND status='available'");
    $q2->bind_param("s", $seatId);
    $q2->execute();
    $r2 = $q2->get_result();
    if ($r2->num_rows === 0) {
        respond(false, [], 'Seat unavailable', 400);
    }
    
    $row = $r2->fetch_assoc();
    $seatDbId = (int)$row['id'];
    $bookingId = 'BK' . time() . $studentId;
    $expires = date('Y-m-d H:i:s', time() + 600);
    
    // Create booking
    $q3 = $conn->prepare("INSERT INTO bookings (booking_id, student_id, seat_id, status, expires_at) VALUES (?, ?, ?, 'reserved', ?)");
    $q3->bind_param("siis", $bookingId, $studentId, $seatDbId, $expires);
    $q3->execute();
    
    // Update seat
    $q4 = $conn->prepare("UPDATE seats SET status='reserved', reserved_by=?, reserved_at=NOW(), booking_expires_at=? WHERE id=?");
    $q4->bind_param("isi", $studentId, $expires, $seatDbId);
    $q4->execute();
    
    respond(true, ['booking_id' => $bookingId, 'seat_id' => $seatId, 'expires_at' => $expires], 'Booked', 200);
}

function checkInSeat() {
    global $conn;
    
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $studentId = (int)($_SESSION['user_id'] ?? $data['student_id'] ?? 0);
    $seatId = $data['seat_id'] ?? '';
    
    if (!$studentId || !$seatId) {
        respond(false, [], 'Missing user or seat ID', 400);
    }
    
    // Get booking
    $q = $conn->prepare("SELECT b.id, s.id as sid FROM bookings b JOIN seats s ON b.seat_id=s.id WHERE s.seat_id=? AND b.student_id=? AND b.status='reserved'");
    $q->bind_param("si", $seatId, $studentId);
    $q->execute();
    $r = $q->get_result();
    if ($r->num_rows === 0) {
        respond(false, [], 'No reservation', 400);
    }
    
    $row = $r->fetch_assoc();
    $bid = (int)$row['id'];
    $sid = (int)$row['sid'];
    
    // Update booking
    $q1 = $conn->prepare("UPDATE bookings SET status='checked_in', checked_in_at=NOW() WHERE id=?");
    $q1->bind_param("i", $bid);
    $q1->execute();
    
    // Update seat
    $q2 = $conn->prepare("UPDATE seats SET status='occupied', occupied_by=?, occupied_at=NOW(), reserved_by=NULL WHERE id=?");
    $q2->bind_param("ii", $studentId, $sid);
    $q2->execute();
    
    respond(true, ['seat_id' => $seatId], 'Checked in', 200);
}

function checkOutSeat() {
    global $conn;
    
    if (!isset($_SESSION['user_id'])) {
        respond(false, [], 'Unauthorized', 401);
    }
    
    $data = getJSON();
    
    if (!isset($data['booking_id'])) {
        respond(false, [], 'Booking ID required', 400);
    }
    
    $studentId = $_SESSION['user_id'];
    $bookingId = sanitize($data['booking_id']);
    
    // Get booking
    $stmt = $conn->prepare("SELECT id, seat_id FROM bookings WHERE booking_id = ? AND student_id = ? AND status = 'checked_in'");
    $stmt->bind_param("si", $bookingId, $studentId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        respond(false, [], 'Booking not found', 400);
    }
    
    $booking = $result->fetch_assoc();
    $bookingDbId = $booking['id'];
    $seatId = $booking['seat_id'];
    
    // Update booking status
    $updateBooking = $conn->prepare("UPDATE bookings SET status = 'checked_out', checked_out_at = NOW() WHERE id = ?");
    $updateBooking->bind_param("i", $bookingDbId);
    $updateBooking->execute();
    
    // Update seat status
    $updateSeat = $conn->prepare("UPDATE seats SET status = 'available', occupied_by = NULL WHERE id = ?");
    $updateSeat->bind_param("i", $seatId);
    $updateSeat->execute();
    
    respond(true, [
        'booking_id' => $bookingId,
        'status' => 'checked_out'
    ], 'Checked out successfully', 200);
}

function releaseSeat() {
    global $conn;
    
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $studentId = (int)($_SESSION['user_id'] ?? $data['student_id'] ?? 0);
    $seatId = $data['seat_id'] ?? '';
    
    if (!$studentId || !$seatId) {
        respond(false, [], 'Missing user or seat ID', 400);
    }
    
    // Get booking
    $q = $conn->prepare("SELECT b.id, s.id as sid FROM bookings b JOIN seats s ON b.seat_id=s.id WHERE s.seat_id=? AND b.student_id=? AND b.status IN ('reserved','checked_in')");
    $q->bind_param("si", $seatId, $studentId);
    $q->execute();
    $r = $q->get_result();
    if ($r->num_rows === 0) {
        respond(false, [], 'No reservation', 400);
    }
    
    $row = $r->fetch_assoc();
    $bid = (int)$row['id'];
    $sid = (int)$row['sid'];
    
    // Cancel booking
    $q1 = $conn->prepare("UPDATE bookings SET status='cancelled' WHERE id=?");
    $q1->bind_param("i", $bid);
    $q1->execute();
    
    // Release seat
    $q2 = $conn->prepare("UPDATE seats SET status='available', reserved_by=NULL, occupied_by=NULL WHERE id=?");
    $q2->bind_param("i", $sid);
    $q2->execute();
    
    respond(true, ['seat_id' => $seatId], 'Released', 200);
}
?>
