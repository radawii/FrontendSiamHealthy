// admin/js/dashboard.js

let globalOrders = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
});

// 1. ดึงข้อมูลสถิติและออเดอร์ทั้งหมดสำหรับหน้า Dashboard
async function fetchDashboardData() {
    try {
        const response = await fetch('http://localhost:3000/orders/stats/dashboard');
        if (!response.ok) throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้');

        const data = await response.json();
        globalOrders = data.recentOrders || [];
        
        // อัปเดตสถิติตัวเลขการ์ดด้านบน
        if(document.getElementById('statTodaySales')) {
            document.getElementById('statTodaySales').innerText = `฿${Number(data.todaySales || 0).toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
        }
        if(document.getElementById('statNewOrders')) document.getElementById('statNewOrders').innerText = data.newOrders || 0;
        if(document.getElementById('statPendingShipment')) document.getElementById('statPendingShipment').innerText = data.pendingShipment || 0;
        if(document.getElementById('statTotalCustomers')) document.getElementById('statTotalCustomers').innerText = Number(data.totalCustomers || 1204).toLocaleString();
        
        // ถ้ามีข้อมูล statCompletedShipment ส่งมาจาก Backend
        if(document.getElementById('statCompletedShipment')) {
            document.getElementById('statCompletedShipment').innerText = data.completedShipment || 0;
        }

        // เรนเดอร์รายการคำสั่งซื้อล่าสุดลงในตาราง (9 คอลัมน์)
        renderOrdersTable(data.recentOrders || []);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        document.getElementById('ordersTableBody').innerHTML = `
            <tr><td colspan="9" class="p-8 text-center text-red-500 font-medium">
                <i class="fas fa-exclamation-circle mr-1"></i> ไม่สามารถเชื่อมต่อฐานข้อมูลได้
            </td></tr>
        `;
    }
}

// 2. วาดตารางให้ตรงกับโครงสร้าง HTML ล่าสุด (9 คอลัมน์)
function renderOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    if (!orders || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="p-8 text-center text-gray-500">ยังไม่มีคำสั่งซื้อในระบบ</td></tr>`;
        return;
    }

    orders.forEach(order => {
        const displayCode = `ORD2026${String(order.id).padStart(5, '0')}`; 

        // จัดการวันที่ให้อยู่ในฟอร์แมต 2 บรรทัด (วันที่ / เวลา)
        const dateObj = new Date(order.createdAt || order.created_at || Date.now());
        const formattedDate = `${dateObj.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' })}<br>${dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`;

        // จัดการชื่อสินค้า
        let productName = 'ไม่มีข้อมูลสินค้า';
        let extraItems = '';
        if (order.orderItems && order.orderItems.length > 0) {
            productName = order.orderItems[0].productName;
            if (order.orderItems.length > 1) {
                extraItems = `<span class="text-xs text-indigo-600 font-semibold ml-1">(+${order.orderItems.length - 1} รายการ)</span>`;
            }
        }

        // จัดการข้อมูลลูกค้า
        let customerName = 'ไม่ระบุ';
        let customerContact = '';
        if (order.shippingAddress) {
            customerName = order.shippingAddress.fullname || 'ไม่ระบุ';
            customerContact = order.shippingAddress.phone || order.shippingAddress.phoneNumber || '';
        } else if (order.user) {
            customerName = order.user.name || order.user.username || 'ลูกค้าทั่วไป';
            customerContact = order.user.phone || '';
        }

        // จัดการสถานะและการชำระเงิน
        let paymentBadge = '';
        let canRefund = false;
        const pStatus = order.paymentStatus || order.payment_status || 'PENDING';
        const oStatus = order.orderStatus || order.order_status || 'PROCESSING';
        const method = order.paymentMethod || 'promptpay';
        
        let methodText = 'PromptPay';
        let methodIcon = 'fa-qrcode text-blue-600';
        if (method.toLowerCase().includes('card')) {
            methodText = 'Credit Card';
            methodIcon = 'fa-credit-card text-purple-600';
        } else if (method.toLowerCase().includes('cod')) {
            methodText = 'COD';
            methodIcon = 'fa-money-bill-wave text-green-600';
        }

        if (pStatus === 'PAID') {
            paymentBadge = `<span class="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"><i class="fas fa-check-circle mr-1.5"></i> ชำระเงินสำเร็จ</span>`;
            canRefund = true; 
        } else if (pStatus === 'REFUNDED' || pStatus === 'PARTIALLY_REFUNDED') {
            paymentBadge = `<span class="inline-flex items-center px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"><i class="fas fa-undo mr-1.5"></i> คืนเงินแล้ว</span>`;
        } else {
            paymentBadge = `<span class="inline-flex items-center px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium"><i class="fas fa-hourglass-half mr-1.5"></i> รอชำระเงิน</span>`;
        }

        let shippingBadge = '';
        if (oStatus === 'COMPLETED') {
            shippingBadge = `<span class="inline-flex items-center px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"><i class="fas fa-check-double mr-1.5"></i> จัดส่งสำเร็จ</span>`;
        } else if (pStatus === 'PAID' || oStatus === 'PROCESSING') {
            shippingBadge = `<span class="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"><i class="fas fa-box mr-1.5"></i> Processing</span>`;
        } else {
            shippingBadge = `<span class="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"><i class="fas fa-clock mr-1.5"></i> Pending</span>`;
        }

        let actionBtns = `
            <a href="order-details.html?order_id=${displayCode}" class="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-lg hover:bg-indigo-100 transition inline-block" title="ดูรายละเอียด" onclick="event.stopPropagation();">
                <i class="fas fa-eye"></i>
            </a>
            ${canRefund ? `
                <button onclick="event.stopPropagation(); processRefund(${order.id}, ${order.grandTotal || order.grand_total || 0})" class="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-100 transition inline-block ml-1" title="คืนเงิน (Refund)">
                    <i class="fas fa-undo-alt"></i>
                </button>
            ` : ''}
        `;

        const row = `
            <tr onclick="window.location.href='order-details.html?order_id=${displayCode}'" class="hover:bg-indigo-50/50 transition cursor-pointer">
                <td class="p-4 font-medium">
                    <a href="order-details.html?order_id=${displayCode}" class="text-indigo-600 hover:underline font-semibold" onclick="event.stopPropagation();">${displayCode}</a>
                </td>
                <td class="p-4 text-gray-600 whitespace-nowrap">
                    <div class="text-gray-500 text-sm font-mono">${formattedDate}</div>
                </td>
                <td class="p-4">
                    <div class="font-medium text-gray-900">${customerName}</div>
                    <div class="text-xs text-gray-400">${customerContact}</div>
                </td>
                <td class="p-4 truncate">
                    ${productName} ${extraItems}
                </td>
                <td class="p-4 font-semibold text-gray-900 whitespace-nowrap">
                    ฿${Number(order.grandTotal || order.grand_total || 0).toLocaleString('th-TH', {minimumFractionDigits: 2})}
                </td>
                <td class="p-4">
                    <span class="inline-flex items-center text-gray-700 text-xs font-medium">
                        <i class="fas ${methodIcon} mr-1.5"></i> ${methodText}
                    </span>
                </td>
                <td class="p-4 whitespace-nowrap">${paymentBadge}</td>
                <td class="p-4 whitespace-nowrap">${shippingBadge}</td>
                <td class="p-4 text-center whitespace-nowrap">${actionBtns}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// 3. ประมวลผลการคืนเงิน (Refund)
function processRefund(orderId, maxAmount) {
    Swal.fire({
        title: 'ดำเนินการคืนเงิน (Refund)',
        html: `
            <p class="text-sm mb-4 text-gray-600">ออเดอร์ <strong class="text-gray-900">#${orderId}</strong> ยอดสูงสุดที่คืนได้: <strong class="text-indigo-600">฿${maxAmount.toLocaleString('th-TH', {minimumFractionDigits: 2})}</strong></p>
            <div class="text-left mb-2">
                <label class="text-sm font-medium text-gray-700">ระบุยอดเงินที่ต้องการคืน</label>
                <p class="text-xs text-gray-400 mb-2">(ปล่อยว่างเพื่อคืนเต็มจำนวน)</p>
            </div>
            <input type="number" id="refundAmount" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="เช่น 500" max="${maxAmount}" min="1">
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'ยืนยันการคืนเงิน',
        cancelButtonText: 'ยกเลิก',
        preConfirm: () => {
            const amountInput = document.getElementById('refundAmount').value;
            if (amountInput && (Number(amountInput) <= 0 || Number(amountInput) > maxAmount)) {
                Swal.showValidationMessage('กรุณาระบุยอดเงินให้ถูกต้อง (ห้ามเกินยอดสุทธิ)');
                return false;
            }
            return amountInput ? Number(amountInput) : null; 
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const refundAmount = result.value;
            
            Swal.fire({ title: 'กำลังดำเนินการกับ Stripe...', allowOutsideClick: false, showConfirmButton: false, didOpen: () => { Swal.showLoading(); } });

            try {
                const response = await fetch(`http://localhost:3000/payments/refund/${orderId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(refundAmount ? { amount: refundAmount } : {}) 
                });

                const data = await response.json();

                if (!response.ok) throw new Error(data.message || 'เกิดข้อผิดพลาดในการคืนเงิน');

                Swal.fire({
                    icon: 'success',
                    title: 'คืนเงินสำเร็จ!',
                    text: `ระบบทำการคืนเงินให้ลูกค้าผ่าน Stripe เรียบร้อยแล้ว`,
                    confirmButtonColor: '#10b981'
                }).then(() => {
                    fetchDashboardData(); 
                });

            } catch (error) {
                Swal.fire('ข้อผิดพลาด', error.message, 'error');
            }
        }
    });
}

// 4. Export เป็น CSV (ถ้าหน้าไหนเรียกใช้)
function exportToCSV() {
    if (!globalOrders || globalOrders.length === 0) {
        Swal.fire('แจ้งเตือน', 'ไม่มีข้อมูลสำหรับ Export', 'warning');
        return;
    }

    let csvContent = '\uFEFF'; 
    csvContent += 'รหัสคำสั่งซื้อ,วันที่สั่งซื้อ,ชื่อลูกค้า,เบอร์โทร,ยอดสุทธิ,ช่องทางชำระเงิน,สถานะการชำระเงิน,สถานะการจัดส่ง\n';

    globalOrders.forEach(order => {
        const id = `ORD2026${String(order.id).padStart(5, '0')}`;
        const name = order.shippingAddress ? order.shippingAddress.fullname : (order.user ? order.user.name : 'ไม่ระบุ');
        const phone = order.shippingAddress ? (order.shippingAddress.phone || order.shippingAddress.phoneNumber) : '-';
        const total = order.grandTotal || order.grand_total || 0;
        const method = order.paymentMethod || '-';
        const pStatus = order.paymentStatus || order.payment_status || 'PENDING';
        const oStatus = order.orderStatus || order.order_status || 'PENDING';
        const date = new Date(order.createdAt || order.created_at || Date.now()).toLocaleString('th-TH').replace(',', '');
        
        csvContent += `${id},"${date}","${name}","${phone}",${total},${method},${pStatus},${oStatus}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Orders_Export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}