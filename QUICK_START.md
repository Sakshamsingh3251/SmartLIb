# SmartLib - Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites
- XAMPP installed (www.apachefriends.org)
- Web browser

### Installation Steps

#### 1️⃣ Extract Project
```bash
# Extract to XAMPP htdocs
# Windows: C:\xampp\htdocs\smartlib
# Mac: /Applications/XAMPP/xamppfiles/htdocs/smartlib
# Linux: /opt/lampp/htdocs/smartlib
```

#### 2️⃣ Start XAMPP
1. Open XAMPP Control Panel
2. Start **Apache** 
3. Start **MySQL**

#### 3️⃣ Create Database
1. Go to: http://localhost/phpmyadmin
2. Click **"New"**
3. Database name: `smartlib_db`
4. Click **"Create"**
5. Go to **"Import"** tab
6. Upload `backend/database.sql`
7. Click **"Go"**

#### 4️⃣ Access Application
- **Home**: http://localhost/smartlib/
- **Login**: http://localhost/smartlib/pages/login.html

#### 5️⃣ Login with Demo Account
```
Student:
- ID: student
- Password: 1234

Admin:
- Username: admin
- Password: admin
- Key: 123456
```

---

## 🎯 Quick Features Demo

### As Student:
1. Login with `student` / `1234`
2. **Find a Seat** → Click green seat → See timer start
3. **Browse Books** → Filter by genre → See availability
4. **My Bookings** → View active reservations

### As Admin:
1. Login with `admin` / `admin` / `123456`
2. **Dashboard** → See real-time statistics
3. **Seat Manager** → Click seat → Change status
4. **Active Users** → View checked-in students
5. **Book Inventory** → Search and manage books

---

## 📁 File Structure

```
smartlib/
├── index.html                 # Main page
├── PROJECT_GUIDE.md          # Full documentation
├── QUICK_START.md            # This file
│
├── pages/
│   ├── login.html            # Login page
│   ├── student.html          # Student portal
│   └── admin.html            # Admin dashboard
│
├── js/
│   ├── app.js               # Core functions
│   ├── data.js              # Demo data
│   ├── student.js           # Student logic
│   └── admin.js             # Admin logic
│
├── css/
│   └── style.css            # All styling
│
├── api/                      # Backend APIs
│   ├── auth.php             # Login/logout
│   ├── seats.php            # Seat operations
│   ├── books.php            # Book operations
│   └── bookings.php         # Booking history
│
└── backend/
    ├── config.php           # Database config
    └── database.sql         # Schema + data
```

---

## 🔧 Configuration

Edit `backend/config.php` if needed:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');       // Your MySQL user
define('DB_PASS', '');            // Your MySQL password
define('DB_NAME', 'smartlib_db');
```

---

## ❌ Common Issues

| Problem | Solution |
|---------|----------|
| "Connection error" | Start MySQL in XAMPP |
| Database not created | Check phpmyadmin import |
| Can't login | Use demo credentials |
| Seats not loading | Check XAMPP Apache is running |
| "404 API Error" | Verify file paths are correct |

---

## 🌐 Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+

---

## 📊 System Capabilities

- **Max Seats**: Unlimited
- **Max Books**: Unlimited
- **Max Zones**: Unlimited
- **Max Concurrent Users**: 100+ (depends on server)
- **Booking Hold Duration**: 10 minutes (configurable)

---

## 🎓 Learning Path

1. **Beginner**: Use demo credentials to explore
2. **Intermediate**: Create new admin account (edit database)
3. **Advanced**: Modify API endpoints, add features
4. **Expert**: Deploy to shared hosting, optimize performance

---

## 💡 Tips & Tricks

1. **Search works everywhere**: Use search bars in any section
2. **Mobile responsive**: Works on phones and tablets
3. **Real-time updates**: Bookings update instantly
4. **Zone filtering**: Quickly find seats by location
5. **Genre browsing**: Books sorted by category

---

## 🔐 Default Login Credentials

### All Students
```
ID Format: student, STU001, STU002, STU003, STU004, STU005
Password Format: 1234 (for 'student'), pass1, pass2, pass3, pass4, pass5
```

### Admin
```
Username: admin
Password: admin
Admin Key: 123456
```

---

## 📈 What's Included

✅ Complete frontend UI
✅ PHP backend APIs
✅ MySQL database
✅ User authentication
✅ Real-time seat booking
✅ Book management
✅ Admin controls
✅ Responsive design
✅ Timer system
✅ Search & filtering

---

## 🚀 Next Steps

1. ✅ Get it running (this guide)
2. ✅ Explore all features
3. ✅ Read PROJECT_GUIDE.md for details
4. ✅ Customize colors/text if needed
5. ✅ Deploy to live server

---

## 📞 Need Help?

1. Check browser console (F12 → Console tab)
2. Verify all files are extracted
3. Make sure database was imported
4. Restart XAMPP services
5. Clear browser cache (Ctrl+Shift+Delete)

---

**Happy Learning! 🎉**

Start exploring at: http://localhost/smartlib/
