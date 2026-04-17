# SmartLib - Complete Project Explanation (Simple Version)

## What is SmartLib?

SmartLib is a **smart library management system** - think of it as a website where students can:
- 📍 Find and reserve study seats in the library
- 📚 Browse and borrow books
- ⏱️ Track their bookings with a countdown timer
- 👨‍💼 Admins can manage seats, books, and users

It's like a mix of AirBnB (for booking seats) + a library system (for books).

---

## The Project Idea (Why was this built?)

**Problem:** 
- Students go to library but can't find seats
- Books aren't tracked properly
- No system to reserve or manage resources

**Solution:**
- Create a website where students can book seats from home
- Real-time seat availability shown
- Automatic timer holds seat for 10 minutes
- Book inventory is tracked
- Admins can manage everything

**Who uses it?**
- 👤 **Students** → Book seats, browse books, see bookings
- 👨‍💼 **Admins** → Manage seats, books, users, view statistics

---

## Tech Stack Explained (Simple Version)

Your project uses 3 main technologies. Think of them like layers of a building:

### Layer 1: FRONTEND (What users see) 🎨
**Technologies:** HTML, CSS, JavaScript

**HTML** = Structure (skeleton of the page)
- Creates buttons, forms, text boxes
- Like building the walls of a house

**CSS** = Styling (how it looks)
- Colors, sizes, layouts, animations
- Like painting and decorating the house

**JavaScript** = Interactivity (what happens when you click)
- Click a button → book a seat
- Fill form → create account
- Switch between pages
- Like adding electricity/automation to the house

**Files involved:**
- `index.html` → Landing page
- `pages/login.html` → Login/signup page
- `pages/student.html` → Student dashboard
- `pages/admin.html` → Admin dashboard
- `css/style.css` → All styling
- `js/app.js` → Common functions
- `js/student.js` → Student page logic
- `js/admin.js` → Admin page logic
- `js/data.js` → Demo data

### Layer 2: BACKEND (Brains of the system) 🧠
**Technology:** PHP

**What is PHP?**
- A programming language that runs on the server
- When user clicks something, PHP processes it
- Like a cashier processing your order

**What does it do?**
- Receives requests from frontend
- Talks to database
- Sends data back to frontend
- Handles login, signup, booking logic

**Files involved:**
- `api/auth.php` → Login/signup logic
- `api/seats.php` → Seat booking logic
- `api/books.php` → Book management logic
- `api/bookings.php` → Booking records

**How it works:**
```
User clicks "Book Seat" 
    ↓
JavaScript sends request to PHP
    ↓
PHP processes the request
    ↓
PHP saves to database
    ↓
PHP sends response back
    ↓
JavaScript updates the page
```

### Layer 3: DATABASE (Memory/Storage) 💾
**Technology:** MySQL

**What is MySQL?**
- A database = place to store data permanently
- Like a filing cabinet with organized drawers

**What does it store?**
- Student accounts (ID, name, email, password)
- Admin accounts
- Seat information (location, status)
- Book information (title, author, status)
- Booking records (who booked what seat when)
- Activity logs

**Files involved:**
- `backend/database.sql` → Database structure & demo data
- `backend/config.php` → Database connection settings

**Database tables (like spreadsheets):**
```
STUDENTS
├─ student_id (e.g., "STU001")
├─ name (e.g., "Priya Sharma")
├─ email
├─ password_hash (encrypted password)
├─ department
└─ phone

SEATS
├─ seat_id (e.g., "A-01")
├─ zone (e.g., "Reading Hall")
├─ status (available/reserved/occupied)
├─ amenities (e.g., "Window, Power outlet")
└─ reserved_by (which student)

BOOKS
├─ isbn (unique book code)
├─ title (e.g., "Cosmos")
├─ author
├─ genre
├─ rack_id (where it's located)
├─ status (available/borrowed)
└─ borrowed_by (which student)

BOOKINGS
├─ booking_id
├─ student_id
├─ seat_id
├─ status (reserved/checked_in/checked_out)
├─ reserved_at (when booked)
└─ expires_at (when reservation expires)
```

