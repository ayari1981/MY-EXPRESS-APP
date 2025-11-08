# ⚡ دليل التشغيل السريع - MySQL

## ❗ MySQL غير مثبت

يبدو أن MySQL غير مثبت على جهازك. اتبع الخطوات التالية:

---

## 📥 تثبيت MySQL

### الخيار 1: XAMPP (الأسهل - مُوصى به)

1. **حمّل XAMPP:**
   - اذهب إلى: https://www.apachefriends.org/download.html
   - حمّل النسخة لـ Windows

2. **ثبّت XAMPP:**
   - شغّل المثبت
   - اختر MySQL و phpMyAdmin فقط
   - أكمل التثبيت

3. **شغّل MySQL:**
   - افتح XAMPP Control Panel
   - اضغط "Start" أمام MySQL

4. **أنشئ قاعدة البيانات:**
   - افتح المتصفح: http://localhost/phpmyadmin
   - اضغط "New" (جديد)
   - اسم قاعدة البيانات: `ecole_chebbi`
   - Collation: `utf8mb4_unicode_ci`
   - اضغط "Create"

5. **حدّث ملف .env:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=ecole_chebbi
   DB_USER=root
   DB_PASSWORD=
   ```
   **ملاحظة:** اترك `DB_PASSWORD` فارغاً في XAMPP

---

### الخيار 2: MySQL Standalone

1. **حمّل MySQL:**
   - https://dev.mysql.com/downloads/installer/
   - اختر "mysql-installer-community"

2. **ثبّت MySQL:**
   - اختر "Developer Default"
   - اضبط كلمة مرور root: `loi123`
   - أكمل التثبيت

3. **أضف MySQL للـ PATH:**
   - ابحث عن "Environment Variables"
   - أضف: `C:\Program Files\MySQL\MySQL Server 8.0\bin`

4. **أنشئ قاعدة البيانات:**
   ```powershell
   mysql -u root -p
   # أدخل: loi123
   
   CREATE DATABASE ecole_chebbi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   exit;
   ```

---

## 🚀 بعد تثبيت MySQL

### 1. شغّل MySQL
**XAMPP:**
- افتح XAMPP Control Panel
- اضغط "Start" أمام MySQL

**MySQL Standalone:**
```powershell
net start MySQL80
```

### 2. تأكد من ملف .env

**لـ XAMPP:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecole_chebbi
DB_USER=root
DB_PASSWORD=
```

**لـ MySQL Standalone:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecole_chebbi
DB_USER=root
DB_PASSWORD=loi123
```

### 3. شغّل التطبيق
```powershell
npm start
```

---

## ✅ الجداول ستُنشأ تلقائياً!

التطبيق يستخدم Sequelize الذي سيُنشئ جميع الجداول تلقائياً عند أول تشغيل.

---

## 🔐 إنشاء حساب المدير

```powershell
npm run create-admin
```

---

## 🌐 افتح التطبيق

```
http://localhost:3000
```

---

**بالتوفيق! 🎓✨**
