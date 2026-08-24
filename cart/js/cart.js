// js/cart.js

let currentStep = 1;

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  goToTypeStep(1);
});

// ฟังก์ชันตรวจสอบสถานะการเข้าสู่ระบบอย่างแม่นยำ
function checkUserLoggedIn() {
  const customToken = localStorage.getItem('siam_healthy_user');
  const supabaseToken = localStorage.getItem('sb-qqzgfnjrnenncgxbrqel-auth-token');

  const hasCustomAuth = customToken && customToken !== 'null' && customToken !== 'undefined' && customToken.trim() !== '' && customToken !== '[]' && customToken !== '{}';
  const hasSupabaseAuth = supabaseToken && supabaseToken !== 'null' && supabaseToken !== 'undefined' && supabaseToken !== '[]' && supabaseToken !== '{}';

  return hasCustomAuth || hasSupabaseAuth;
}

// -----------------------------------------
// 1. การจัดการ Stepper และ Layout
// -----------------------------------------
function goToTypeStep(stepNumber) {
  const cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
  const selectedItems = cart.filter(i => i.selected);

  // ดักการข้ามขั้นตอนถ้ายังไม่ได้เลือกสินค้า
  if (stepNumber > 1 && selectedItems.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'ตะกร้าว่างเปล่า',
      text: 'กรุณาเลือกสินค้าในตะกร้าอย่างน้อย 1 รายการก่อนดำเนินการต่อ',
      confirmButtonColor: '#0f766e'
    });
    return;
  }

  // ===============================================
  // 🔐 ระบบบังคับ Login ก่อนไปหน้าจัดส่ง (Step 2 หรือ 3)
  // ===============================================
  if (stepNumber >= 2) {
    if (!checkUserLoggedIn()) {
        Swal.fire({
            icon: 'warning',
            title: 'กรุณาเข้าสู่ระบบ',
            text: 'คุณจำเป็นต้องเข้าสู่ระบบก่อนดำเนินการสั่งซื้อสินค้า',
            showCancelButton: true,
            confirmButtonText: 'ไปหน้าเข้าสู่ระบบ',
            cancelButtonText: 'ปิด',
            confirmButtonColor: '#0f766e',
            cancelButtonColor: '#cbd5e1',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '../login.html'; 
            }
        });
        
        return; // 🛑 บล็อกไม่ให้เปิดหน้า Step 2 หรือ 3
    }
  }
  // ===============================================

  // ซ่อนเนื้อหาทุก Step ก่อน
  const step1 = document.getElementById('step1-content');
  const step2 = document.getElementById('step2-content');
  const step3 = document.getElementById('step3-content');

  if (step1) step1.style.display = 'none';
  if (step2) step2.style.display = 'none';
  if (step3) step3.style.display = 'none';

  const cartContainer = document.querySelector('.cart-container');
  const summarySection = document.getElementById('cartSummarySection');

  // ควบคุมแถบสรุปยอดด้านขวา
  if (stepNumber === 1) {
    if (cartContainer) cartContainer.classList.remove('checkout-layout');
    if (summarySection) summarySection.style.display = 'none';
  } else {
    if (cartContainer) cartContainer.classList.add('checkout-layout');
    if (summarySection) summarySection.style.display = 'block';

    if (stepNumber === 2) {
      document.getElementById('shippingSummaryBox').style.display = 'none';
      document.getElementById('checkoutBtn').style.display = 'none';
      if (typeof renderSavedAddresses === 'function') renderSavedAddresses();
    } else if (stepNumber === 3) {
      document.getElementById('shippingSummaryBox').style.display = 'block';
      document.getElementById('checkoutBtn').style.display = 'flex';
      if (typeof renderCheckoutReviewItems === 'function') renderCheckoutReviewItems();
    }
  }

  // แสดงเนื้อหาของ Step ปัจจุบัน
  const targetStep = document.getElementById(`step${stepNumber}-content`);
  if (targetStep) targetStep.style.display = 'block';

  // อัปเดตสถานะ Progress Bar ด้านบน
  const stepItems = document.querySelectorAll('.checkout-stepper .step-item');
  stepItems.forEach((item, idx) => {
    if (idx + 1 <= stepNumber) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  currentStep = stepNumber;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// -----------------------------------------
// 2. ระบบตะกร้าสินค้า (Render & Logic)
// -----------------------------------------
function renderCart() {
  const cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
  const container = document.querySelector('.cart-items-list');
  const selectAllText = document.querySelector('.select-text');
  const selectAllCheckbox = document.getElementById('selectAll');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 50px 20px;">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" style="margin-bottom: 12px;">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <p style="color: var(--text-muted); font-size: 1.05rem; margin-bottom: 20px;">ยังไม่มีสินค้าในตะกร้าของคุณ</p>
        <button type="button" onclick="window.location.href='../shop/'" class="checkout-btn" style="max-width: 220px; margin: 0 auto; display: flex; padding: 10px 20px;">
          เลือกซื้อสินค้าเลย
        </button>
      </div>
    `;
    if (selectAllText) selectAllText.innerText = `เลือกทั้งหมด (0/0 รายการ)`;
    if (selectAllCheckbox) selectAllCheckbox.checked = false;

    calculateSummary();
    return;
  }

  let itemsHTML = cart.map((item, index) => {
    let imgPath = item.image || '';
    if (imgPath) {
      imgPath = imgPath.replace(/^\.\//, '').replace(/^\//, '');
      if (!imgPath.startsWith('../shop/') && !imgPath.startsWith('http')) {
        imgPath = imgPath.startsWith('shop/') ? '../' + imgPath : '../shop/' + imgPath;
      }
    } else {
      imgPath = '../shop/img/elsie/elsie1.png';
    }

    return `
      <div class="cart-item-card" data-index="${index}">
        <label class="custom-checkbox item-checkbox">
          <input type="checkbox" ${item.selected ? 'checked' : ''} onchange="toggleSelect(${index})">
          <span class="checkmark"></span>
        </label>

        <div class="item-img-box">
          <img src="${imgPath}" alt="${item.name}" onerror="this.onerror=null; this.src='../shop/img/elsie/elsie1.png';">
        </div>

        <div class="item-details">
          <div class="item-title-row">
            <h3 class="item-name">${item.name}</h3>
            <button type="button" class="remove-item-btn" onclick="removeItem(${index})" aria-label="Remove item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <p class="item-subtitle">จัดจำหน่ายโดย: Siam-Healthy Official</p>
          <p class="item-tag-info">${item.tag || '#ผลิตภัณฑ์เสริมอาหาร'}</p>

          <div class="item-bottom-row">
            <div class="item-price">
              <span class="current-price">฿${item.price.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
              ${item.oldPrice ? `<span class="old-price">฿${item.oldPrice.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>` : ''}
            </div>
            <div class="quantity-control">
              <button type="button" class="qty-btn minus" onclick="changeQty(${index}, -1)">-</button>
              <input type="text" class="qty-input" value="${item.quantity}" readonly>
              <button type="button" class="qty-btn plus" onclick="changeQty(${index}, 1)">+</button>
            </div>
          </div>
          <div class="item-shipping-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <span>จัดส่งด่วนฟรี รับสินค้าภายใน 1-2 วัน</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const selectedItems = cart.filter(i => i.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  itemsHTML += `
    <div class="cart-footer-actions-wrapper" style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
      <button type="button" onclick="window.location.href='../shop/'" class="back-btn cart-footer-back-btn">
        เลือกซื้อสินค้าเพิ่มเติม
      </button>

      <div class="cart-footer-summary-group" style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
        <div style="text-align: right;">
          <span style="font-size: 0.9rem; color: var(--text-muted); margin-right: 8px;">ยอดรวมสุทธิ:</span>
          <span style="font-size: 1.25rem; font-weight: 700; color: var(--primary-color);">฿${subtotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
        </div>

        <button type="button" onclick="goToTypeStep(2)" class="checkout-btn cart-footer-checkout-btn" ${selectedItems.length === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
          <span>ไปหน้าที่อยู่จัดส่ง</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  `;

  container.innerHTML = itemsHTML;

  const selectedCount = cart.filter(i => i.selected).length;
  if (selectAllText) selectAllText.innerText = `เลือกทั้งหมด (${selectedCount}/${cart.length} รายการ)`;
  if (selectAllCheckbox) selectAllCheckbox.checked = selectedCount === cart.length && cart.length > 0;

  calculateSummary();
}

function changeQty(index, delta) {
  let cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
  if (cart[index]) {
    cart[index].quantity += delta;
    if (cart[index].quantity < 1) cart[index].quantity = 1;
    localStorage.setItem('siam_healthy_cart', JSON.stringify(cart));
    renderCart();
    updateCartBadge();
  }
}

function removeItem(index) {
  Swal.fire({
    title: 'ลบสินค้า?',
    text: "คุณต้องการลบสินค้านี้ออกจากตะกร้าใช่หรือไม่",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e11d48',
    cancelButtonColor: '#cbd5e1',
    confirmButtonText: 'ใช่, ลบออก',
    cancelButtonText: 'ยกเลิก'
  }).then((result) => {
    if (result.isConfirmed) {
      let cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
      cart.splice(index, 1);
      localStorage.setItem('siam_healthy_cart', JSON.stringify(cart));
      renderCart();
      updateCartBadge();
    }
  });
}

function clearSelectedItems() {
  let cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
  const hasSelected = cart.some(i => i.selected);
  
  if (!hasSelected) return;

  Swal.fire({
    title: 'ลบรายการที่เลือก?',
    text: "คุณแน่ใจหรือไม่ที่จะลบสินค้าที่เลือกทั้งหมด",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e11d48',
    cancelButtonColor: '#cbd5e1',
    confirmButtonText: 'ลบทั้งหมด',
    cancelButtonText: 'ยกเลิก'
  }).then((result) => {
    if (result.isConfirmed) {
      cart = cart.filter(i => !i.selected);
      localStorage.setItem('siam_healthy_cart', JSON.stringify(cart));
      renderCart();
      updateCartBadge();
    }
  });
}

function toggleSelect(index) {
  let cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
  if (cart[index]) {
    cart[index].selected = !cart[index].selected;
    localStorage.setItem('siam_healthy_cart', JSON.stringify(cart));
    renderCart();
  }
}

function toggleSelectAll(checkboxEl) {
  let cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
  cart.forEach(item => item.selected = checkboxEl.checked);
  localStorage.setItem('siam_healthy_cart', JSON.stringify(cart));
  renderCart();
}

function calculateSummary() {
  const cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
  const selectedItems = cart.filter(i => i.selected);

  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = 0; 
  const grandTotal = Math.max(0, subtotal - discount);

  const subtotalEl = document.getElementById('subtotalAmount');
  const discountEl = document.getElementById('discountAmount');
  const grandTotalEl = document.getElementById('grandTotalAmount');

  if (subtotalEl) subtotalEl.innerText = `฿${subtotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
  if (discountEl) discountEl.innerText = subtotal > 0 ? `-฿${discount.toLocaleString('th-TH', {minimumFractionDigits: 2})}` : '฿0.00';
  if (grandTotalEl) grandTotalEl.innerText = `฿${grandTotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  document.querySelectorAll('.cart-badge').forEach(badge => {
    if (totalCount > 0) {
      badge.innerText = totalCount;
      badge.style.display = 'flex';
    } else {
      badge.innerText = '';
      badge.style.display = 'none';
    }
  });
}

function refreshAllUI() {
  if (typeof renderCheckoutReviewItems === 'function') renderCheckoutReviewItems();
  calculateSummary();
  updateCartBadge();
  renderCart();
}