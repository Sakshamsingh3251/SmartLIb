-- SmartLib Database Schema
-- Run this script in phpMyAdmin or MySQL console

CREATE DATABASE IF NOT EXISTS smartlib_v2;
USE smartlib_v2;

-- Students Table
CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  phone VARCHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student_id (student_id),
  INDEX idx_email (email)
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  admin_key VARCHAR(6) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username)
);

-- Seats Table
CREATE TABLE IF NOT EXISTS seats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  seat_id VARCHAR(20) UNIQUE NOT NULL,
  zone VARCHAR(100) NOT NULL,
  amenities TEXT,
  status ENUM('available', 'reserved', 'occupied', 'maintenance') DEFAULT 'available',
  reserved_by INT NULL,
  occupied_by INT NULL,
  reserved_at TIMESTAMP NULL,
  occupied_at TIMESTAMP NULL,
  booking_expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_seat_id (seat_id),
  INDEX idx_zone (zone),
  INDEX idx_status (status),
  FOREIGN KEY (reserved_by) REFERENCES students(id) ON DELETE SET NULL,
  FOREIGN KEY (occupied_by) REFERENCES students(id) ON DELETE SET NULL
);

-- Bookings/Reservations Table
CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id VARCHAR(50) UNIQUE NOT NULL,
  student_id INT NOT NULL,
  seat_id INT NOT NULL,
  status ENUM('reserved', 'checked_in', 'checked_out', 'expired', 'cancelled') DEFAULT 'reserved',
  reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  checked_in_at TIMESTAMP NULL,
  checked_out_at TIMESTAMP NULL,
  duration_minutes INT DEFAULT 600,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_booking_id (booking_id),
  INDEX idx_student_id (student_id),
  INDEX idx_seat_id (seat_id),
  INDEX idx_status (status),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE
);

-- Racks Table
CREATE TABLE IF NOT EXISTS racks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rack_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  genre VARCHAR(100),
  location VARCHAR(200),
  capacity INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_rack_id (rack_id),
  INDEX idx_genre (genre)
);

-- Books Table
CREATE TABLE IF NOT EXISTS books (
  id INT PRIMARY KEY AUTO_INCREMENT,
  isbn VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(150) NOT NULL,
  genre VARCHAR(100),
  publication_year INT,
  rack_id INT NOT NULL,
  status ENUM('available', 'borrowed', 'reserved', 'damaged', 'lost') DEFAULT 'available',
  borrowed_by INT NULL,
  borrowed_at TIMESTAMP NULL,
  due_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_isbn (isbn),
  INDEX idx_title (title),
  INDEX idx_genre (genre),
  INDEX idx_rack_id (rack_id),
  INDEX idx_status (status),
  FOREIGN KEY (rack_id) REFERENCES racks(id) ON DELETE CASCADE,
  FOREIGN KEY (borrowed_by) REFERENCES students(id) ON DELETE SET NULL
);

-- Borrow Records Table
CREATE TABLE IF NOT EXISTS borrow_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  record_id VARCHAR(50) UNIQUE NOT NULL,
  student_id INT NOT NULL,
  book_id INT NOT NULL,
  borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE NOT NULL,
  returned_at TIMESTAMP NULL,
  fine_amount DECIMAL(10, 2) DEFAULT 0,
  fine_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_record_id (record_id),
  INDEX idx_student_id (student_id),
  INDEX idx_book_id (book_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  user_type ENUM('student', 'admin') NOT NULL,
  action VARCHAR(100),
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_user_type (user_type),
  INDEX idx_created_at (created_at)
);

-- Session Table for backend
CREATE TABLE IF NOT EXISTS sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  user_type ENUM('student', 'admin') NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  INDEX idx_token (token),
  INDEX idx_user_id (user_id)
);

