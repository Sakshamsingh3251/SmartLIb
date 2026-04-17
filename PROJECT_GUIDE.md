# SmartLib - Full Stack Library Seat & Rack Management System

A complete full-stack web application for intelligent library management with real-time seat booking, book tracking, and admin controls.

## 📋 Project Overview

SmartLib is a modern library management system with:
- ✅ Real-time seat booking with 10-minute hold timers
- ✅ Book inventory management across multiple racks
- ✅ Student portal for browsing and booking
- ✅ Admin dashboard for complete system control
- ✅ Zone-based seat organization
- ✅ Genre-based book cataloging
- ✅ Active user tracking
- ✅ Timer-based seat release management

---

## 🏗️ Project Architecture

### Frontend Structure
```
smartlib/
├── index.html              # Landing page
├── pages/
│   ├── login.html         # Login page (Student & Admin)
│   ├── student.html       # Student portal
│   └── admin.html         # Admin dashboard
├── css/
│   └── style.css          # All styling
└── js/
    ├── app.js             # Core utilities & API functions
    ├── data.js            # Demo data (fallback)
    ├── student.js         # Student page logic
    └── admin.js           # Admin page logic
```

### Backend Structure
```
backend/
├── config.php             # Database connection & utilities
└── database.sql           # Database schema

api/
├── auth.php              # Authentication (login/logout)
├── seats.php             # Seat management APIs
├── books.php             # Book & rack management
└── bookings.php          # Booking history & stats
```

---

## 🛠️ Installation & Setup Guide

### Prerequisites
- **XAMPP** (or similar PHP/MySQL server)
- **PHP** 7.4+
- **MySQL** 5.7+
- **Web Browser** (Chrome, Firefox, Safari, Edge)

### Step 1: Download & Extract Project
```bash
# Download the project
# Extract to: C:\xampp\htdocs\smartlib
```

### Step 2: Configure XAMPP
1. Open **XAMPP Control Panel**
2. Start **Apache** and **MySQL** services
3. Both should show "running" status

### Step 3: Create Database
1. Open **phpMyAdmin**: http://localhost/phpmyadmin
2. Click **New** database
3. Name it: `smartlib_db`
4. Select **utf8mb4_unicode_ci** collation
5. Click **Create**
6. Go to **Import** tab
7. Select `backend/database.sql`
8. Click **Go** to import schema

### Step 4: Update Database Credentials (if needed)
Edit `backend/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');        // Your MySQL username
define('DB_PASS', '');             // Your MySQL password
define('DB_NAME', 'smartlib_db');
```

### Step 5: Access the Application
- **Landing Page**: http://localhost/smartlib/
- **Login Page**: http://localhost/smartlib/pages/login.html
- **phpMyAdmin**: http://localhost/phpmyadmin

---

## 🔐 Demo Credentials

### Student Login
- **ID**: `student` | **Password**: `1234`
- **ID**: `STU001` | **Password**: `pass1`
- **ID**: `STU002` | **Password**: `pass2`
- **ID**: `STU003` | **Password**: `pass3`

### Admin Login
- **Username**: `admin`
- **Password**: `admin`
- **Admin Key**: `123456`

---

## 📱 Features Explanation

### For Students

#### 1. **Find a Seat** 
- Browse all available seats across different zones
- Filter by zone: Reading Hall, Computer Lab, Discussion Room, Quiet Zone
- Search by seat ID
- Real-time availability status (🪑 Available, ⏳ Reserved, ✅ Occupied)

**How It Works:**
```
1. Click "Find a Seat" in sidebar
2. Browse available seats (green 🪑)
3. Click a seat to reserve it
4. 10-minute timer starts
5. Walk to the seat and click "Check In"
6. Seat now marked as occupied (✅)
```

#### 2. **Browse Books**
- Search entire book collection by title/author/genre
- Filter by genre (Science, Literature, History, Tech, Math, Philosophy)
- View rack location and availability status
- See which books are available or borrowed

**Features:**
- Books show author, title, and availability
- Borrowed books show due dates (if implemented)
- Expand/collapse racks for better view
- Real-time inventory counts

#### 3. **My Bookings**
- View all active and past reservations
- See countdown timer for active holds
- Cancel reservation if needed (before time expires)
- Check-in confirmation when at seat
- Booking history with check-in/check-out times

### For Admins

#### 1. **Dashboard Overview**
- **Real-time statistics**:
  - Total seats and availability
  - Books in collection vs on shelf
  - Reserved and occupied seats
  - Zone utilization percentages

- **Sections**:
  - Recent reservations table
  - Zone utilization charts
  - Active user list
  - Book collection stats

#### 2. **Seat Manager**
- **View all seats** with status indicators
- **Update seat status** manually:
  - Mark as Available (🪑)
  - Mark as Reserved (⏳)
  - Mark as Occupied (✅)
  - Handle maintenance issues

- **Search & filter** by zone or seat ID
- **QR codes** for each seat
- **Admin override** capabilities

#### 3. **Rack Manager**
- **View all racks** with genre info
- **See book distribution** across racks
- **Track capacity** utilization
- **Add new racks** to system
- **Manage rack locations** and metadata

#### 4. **Book Inventory**
- **Browse entire collection** by genre
- **Track book status**: Available, Borrowed, Reserved
- **See borrower information** and due dates
- **Add new books** to racks
- **Search functionality** by title/author

#### 5. **Active Users**
- **Real-time list** of checked-in students
- **Current seat information** for each user
- **Check-in time** and duration
- **User contact information**

---

## 🔄 Booking Process Flow

