// admin/js/order-details.js

let currentOrderId = null;
let currentOrderData = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const rawOrderId = urlParams.get('order_id') || urlParams.get('id');

    if (!rawOrderId) {
        Swal.fire('ข้อผิดพลาด', 'ไม่พบรหัสคำสั่งซื้อในระบบ', 'error').then(() => {
            window.location.href = 'transactions.html';
        });
        return;
    }

    // ดึงเฉพาะตัวเลขจากรูปแบบ ORD2026xxxxx
    const match = rawOrderId.match(/ORD\d{4}(\d+)/);
    if (match) {
        currentOrderId = parseInt(match[1], 10);
    } else {
        currentOrderId = parseInt(rawOrderId, 10);
    }

    if (isNaN(currentOrderId)) {
        Swal.fire('ข้อผิดพลาด', 'รหัสคำสั่งซื้อไม่ถูกต้อง', 'error').then(() => {
            window.location.href = 'transactions.html';
        });
        return;
    }

    fetchOrderDetails(currentOrderId);
});

// 1. ดึงข้อมูลออเดอร์จาก Backend
async function fetchOrderDetails(orderId) {
    try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`http://localhost:3000/orders/${orderId}`, { headers });
        if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลออเดอร์ได้');

        const order = await response.json();
        currentOrderData = order;
        renderOrderDetails(order);
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อฐานข้อมูลเพื่อโหลดออเดอร์นี้ได้', 'error');
    }
}

