// ตัวแปรสำหรับเก็บ Order ID ล่าสุดเพื่อใช้ส่งต่อเข้าหน้า Order Detail
let latestCreatedOrderId = '';
let currentStep = 1;

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  goToTypeStep(1);
});

function goToTypeStep(stepNumber) {
  const cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
  const selectedItems = cart.filter(i => i.selected);

  if (stepNumber > 1 && selectedItems.length === 0) {
    alert('กรุณาเลือกสินค้าในตะกร้าอย่างน้อย 1 รายการก่อนดำเนินการต่อ');
    return;
  }

  if (currentStep === 2 && stepNumber === 3) {
    const form = document.getElementById('shipping-form');
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
    }
  }

  const step1 = document.getElementById('step1-content');
  const step2 = document.getElementById('step2-content');
  const step3 = document.getElementById('step3-content');

  if (step1) step1.style.display = 'none';
  if (step2) step2.style.display = 'none';
  if (step3) step3.style.display = 'none';

  const cartContainer = document.querySelector('.cart-container');
  const summarySection = document.getElementById('cartSummarySection');

  if (stepNumber === 3) {
    if (cartContainer) cartContainer.classList.add('checkout-layout');
    if (summarySection) summarySection.style.display = 'flex';
    renderCheckoutReviewItems();
  } else {
    if (cartContainer) cartContainer.classList.remove('checkout-layout');
    if (summarySection) summarySection.style.display = 'none';
  }

  const targetStep = document.getElementById(`step${stepNumber}-content`);
  if (targetStep) targetStep.style.display = 'block';

  const stepItems = document.querySelectorAll('.checkout-stepper .step-item');
  stepItems.forEach((item, idx) => {
    if (idx + 1 <= stepNumber) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  currentStep = stepNumber;
  calculateSummary();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateAndGoToStep3() {
  const form = document.getElementById('shipping-form');
  if (form && form.checkValidity()) {
    const fullname = document.getElementById('fullname').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email') ? document.getElementById('email').value : '';
    const address = document.getElementById('address').value;
    const subdistrict = document.getElementById('subdistrict').value;
    const district = document.getElementById('district').value;
    const province = document.getElementById('province').value;
    const zipcode = document.getElementById('zipcode').value;

    const summaryBox = document.getElementById('summaryAddressText');
    if (summaryBox) {
      summaryBox.innerHTML = `
        <div style="font-weight: 600; color: var(--text-heading); font-size: 0.95rem; margin-bottom: 6px;">
          ${fullname} <span style="font-weight: 400; color: var(--text-muted); margin: 0 8px;">|</span> <span style="font-weight: 400; color: var(--text-dark);">${phone}</span>
        </div>
        ${email ? `<div style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 4px;">${email}</div>` : ''}
        <div style="color: var(--text-dark); margin-bottom: 4px; line-height: 1.5;">
          ${address}
        </div>
        <div style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.5;">
          ${subdistrict}, ${district}, ${province} ${zipcode}
        </div>
      `;
    }

    goToTypeStep(3);
  } else if (form) {
    form.reportValidity();
  }
}

// [ปรับปรุงฟังก์ชันคำนวณ]: คำนวณอัตโนมัติ ยอดรวมสินค้า + ค่าจัดส่ง - ส่วนลด + ภาษี VAT 7%
function calculateSummary() {
  const cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
  const selectedItems = cart.filter(i => i.selected);

  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal > 0 ? 100 : 0;
  const shippingFee = 0; // จัดส่งฟรี
  
  // คำนวณภาษี VAT 7%
  const taxableAmount = Math.max(0, subtotal - discount);
  const vat = taxableAmount * 0.07;
  const grandTotal = taxableAmount + shippingFee + vat;

  const subtotalEl = document.getElementById('subtotalAmount');
  const discountEl = document.getElementById('discountAmount');
  const vatEl = document.getElementById('vatAmount');
  const grandTotalEl = document.getElementById('grandTotalAmount');

  if (subtotalEl) subtotalEl.innerText = `฿${subtotal.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if (discountEl) discountEl.innerText = subtotal > 0 ? `-฿${discount.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '฿0.00';
  if (vatEl) vatEl.innerText = `฿${vat.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if (grandTotalEl) grandTotalEl.innerText = `฿${grandTotal.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  return { subtotal, discount, shippingFee, vat, grandTotal };
}

// ==========================================
// ฟังก์ชันกระบวนการชำระเงินและบันทึกลง CRM / Order System
// ==========================================
async function processPayment() {
  const cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
  const selectedItems = cart.filter(i => i.selected);

  if (selectedItems.length === 0) {
    alert('ไม่พบรายการสินค้าที่เลือกชำระเงิน');
    return;
  }

  // 1. ดึงข้อมูลผู้สั่งซื้อ
  const fullname = document.getElementById('fullname')?.value || 'คุณลูกค้า';
  const phone = document.getElementById('phone')?.value || '-';
  const email = document.getElementById('email')?.value || 'customer@example.com';
  const address = document.getElementById('address')?.value || '-';
  const subdistrict = document.getElementById('subdistrict')?.value || '';
  const district = document.getElementById('district')?.value || '';
  const province = document.getElementById('province')?.value || '';
  const zipcode = document.getElementById('zipcode')?.value || '';

  // 2. ดึงช่องทางการชำระเงิน
  const selectedPaymentEl = document.querySelector('input[name="paymentMethod"]:checked');
  const paymentMethodVal = selectedPaymentEl ? selectedPaymentEl.value : 'promptpay';

  const paymentTextMap = {
    'promptpay': 'QR Code / PromptPay',
    'credit': 'บัตรเครดิต / บัตรเดบิต',
    'ewallet': 'E-Wallet (TrueMoney)',
    'cod': 'เก็บเงินปลายทาง (COD)'
  };
  const paymentMethodText = paymentTextMap[paymentMethodVal] || 'โอนเงินชำระผ่านระบบ';

  // 3. คำนวณยอดเงิน และสร้างเลขอ้างอิง
  const summary = calculateSummary();
  const transactionRef = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
  const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  latestCreatedOrderId = orderId; // บันทึกไว้ใช้ลิงก์ไปยังหน้ารายละเอียด

  const now = new Date();
  const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // 4. สร้างข้อมูลคำสั่งซื้อ พร้อมเปลี่ยนสถานะเป็น "ชำระเงินแล้ว" อัตโนมัติ
  const orderRecord = {
    orderId: orderId,
    transactionRef: transactionRef,
    orderStatus: paymentMethodVal === 'cod' ? 'รอชำระเงินปลายทาง' : 'ชำระเงินแล้ว', // อัปเดตสถานะอัตโนมัติ
    paymentMethod: paymentMethodText,
    customer: {
      fullname,
      phone,
      email,
      address: `${address} ต.${subdistrict} อ.${district} จ.${province} ${zipcode}`
    },
    items: selectedItems,
    summary: summary,
    timestamp: now.toISOString()
  };

  // 5. บันทึกข้อมูลลงในระบบ CRM / Order Management (localStorage)
  const crmOrders = JSON.parse(localStorage.getItem('siam_healthy_crm_orders')) || [];
  crmOrders.push(orderRecord);
  localStorage.setItem('siam_healthy_crm_orders', JSON.stringify(crmOrders));

  // 6. แสดงผล UI ใบเสร็จ
  const receiptPaper = document.getElementById('receiptPaper');
  if (receiptPaper) {
    receiptPaper.innerHTML = `
      <div style="text-align: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 10px; margin-bottom: 10px;">
        <strong style="font-size: 1.05rem; color: #0f172a;">Siam-Healthy Official</strong><br>
        <span style="font-size: 0.78rem; color: #64748b;">ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ</span><br>
        <span style="font-size: 0.75rem; color: #94a3b8;">${dateStr}</span>
      </div>

      <div style="background: #f1f5f9; padding: 10px; border-radius: 8px; margin-bottom: 10px; font-size: 0.8rem; line-height: 1.5;">
        <div><strong>เลขที่คำสั่งซื้อ:</strong> ${orderId}</div>
        <div><strong>เลขอ้างอิงชำระเงิน (Ref):</strong> ${transactionRef}</div>
        <div><strong>ช่องทางชำระเงิน:</strong> ${paymentMethodText}</div>
        <div style="margin-top: 4px;">
          <strong>สถานะคำสั่งซื้อ:</strong> 
          <span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: 600;">
            ${orderRecord.orderStatus}
          </span>
        </div>
      </div>

      <div style="margin-bottom: 10px; font-size: 0.82rem; line-height: 1.5;">
        <strong>ผู้รับ:</strong> ${fullname} (${phone})<br>
        <strong>ที่อยู่:</strong> ${address} ต.${subdistrict} อ.${district} จ.${province} ${zipcode}<br>
        <strong style="color: #059669;">ส่งการยืนยันสำเร็จ:</strong> ทาง Email (${email}) และ SMS (${phone})
      </div>

      <div style="border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 8px;">
        ${selectedItems.map(i => `
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 4px;">
            <span>${i.name} (x${i.quantity})</span>
            <span>฿${(i.price * i.quantity).toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
          </div>
        `).join('')}
      </div>

      <div style="font-size: 0.82rem; display: flex; justify-content: space-between; margin-bottom: 2px;">
        <span>ยอดรวมสินค้า:</span>
        <span>฿${summary.subtotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
      </div>
      <div style="font-size: 0.82rem; display: flex; justify-content: space-between; margin-bottom: 2px; color: #ef4444;">
        <span>ส่วนลดคูปอง:</span>
        <span>-฿${summary.discount.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
      </div>
      <div style="font-size: 0.82rem; display: flex; justify-content: space-between; margin-bottom: 2px;">
        <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
        <span>฿${summary.vat.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
      </div>
      <div style="font-size: 0.85rem; display: flex; justify-content: space-between; font-weight: 700; color: #059669; border-top: 1px solid #cbd5e1; padding-top: 6px; margin-top: 6px;">
        <span>ยอดชำระสุทธิ:</span>
        <span>฿${summary.grandTotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
      </div>
    `;
  }

  // 7. เคลียร์ตะกร้าสินค้า
  const remainingCart = cart.filter(i => !i.selected);
  localStorage.setItem('siam_healthy_cart', JSON.stringify(remainingCart));
  updateCartBadge();

  // 8. แสดง Modal
  const modal = document.getElementById('receiptModal');
  if (modal) modal.style.display = 'flex';
}

// ฟังก์ชันเปิดไปหน้าดูรายละเอียดคำสั่งซื้อ (Order Detail)
function goToOrderDetailPage() {
  if (latestCreatedOrderId) {
    window.location.href = `./order-detail.html?orderId=${latestCreatedOrderId}`;
  } else {
    window.location.href = `./orders.html`;
  }
}

function renderCheckoutReviewItems() {
  const cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
  const container = document.getElementById('checkoutItemsReviewList');

  if (!container) return;

  const selectedItems = cart.filter(i => i.selected);

  if (selectedItems.length === 0) {
    alert('กรุณาเลือกสินค้าในตะกร้าอย่างน้อย 1 รายการ');
    goToTypeStep(1);
    return;
  }

  let reviewHTML = cart.map((item, index) => {
    if (!item.selected) return '';

    let imgPath = item.image || '';
    if (imgPath) {
      imgPath = imgPath.replace(/^\.\//, '').replace(/^\//, '');
      if (!imgPath.startsWith('../shop/')) {
        imgPath = imgPath.startsWith('shop/') ? '../' + imgPath : '../shop/' + imgPath;
      }
    } else {
      imgPath = '../shop/img/elsie/elsie1.png';
    }

    return `
      <div class="cart-item-card step3-item-card" data-index="${index}">
        <div class="item-img-box">
          <img src="${imgPath}" alt="${item.name}" onerror="this.onerror=null; this.src='../shop/img/elsie/elsie1.png';">
        </div>

        <div class="item-details">
          <div class="item-title-row">
            <h3 class="item-name">${item.name}</h3>
          </div>
          <p class="item-subtitle">จัดจำหน่ายโดย: Siam-Healthy Official</p>
          <p class="item-tag-info">${item.tag || '#ผลิตภัณฑ์เสริมอาหาร'}</p>

          <div class="item-bottom-row">
            <div class="item-price">
              <span class="current-price">฿${item.price.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
              ${item.oldPrice ? `<span class="old-price">฿${item.oldPrice.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>` : ''}
            </div>

            <div class="quantity-control">
              <button class="qty-btn minus" onclick="updateReviewQty(${index}, -1)">-</button>
              <input type="text" class="qty-input" value="${item.quantity}" readonly>
              <button class="qty-btn plus" onclick="updateReviewQty(${index}, 1)">+</button>
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

  container.innerHTML = reviewHTML;
}

function updateReviewQty(index, delta) {
  let cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
  if (cart[index]) {
    if (cart[index].quantity === 1 && delta === -1) {
      if (confirm(`คุณต้องการลบ "${cart[index].name}" ออกจากรายการสั่งซื้อใช่หรือไม่?`)) {
        cart.splice(index, 1);
      } else {
        return;
      }
    } else {
      cart[index].quantity += delta;
      if (cart[index].quantity < 1) cart[index].quantity = 1;
    }

    localStorage.setItem('siam_healthy_cart', JSON.stringify(cart));
    
    renderCheckoutReviewItems();
    calculateSummary();
    updateCartBadge();
    
    if (typeof renderCart === 'function') {
      renderCart();
    }
  }
}

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
        <button onclick="window.location.href='../shop/'" class="add-gift-btn" style="max-width: 220px; margin: 0 auto; display: block; padding: 10px 20px;">
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
      if (!imgPath.startsWith('../shop/')) {
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
          </div>
          <p class="item-subtitle">จัดจำหน่ายโดย: Siam-Healthy Official</p>
          <p class="item-tag-info">${item.tag || '#ผลิตภัณฑ์เสริมอาหาร'}</p>

          <div class="item-bottom-row">
            <div class="item-price">
              <span class="current-price">฿${item.price.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
              ${item.oldPrice ? `<span class="old-price">฿${item.oldPrice.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>` : ''}
            </div>
            <div class="quantity-control" style="display: flex; align-items: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 50px; padding: 2px 6px;">
              <button class="qty-btn minus" onclick="changeQty(${index}, -1)" style="width: 26px; height: 26px; border-radius: 50%; border: none; background: transparent; cursor: pointer; font-size: 0.9rem;">-</button>
              <input type="text" class="qty-input" value="${item.quantity}" readonly>
              <button class="qty-btn plus" onclick="changeQty(${index}, 1)" style="width: 26px; height: 26px; border-radius: 50%; border: none; background: transparent; cursor: pointer; font-size: 0.9rem;">+</button>
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
    <div class="cart-step1-footer" style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
      <button onclick="window.location.href='../shop/'" class="add-gift-btn" style="max-width: 200px; padding: 10px 20px; font-size: 0.95rem;">
        เลือกซื้อสินค้าเพิ่มเติม
      </button>

      <div style="display: flex; align-items: center; gap: 20px;">
        <div style="text-align: right;">
          <span style="font-size: 0.9rem; color: var(--text-muted); margin-right: 8px;">ยอดรวมสุทธิ:</span>
          <span style="font-size: 1.25rem; font-weight: 700; color: var(--primary-color);">฿${subtotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
        </div>

        <button onclick="goToTypeStep(2)" class="checkout-btn" style="max-width: 280px; margin: 0; padding: 12px 24px; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 8px;" ${selectedItems.length === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
          <span>ไปหน้าที่อยู่จัดส่ง</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
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
  let cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('siam_healthy_cart', JSON.stringify(cart));
  renderCart();
  updateCartBadge();
}

function clearSelectedItems() {
  let cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
  cart = cart.filter(i => !i.selected);
  localStorage.setItem('siam_healthy_cart', JSON.stringify(cart));
  renderCart();
  updateCartBadge();
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

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  document.querySelectorAll('.cart-badge').forEach(badge => {
    badge.innerText = totalCount;
  });
}