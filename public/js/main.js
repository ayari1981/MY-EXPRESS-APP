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

// تأثيرات لوحة الشرف المتطورة
document.addEventListener('DOMContentLoaded', function() {
  // تحريك دوائر العلامات
  const gradeCircles = document.querySelectorAll('.grade-fill');
  const observerGrades = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const currentOffset = entry.target.style.strokeDashoffset;
        setTimeout(() => {
          entry.target.style.strokeDashoffset = currentOffset || '0';
        }, 300);
      }
    });
  }, { threshold: 0.5 });

  gradeCircles.forEach(circle => {
    observerGrades.observe(circle);
  });

  // تأثير ظهور الأقسام
  const subjectContainers = document.querySelectorAll('.subject-container');
  const observerSubjects = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 200);
      }
    });
  }, { threshold: 0.1 });

  subjectContainers.forEach(container => {
    container.style.opacity = '0';
    container.style.transform = 'translateY(50px)';
    container.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    observerSubjects.observe(container);
  });

  // تأثير ظهور منصات التتويج
  const podiumPlaces = document.querySelectorAll('.podium-place');
  podiumPlaces.forEach((place, index) => {
    place.style.opacity = '0';
    place.style.transform = 'translateY(100px)';
    
    setTimeout(() => {
      place.style.transition = 'all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      place.style.opacity = '1';
      place.style.transform = 'translateY(0)';
    }, index * 300);
  });

  // تأثير بطاقات قاعة المشاهير
  const fameCards = document.querySelectorAll('.fame-card');
  const observerFame = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0) rotate(0deg)';
        }, index * 100);
      }
    });
  }, { threshold: 0.1 });

  fameCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px) rotate(-5deg)';
    card.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    observerFame.observe(card);
  });

  // تأثيرات الأفاتار عند التمرير
  const avatars = document.querySelectorAll('.avatar-circle, .avatar-ring');
  avatars.forEach(avatar => {
    avatar.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.2) rotate(360deg)';
      this.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    });
    
    avatar.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1) rotate(0deg)';
    });
  });

  // تأثير النقر على البطاقات
  const allCards = document.querySelectorAll('.student-info-card, .fame-card');
  allCards.forEach(card => {
    card.addEventListener('click', function(e) {
      // تأثير النبض
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 200);
      
      // إضافة دوائر متموجة
      const ripple = document.createElement('div');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.className = 'ripple-effect';
      
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // تأثير العد التصاعدي للعلامات
  const gradeNumbers = document.querySelectorAll('.grade-num, .fame-score');
  const observerNumbers = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        const finalValue = parseFloat(entry.target.textContent);
        let currentValue = 0;
        const increment = finalValue / 30;
        const timer = setInterval(() => {
          currentValue += increment;
          if (currentValue >= finalValue) {
            entry.target.textContent = finalValue.toFixed(2);
            clearInterval(timer);
          } else {
            entry.target.textContent = currentValue.toFixed(2);
          }
        }, 30);
      }
    });
  }, { threshold: 0.5 });

  gradeNumbers.forEach(num => {
    observerNumbers.observe(num);
  });
});

// إضافة CSS للتأثيرات فقط
const style = document.createElement('style');
style.textContent = `
  .ripple-effect {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// إضافة تأثير تموج عند النقر على البطاقات
document.addEventListener('click', function(e) {
  if (e.target.closest('.podium-place')) {
    const card = e.target.closest('.podium-place');
    card.style.transform = 'translateY(-20px) scale(1.05)';
    setTimeout(() => {
      card.style.transform = 'translateY(0) scale(1)';
    }, 300);
  }
});

console.log('✅ تم تحميل المدرسة الإعدادية أبو القاسم الشابي - تصميم لوحة الشرف المتطور');

