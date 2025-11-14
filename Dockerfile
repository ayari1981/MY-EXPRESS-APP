# استخدام Node.js 20 LTS
FROM node:20-alpine

# تثبيت dependencies للتطبيقات التي تحتاج native modules
RUN apk add --no-cache python3 make g++

# إنشاء مجلد التطبيق
WORKDIR /app

# نسخ package files
COPY package*.json ./

# تثبيت dependencies للإنتاج فقط
RUN npm ci --only=production

# نسخ باقي ملفات المشروع
COPY . .

# إنشاء مجلدات الرفع
RUN mkdir -p uploads/lessons uploads/profile-pics uploads/schedules

# تعيين صلاحيات المجلدات
RUN chmod -R 755 uploads

# استخدام مستخدم غير root للأمان
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# تعريف المنفذ
EXPOSE 8080

# متغير البيئة للإنتاج
ENV NODE_ENV=production

# تشغيل التطبيق
CMD ["node", "src/app.js"]