---

## How Everything Works Together

### When a student logs in:

```
1. User enters ID & password on login page (HTML form)
2. JavaScript collects the data
3. JavaScript sends it to PHP (via API)
4. PHP receives the data
5. PHP queries MySQL: "Is this student ID in the database?"
6. PHP checks: "Does password match what's stored?"
7. If yes → PHP creates session & sends "Success!"
8. JavaScript receives response → Takes user to dashboard
9. If no → Shows "Invalid credentials" error
```

### When a student books a seat:

```
1. Student clicks on an empty seat on the map
2. JavaScript detects the click
3. JavaScript sends: "Book seat A-01 for student STU001"
4. PHP receives request
5. PHP queries MySQL: "Is seat A-01 available?"
6. If yes → PHP updates database: "A-01 is now reserved by STU001"
7. PHP also creates a 10-minute timer
8. PHP sends response: "Booking successful!"
9. JavaScript updates the page:
   - Changes seat color to yellow
   - Shows timer counting down
   - Shows "You have 10 min to check in"
```

### When a student creates new account:

```
1. User fills signup form (name, email, password, etc.)
2. JavaScript validates: "Is email valid? Passwords match?"
3. If validation passes → JavaScript sends data to PHP
4. PHP validates again (security check)
5. PHP checks: "Is email/ID already used?"
6. If no → PHP hashes password (encrypts it for security)
7. PHP saves to database
8. JavaScript shows: "Account created! Redirecting to login..."
9. User can now login with their credentials
```

---

## File Organization (Folder Structure)

```
smartlib/
│
├─ index.html ..................... Landing page (Home)
│
├─ pages/
│  ├─ login.html .................. Login & signup page
│  ├─ student.html ................ Student dashboard
│  └─ admin.html .................. Admin dashboard
│
├─ css/
│  └─ style.css ................... All styling
│
├─ js/
│  ├─ app.js ...................... Common functions (API calls, sessions)
│  ├─ student.js .................. Student page logic (booking, etc.)
│  ├─ admin.js .................... Admin page logic
│  └─ data.js ..................... Demo data for testing
│
├─ api/
│  ├─ auth.php .................... Login/signup/logout
│  ├─ seats.php ................... Book/release seats
│  ├─ books.php ................... Browse/borrow books
│  └─ bookings.php ................ View booking history
│
└─ backend/
   ├─ database.sql ................ Database structure & demo data
   └─ config.php .................. Database connection settings
```

---

## Key Technologies Explained Simply

### HTML (HyperText Markup Language)
- Markup = just marking/tagging content
- Like writing on paper with labels
- Creates structure: buttons, text, forms, etc.
- **Example:** `<button onclick="bookSeat()">Book Seat</button>`

### CSS (Cascading Style Sheets)
- Makes things look nice
- Colors, fonts, sizes, layouts
- **Example:** `button { background-color: blue; padding: 10px; }`

### JavaScript
- Programming language for browsers
- Makes pages interactive
- Runs on user's computer
- **Example:**
```javascript
function bookSeat() {
  // When button clicked, this runs
  alert("Booking seat...");
}
```

### PHP
- Programming language for servers
- Runs on the company's computer (XAMPP)
- Handles business logic
- Talks to database
- **Example:**
```php
<?php
  $student_id = $_POST['student_id'];
  // Save to database
?>
```

### MySQL
- Database (organized data storage)
- Stores everything permanently
- Like a smart filing system
- **Example Query:**
```sql
SELECT * FROM students WHERE student_id = 'STU001';
// Gets all info about student STU001
```

### XAMPP
- Local development environment
- Bundles together: Apache (web server), MySQL (database), PHP
- Lets you run the website on your computer
- Like a mini version of the internet

---

## Security Features

