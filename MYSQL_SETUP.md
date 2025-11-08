# 🔧 دليل إعداد MySQL - المدرسة الإعدادية أبو القاسم الشابي

## الخطوة 1: تثبيت MySQL

### على Windows:
1. حمّل MySQL من: https://dev.mysql.com/downloads/installer/
2. شغّل المثبت واختر "Developer Default"
3. اضبط كلمة مرور root إلى: `loi123`

### على Linux:
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### على macOS:
```bash
brew install mysql
brew services start mysql
```

---

## الخطوة 2: إنشاء قاعدة البيانات

### الطريقة 1: باستخدام ملف SQL
```powershell
# افتح MySQL
mysql -u root -p
# أدخل كلمة المرور: loi123

# أو باستخدام الملف مباشرة
mysql -u root -p < database.sql
```

### الطريقة 2: يدوياً
```sql
mysql -u root -p
# أدخل كلمة المرور: loi123

CREATE DATABASE ecole_chebbi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecole_chebbi;
exit;
```

---

## الخطوة 3: تحديث ملف .env

تأكد أن ملف `.env` يحتوي على:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecole_chebbi
DB_USER=root
DB_PASSWORD=loi123
```

---

## الخطوة 4: تثبيت المكتبات

```powershell
npm install
```

---

## الخطوة 5: تشغيل التطبيق

التطبيق سيقوم بإنشاء الجداول تلقائياً عند التشغيل:

```powershell
npm start
```

---

## الخطوة 6: إنشاء حساب المدير

```powershell
npm run create-admin
```

**بيانات الدخول:**
- البريد: `admin@ecole-chebbi.tn`
- كلمة المرور: `admin123`

---

## 🔍 التحقق من قاعدة البيانات

```sql
mysql -u root -p
USE ecole_chebbi;
SHOW TABLES;
DESCRIBE users;
```

---

## ⚠️  استكشاف الأخطاء

### خطأ: Access denied for user 'root'
```powershell
# أعد ضبط كلمة مرور root
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'loi123';
FLUSH PRIVILEGES;
```

### خطأ: Database does not exist
```sql
CREATE DATABASE ecole_chebbi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### خطأ: Can't connect to MySQL server
```powershell
# تأكد من تشغيل MySQL
net start MySQL80  # على Windows
# أو
sudo service mysql start  # على Linux
```

---

## 📊 أدوات مفيدة

### MySQL Workbench (مُوصى به)
- واجهة رسومية لإدارة MySQL
- حمّل من: https://dev.mysql.com/downloads/workbench/

### phpMyAdmin
- واجهة ويب لإدارة MySQL
- يأتي مع XAMPP/WAMP

---

**✅ قاعدة البيانات جاهزة!**
