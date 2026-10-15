/**
 * Velvet Luxe - Atelier Lingerie & Silk
 * Admin Dashboard & Product Management Logic
 * Vanilla JavaScript
 */

// Draw weekly sales chart on Canvas
function initSalesChart() {
  const canvas = document.getElementById('sales-chart-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;

  // Data points for Saturday to Friday (جمعه)
  const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه (پیک)', 'چهارشنبه', 'پنج‌شنبه', 'امروز (جمعه)'];
  // Scaled normalized values (0 to 1)
  const values = [0.25, 0.32, 0.38, 0.88, 0.65, 0.72, 0.95];

  const paddingBottom = 30;
  const paddingTop = 20;
  const chartHeight = h - paddingBottom - paddingTop;
  const stepX = w / (days.length - 1);

  const points = values.map((val, idx) => {
    // RTL layout: right to left
    const x = w - idx * stepX;
    const y = h - paddingBottom - val * chartHeight;
    return { x, y };
  });

  ctx.clearRect(0, 0, w, h);

  // Draw smooth gradient fill under the curve
  const gradient = ctx.createLinearGradient(0, paddingTop, 0, h - paddingBottom);
  gradient.addColorStop(0, 'rgba(216, 27, 96, 0.35)');
  gradient.addColorStop(0.7, 'rgba(216, 27, 96, 0.08)');
  gradient.addColorStop(1, 'rgba(216, 27, 96, 0)');

  ctx.beginPath();
  ctx.moveTo(points[0].x, h - paddingBottom);
  ctx.lineTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
    const cp1x = (points[i].x + points[i + 1].x) / 2;
    const cp1y = points[i].y;
    const cp2x = (points[i].x + points[i + 1].x) / 2;
    const cp2y = points[i + 1].y;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i + 1].x, points[i + 1].y);
  }

  ctx.lineTo(points[points.length - 1].x, h - paddingBottom);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw main stroke curve
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
    const cp1x = (points[i].x + points[i + 1].x) / 2;
    const cp1y = points[i].y;
    const cp2x = (points[i].x + points[i + 1].x) / 2;
    const cp2y = points[i + 1].y;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i + 1].x, points[i + 1].y);
  }

  ctx.strokeStyle = '#b0004a';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw dots and day labels
  points.forEach((pt, idx) => {
    // Outer glow
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#b0004a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#b0004a';
    ctx.fill();

    // Text labels
    ctx.fillStyle = idx === 6 ? '#b0004a' : '#8e6f74';
    ctx.font = idx === 6 ? 'bold 11px Vazirmatn' : '10px Vazirmatn';
    ctx.textAlign = 'center';
    ctx.fillText(days[idx], pt.x, h - 8);
  });
}

// Order management actions
function markOrderPacked(btn, orderId) {
  btn.textContent = 'بسته‌بندی شد ✓';
  btn.style.backgroundColor = '#10b981';
  btn.style.color = '#fff';
  btn.disabled = true;
  showToast(`سفارش ${orderId} با موفقیت در انبار میرداماد بسته‌بندی محرمانه شد.`, 'success');
}

function showTrackingCode(orderId, code) {
  alert(`کد رهگیری پستی مرسوله ${orderId}:\n${code}\nارسال با پست ویژه پیشتاز و تحویل ۲۴ ساعته`);
}

function reorderStock(productName, size) {
  showToast(`درخواست سفارش مجدد «${productName}» (سایز ${size}) به کارگاه دوخت آتلیه ارسال شد.`, 'success');
}

// Admin Products catalog interactions
function initAdminProducts() {
  const selectAll = document.getElementById('select-all-products');
  const checkboxes = document.querySelectorAll('.product-row-check');
  const bulkBar = document.getElementById('bulk-actions-bar');
  const countSpan = document.getElementById('selected-count-span');

  if (selectAll) {
    selectAll.addEventListener('change', () => {
      checkboxes.forEach(cb => cb.checked = selectAll.checked);
      updateBulkBar();
    });
  }

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      updateBulkBar();
    });
  });

  function updateBulkBar() {
    const checked = Array.from(checkboxes).filter(c => c.checked).length;
    if (countSpan) countSpan.textContent = toPersianDigits(checked) + ' مورد انتخاب شده';
    if (bulkBar) {
      bulkBar.style.display = checked > 0 ? 'flex' : 'none';
    }
  }

  // Filter products by search
  const searchInput = document.getElementById('admin-product-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const rows = document.querySelectorAll('.admin-product-row');
      rows.forEach(r => {
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }
}

// Export orders simulation
function exportExcel() {
  showToast('خروجی Excel با فرمت استاندارد حسابداری در حال آماده‌سازی است...', 'rose');
  setTimeout(() => {
    showToast('فایل اکسل سفارشات اسفندماه آماده دانلود شد.', 'success');
  }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  initSalesChart();
  window.addEventListener('resize', initSalesChart);
  initAdminProducts();
});
