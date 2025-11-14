# إعداد Domain على Railway

## الخطوات السريعة:

### 1️⃣ في Railway Dashboard:
1. افتح مشروعك: `montassarp`
2. Settings → Networking/Domains
3. اضغط "Add Custom Domain"
4. أدخل الدومان: `your-domain.com`
5. انسخ قيمة CNAME التي تظهر

### 2️⃣ في إعدادات DNS (عند مزود الدومان):

**للدومان الرئيسي (example.com):**
```
Type: CNAME
Host: @
Value: montassarp.up.railway.app
TTL: 3600
```

**للنطاق الفرعي (www.example.com):**
```
Type: CNAME
Host: www
Value: montassarp.up.railway.app
TTL: 3600
```

### 3️⃣ الانتظار:
- انتشار DNS: 5-30 دقيقة
- SSL Certificate: يُنشأ تلقائياً (10-60 دقيقة)

### 4️⃣ التحقق:
```bash
# تحقق من DNS
nslookup your-domain.com

# اختبر الموقع
https://your-domain.com
```

## ملاحظات مهمة:

✅ **التطبيق جاهز**: يقرأ PORT من `process.env.PORT` تلقائياً
✅ **SSL مجاني**: Railway يوفر HTTPS تلقائياً
✅ **لا حاجة لتغيير الكود**: كل شيء معد مسبقاً

## إذا واجهت مشاكل:

### المشكلة: "Domain not working"
- انتظر 30 دقيقة لانتشار DNS
- تأكد من CNAME صحيح
- احذف الـ cache: `ipconfig /flushdns`

### المشكلة: "SSL Certificate Pending"
- انتظر حتى ساعة
- Railway ينشئ SSL تلقائياً

### المشكلة: "Port Configuration"
- لا داعي للقلق! التطبيق يقرأ PORT تلقائياً
- Railway يحدد PORT ديناميكياً

## مزودي الدومان الشائعين:

### GoDaddy:
```
DNS Management → Add Record → CNAME
```

### Namecheap:
```
Advanced DNS → Add New Record → CNAME Record
```

### Google Domains:
```
DNS → Custom resource records → CNAME
```

### Cloudflare:
```
DNS → Add record → CNAME
⚠️ تأكد أن Proxy status: DNS Only (غيمة رمادية)
```

---

**ما هو الدومان الذي اشتريته؟** سأساعدك في الإعداد الدقيق حسب المزود.
