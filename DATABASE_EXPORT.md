# 📤 تصدير واستيراد قاعدة البيانات

## دليل شامل لنقل البيانات

---

## 1️⃣ تصدير من المحلي (Local)

### الطريقة 1: phpMyAdmin (الأسهل)

#### الخطوات:

1. **افتح phpMyAdmin:**
   ```
   http://localhost/phpmyadmin
   ```

2. **اختر قاعدة البيانات:**
   - اضغط على `ecole_chebbi` من القائمة اليسرى

3. **اضغط تبويب "Export" (تصدير)**

4. **اختر الإعدادات:**
   
   **Quick Export (سريع):**
   - Format: SQL
   - اضغط "Go"
   
   **Custom Export (مخصص - موصى به):**
   - Export method: **Custom**
   - Tables: اختر **Select all**
   - Output: **Save output to a file**
   - Format: **SQL**
   - Format-specific options:
     - ✅ Add DROP TABLE / VIEW / PROCEDURE / FUNCTION / EVENT / TRIGGER statement
     - ✅ Add CREATE DATABASE / USE statement
     - ✅ Add AUTO_INCREMENT value
     - ✅ Enclose export in a transaction
   - Object creation options:
     - ✅ Add CREATE PROCEDURE / FUNCTION / EVENT
   - Data creation options:
     - ✅ Complete inserts
     - ✅ Extended inserts
     - ✅ Use hexadecimal for BLOB

5. **تحميل الملف:**
   - اضغط "Go"
   - سيتم تحميل: `ecole_chebbi.sql`

---

### الطريقة 2: Terminal/Command Line

#### لـ Windows (XAMPP):

```bash
# افتح PowerShell في مجلد XAMPP/mysql/bin
cd "C:\xampp\mysql\bin"

# تصدير قاعدة البيانات
.\mysqldump.exe -u root ecole_chebbi > E:\my-express-app\ecole_chebbi_backup.sql

# تصدير مع كلمة مرور
.\mysqldump.exe -u root -p ecole_chebbi > E:\my-express-app\ecole_chebbi_backup.sql

# تصدير مع ضغط
.\mysqldump.exe -u root ecole_chebbi | gzip > E:\my-express-app\ecole_chebbi_backup.sql.gz
```

#### لـ Linux/Mac:

```bash
# تصدير أساسي
mysqldump -u root -p ecole_chebbi > ecole_chebbi_backup.sql

# تصدير مع خيارات إضافية
mysqldump -u root -p \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  ecole_chebbi > ecole_chebbi_backup.sql

# تصدير مع ضغط
mysqldump -u root -p ecole_chebbi | gzip > ecole_chebbi_backup.sql.gz
```

#### تصدير جدول واحد فقط:

```bash
mysqldump -u root -p ecole_chebbi users > users_only.sql
```

#### تصدير بدون بيانات (structure only):

```bash
mysqldump -u root -p --no-data ecole_chebbi > structure_only.sql
```

---

### الطريقة 3: Node.js Script

أنشئ ملف `scripts/export-db.js`:

```javascript
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

const outputPath = path.join(__dirname, '..', 'backup', `db_${Date.now()}.sql`);

const command = `mysqldump -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} > ${outputPath}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ خطأ في التصدير:', error);
    return;
  }
  console.log('✅ تم التصدير بنجاح!');
  console.log('📁 الملف:', outputPath);
});
```

ثم شغله:

```bash
node scripts/export-db.js
```

---

## 2️⃣ استيراد إلى الاستضافة

### الطريقة 1: phpMyAdmin على الاستضافة

1. **سجل دخول cPanel**

2. **افتح phpMyAdmin**

3. **اختر قاعدة البيانات:**
   - `username_ecole_chebbi`

4. **اضغط تبويب "Import" (استيراد)**

5. **اختر الملف:**
   - Browse → اختر `ecole_chebbi.sql`
   - Format: SQL
   - اضغط "Go"

6. **انتظر حتى ينتهي:**
   - ✅ "Import has been successfully finished"

⚠️ **ملاحظة:** إذا كان الملف كبير (>50MB):
- ضغط الملف أولاً (.zip)
- أو استخدم طريقة SSH

---

### الطريقة 2: SSH على الاستضافة

```bash
# اتصل بالخادم
ssh username@your-server.com

