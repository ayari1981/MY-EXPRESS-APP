// قائمة الهاتف المحمول
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// إخفاء الرسائل تلقائياً بعد 5 ثوانٍ
const alerts = document.querySelectorAll('.alert');
alerts.forEach(alert => {
  setTimeout(() => {
    alert.style.transition = 'opacity 0.5s';
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 500);
  }, 5000);
});

// تأكيد الحذف
function confirmDelete(message) {
  return confirm(message || 'هل أنت متأكد من الحذف؟');
}

// معاينة الملف قبل الرفع
function previewFile(input) {
  const file = input.files[0];
  const preview = document.getElementById('file-preview');
  
  if (file && preview) {
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    preview.innerHTML = `
      <div class="p-4 bg-gray-100 rounded-lg">
        <p class="font-semibold">الملف المختار:</p>
        <p class="text-sm text-gray-600">${file.name}</p>
        <p class="text-sm text-gray-600">الحجم: ${fileSize} MB</p>
      </div>
    `;
  }
}

console.log('✅ تم تحميل المدرسة الإعدادية أبو القاسم الشابي');