// 2. แสดงผลข้อมูลลงในหน้า HTML
function renderOrderDetails(order) {
    const formattedOrderId = `ORD2026${String(order.id).padStart(5, '0')}`;
    document.getElementById('order-title').innerText = `คำสั่งซื้อ #${formattedOrderId}`;

    const dateObj = new Date(order.createdAt || order.created_at || Date.now());
    document.getElementById('order-date').innerHTML = `<i class="far fa-calendar-alt mr-1"></i> วันที่สั่งซื้อ: ${dateObj.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} น.`;

    // 🟢 แสดงสถานะออร์เดอร์ (Order Status)
    const badgeOrder = document.getElementById('badge-order-status');
    const oStatus = (order.orderStatus || order.order_status || 'PROCESSING').toUpperCase();
    if (oStatus === 'COMPLETED' || oStatus === 'DELIVERED') {
        badgeOrder.className = "px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200";
        badgeOrder.innerHTML = `<i class="fas fa-check-double mr-1.5"></i> จัดส่งสำเร็จ (Completed)`;
    } else if (oStatus === 'CANCELLED') {
        badgeOrder.className = "px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-200";
        badgeOrder.innerHTML = `<i class="fas fa-ban mr-1.5"></i> ยกเลิกแล้ว (Cancelled)`;
    } else {
        badgeOrder.className = "px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200";
        badgeOrder.innerHTML = `<i class="fas fa-box mr-1.5"></i> กำลังดำเนินการ (Processing)`;
    }

    // 🟢 แสดงสถานะการชำระเงิน (Payment Status)
    const badgePayment = document.getElementById('badge-payment-status');
    const paymentText = document.getElementById('payment-text-status');
    const pStatus = (order.paymentStatus || order.payment_status || 'PENDING').toUpperCase();
    
    if (pStatus === 'PAID') {
        badgePayment.className = "px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200";
        badgePayment.innerHTML = `<i class="fas fa-check-circle mr-1.5"></i> ชำระเงินแล้ว (Paid)`;
        paymentText.className = "text-xs font-medium text-green-600 mt-1";
        paymentText.innerHTML = `<i class="fas fa-check-circle mr-1"></i> ชำระเงินสำเร็จแล้ว`;
    } else if (pStatus.includes('REFUND')) {
        badgePayment.className = "px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold border border-rose-200";
        badgePayment.innerHTML = `<i class="fas fa-undo mr-1.5"></i> คืนเงินแล้ว (Refunded)`;
        paymentText.className = "text-xs font-medium text-rose-600 mt-1";
        paymentText.innerHTML = `<i class="fas fa-undo mr-1"></i> ดำเนินการคืนเงินแล้ว`;
    } else {
        badgePayment.className = "px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold border border-yellow-200";
        badgePayment.innerHTML = `<i class="fas fa-hourglass-half mr-1.5"></i> รอชำระเงิน (Pending)`;
        paymentText.className = "text-xs font-medium text-yellow-600 mt-1";
        paymentText.innerHTML = `<i class="fas fa-hourglass-half mr-1"></i> รอการตรวจสอบยอดเงิน`;
    }

    // เซ็ตค่าลงใน Modal ให้ตรงกับสถานะปัจจุบัน
    document.getElementById('select-order-status').value = oStatus === 'DELIVERED' ? 'COMPLETED' : oStatus;
    document.getElementById('select-payment-status').value = pStatus;

    // ข้อมูลลูกค้า
    const user = order.user || {};
    document.getElementById('customer-name').innerText = user.name || user.username || 'ลูกค้าทั่วไป';
    document.getElementById('customer-email').innerText = user.email || 'ไม่มีอีเมล';
    document.getElementById('customer-phone').innerText = order.shippingAddress?.phoneNumber || user.phone || 'ไม่มีเบอร์โทร';

    // ที่อยู่จัดส่ง
    const addr = order.shippingAddress || {};
    const addressBox = document.getElementById('shipping-address-box');
    addressBox.innerHTML = `
        <p class="font-semibold text-gray-900"><i class="fas fa-user w-4 text-gray-400"></i> คุณ ${addr.fullname || 'ไม่ระบุชื่อ'} (ผู้รับ)</p>
        <p><i class="fas fa-phone w-4 text-gray-400"></i> ${addr.phoneNumber || '-'}</p>
        <div class="flex items-start mt-2">
            <i class="fas fa-map-marker-alt w-4 text-gray-400 mt-1"></i>
            <p class="ml-1 leading-relaxed">
                ${addr.address || '-'}<br>
                ตำบล/แขวง: ${addr.subdistrict || '-'} | อำเภอ/เขต: ${addr.district || '-'}<br>
                จังหวัด: ${addr.province || '-'} <span class="font-semibold text-indigo-600">${addr.zipcode || ''}</span>
            </p>
        </div>
    `;

    // ช่องทางชำระเงิน
    document.getElementById('payment-method-text').innerText = order.paymentMethod ? order.paymentMethod.toUpperCase() : 'PROMPTPAY';

    // รายการสินค้า
    const itemsTable = document.getElementById('order-items-table');
    itemsTable.innerHTML = '';
    const items = order.orderItems || order.items || [];
    document.getElementById('item-count').innerText = `${items.length} รายการ`;

    let calculatedSubtotal = 0;
    items.forEach(item => {
        const total = (Number(item.price) || 0) * (Number(item.quantity) || 1);
        calculatedSubtotal += total;

        itemsTable.innerHTML += `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="p-4 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                        <i class="fas fa-box text-gray-400"></i>
                    </div>
                    <div>
                        <p class="font-bold text-gray-900">${item.productName || item.product_name || 'สินค้า'}</p>
                        <p class="text-xs text-gray-500 mt-0.5">รหัสสินค้า: ${item.productId || item.product_id || '-'}</p>
                    </div>
                </td>
                <td class="p-4 text-right font-medium text-gray-700">฿${Number(item.price || 0).toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
                <td class="p-4 text-center font-bold text-gray-900">${item.quantity || 1}</td>
                <td class="p-4 text-right font-bold text-indigo-600">฿${total.toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
            </tr>
        `;
    });

    // สรุปยอดเงิน
    const discount = Number(order.discountAmount || order.discount_amount || 0);
    const shippingFee = Number(order.shippingFee || order.shipping_fee || 0);
    const grandTotal = Number(order.grandTotal || order.grand_total || (calculatedSubtotal - discount + shippingFee));

    document.getElementById('summary-total').innerText = `฿${calculatedSubtotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
    document.getElementById('summary-discount').innerText = `- ฿${discount.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
    document.getElementById('summary-shipping').innerText = `฿${shippingFee.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
    document.getElementById('summary-grand-total').innerText = `฿${grandTotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
}

// 3. Export Data Dropdown Logic
function toggleExportMenu() {
    document.getElementById('export-menu').classList.toggle('hidden');
}

window.onclick = function(event) {
    if (!event.target.closest('#export-dropdown-btn') && !event.target.closest('#export-menu')) {
        const menu = document.getElementById('export-menu');
        if (menu && !menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
        }
    }
}

// ฟังก์ชันแปลงและจัดกลุ่มข้อมูลคำสั่งซื้อให้อยู่ในโครงสร้างพร้อม Export
function prepareOrderExportData() {
    if (!currentOrderData) {
        Swal.fire({
            icon: 'warning',
            title: 'ไม่พบข้อมูล',
            text: 'ยังไม่มีข้อมูลคำสั่งซื้อสำหรับส่งออก',
            confirmButtonColor: '#4f46e5'
        });
        return null;
    }

    const order = currentOrderData;
    const formattedOrderId = `ORD2026${String(order.id).padStart(5, '0')}`;
    const dateObj = new Date(order.createdAt || order.created_at || Date.now());
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

    // ข้อมูลลูกค้าและที่อยู่
    const user = order.user || {};
    const addr = order.shippingAddress || {};
    const customerName = user.name || user.username || addr.fullname || 'ลูกค้าทั่วไป';
    const customerEmail = user.email || '-';
    const customerPhone = addr.phoneNumber || user.phone || '-';
    const fullAddress = `${addr.address || '-'} ต.${addr.subdistrict || '-'} อ.${addr.district || '-'} จ.${addr.province || '-'} ${addr.zipcode || ''}`.trim();

    // สถานะและการเงิน
    const oStatus = (order.orderStatus || order.order_status || 'PROCESSING').toUpperCase();
    const pStatus = (order.paymentStatus || order.payment_status || 'PENDING').toUpperCase();
    const paymentMethod = (order.paymentMethod || 'PROMPTPAY').toUpperCase();

    const items = order.orderItems || order.items || [];
    let subtotal = 0;

    const formattedItems = items.map((item, index) => {
        const price = Number(item.price || 0);
        const qty = Number(item.quantity || 1);
        const total = price * qty;
        subtotal += total;

        return {
            'ลำดับ': index + 1,
            'รหัสสินค้า': item.productId || item.product_id || '-',
            'ชื่อสินค้า': item.productName || item.product_name || 'สินค้า',
            'ราคาต่อหน่วย (บาท)': price,
            'จำนวน': qty,
            'ยอดรวม (บาท)': total
        };
    });

    const discount = Number(order.discountAmount || order.discount_amount || 0);
    const shippingFee = Number(order.shippingFee || order.shipping_fee || 0);
    const grandTotal = Number(order.grandTotal || order.grand_total || (subtotal - discount + shippingFee));

    const orderSummary = [
        { 'หัวข้อ': 'รหัสคำสั่งซื้อ', 'ข้อมูล': formattedOrderId },
        { 'หัวข้อ': 'วันที่สั่งซื้อ', 'ข้อมูล': dateStr },
        { 'หัวข้อ': 'สถานะคำสั่งซื้อ', 'ข้อมูล': oStatus },
        { 'หัวข้อ': 'สถานะการชำระเงิน', 'ข้อมูล': pStatus },
        { 'หัวข้อ': 'ช่องทางชำระเงิน', 'ข้อมูล': paymentMethod },
        { 'หัวข้อ': 'ชื่อลูกค้า', 'ข้อมูล': customerName },
        { 'หัวข้อ': 'อีเมล', 'ข้อมูล': customerEmail },
        { 'หัวข้อ': 'เบอร์โทรศัพท์', 'ข้อมูล': customerPhone },
        { 'หัวข้อ': 'ที่อยู่จัดส่ง', 'ข้อมูล': fullAddress },
        { 'หัวข้อ': 'ยอดรวมราคาสินค้า (บาท)', 'ข้อมูล': subtotal },
        { 'หัวข้อ': 'ส่วนลด (บาท)', 'ข้อมูล': discount },
        { 'หัวข้อ': 'ค่าจัดส่ง (บาท)', 'ข้อมูล': shippingFee },
        { 'หัวข้อ': 'ยอดสุทธิ (บาท)', 'ข้อมูล': grandTotal }
    ];

    return {
        orderId: formattedOrderId,
        summary: orderSummary,
        items: formattedItems
    };
}

// 3.1 ส่งออกเป็น CSV (UTF-8 BOM พร้อมแยก Section ชัดเจน)
function exportCSV() {
    if (!currentOrderData) {
        Swal.fire('ข้อผิดพลาด', 'ยังไม่มีข้อมูลคำสั่งซื้อสำหรับส่งออก', 'error');
        return;
    }

    const order = currentOrderData;
    const formattedOrderId = `ORD2026${String(order.id).padStart(5, '0')}`;
    const dateObj = new Date(order.createdAt || order.created_at || Date.now());
    const dateStr = dateObj.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' น.';

    const user = order.user || {};
    const addr = order.shippingAddress || {};
    const customerName = user.name || user.username || 'ลูกค้าทั่วไป';
    const customerEmail = user.email || 'ไม่มีอีเมล';
    const customerPhone = addr.phoneNumber || user.phone || '-';

    const recipientName = addr.fullname || '-';
    const recipientPhone = addr.phoneNumber || '-';
    const recipientAddr = `${addr.address || '-'} ต.${addr.subdistrict || '-'} อ.${addr.district || '-'} จ.${addr.province || '-'} ${addr.zipcode || ''}`.trim();

    const oStatus = (order.orderStatus || order.order_status || 'PROCESSING').toUpperCase();
    const pStatus = (order.paymentStatus || order.payment_status || 'PENDING').toUpperCase();
    const paymentMethod = (order.paymentMethod || 'PROMPTPAY').toUpperCase();

    const items = order.orderItems || order.items || [];
    let subtotal = 0;

    // Helper escape CSV
    const esc = (val) => {
        let str = val !== undefined && val !== null ? String(val) : '';
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            str = `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    let csvRows = [
        [esc('ใบสรุปรายการคำสั่งซื้อ (Order Details)'), '', '', '', ''],
        [esc(`รหัสคำสั่งซื้อ: #${formattedOrderId}`), '', esc(`วันที่สั่งซื้อ: ${dateStr}`), '', ''],
        [esc(`สถานะคำสั่งซื้อ: ${oStatus}`), '', esc(`การชำระเงิน: ${pStatus} (${paymentMethod})`), '', ''],
        ['', '', '', '', ''],
        [esc('--- ข้อมูลผู้สั่งซื้อ (Customer) ---'), '', esc('--- ที่อยู่สำหรับจัดส่ง (Shipping Address) ---'), '', ''],
        [esc(`ชื่อลูกค้า: ${customerName}`), '', esc(`ผู้รับ: คุณ ${recipientName}`), '', ''],
        [esc(`เบอร์โทร: ${customerPhone}`), '', esc(`โทร: ${recipientPhone}`), '', ''],
        [esc(`อีเมล: ${customerEmail}`), '', esc(`ที่อยู่: ${recipientAddr}`), '', ''],
        ['', '', '', '', ''],
        [esc('--- รายการสินค้า (Order Items) ---'), '', '', '', ''],
        [esc('ลำดับ'), esc('สินค้า / รหัสสินค้า'), esc('ราคาต่อหน่วย (฿)'), esc('จำนวน'), esc('ยอดรวม (฿)')]
    ];

    items.forEach((item, index) => {
        const price = Number(item.price || 0);
        const qty = Number(item.quantity || 1);
        const total = price * qty;
        subtotal += total;

        const prodName = `${item.productName || item.product_name || 'สินค้า'} (รหัส: ${item.productId || item.product_id || '-'})`;
        csvRows.push([
            esc(index + 1),
            esc(prodName),
            esc(price.toFixed(2)),
            esc(qty),
            esc(total.toFixed(2))
        ]);
    });

    const discount = Number(order.discountAmount || order.discount_amount || 0);
    const shippingFee = Number(order.shippingFee || order.shipping_fee || 0);
    const grandTotal = Number(order.grandTotal || order.grand_total || (subtotal - discount + shippingFee));

    csvRows.push(['', '', '', '', '']);
    csvRows.push(['', '', '', esc('ยอดรวมราคาสินค้า (Total Amount):'), esc(subtotal.toFixed(2))]);
    csvRows.push(['', '', '', esc('ส่วนลด (Discount):'), esc((-discount).toFixed(2))]);
    csvRows.push(['', '', '', esc('ค่าจัดส่ง (Shipping Fee):'), esc(shippingFee.toFixed(2))]);
    csvRows.push(['', '', '', esc('ยอดสุทธิ (Grand Total):'), esc(grandTotal.toFixed(2))]);

    const csvString = csvRows.map(row => row.join(',')).join('\r\n');

    // ใส่ UTF-8 BOM (\uFEFF) เพื่อให้อ่านภาษาไทยในโปรแกรม Excel ได้ทันที สระไม่เพี้ยน
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Order_${formattedOrderId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const menu = document.getElementById('export-menu');
    if (menu) menu.classList.add('hidden');

    Swal.fire({
        icon: 'success',
        title: 'ส่งออก CSV สำเร็จ!',
        text: `ดาวน์โหลดไฟล์ Order_${formattedOrderId}.csv เรียบร้อยแล้ว`,
        timer: 2000,
        showConfirmButton: false
    });
}

// 3.2 ส่งออกเป็น Excel (.xlsx) ด้วย SheetJS แยก 2 ชีท (สรุปออเดอร์ + รายการสินค้า)
function exportExcel() {
    if (!currentOrderData) {
        Swal.fire('ข้อผิดพลาด', 'ยังไม่มีข้อมูลคำสั่งซื้อสำหรับส่งออก', 'error');
        return;
    }

    if (typeof XLSX === 'undefined') {
        Swal.fire('ข้อผิดพลาด', 'ไม่พบไลบรารี SheetJS (XLSX)', 'error');
        return;
    }

    const order = currentOrderData;
    const formattedOrderId = `ORD2026${String(order.id).padStart(5, '0')}`;
    const dateObj = new Date(order.createdAt || order.created_at || Date.now());
    const dateStr = dateObj.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' น.';

    const user = order.user || {};
    const addr = order.shippingAddress || {};
    const customerName = user.name || user.username || 'ลูกค้าทั่วไป';
    const customerEmail = user.email || 'ไม่มีอีเมล';
    const customerPhone = addr.phoneNumber || user.phone || '-';

    const recipientName = addr.fullname || '-';
    const recipientPhone = addr.phoneNumber || '-';
    const recipientAddr = `${addr.address || '-'} ต.${addr.subdistrict || '-'} อ.${addr.district || '-'} จ.${addr.province || '-'} ${addr.zipcode || ''}`.trim();

    const oStatus = (order.orderStatus || order.order_status || 'PROCESSING').toUpperCase();
    const pStatus = (order.paymentStatus || order.payment_status || 'PENDING').toUpperCase();
    const paymentMethod = (order.paymentMethod || 'PROMPTPAY').toUpperCase();

    const items = order.orderItems || order.items || [];
    let subtotal = 0;

    const aoaData = [
        ['ใบสรุปรายการคำสั่งซื้อ (Order Details)'],
        [`รหัสคำสั่งซื้อ: #${formattedOrderId}`, '', `วันที่สั่งซื้อ: ${dateStr}`],
        [`สถานะคำสั่งซื้อ: ${oStatus}`, '', `การชำระเงิน: ${pStatus} (${paymentMethod})`],
        [],
        ['ข้อมูลผู้สั่งซื้อ (Customer)', '', 'ที่อยู่สำหรับจัดส่ง (Shipping Address)'],
        ['ชื่อลูกค้า:', customerName, 'ผู้รับ:', `คุณ ${recipientName} (${recipientPhone})`],
        ['เบอร์โทร:', customerPhone, 'ที่อยู่:', recipientAddr],
        ['อีเมล:', customerEmail, '', ''],
        [],
        ['รายการสินค้า (Order Items)'],
        ['ลำดับ', 'สินค้า / รหัสสินค้า', 'ราคาต่อหน่วย (฿)', 'จำนวน', 'ยอดรวม (฿)']
    ];

    items.forEach((item, index) => {
        const price = Number(item.price || 0);
        const qty = Number(item.quantity || 1);
        const total = price * qty;
        subtotal += total;

        const prodName = `${item.productName || item.product_name || 'สินค้า'} (รหัส: ${item.productId || item.product_id || '-'})`;
        aoaData.push([index + 1, prodName, price, qty, total]);
    });

    const discount = Number(order.discountAmount || order.discount_amount || 0);
    const shippingFee = Number(order.shippingFee || order.shipping_fee || 0);
    const grandTotal = Number(order.grandTotal || order.grand_total || (subtotal - discount + shippingFee));

    aoaData.push([]);
    aoaData.push(['', '', '', 'ยอดรวมราคาสินค้า (Total Amount):', subtotal]);
    aoaData.push(['', '', '', 'ส่วนลด (Discount):', -discount]);
    aoaData.push(['', '', '', 'ค่าจัดส่ง (Shipping Fee):', shippingFee]);
    aoaData.push(['', '', '', 'ยอดสุทธิ (Grand Total):', grandTotal]);

    const ws = XLSX.utils.aoa_to_sheet(aoaData);

    ws['!cols'] = [
        { wch: 10 },
        { wch: 38 },
        { wch: 20 },
        { wch: 14 },
        { wch: 22 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, formattedOrderId);

    XLSX.writeFile(wb, `Order_${formattedOrderId}.xlsx`);

    const menu = document.getElementById('export-menu');
    if (menu) menu.classList.add('hidden');

    Swal.fire({
        icon: 'success',
        title: 'ส่งออก Excel สำเร็จ!',
        text: `ดาวน์โหลดไฟล์ Order_${formattedOrderId}.xlsx เรียบร้อยแล้ว`,
        timer: 2000,
        showConfirmButton: false
    });
}

// 4. Modal อัปเดตสถานะ
function openStatusModal() {
    document.getElementById('statusModal').classList.remove('hidden');
}

function closeStatusModal() {
    document.getElementById('statusModal').classList.add('hidden');
}

async function saveStatusChanges() {
    const newOrderStatus = document.getElementById('select-order-status').value;
    const newPaymentStatus = document.getElementById('select-payment-status').value;

    Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // 🟢 ส่งค่าไปทั้ง order_status และ payment_status
        const res = await fetch(`http://localhost:3000/orders/${currentOrderId}/status`, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify({ 
                order_status: newOrderStatus,
                payment_status: newPaymentStatus
            })
        });

        if (!res.ok) throw new Error('ไม่สามารถอัปเดตสถานะได้');

        Swal.fire({
            icon: 'success',
            title: 'สำเร็จ!',
            text: 'อัปเดตสถานะคำสั่งซื้อเรียบร้อยแล้ว',
            confirmButtonColor: '#4f46e5'
        }).then(() => {
            closeStatusModal();
            fetchOrderDetails(currentOrderId); // โหลดข้อมูลใหม่มาแสดง
        });
    } catch (err) {
        Swal.fire('ข้อผิดพลาด', err.message, 'error');
    }
}