# انتقل للمجلد
cd /path/to/your/app

# رفع الملف (إذا لم يكن موجود)
# استخدم FTP أو:
scp ecole_chebbi.sql username@your-server.com:/path/to/app/

# استيراد
mysql -u username -p database_name < ecole_chebbi.sql

# أو مع معلومات كاملة
mysql -h localhost -u username -p database_name < ecole_chebbi.sql
```

---

### الطريقة 3: Railway

#### باستخدام Railway CLI:

```bash
# تثبيت Railway CLI
npm install -g @railway/cli

# تسجيل الدخول
railway login

# ربط المشروع
railway link

# استيراد البيانات
railway run mysql -u root -p database_name < ecole_chebbi.sql
```

#### عبر اتصال مباشر:

1. **احصل على معلومات الاتصال من Railway:**
   - MySQL Service → Variables
   - نسخ: HOST, PORT, USER, PASSWORD, DATABASE

2. **استورد:**
```bash
mysql -h RAILWAY_HOST -P RAILWAY_PORT -u RAILWAY_USER -p RAILWAY_DATABASE < ecole_chebbi.sql
```

---

## 3️⃣ تصدير واستيراد البيانات فقط (بدون structure)

### تصدير البيانات فقط:

```bash
mysqldump -u root -p --no-create-info ecole_chebbi > data_only.sql
```

### استيراد البيانات فقط:

```bash
mysql -u root -p ecole_chebbi < data_only.sql
```

---

## 4️⃣ نسخ احتياطي تلقائي

### سكريبت نسخ احتياطي يومي (Windows):

أنشئ ملف `backup-daily.bat`:

```batch
@echo off
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%
set BACKUP_DIR=E:\backups
set MYSQL_BIN=C:\xampp\mysql\bin

%MYSQL_BIN%\mysqldump.exe -u root ecole_chebbi > %BACKUP_DIR%\ecole_chebbi_%TIMESTAMP%.sql

echo Backup completed: ecole_chebbi_%TIMESTAMP%.sql
```

**جدولة في Windows:**
- Task Scheduler → Create Task
- Trigger: Daily at 2:00 AM
- Action: Start program → `backup-daily.bat`

---

### سكريبت نسخ احتياطي يومي (Linux):

أنشئ ملف `backup-daily.sh`:

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="ecole_chebbi"
DB_USER="root"
DB_PASS="loi123"

mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/ecole_chebbi_$TIMESTAMP.sql

# حذف النسخ الأقدم من 7 أيام
find $BACKUP_DIR -name "ecole_chebbi_*.sql" -mtime +7 -delete

echo "Backup completed: ecole_chebbi_$TIMESTAMP.sql"
```

**جدولة في Linux (Cron):**
```bash
# فتح crontab
crontab -e

# إضافة سطر
0 2 * * * /path/to/backup-daily.sh
```

---

## 5️⃣ نسخ احتياطي مع GitHub

### باستخدام GitHub Actions

أنشئ `.github/workflows/db-backup.yml`:

```yaml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # كل يوم 2 صباحاً
  workflow_dispatch:  # يدوي

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup MySQL Client
        run: |
          sudo apt-get update
          sudo apt-get install -y mysql-client
      
      - name: Backup Database
        env:
          DB_HOST: ${{ secrets.DB_HOST }}
          DB_PORT: ${{ secrets.DB_PORT }}
          DB_USER: ${{ secrets.DB_USER }}
          DB_PASS: ${{ secrets.DB_PASS }}
          DB_NAME: ${{ secrets.DB_NAME }}
        run: |
          mysqldump -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS $DB_NAME > backup.sql
      
      - name: Upload to Artifacts
        uses: actions/upload-artifact@v3
        with:
          name: database-backup
          path: backup.sql
          retention-days: 30
```