### Password Hashing
- When user creates account, password is encrypted
- Even we can't see the real password
- Only encrypted version stored in database
- When user logs in, we compare encrypted versions

### Session Management
- After login, user gets a session token
- Token proves "You are logged in"
- Without token, you can't access dashboard
- Token expires after a while

### SQL Injection Prevention
- PHP uses prepared statements
- Prevents hackers from entering malicious code
- Like having a security guard check all inputs

---

## Demo Accounts (for testing)

**Student:**
- ID: `student`
- Password: `1234`

**Or create your own account via signup!**

**Admin:**
- Username: `admin`
- Password: `admin`
- Key: `123456`

---

## What Each Person Can Do

### Student Features:
✅ Create account (signup)
✅ Login
✅ View available seats
✅ Book a seat (10-minute hold)
✅ Check in when arriving
✅ Browse books
✅ See my bookings
✅ View booking history

### Admin Features:
✅ Login with special key
✅ See all students
✅ See all bookings
✅ See all seats on map
✅ Change seat status manually
✅ View statistics
✅ See activity logs

---

## How the Booking Timer Works

```
Student books seat
    ↓
Timer starts: 10 minutes (600 seconds)
    ↓
JavaScript counts down: 10:00 → 9:59 → 9:58 ...
    ↓
User sees countdown in real time
    ↓
When 0:00 reached:
  - Booking expires
  - Seat becomes available again
  - User can check-in before time runs out to convert to "occupied"
```

---

## Data Flow Summary

```
USER CLICKS BUTTON
        ↓
   HTML/JavaScript
(Frontend - User's Browser)
        ↓
  API Call to PHP
(Request over internet)
        ↓
    PHP processes
(Backend - Server)
        ↓
  PHP queries MySQL
(Reads/writes data)
        ↓
  Database returns data
        ↓
    PHP sends response
        ↓
JavaScript receives
        ↓
Updates page display
        ↓
USER SEES RESULTS
```

---

## Why These Technologies?

| Tech | Why? |
|------|------|
| **HTML/CSS/JS** | These are THE tools for websites. Every website uses them. |
| **PHP** | Easy to learn, perfect for web development, runs on servers |
| **MySQL** | Most popular database, reliable, simple |
| **XAMPP** | All-in-one package for development. Like a beginner-friendly setup |

---

## Installation Summary (What we did)

1. **Created database** (`database.sql`) → MySQL stores everything
2. **Created frontend** (HTML/CSS/JS) → What users see
3. **Created backend** (PHP) → Brain that processes requests
4. **Connected everything** → Files talk to each other
5. **Added security** → Passwords hashed, sessions managed
6. **Added signup** → Students can create accounts
7. **Fixed login** → Works with hashed passwords

---

## What Happens When You Access localhost:8000

```
1. You type: localhost:8000
2. Your browser requests: "Show me the homepage"
3. PHP Development Server (running in terminal) receives request
4. Sends back index.html
5. Browser loads HTML (structure)
6. Browser loads CSS (styling)
7. Browser loads JavaScript (interactivity)
8. Page appears with buttons that work!
```

---

## Summary

**SmartLib = A website where:**
- Frontend (HTML/CSS/JS) shows the interface
- Backend (PHP) handles business logic
- Database (MySQL) stores data
- All together = A working library management system

**The flow:**
User → HTML Button → JavaScript → PHP API → MySQL Database → Response → Page Updates

**Three layers work together:**
- 🎨 **Frontend** = What you see and interact with
- 🧠 **Backend** = Logic that processes requests
- 💾 **Database** = Where data lives

---

## Need Help?

- **Can't login?** Check demo credentials or create new account via signup
- **Page looks broken?** Refresh browser with `Ctrl+Shift+R`
- **Getting API errors?** Make sure database was imported correctly
- **Creating account failed?** Make sure all fields are filled and email is unique

---

**You now understand SmartLib! 🎉**

Every major website uses these same three layers (frontend, backend, database).
By understanding SmartLib, you understand how websites work in general!