-- Insert Default Admin
REPLACE INTO admins (username, password_hash, admin_key, name, email, role) 
VALUES ('admin', '$2y$10$4B.a4c6W6K0Q6L8b8M4KYeKk6L8b8M4KYeKk6L8b8M4KYeKk6L8b8M', '123456', 'Dr. Meena Kapoor', 'admin@smartlib.local', 'super_admin');

-- Insert Default Students
REPLACE INTO students (student_id, name, email, password_hash, department, phone)
VALUES 
  ('student', 'Alex Johnson', 'student@smartlib.local', '$2y$10$4B.a4c6W6K0Q6L8b8M4KYeKk6L8b8M4KYeKk6L8b8M4KYeKk6L8b8M', 'Engineering', '9876543210'),
  ('STU001', 'Priya Sharma', 'priya@smartlib.local', '$2y$10$4B.a4c6W6K0Q6L8b8M4KYeKk6L8b8M4KYeKk6L8b8M4KYeKk6L8b8M', 'Computer Science', '9876543211'),
  ('STU002', 'Rahul Mehta', 'rahul@smartlib.local', '$2y$10$4B.a4c6W6K0Q6L8b8M4KYeKk6L8b8M4KYeKk6L8b8M4KYeKk6L8b8M', 'Information Technology', '9876543212'),
  ('STU003', 'Ananya Singh', 'ananya@smartlib.local', '$2y$10$4B.a4c6W6K0Q6L8b8M4KYeKk6L8b8M4KYeKk6L8b8M4KYeKk6L8b8M', 'Electronics', '9876543213'),
  ('STU004', 'Dev Nair', 'dev@smartlib.local', '$2y$10$4B.a4c6W6K0Q6L8b8M4KYeKk6L8b8M4KYeKk6L8b8M4KYeKk6L8b8M', 'Mechanical', '9876543214'),
  ('STU005', 'Tanvi Desai', 'tanvi@smartlib.local', '$2y$10$4B.a4c6W6K0Q6L8b8M4KYeKk6L8b8M4KYeKk6L8b8M4KYeKk6L8b8M', 'Civil', '9876543215');

-- Insert Racks
REPLACE INTO racks (rack_id, name, genre, location, capacity)
VALUES 
  ('rack-1', 'Science Rack', 'Science', 'Aisle 1, Row A', 60),
  ('rack-2', 'Literature Rack', 'Literature', 'Aisle 1, Row B', 80),
  ('rack-3', 'History Rack', 'History', 'Aisle 2, Row A', 50),
  ('rack-4', 'Technology Rack', 'Technology', 'Aisle 2, Row B', 45),
  ('rack-5', 'Mathematics Rack', 'Mathematics', 'Aisle 3, Row A', 40),
  ('rack-6', 'Philosophy Rack', 'Philosophy', 'Aisle 3, Row B', 35);

