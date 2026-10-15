/**
 * Velvet Luxe - Atelier Lingerie & Silk
 * Shopping Cart & Checkout Logic
 * Vanilla JavaScript
 */

const DEFAULT_CART = [
  {
    id: 'cart_item_1',
    title: 'ست خواب و شورت گیپور شانتیلی پاریس',
    code: 'CR-8820-VL',
    badge: 'ابریشم خالص',
    color: 'سرخ مخملی',
    size: 'سایز: 75B (کاپ اسفنجی نازک)',
    pantSize: 'شورت: لایت اسلیپ (M)',
    discount: '۱۵٪ تخفیف',
    oldPrice: 2150000,
    price: 1827500,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1583846783214-7229a91b20ed?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cart_item_2',
    title: 'برالت ابریشم خالص مالبر‌ی بدون فنر',
    code: 'IV-4102-VL',
    badge: 'کالکشن تورا',
    color: 'عاجی مرواریدی',
    size: 'سایز: 80C',
    pantSize: '',
    discount: '',
    oldPrice: 0,
    price: 1450000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cart_item_3',
    title: 'پک ۳ تایی شورت آنتی‌باکتریال لیزری بدون دوخت',
    code: 'TR-1099-VL',
    badge: 'پک ۳ عددی',
    badge2: 'الیاف ۱۰۰٪ پنبه ارگانیک',
    color: 'پک رنگی: پاستلی / پودری',
    size: 'سایز: L (مناسب ۳۸ - ۴۰)',
    pantSize: '',
    discount: '',
    oldPrice: 0,
    price: 790000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80'
  }
];

let appliedCoupon = null;

function getCart() {
  const stored = localStorage.getItem('velvet_cart');
  if (!stored) {
    localStorage.setItem('velvet_cart', JSON.stringify(DEFAULT_CART));
    return [...DEFAULT_CART];
  }
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [];
    }
    return parsed;
  } catch (e) {
    return [...DEFAULT_CART];
  }
}

function saveCart(cart) {
  localStorage.setItem('velvet_cart', JSON.stringify(cart));
  updateHeaderCounters();
  renderCart();
}

function updateCartItemQty(id, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity = (item.quantity || 1) + delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
    showToast('کالا از سبد خرید حذف شد');
  }
  saveCart(cart);
}

function removeCartItem(id) {
  let cart = getCart();
  cart = cart.filter(i => i.id !== id);
  showToast('کالا از سبد خرید حذف گردید');
  saveCart(cart);
}

function clearCart() {
  if (confirm('آیا از خالی کردن سبد خرید مطمئن هستید؟')) {
    saveCart([]);
    showToast('سبد خرید با موفقیت خالی شد');
  }
}

function applyCouponCode() {
  const input = document.getElementById('coupon-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (!code) {
    showToast('لطفاً کد تخفیف را وارد کنید.', 'rose');
    return;
  }

  if (code === 'BRIDE2025') {
    appliedCoupon = { code: 'BRIDE2025', percent: 15, name: 'تخفیف ویژه کالکشن عروس' };
    showToast('کد تخفیف ۱۵٪ کالکشن عروس با موفقیت اعمال شد.', 'success');
  } else if (code === 'SILKCARE') {
    appliedCoupon = { code: 'SILKCARE', percent: 10, name: 'تخفیف مراقبت ابریشم' };
    showToast('کد تخفیف ۱۰٪ مراقبت ابریشم اعمال شد.', 'success');
  } else if (code === 'VIP20') {
    appliedCoupon = { code: 'VIP20', percent: 20, name: 'تخفیف اعضای VIP' };
    showToast('کد تخفیف ۲۰٪ اعضای VIP اعمال شد.', 'success');
  } else {
    showToast('کد تخفیف وارد شده معتبر نمی‌باشد یا منقضی شده است.', 'rose');
    return;
  }

  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items-container');
  const countBadge = document.getElementById('cart-items-count-badge');
  const emptyState = document.getElementById('cart-empty-state');
  const cartGrid = document.getElementById('cart-main-grid');

  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (container) container.innerHTML = '';
    if (countBadge) countBadge.textContent = '۰ کالا';
    updateSummary(0, 0, 0);
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  const totalCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  if (countBadge) countBadge.textContent = `${toPersianDigits(totalCount)} کالا`;

  let subtotal = 0;
  let html = '';

  cart.forEach(item => {
    const qty = item.quantity || 1;
    const itemTotal = item.price * qty;
    subtotal += itemTotal;

    html += `
      <div class="cart-item-row" data-id="${item.id}">
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1583846783214-7229a91b20ed?auto=format&fit=crop&w=600&q=80'" />
        </div>
        <div class="cart-item-info">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <h4>${item.title}</h4>
            <button onclick="removeCartItem('${item.id}')" style="background:none; border:none; color:var(--text-light); cursor:pointer;" title="حذف کالا">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
          </div>
          <div style="font-size:0.75rem; color:var(--text-light); margin-bottom:0.35rem;">
            کد اختصاصی: <span style="font-family:var(--font-sans); direction:ltr; display:inline-block;">${item.code || 'VL-000'}</span>
          </div>
          <div class="cart-item-props">
            ${item.color ? `<span class="badge badge-rose">● رنگ: ${item.color}</span>` : ''}
            ${item.size ? `<span class="badge badge-outline">${item.size}</span>` : ''}
            ${item.pantSize ? `<span class="badge badge-outline">${item.pantSize}</span>` : ''}
            ${item.badge ? `<span class="badge badge-gold">${item.badge}</span>` : ''}
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-top:0.6rem;">
            <div class="cart-qty-control">
              <button class="qty-btn" onclick="updateCartItemQty('${item.id}', 1)">+</button>
              <span class="qty-val">${toPersianDigits(qty)}</span>
              <button class="qty-btn" onclick="updateCartItemQty('${item.id}', -1)">-</button>
            </div>
            <div style="text-align:left;">
              ${item.oldPrice ? `<div style="font-size:0.75rem; color:var(--text-light); text-decoration:line-through;">${formatPrice(item.oldPrice * qty)} تومان</div>` : ''}
              <div style="font-size:1.05rem; font-weight:800; color:var(--primary);">${formatPrice(itemTotal)} تومان</div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Calculate discounts
  let discountAmount = 222500; // Standard Valentine promo default as in design
  if (appliedCoupon) {
    discountAmount = Math.round(subtotal * (appliedCoupon.percent / 100));
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);
  updateSummary(subtotal, discountAmount, finalTotal);
}

function updateSummary(subtotal, discount, total) {
  const subtotalEl = document.getElementById('summary-subtotal');
  const discountEl = document.getElementById('summary-discount');
  const totalEl = document.getElementById('summary-total');

  if (subtotalEl) subtotalEl.textContent = `${formatPrice(subtotal)} تومان`;
  if (discountEl) discountEl.textContent = `- ${formatPrice(discount)} تومان`;
  if (totalEl) totalEl.textContent = `${formatPrice(total)} تومان`;
}

// Checkout simulation modal
function openCheckoutModal() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('سبد خرید شما خالی است.', 'rose');
    return;
  }
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.style.display = 'flex';
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.style.display = 'none';
}

function submitOrder(e) {
  e.preventDefault();
  closeCheckoutModal();
  saveCart([]);
  const orderNum = 'VL-#' + Math.floor(10000 + Math.random() * 90000);
  showToast(`سفارش شما با شماره ${orderNum} با موفقیت ثبت شد و مرسوله آماده بسته‌بندی محرمانه می‌باشد.`, 'success');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cart-items-container')) {
    renderCart();
  }
});
