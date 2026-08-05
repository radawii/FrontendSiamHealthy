document.addEventListener('DOMContentLoaded', () => {
  loadOrderDetail();
});

function loadOrderDetail() {
  // 1. ดึง Order ID จาก Query Parameter ใน URL (?orderId=ORD-xxxxxx)
  const urlParams = new URLSearchParams(window.location.search);
  const targetOrderId = urlParams.get('orderId');

  const notFoundBox = document.getElementById('notFoundBox');
  const detailContent = document.getElementById('orderDetailContent');

  if (!targetOrderId) {
    if (notFoundBox) notFoundBox.style.display = 'block';
    if (detailContent) detailContent.style.display = 'none';
    return;
  }

  // 2. ดึงรายการคำสั่งซื้อจาก localStorage CRM System
  const crmOrders = JSON.parse(localStorage.getItem('siam_healthy_crm_orders')) || [];
  
  // ค้นหา Order ตาม Order ID
  const order = crmOrders.find(o => o.orderId === targetOrderId);

  if (!order) {
    if (notFoundBox) notFoundBox.style.display = 'block';
    if (detailContent) detailContent.style.display = 'none';
    return;
  }

  // แสดงผลหน้าจอหลัก
  if (notFoundBox) notFoundBox.style.display = 'none';
  if (detailContent) detailContent.style.display = 'block';

  // 3. แสดงผลข้อมูลส่วนป้ายคำสั่งซื้อ & วันที่
  document.getElementById('orderIdText').innerText = order.orderId;
  
  const orderDate = order.timestamp ? new Date(order.timestamp) : new Date();
  const dateStr = orderDate.toLocaleDateString('th-TH', { 
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
  document.getElementById('orderDateText').innerText = `สั่งซื้อเมื่อ: ${dateStr}`;

  // 4. แสดง Badge สถานะ และข้อความแจ้งเตือนระยะเวลาจัดส่ง
  const statusBadge = document.getElementById('orderStatusBadge');
  const statusText = document.getElementById('statusText');
  const shippingNotice = document.getElementById('shippingNoticeText');

  const currentStatus = (order.orderStatus || '').trim();

  if (currentStatus === 'ชำระเงินแล้ว') {
    if (statusBadge) statusBadge.className = 'status-badge paid';
    if (statusText) statusText.innerText = 'ชำระเงินแล้ว';
    
    // แสดงข้อความแจ้งเตือนจัดเตรียมพัสดุเฉพาะตอนชำระเงินแล้ว
    if (shippingNotice) {
      shippingNotice.style.display = 'inline-flex';
      shippingNotice.innerHTML = `กำลังจัดเตรียมพัสดุ ท่านจะได้รับสินค้าภายใน 2-3 วัน`;
    }
  } else if (currentStatus === 'กำลังจัดส่ง') {
    if (statusBadge) statusBadge.className = 'status-badge shipping';
    if (statusText) statusText.innerText = 'กำลังจัดส่ง';
    
    if (shippingNotice) {
      shippingNotice.style.display = 'inline-flex';
      shippingNotice.innerHTML = `พัสดุอยู่ระหว่างการจัดส่งไปยังที่อยู่ของคุณ`;
    }
  } else if (currentStatus === 'จัดส่งสำเร็จ' || currentStatus === 'จัดส่งเรียบร้อย') {
    if (statusBadge) statusBadge.className = 'status-badge delivered';
    if (statusText) statusText.innerText = 'จัดส่งสำเร็จ';
    
    if (shippingNotice) {
      shippingNotice.style.display = 'inline-flex';
      shippingNotice.innerHTML = `จัดส่งสินค้าสำเร็จเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ`;
    }
  } else if (currentStatus === 'จัดส่งไม่สำเร็จ') {
    if (statusBadge) statusBadge.className = 'status-badge failed';
    if (statusText) statusText.innerText = 'จัดส่งไม่สำเร็จ';
    
    if (shippingNotice) {
      shippingNotice.style.display = 'inline-flex';
      shippingNotice.innerHTML = `การจัดส่งไม่สำเร็จ กรุณาติดต่อเจ้าหน้าที่เพื่อรับความช่วยเหลือ`;
    }
  } else {
    if (statusBadge) statusBadge.className = 'status-badge pending';
    if (statusText) statusText.innerText = currentStatus || 'รอชำระเงิน';
    
    // ซ่อนข้อความแจ้งเตือนกรณีรอชำระเงินหรือสถานะอื่นๆ
    if (shippingNotice) {
      shippingNotice.style.display = 'none';
    }
  }

  // 5. เรนเดอร์รายการสินค้าที่สั่งซื้อ
  const itemsContainer = document.getElementById('orderItemsList');
  if (itemsContainer && order.items && order.items.length > 0) {
    itemsContainer.innerHTML = order.items.map(item => {
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
        <div class="order-item-row">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${imgPath}" alt="${item.name}" onerror="this.src='../shop/img/elsie/elsie1.png';" style="width: 54px; height: 54px; object-fit: cover; border-radius: 8px; border: 1px solid #f1f5f9;">
            <div>
              <h4 style="font-size: 0.95rem; font-weight: 600; color: #1e293b; margin-bottom: 2px;">${item.name}</h4>
              <span style="font-size: 0.85rem; color: #64748b;">จำนวน: x${item.quantity} | ฿${item.price.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
          <div style="font-weight: 600; color: var(--primary-color, #10b981); font-size: 0.95rem;">
            ฿${(item.price * item.quantity).toLocaleString('th-TH', {minimumFractionDigits: 2})}
          </div>
        </div>
      `;
    }).join('');
  } else if (itemsContainer) {
    itemsContainer.innerHTML = `<p style="color: #64748b; font-size: 0.9rem;">ไม่มีข้อมูลรายการสินค้า</p>`;
  }

  // 6. แสดงข้อมูลผู้สั่งซื้อ
  if (order.customer) {
    document.getElementById('customerName').innerText = order.customer.fullname || '-';
    document.getElementById('customerPhone').innerText = order.customer.phone || '-';
    document.getElementById('customerEmail').innerText = order.customer.email || '-';
    document.getElementById('customerAddress').innerText = order.customer.address || '-';
  }

  // 7. แสดงสรุปยอดเงินและวิธีชำระเงิน
  document.getElementById('paymentMethodText').innerText = order.paymentMethod || 'ชำระผ่านระบบ';
  document.getElementById('transactionRefText').innerText = order.transactionRef || '-';

  if (order.summary) {
    document.getElementById('subtotalText').innerText = `฿${(order.summary.subtotal || 0).toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
    document.getElementById('discountText').innerText = order.summary.discount > 0 ? `-฿${(order.summary.discount).toLocaleString('th-TH', {minimumFractionDigits: 2})}` : '฿0.00';
    document.getElementById('vatText').innerText = `฿${(order.summary.vat || 0).toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
    document.getElementById('grandTotalText').innerText = `฿${(order.summary.grandTotal || 0).toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
  }
}