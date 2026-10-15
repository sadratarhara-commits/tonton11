/**
 * Velvet Luxe - Atelier Lingerie & Silk
 * Main Interactive Vanilla JavaScript
 * Zero external framework dependencies - Ready for Cloudflare Pages
 */

// Toast Notification Engine
function showToast(message, type = 'rose') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Convert English numerals to Persian numerals
function toPersianDigits(num) {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (w) => farsiDigits[+w]);
}

// Format price with Persian commas
function formatPrice(num) {
  const parts = Number(num).toLocaleString('en-US');
  return toPersianDigits(parts);
}

// Global Cart Badge Counter
function updateHeaderCounters() {
  const cartItems = JSON.parse(localStorage.getItem('velvet_cart') || '[]');
  const totalCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  
  const badges = document.querySelectorAll('.header-cart-badge');
  badges.forEach(b => {
    b.textContent = toPersianDigits(totalCount);
  });

  const wishlist = JSON.parse(localStorage.getItem('velvet_wishlist') || '[1, 2, 3]');
  const wishBadges = document.querySelectorAll('.header-wish-badge');
  wishBadges.forEach(b => {
    b.textContent = toPersianDigits(wishlist.length);
  });
}

// Countdown Timer for Golden Offer
function initCountdown() {
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  if (!hoursEl || !minutesEl || !secondsEl) return;

  let totalSeconds = 9 * 3600 + 42 * 60 + 9; // 09:42:09 as in Stitch design

  const timer = setInterval(() => {
    if (totalSeconds <= 0) {
      clearInterval(timer);
      return;
    }
    totalSeconds--;

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    hoursEl.textContent = toPersianDigits(String(h).padStart(2, '0'));
    minutesEl.textContent = toPersianDigits(String(m).padStart(2, '0'));
    secondsEl.textContent = toPersianDigits(String(s).padStart(2, '0'));
  }, 1000);
}

// Size Calculator Engine
function calculateBraSize(underbust, overbust) {
  const u = parseFloat(underbust);
  const o = parseFloat(overbust);

  if (isNaN(u) || isNaN(o) || u < 55 || o < 65 || o <= u) {
    return null;
  }

  // Band size EU standard (rounded to nearest 5)
  let band = Math.round(u / 5) * 5;
  if (band < 65) band = 65;
  if (band > 115) band = 115;

  const diff = o - u;
  let cup = 'A';

  if (diff < 11) cup = 'AA';
  else if (diff <= 13) cup = 'A';
  else if (diff <= 15) cup = 'B';
  else if (diff <= 17) cup = 'C';
  else if (diff <= 19) cup = 'D';
  else if (diff <= 21) cup = 'E';
  else if (diff <= 23) cup = 'F';
  else cup = 'G';

  return `${band}${cup}`;
}

function initSizeCalculator() {
  const form = document.getElementById('size-calculator-form');
  const resultBox = document.getElementById('size-result-box');
  const resultVal = document.getElementById('size-result-value');

  if (!form || !resultBox || !resultVal) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const under = document.getElementById('underbust-input').value;
    const over = document.getElementById('overbust-input').value;

    const size = calculateBraSize(under, over);
    if (!size) {
      showToast('لطفاً مقادیر معتبر دور زیر سینه و دور سینه را وارد فرمایید.', 'rose');
      return;
    }

    resultVal.textContent = size;
    resultBox.style.display = 'flex';
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showToast(`سایز استاندارد اروپایی شما ${size} محاسبه شد.`, 'success');
  });
}

// Wishlist interaction
function initWishlist() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.product-wishlist-btn');
    if (!btn) return;
    
    e.preventDefault();
    const id = btn.dataset.productId || '1';
    let wishlist = JSON.parse(localStorage.getItem('velvet_wishlist') || '[1, 2, 3]');
    
    if (wishlist.includes(id)) {
      wishlist = wishlist.filter(item => item !== id);
      btn.classList.remove('active');
      btn.style.color = 'var(--text-muted)';
      showToast('محصول از علاقه‌مندی‌ها حذف شد');
    } else {
      wishlist.push(id);
      btn.classList.add('active');
      btn.style.color = 'var(--primary)';
      showToast('محصول به لیست علاقه‌مندی‌ها افزوده شد', 'success');
    }
    
    localStorage.setItem('velvet_wishlist', JSON.stringify(wishlist));
    updateHeaderCounters();
  });
}

// Quick Add To Cart from anywhere
function initQuickAddToCart() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-add-to-cart');
    if (!btn) return;

    e.preventDefault();
    const item = {
      id: btn.dataset.id || ('prod_' + Date.now()),
      title: btn.dataset.title || 'ست دست‌دوز لوکس ولوت',
      code: btn.dataset.code || 'VL-SP-900',
      price: parseInt(btn.dataset.price || '1320000', 10),
      size: btn.dataset.size || '75B',
      color: btn.dataset.color || 'سرخ مخملی',
      image: btn.dataset.img || 'https://images.unsplash.com/photo-1583846783214-7229a91b20ed?auto=format&fit=crop&w=600&q=80',
      quantity: 1
    };

    let cart = JSON.parse(localStorage.getItem('velvet_cart') || '[]');
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push(item);
    }

    localStorage.setItem('velvet_cart', JSON.stringify(cart));
    updateHeaderCounters();
    showToast(`«${item.title}» با موفقیت به سبد خرید افزوده شد`, 'success');
  });
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderCounters();
  initCountdown();
  initSizeCalculator();
  initWishlist();
  initQuickAddToCart();
});