---

## 6️⃣ استعادة من نسخة احتياطية

### إعادة قاعدة البيانات بالكامل:

```bash
# حذف قاعدة البيانات الحالية
mysql -u root -p -e "DROP DATABASE ecole_chebbi;"

# إنشاء قاعدة بيانات جديدة
mysql -u root -p -e "CREATE DATABASE ecole_chebbi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# استيراد النسخة الاحتياطية
mysql -u root -p ecole_chebbi < ecole_chebbi_backup.sql
```

---

## 7️⃣ تصدير لأنواع أخرى

### تصدير إلى CSV:

```sql
-- في MySQL
SELECT * FROM users
INTO OUTFILE 'C:/xampp/tmp/users.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

### تصدير إلى JSON (باستخدام Node.js):

```javascript
const mysql = require('mysql2/promise');
const fs = require('fs');

async function exportToJSON() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'loi123',
    database: 'ecole_chebbi'
  });

  const [users] = await connection.execute('SELECT * FROM users');
  
  fs.writeFileSync(
    'users_export.json',
    JSON.stringify(users, null, 2)
  );
  
  console.log('✅ Exported to JSON');
  await connection.end();
}

exportToJSON();
```

---

## 8️⃣ أفضل الممارسات

### ✅ ما يجب فعله:

1. **نسخ احتياطي منتظم:**
   - يومي على الأقل
   - قبل أي تحديث كبير

2. **اختبار النسخ الاحتياطية:**
   - استعد من نسخة احتياطية مرة شهرياً
   - تأكد أنها تعمل

3. **تخزين آمن:**
   - خارج الخادم
   - مشفر
   - في مواقع متعددة

4. **الاحتفاظ بنسخ متعددة:**
   - 7 أيام أخيرة
   - آخر 4 أسابيع
   - آخر 12 شهر

### ❌ ما يجب تجنبه:

1. ❌ كلمات مرور في السكريبتات
2. ❌ نسخ احتياطية على نفس الخادم فقط
3. ❌ عدم اختبار الاستعادة
4. ❌ نسخ احتياطية قديمة جداً

---

## 🆘 حل المشاكل

### المشكلة: ملف كبير جداً لـ phpMyAdmin

**الحل 1:** تقسيم الملف

```bash
# تقسيم إلى ملفات 10MB
split -b 10M ecole_chebbi.sql ecole_chebbi_part_

# استيراد كل جزء
for file in ecole_chebbi_part_*; do
  mysql -u root -p ecole_chebbi < $file
done
```

**الحل 2:** رفع حد الحجم في php.ini

```ini
upload_max_filesize = 100M
post_max_size = 100M
max_execution_time = 300
```

### المشكلة: أخطاء في الترميز (encoding)

**الحل:**

```bash
# تصدير مع ترميز محدد
mysqldump -u root -p --default-character-set=utf8mb4 ecole_chebbi > backup.sql

# استيراد مع ترميز محدد
mysql -u root -p --default-character-set=utf8mb4 ecole_chebbi < backup.sql
```

---

## ✅ قائمة التحقق

- [ ] نسخة احتياطية قبل أي تغيير
- [ ] اختبرت الاستعادة
- [ ] النسخ في مكان آمن
- [ ] جدولة نسخ تلقائية
- [ ] حذف نسخ قديمة
- [ ] توثيق عملية الاستعادة

---

## 📚 ملفات إضافية

تحقق من:
- `DEPLOYMENT_GUIDE.md` - دليل النشر الكامل
- `DEPLOYMENT_RAILWAY.md` - النشر على Railway
- `database.sql` - هيكل قاعدة البيانات

---

**تذكر:** النسخ الاحتياطية تنقذ حياتك! 💾✨
