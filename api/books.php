<?php
/**
 * SmartLib API - Books & Racks Management
 * Get books, borrow, return, rack management
 */

session_start();
require_once '../backend/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    if ($action === 'get_all') {
        getAllBooks();
    } elseif ($action === 'get_racks') {
        getRacks();
    } elseif ($action === 'get_rack_books') {
        getRackBooks();
    } elseif ($action === 'get_genres') {
        getGenres();
    }
} elseif ($method === 'POST') {
    if ($action === 'borrow') {
        borrowBook();
    } elseif ($action === 'return') {
        returnBook();
    } elseif ($action === 'add_book') {
        addBook();
    }
}

function getAllBooks() {
    global $conn;
    
    $query = "SELECT b.*, r.name as rack_name, r.genre, st.name as borrowed_by_name
              FROM books b
              LEFT JOIN racks r ON b.rack_id = r.id
              LEFT JOIN students st ON b.borrowed_by = st.id
              ORDER BY b.title";
    
    $result = $conn->query($query);
    
    if (!$result) {
        respond(false, [], 'Query failed: ' . $conn->error, 500);
    }
    
    $books = [];
    while ($row = $result->fetch_assoc()) {
        $books[] = [
            'id' => $row['id'],
            'isbn' => $row['isbn'],
            'title' => $row['title'],
            'author' => $row['author'],
            'genre' => $row['genre'],
            'publication_year' => $row['publication_year'],
            'rack_name' => $row['rack_name'],
            'status' => $row['status'],
            'borrowed_by' => $row['borrowed_by_name'],
            'due_date' => $row['due_date']
        ];
    }
    
    respond(true, ['books' => $books], 'Books retrieved', 200);
}

function getRacks() {
    global $conn;
    
    $result = $conn->query("SELECT * FROM racks ORDER BY genre, name");
    
    $racks = [];
    while ($row = $result->fetch_assoc()) {
        // Count books in rack
        $countStmt = $conn->prepare("SELECT COUNT(*) as count FROM books WHERE rack_id = ?");
        $countStmt->bind_param("i", $row['id']);
        $countStmt->execute();
        $countResult = $countStmt->get_result()->fetch_assoc();
        
        $racks[] = [
            'id' => $row['id'],
            'rack_id' => $row['rack_id'],
            'name' => $row['name'],
            'genre' => $row['genre'],
            'location' => $row['location'],
            'capacity' => $row['capacity'],
            'book_count' => $countResult['count']
        ];
    }
    
    respond(true, ['racks' => $racks], 'Racks retrieved', 200);
}