-- Insert Books
REPLACE INTO books (isbn, title, author, genre, publication_year, rack_id, status)
SELECT * FROM (
  SELECT '978-0553380163', 'A Brief History of Time', 'Stephen Hawking', 'Science', 1988, 1, 'available'
  UNION ALL SELECT '978-0198788607', 'The Selfish Gene', 'Richard Dawkins', 'Science', 1976, 1, 'borrowed'
  UNION ALL SELECT '978-0345539434', 'Cosmos', 'Carl Sagan', 'Science', 1980, 1, 'available'
  UNION ALL SELECT '978-0393950755', 'The Double Helix', 'James D. Watson', 'Science', 1968, 1, 'borrowed'
  UNION ALL SELECT '978-0393316049', 'Surely You\'re Joking', 'R. Feynman', 'Science', 1985, 1, 'available'
  UNION ALL SELECT '978-0061935466', 'To Kill a Mockingbird', 'Harper Lee', 'Literature', 1960, 2, 'available'
  UNION ALL SELECT '978-0451524935', '1984', 'George Orwell', 'Literature', 1949, 2, 'borrowed'
  UNION ALL SELECT '978-0141439518', 'Pride and Prejudice', 'Jane Austen', 'Literature', 1813, 2, 'available'
  UNION ALL SELECT '978-0743273565', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Literature', 1925, 2, 'available'
  UNION ALL SELECT '978-0060850524', 'Brave New World', 'Aldous Huxley', 'Literature', 1932, 2, 'available'
  UNION ALL SELECT '978-0062316097', 'Sapiens', 'Yuval Noah Harari', 'History', 2011, 3, 'borrowed'
  UNION ALL SELECT '978-0393354324', 'Guns, Germs, and Steel', 'Jared Diamond', 'History', 1997, 3, 'available'
  UNION ALL SELECT '978-1101946329', 'The Silk Roads', 'Peter Frankopan', 'History', 2015, 3, 'available'
  UNION ALL SELECT '978-1476708706', 'The Innovators', 'Walter Isaacson', 'Technology', 2014, 4, 'available'
  UNION ALL SELECT '978-0132350884', 'Clean Code', 'Robert C. Martin', 'Technology', 2008, 4, 'borrowed'
  UNION ALL SELECT '978-0135957059', 'The Pragmatic Programmer', 'David Thomas', 'Technology', 2019, 4, 'available'
  UNION ALL SELECT '978-1857025217', 'Fermat\'s Last Theorem', 'Simon Singh', 'Mathematics', 1997, 5, 'available'
  UNION ALL SELECT '978-0465026562', 'Gödel, Escher, Bach', 'Douglas Hofstadter', 'Mathematics', 1979, 5, 'available'
  UNION ALL SELECT '978-0140449334', 'Meditations', 'Marcus Aurelius', 'Philosophy', 170, 6, 'available'
  UNION ALL SELECT '978-0679724650', 'Beyond Good and Evil', 'Friedrich Nietzsche', 'Philosophy', 1886, 6, 'borrowed'
) AS temp;

-- Insert Seats
REPLACE INTO seats (seat_id, zone, amenities, status)
VALUES 
  ('A-01', 'Reading Hall', 'Window, Power outlet', 'available'),
  ('A-02', 'Reading Hall', 'Power outlet', 'available'),
  ('A-03', 'Reading Hall', 'Window view', 'available'),
  ('A-04', 'Reading Hall', 'Lamp, Power outlet', 'available'),
  ('A-05', 'Reading Hall', 'Quiet zone', 'available'),
  ('A-06', 'Reading Hall', 'Power outlet', 'available'),
  ('A-07', 'Reading Hall', 'Window, Lamp', 'available'),
  ('A-08', 'Reading Hall', 'Quiet zone', 'available'),
  ('B-01', 'Computer Lab', 'PC, Power outlet', 'available'),
  ('B-02', 'Computer Lab', 'PC, Power outlet', 'available'),
  ('B-03', 'Computer Lab', 'PC, Power outlet', 'available'),
  ('B-04', 'Computer Lab', 'PC, Power outlet', 'available'),
  ('B-05', 'Computer Lab', 'PC, Power outlet', 'available'),
  ('B-06', 'Computer Lab', 'PC, Power outlet', 'available'),
  ('C-01', 'Discussion Room', 'Whiteboard, Group table', 'available'),
  ('C-02', 'Discussion Room', 'Whiteboard', 'available'),
  ('C-03', 'Discussion Room', 'Power outlet', 'available'),
  ('C-04', 'Discussion Room', 'Whiteboard', 'available'),
  ('D-01', 'Quiet Zone', 'Soundproof, Lamp', 'available'),
  ('D-02', 'Quiet Zone', 'Soundproof, Lamp', 'available'),
  ('D-03', 'Quiet Zone', 'Soundproof, Window', 'available'),
  ('D-04', 'Quiet Zone', 'Soundproof, Power', 'available'),
  ('D-05', 'Quiet Zone', 'Soundproof, Lamp', 'available'),
  ('D-06', 'Quiet Zone', 'Soundproof', 'available');