### Student Booking Journey
```
Login
  ↓
[Find a Seat]
  ↓
Click Available Seat (🪑)
  ↓
Reserve Modal Opens
  • Shows seat details
  • Displays 10-minute timer
  • Shows QR code
  ↓
[Walk to Physical Seat]
  ↓
Scan QR Code or Click "Check In"
  ↓
Seat Status: Occupied (✅)
  ↓
"My Bookings" shows: Checked In
  ↓
[Leave Seat]
  ↓
Click "Check Out" (if available)
  ↓
Seat returns to Available
```

### Timer Behavior
- **10 minutes**: Full time (green)
- **2 minutes remaining**: Timer turns red
- **Time expires**: Seat automatically released
- **Student can cancel**: Release hold manually

---

## 🗄️ Database Schema

### Key Tables

**students**
- ID, student_id, name, email, password_hash
- Department, phone, created_at

**admins**
- ID, username, password_hash, admin_key
- Name, email, role, created_at

**seats**
- ID, seat_id, zone, amenities, status
- reserved_by, occupied_by, booking_expires_at

**bookings** (Reservations)
- ID, booking_id, student_id, seat_id
- Status: reserved, checked_in, checked_out, expired, cancelled
- reserved_at, expires_at, checked_in_at, checked_out_at

**books**
- ID, isbn, title, author, genre
- rack_id, status, borrowed_by, due_date

**racks**
- ID, rack_id, name, genre, location, capacity

**borrow_records**
- ID, record_id, student_id, book_id
- borrowed_at, due_date, returned_at, fine_amount

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth.php?action=login` - Login (student/admin)
- `POST /api/auth.php?action=logout` - Logout
- `GET /api/auth.php?action=verify` - Verify session

### Seats
- `GET /api/seats.php?action=get` - Get all seats
- `GET /api/seats.php?action=get_zones` - Get zones list
- `GET /api/seats.php?action=get_available` - Get available seats
- `POST /api/seats.php?action=book` - Book a seat
- `POST /api/seats.php?action=check_in` - Check-in to seat
- `POST /api/seats.php?action=check_out` - Check-out from seat
- `POST /api/seats.php?action=release` - Release/cancel booking
- `PUT /api/seats.php?action=update_status` - Admin: Update seat status

### Books & Racks
- `GET /api/books.php?action=get_all` - Get all books
- `GET /api/books.php?action=get_racks` - Get all racks
- `GET /api/books.php?action=get_rack_books` - Get books in specific rack
- `GET /api/books.php?action=get_genres` - Get genres
- `POST /api/books.php?action=borrow` - Borrow a book
- `POST /api/books.php?action=return` - Return a book
- `POST /api/books.php?action=add_book` - Admin: Add book

### Bookings & Users
- `GET /api/bookings.php?action=my_bookings` - Get my bookings
- `GET /api/bookings.php?action=all_bookings` - Admin: Get all bookings
- `GET /api/bookings.php?action=active_users` - Admin: Get active users
- `GET /api/bookings.php?action=booking_stats` - Admin: Get statistics
- `GET /api/bookings.php?action=user_profile` - Get profile

---

## 🎨 Seat Status System

| Status | Symbol | Color | Meaning |
|--------|--------|-------|---------|
| Available | 🪑 | Green | Can be booked now |
| Reserved | ⏳ | Yellow | On hold (10 min timer) |
| Occupied | ✅ | Red | Student checked in |
| Maintenance | 🔧 | Gray | Not available |

---

## 📊 Seat Zones

1. **Reading Hall** (A01-A08)
   - General study area
   - Window seats, power outlets
   - Good for focused reading

2. **Computer Lab** (B01-B06)
   - All seats have PCs
   - Individual power outlets
   - For digital work

3. **Discussion Room** (C01-C04)
   - Group study area
   - Whiteboards available
   - For collaborative work

4. **Quiet Zone** (D01-D06)
   - Silent study area
   - Soundproof
   - For concentration

---

## 🐛 Troubleshooting

### Issue: "Connection error" on login
**Solution**: 
1. Make sure XAMPP MySQL is running
2. Check database credentials in `backend/config.php`
3. Verify database was created
4. Try demo credentials (they work offline)

### Issue: Bookings not saving
**Solution**:
1. Check browser console (F12) for errors
2. Verify API endpoints are accessible
3. Check `api/bookings.php` permissions
4. Use local fallback mode if backend unavailable

### Issue: Database import failed
**Solution**:
1. Make sure database is empty
2. Try importing in smaller chunks
3. Check file encoding (should be UTF-8)
4. Verify phpMyAdmin is accessible

### Issue: Seat QR codes not showing
**Solution**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Reload page
3. Check browser console for JS errors
4. QR codes are for demo (visual representation)

---

## 🚀 Performance Tips

1. **Clear old bookings**: Archive expired bookings regularly
2. **Database indexing**: Indexes on `student_id`, `seat_id`, `status`
3. **API response**: Paginate large results
4. **Frontend caching**: Use browser localStorage for zones/genres

---

## 📝 License

SmartLib © 2024 - Educational Project

---

## 👨‍💻 Technical Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- FontAwesome Icons
- Responsive Design (Mobile-first)

**Backend:**
- PHP 7.4+
- MySQL 5.7+
- RESTful API architecture
- Session management

**Deployment:**
- XAMPP (Local development)
- Can be deployed on shared hosting with PHP+MySQL

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review database.sql for schema
3. Check API endpoints in respective files
4. Review browser console for JavaScript errors
5. Verify all files are in correct directories

---

**Version**: 1.0  
**Last Updated**: April 2024  
**Status**: Production Ready ✅