function getRackBooks() {
    global $conn;
    
    if (!isset($_GET['rack_id'])) {
        respond(false, [], 'Rack ID required', 400);
    }
    
    $rackId = (int)sanitize($_GET['rack_id']);
    
    $stmt = $conn->prepare("SELECT b.*, st.name as borrowed_by_name FROM books b
                           LEFT JOIN students st ON b.borrowed_by = st.id
                           WHERE b.rack_id = ? ORDER BY b.title");
    $stmt->bind_param("i", $rackId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $books = [];
    while ($row = $result->fetch_assoc()) {
        $books[] = [
            'id' => $row['id'],
            'isbn' => $row['isbn'],
            'title' => $row['title'],
            'author' => $row['author'],
            'status' => $row['status'],
            'borrowed_by' => $row['borrowed_by_name'],
            'due_date' => $row['due_date']
        ];
    }
    
    respond(true, ['books' => $books], 'Books retrieved', 200);
}

function getGenres() {
    global $conn;
    
    $result = $conn->query("SELECT DISTINCT genre FROM racks WHERE genre IS NOT NULL ORDER BY genre");
    
    $genres = [];
    while ($row = $result->fetch_assoc()) {
        $genres[] = $row['genre'];
    }
    
    respond(true, ['genres' => $genres], 'Genres retrieved', 200);
}

function borrowBook() {
    global $conn;
    
    if (!isset($_SESSION['user_id'])) {
        respond(false, [], 'Unauthorized', 401);
    }
    
    $data = getJSON();
    
    if (!isset($data['book_id'])) {
        respond(false, [], 'Book ID required', 400);
    }
    
    $studentId = $_SESSION['user_id'];
    $bookId = (int)$data['book_id'];
    
    // Check book availability
    $stmt = $conn->prepare("SELECT * FROM books WHERE id = ? AND status = 'available'");
    $stmt->bind_param("i", $bookId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        respond(false, [], 'Book not available', 400);
    }
    
    $book = $result->fetch_assoc();
    
    // Update book status
    $dueDate = date('Y-m-d', time() + (14 * 24 * 60 * 60)); // 14 days due date
    $updateBook = $conn->prepare("UPDATE books SET status = 'borrowed', borrowed_by = ?, borrowed_at = NOW(), due_date = ? WHERE id = ?");
    $updateBook->bind_param("isi", $studentId, $dueDate, $bookId);
    $updateBook->execute();
    
    // Create borrow record
    $recordId = 'BORROW-' . time() . '-' . $studentId;
    $insertRecord = $conn->prepare("INSERT INTO borrow_records (record_id, student_id, book_id, due_date) VALUES (?, ?, ?, ?)");
    $insertRecord->bind_param("sii", $recordId, $studentId, $bookId, $dueDate);
    $insertRecord->execute();
    
    respond(true, [
        'book_id' => $book['id'],
        'title' => $book['title'],
        'due_date' => $dueDate,
        'record_id' => $recordId
    ], 'Book borrowed successfully', 200);
}

function returnBook() {
    global $conn;
    
    if (!isset($_SESSION['user_id'])) {
        respond(false, [], 'Unauthorized', 401);
    }
    
    $data = getJSON();
    
    if (!isset($data['book_id'])) {
        respond(false, [], 'Book ID required', 400);
    }
    
    $studentId = $_SESSION['user_id'];
    $bookId = (int)$data['book_id'];
    
    // Check book
    $stmt = $conn->prepare("SELECT * FROM books WHERE id = ? AND borrowed_by = ?");
    $stmt->bind_param("ii", $bookId, $studentId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        respond(false, [], 'Book not found or not borrowed by you', 400);
    }
    
    $book = $result->fetch_assoc();
    
    // Calculate fine if overdue
    $fine = 0;
    if (strtotime($book['due_date']) < time()) {
        $daysOverdue = ceil((time() - strtotime($book['due_date'])) / (24 * 60 * 60));
        $fine = $daysOverdue * 5; // 5 per day fine
    }
    
    // Update book status
    $updateBook = $conn->prepare("UPDATE books SET status = 'available', borrowed_by = NULL, borrowed_at = NULL, due_date = NULL WHERE id = ?");
    $updateBook->bind_param("i", $bookId);
    $updateBook->execute();
    
    // Update borrow record
    $updateRecord = $conn->prepare("UPDATE borrow_records SET returned_at = NOW(), fine_amount = ? WHERE book_id = ? AND student_id = ? AND returned_at IS NULL");
    $updateRecord->bind_param("dii", $fine, $bookId, $studentId);
    $updateRecord->execute();
    
    respond(true, [
        'book_id' => $book['id'],
        'title' => $book['title'],
        'fine' => $fine,
        'status' => 'returned'
    ], 'Book returned successfully', 200);
}

function addBook() {
    global $conn;
    
    if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
        respond(false, [], 'Admin access required', 403);
    }
    
    $data = getJSON();
    
    if (!isset($data['title']) || !isset($data['author']) || !isset($data['isbn']) || !isset($data['rack_id'])) {
        respond(false, [], 'Missing required fields', 400);
    }
    
    $isbn = sanitize($data['isbn']);
    $title = sanitize($data['title']);
    $author = sanitize($data['author']);
    $genre = sanitize($data['genre'] ?? '');
    $year = (int)($data['publication_year'] ?? date('Y'));
    $rackId = (int)$data['rack_id'];
    
    $stmt = $conn->prepare("INSERT INTO books (isbn, title, author, genre, publication_year, rack_id, status)
                           VALUES (?, ?, ?, ?, ?, ?, 'available')");
    $stmt->bind_param("ssssii", $isbn, $title, $author, $genre, $year, $rackId);
    
    if ($stmt->execute()) {
        respond(true, [
            'book_id' => $conn->insert_id,
            'title' => $title
        ], 'Book added successfully', 200);
    } else {
        respond(false, [], 'Failed to add book: ' . $stmt->error, 500);
    }
}
?>
