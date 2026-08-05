document.addEventListener('DOMContentLoaded', () => {
    loadOrdersHistory();
});

function loadOrdersHistory() {
    const emptyBox = document.getElementById('emptyOrdersBox');
    const container = document.getElementById('ordersListContainer');

    // 1. ดึงรายการคำสั่งซื้อจาก localStorage (จัดเก็บจากหน้า Checkout)
    const crmOrders = JSON.parse(localStorage.getItem('siam_healthy_crm_orders')) || [];

    if (!container) return;

    if (crmOrders.length === 0) {
        if (emptyBox) emptyBox.style.display = 'block';
        container.style.display = 'none';
        return;
    }

    if (emptyBox) emptyBox.style.display = 'none';
    container.style.display = 'flex';

    // 2. เรียงลำดับคำสั่งซื้อล่าสุดขึ้นก่อน (Newest First)
    const sortedOrders = crmOrders.reverse();

    // 3. เรนเดอร์การ์ดรายการคำสั่งซื้อ
    container.innerHTML = sortedOrders.map(order => {
        const orderDate = order.timestamp ? new Date(order.timestamp) : new Date();
        const dateStr = orderDate.toLocaleDateString('th-TH', { 
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        });

        // กำหนด Class และ Text สำหรับ Status Badge
        const statusObj = getStatusBadgeInfo(order.orderStatus);

        // จัดการรูปภาพสินค้าตัวแรกสำหรับเป็น Thumbnail
        let firstItemImg = order.items && order.items[0] ? order.items[0].image : '';
        if (firstItemImg) {
            firstItemImg = firstItemImg.replace(/^\.\//, '').replace(/^\//, '');
            if (!firstItemImg.startsWith('../shop/')) {
                firstItemImg = firstItemImg.startsWith('shop/') ? '../' + firstItemImg : '../shop/' + firstItemImg;
            }
        } else {
            firstItemImg = '../shop/img/elsie/elsie1.png';
        }

        const totalItemCount = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        const grandTotal = order.summary ? order.summary.grandTotal : 0;

        return `
            <div class="order-card" onclick="goToOrderDetail('${order.orderId}')">
                <div class="order-card-header">
                    <div>
                        <span class="order-id">${order.orderId}</span>
                        <span class="order-date">สั่งซื้อเมื่อ: ${dateStr}</span>
                    </div>
                    <span class="status-badge ${statusObj.badgeClass}">
                        ${statusObj.label}
                    </span>
                </div>

                <div class="order-card-body">
                    <div class="order-thumb-wrapper">
                        <img src="${firstItemImg}" alt="Product Image" onerror="this.src='../shop/img/elsie/elsie1.png';">
                        ${order.items && order.items.length > 1 ? `<span class="more-items-badge">+${order.items.length - 1}</span>` : ''}
                    </div>
                    
                    <div class="order-info-summary">
                        <h4 class="first-item-name">${order.items && order.items[0] ? order.items[0].name : 'รายการสินค้า'}</h4>
                        <p class="order-item-count">รวมทั้งหมด ${totalItemCount} ชิ้น</p>
                        <p class="order-payment-method">ชำระเงินผ่าน: ${order.paymentMethod || 'โอนเงินชำระผ่านระบบ'}</p>
                    </div>

                    <div class="order-price-col">
                        <span class="total-label">ยอดชำระสุทธิ</span>
                        <span class="total-amount">฿${grandTotal.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                </div>

                <div class="order-card-footer">
                    <span class="view-detail-btn">
                        <span>ดูรายละเอียดคำสั่งซื้อ</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// ช่วยคำนวณ Class สีป้ายสถานะ
function getStatusBadgeInfo(status) {
    const currentStatus = (status || '').trim();

    if (currentStatus === 'ชำระเงินแล้ว') {
        return { badgeClass: 'paid', label: 'ชำระเงินแล้ว' };
    } else if (currentStatus === 'กำลังจัดส่ง') {
        return { badgeClass: 'shipping', label: 'กำลังจัดส่ง' };
    } else if (currentStatus === 'จัดส่งสำเร็จ' || currentStatus === 'จัดส่งเรียบร้อย') {
        return { badgeClass: 'delivered', label: 'จัดส่งสำเร็จ' };
    } else if (currentStatus === 'จัดส่งไม่สำเร็จ') {
        return { badgeClass: 'failed', label: 'จัดส่งไม่สำเร็จ' };
    } else {
        return { badgeClass: 'pending', label: currentStatus || 'รอชำระเงิน' };
    }
}

// ลิงก์ไปยังหน้า order-detail.html
function goToOrderDetail(orderId) {
    window.location.href = `./order-detail.html?orderId=${orderId}`;
}