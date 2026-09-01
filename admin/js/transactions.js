let globalTransactions = [];
let currentFilteredData = [];
let currentPage = 1;
const itemsPerPage = 10; // กำหนดจำนวนรายการต่อหน้า (สามารถปรับเป็น 15, 20 ได้ตามต้องการ)

document.addEventListener('DOMContentLoaded', () => {
    fetchTransactions();
});

// 1. ดึงข้อมูลออเดอร์ (ธุรกรรม) จาก Backend
async function fetchTransactions() {
    try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch('http://localhost:3000/orders', { headers });
        
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `ไม่สามารถดึงข้อมูลได้ (Error: ${response.status})`);
        }
        
        let data = await response.json();
        
        if (!Array.isArray(data)) {
            if (data.data && Array.isArray(data.data)) {
                data = data.data; 
            } else if (data.orders && Array.isArray(data.orders)) {
                data = data.orders; 
            } else {
                data = []; 
            }
        }

        // เรียงลำดับจากล่าสุดไปเก่าสุดเสมอ (เทียบจาก createdAt หรือ id)
        data.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
            const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
            return dateB - dateA || (b.id - a.id);
        });

        globalTransactions = data;
        currentFilteredData = data;
        currentPage = 1;
        
        updateSummaryCards(data);
        renderTransactionsTable(data);
        
    } catch (error) {
        console.error('Error fetching transactions:', error);
        
        document.getElementById('transactionsTableBody').innerHTML = `
            <tr>
                <td colspan="9" class="p-12 text-center text-red-500">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                        <i class="fas fa-exclamation-triangle text-3xl text-red-500"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 mb-1">ไม่สามารถโหลดข้อมูลธุรกรรมได้</h3>
                    <p class="font-medium text-red-500 mb-2">${error.message}</p>
                </td>
            </tr>
        `;
        document.getElementById('paginationInfo').innerHTML = 'เกิดข้อผิดพลาด';
        renderPaginationButtons(0);
    }
}

// 2. อัปเดตการ์ดสรุปยอดด้านบน 4 ช่อง
function updateSummaryCards(transactions) {
    let totalRevenue = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let refundCount = 0;

    transactions.forEach(t => {
        const pStatus = (t.paymentStatus || t.payment_status || 'PENDING').toUpperCase();
        
        if (pStatus === 'PAID') {
            paidCount++;
            totalRevenue += Number(t.grandTotal || t.grand_total || 0);
        } else if (pStatus === 'PENDING') {
            pendingCount++;
        } else if (pStatus.includes('REFUND') || pStatus === 'CANCELLED') {
            refundCount++;
        }
    });

    document.getElementById('stat-total-revenue').innerText = `฿${totalRevenue.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
    document.getElementById('stat-paid-count').innerText = `${paidCount} รายการ`;
    document.getElementById('stat-pending-count').innerText = `${pendingCount} รายการ`;
    document.getElementById('stat-refund-count').innerText = `${refundCount} รายการ`;
}

// 3. วาดตารางข้อมูลพร้อมแบ่งหน้า (Pagination)
function renderTransactionsTable(transactions) {
    const tbody = document.getElementById('transactionsTableBody');
    tbody.innerHTML = '';
    
    const totalCountElem = document.getElementById('total-count');
    if (totalCountElem) totalCountElem.innerText = transactions.length;

    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="p-12 text-center text-gray-400">
                    <i class="fas fa-receipt text-4xl mb-3 text-gray-300"></i>
                    <p class="font-medium text-gray-500">ไม่พบรายการธุรกรรมที่ตรงกับการค้นหา/ตัวกรอง</p>
                </td>
            </tr>`;
        document.getElementById('paginationInfo').innerHTML = 'ไม่พบข้อมูล';
        renderPaginationButtons(0);
        return;
    }

    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    // คำนวณช่วงข้อมูลเฉพาะหน้าปัจจุบัน
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, transactions.length);
    const pageItems = transactions.slice(startIndex, endIndex);

    pageItems.forEach(t => {
        const orderIdFormat = `ORD2026${String(t.id).padStart(5, '0')}`;
        
        const dateObj = new Date(t.createdAt || t.created_at || new Date());
        const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

        let customerName = 'ลูกค้าทั่วไป';
        if (t.shippingAddress && t.shippingAddress.fullname) {
            customerName = t.shippingAddress.fullname;
        } else if (t.user && (t.user.name || t.user.username)) {
            customerName = t.user.name || t.user.username;
        }

        let customerEmailHtml = '<span class="text-gray-400 italic">สั่งซื้อแบบทั่วไป</span>';
        if (t.user && t.user.email) {
            customerEmailHtml = `<i class="fas fa-envelope mr-1 text-gray-300"></i> ${t.user.email}`;
        }

        let productName = 'ไม่ระบุสินค้า';
        let extraText = '';
        if (t.orderItems && t.orderItems.length > 0) {
            productName = t.orderItems[0].productName || t.orderItems[0].product_name;
            if (t.orderItems.length > 1) {
                extraText = `<span class="text-indigo-600 text-[11px] font-semibold ml-1">(+${t.orderItems.length - 1} รายการ)</span>`;
            }
        }

        const grandTotalValue = Number(t.grandTotal || t.grand_total || 0);
        const grandTotal = `฿${grandTotalValue.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;

        const method = (t.paymentMethod || 'promptpay').toLowerCase();
        let methodHtml = `<i class="fas fa-qrcode text-indigo-500 mr-1.5"></i> PromptPay`;
        if (method.includes('card') || method.includes('stripe')) methodHtml = `<i class="fas fa-credit-card text-purple-500 mr-1.5"></i> Credit Card`;
        else if (method.includes('wallet')) methodHtml = `<i class="fas fa-wallet text-pink-500 mr-1.5"></i> E-Wallet`;
        else if (method.includes('cod')) methodHtml = `<i class="fas fa-money-bill-wave text-emerald-500 mr-1.5"></i> COD`;

        const pStatus = (t.paymentStatus || t.payment_status || 'PENDING').toUpperCase();
        let paymentBadge = `<span class="inline-flex items-center px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[11px] font-medium"><i class="fas fa-hourglass-half mr-1.5"></i> รอชำระเงิน</span>`;
        let canRefund = false;

        if (pStatus === 'PAID') {
            paymentBadge = `<span class="inline-flex items-center px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[11px] font-medium"><i class="fas fa-check-circle mr-1.5"></i> ชำระเงินสำเร็จ</span>`;
            canRefund = true;
        } else if (pStatus.includes('REFUND')) {
            paymentBadge = `<span class="inline-flex items-center px-2.5 py-1 border border-gray-200 text-gray-600 rounded-full text-[11px] font-medium"><i class="fas fa-undo mr-1.5"></i> คืนเงินแล้ว</span>`;
        }

        const oStatus = (t.orderStatus || t.order_status || 'PROCESSING').toUpperCase();
        let shippingBadge = `<span class="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-[11px] font-medium"><i class="fas fa-clock mr-1.5"></i> Pending</span>`;
        if (oStatus === 'COMPLETED' || oStatus === 'DELIVERED') {
            shippingBadge = `<span class="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[11px] font-medium"><i class="fas fa-check-double mr-1.5"></i> Delivered</span>`;
        } else if (oStatus === 'PROCESSING' || pStatus === 'PAID') {
            shippingBadge = `<span class="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[11px] font-medium"><i class="fas fa-box mr-1.5"></i> Processing</span>`;
        }

        let actionBtns = `
            <a href="order-details.html?order_id=${orderIdFormat}" class="w-8 h-8 inline-flex items-center justify-center rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-colors" title="ดูรายละเอียด">
                <i class="fas fa-eye text-xs"></i>
            </a>
            ${canRefund ? `
            <button onclick="processRefund(${t.id}, ${grandTotalValue})" class="w-8 h-8 inline-flex items-center justify-center rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white transition-colors ml-1" title="ดำเนินการคืนเงิน (Refund)">
                <i class="fas fa-undo-alt text-xs"></i>
            </button>
            ` : ''}
        `;

        const row = `
            <tr class="hover:bg-indigo-50/30 transition-colors group">
                <td class="p-4">
                    <a href="order-details.html?order_id=${orderIdFormat}" class="text-indigo-600 hover:text-indigo-800 font-semibold text-xs transition-colors">${orderIdFormat}</a>
                </td>
                <td class="p-4 text-xs font-mono text-gray-500">
                    <div class="text-gray-800 font-medium">${dateStr}</div>
                    <div class="mt-0.5">${timeStr} น.</div>
                </td>
                <td class="p-4">
                    <div class="font-medium text-gray-900 text-xs">${customerName}</div>
                    <div class="text-[11px] text-gray-500 mt-0.5">${customerEmailHtml}</div>
                </td>
                <td class="p-4 text-xs text-gray-700 truncate max-w-[180px]">
                    ${productName} ${extraText}
                </td>
                <td class="p-4 font-bold text-gray-900 text-xs">${grandTotal}</td>
                <td class="p-4 text-xs font-medium text-gray-700">${methodHtml}</td>
                <td class="p-4">${paymentBadge}</td>
                <td class="p-4">${shippingBadge}</td>
                <td class="p-4 text-center">
                    <div class="flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        ${actionBtns}
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    // อัปเดตข้อความบอกหน้าและจำนวนรายการ
    document.getElementById('paginationInfo').innerHTML = `แสดง <b>${startIndex + 1}</b> ถึง <b>${endIndex}</b> จากทั้งหมด <span class="font-bold text-gray-800">${transactions.length}</span> รายการ`;
    
    // สร้างปุ่ม Pagination
    renderPaginationButtons(totalPages);
}

// ฟังก์ชันสร้างปุ่มกดเปลี่ยนหน้า
function renderPaginationButtons(totalPages) {
    const paginationContainer = document.querySelector('#paginationInfo').nextElementSibling;
    if (!paginationContainer) return;

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let buttonsHtml = `
        <button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled class="px-2.5 py-1 border border-gray-200 rounded-md text-gray-300 cursor-not-allowed"' : 'class="px-2.5 py-1 border border-gray-200 rounded-md hover:bg-gray-100 text-gray-600 transition"'} title="หน้าก่อนหน้า">
            <i class="fas fa-chevron-left text-xs"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        // แสดงเฉพาะหน้าใกล้เคียงเพื่อไม่ให้ปุ่มยาวเกินไป
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            if (i === currentPage) {
                buttonsHtml += `<button class="px-3 py-1 bg-indigo-600 text-white rounded-md font-medium text-xs shadow-sm">${i}</button>`;
            } else {
                buttonsHtml += `<button onclick="goToPage(${i})" class="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-100 text-gray-600 text-xs transition">${i}</button>`;
            }
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            buttonsHtml += `<span class="px-1 text-gray-400 text-xs">...</span>`;
        }
    }

    buttonsHtml += `
        <button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled class="px-2.5 py-1 border border-gray-200 rounded-md text-gray-300 cursor-not-allowed"' : 'class="px-2.5 py-1 border border-gray-200 rounded-md hover:bg-gray-100 text-gray-600 transition"'} title="หน้าถัดไป">
            <i class="fas fa-chevron-right text-xs"></i>
        </button>
    `;

    paginationContainer.innerHTML = buttonsHtml;
}

// ฟังก์ชันเปลี่ยนหน้า
function goToPage(page) {
    const totalPages = Math.ceil(currentFilteredData.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderTransactionsTable(currentFilteredData);
}

// 4. ฟังก์ชันคืนเงิน (Refund)
function processRefund(orderId, maxAmount) {
    const formattedOrderId = `ORD2026${String(orderId).padStart(5, '0')}`;
    
    Swal.fire({
        title: 'ดำเนินการคืนเงิน (Refund)',
        html: `
            <div class="text-left mt-2">
                <p class="text-sm mb-4 text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    รหัสคำสั่งซื้อ: <strong class="text-gray-900">${formattedOrderId}</strong><br>
                    ยอดที่สามารถคืนได้สูงสุด: <strong class="text-indigo-600">฿${Number(maxAmount).toLocaleString('th-TH', {minimumFractionDigits: 2})}</strong>
                </p>
                <label class="block text-sm font-medium text-gray-700 mb-1">ระบุยอดเงินที่ต้องการคืน</label>
                <p class="text-xs text-gray-400 mb-2">(ปล่อยช่องว่างไว้ หากต้องการคืนเต็มจำนวน หรือระบุตัวเลขเพื่อคืนบางส่วน)</p>
                <input type="number" id="refundAmount" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-colors" placeholder="เช่น 500" max="${maxAmount}" min="1">
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e11d48',
        cancelButtonColor: '#f1f5f9',
        confirmButtonText: '<i class="fas fa-undo mr-1.5"></i> ยืนยันการคืนเงิน',
        cancelButtonText: '<span class="text-gray-700">ยกเลิก</span>',
        customClass: {
            popup: 'rounded-2xl shadow-xl',
            cancelButton: 'hover:bg-gray-200 transition-colors'
        },
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
            
            Swal.fire({ 
                title: 'กำลังดำเนินการคืนเงิน...', 
                allowOutsideClick: false, 
                showConfirmButton: false, 
                didOpen: () => { Swal.showLoading(); } 
            });

            try {
                const token = localStorage.getItem('token');
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const response = await fetch(`http://localhost:3000/payments/refund/${orderId}`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(refundAmount ? { amount: refundAmount } : {}) 
                });

                const data = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(data.message || 'เกิดข้อผิดพลาดในการคืนเงิน กรุณาลองใหม่อีกครั้ง');

                Swal.fire({
                    icon: 'success',
                    title: 'คืนเงินสำเร็จ!',
                    html: refundAmount 
                        ? `ระบบดำเนินการคืนเงินบางส่วนจำนวน <b>฿${refundAmount.toLocaleString('th-TH', {minimumFractionDigits: 2})}</b> เรียบร้อยแล้ว` 
                        : `ระบบดำเนินการคืนเงินเต็มจำนวน <b>฿${Number(maxAmount).toLocaleString('th-TH', {minimumFractionDigits: 2})}</b> เรียบร้อยแล้ว`,
                    confirmButtonColor: '#4f46e5',
                    customClass: { popup: 'rounded-2xl shadow-xl' }
                }).then(() => {
                    fetchTransactions();
                });

            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'ข้อผิดพลาด',
                    text: error.message,
                    confirmButtonColor: '#e11d48',
                    customClass: { popup: 'rounded-2xl shadow-xl' }
                });
            }
        }
    });
}

// 5. ระบบคัดกรอง (Search & Filters)
function filterTransactions() {
    const searchVal = document.getElementById('searchInput').value.toLowerCase().trim();
    const methodVal = document.getElementById('filter-method').value.toLowerCase();
    const paymentVal = document.getElementById('filter-payment').value;
    const shippingVal = document.getElementById('filter-shipping').value;

    const filtered = globalTransactions.filter(t => {
        const orderId = `ORD2026${String(t.id).padStart(5, '0')}`.toLowerCase();
        const customer = (t.shippingAddress?.fullname || t.user?.name || t.user?.username || '').toLowerCase();
        const email = (t.user?.email || '').toLowerCase();
        
        let prodName = '';
        if (t.orderItems && t.orderItems.length > 0) prodName = (t.orderItems[0].productName || t.orderItems[0].product_name || '').toLowerCase();

        const matchSearch = !searchVal || orderId.includes(searchVal) || customer.includes(searchVal) || email.includes(searchVal) || prodName.includes(searchVal);
        const matchMethod = !methodVal || (t.paymentMethod || '').toLowerCase().includes(methodVal);
        const matchPayment = !paymentVal || (t.paymentStatus || t.payment_status || 'PENDING').toUpperCase() === paymentVal;
        
        let currentShipStatus = (t.orderStatus || t.order_status || 'PENDING').toUpperCase();
        if (currentShipStatus === 'DELIVERED') currentShipStatus = 'COMPLETED';
        const matchShipping = !shippingVal || currentShipStatus === shippingVal;

        return matchSearch && matchMethod && matchPayment && matchShipping;
    });

    currentFilteredData = filtered;
    currentPage = 1; // เมื่อค้นหาหรือฟิลเตอร์ ให้เริ่มที่หน้า 1 เสมอ
    renderTransactionsTable(filtered);
}

// เปิด-ปิดเมนู Export
function toggleExportMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('exportDropdownMenu');
    menu.classList.toggle('hidden');
}

document.addEventListener('click', (e) => {
    const menu = document.getElementById('exportDropdownMenu');
    if (menu && !menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
    }
});

// 6. ส่งออกข้อมูล (Export CSV & Excel)
function prepareExportData() {
    if (!currentFilteredData || currentFilteredData.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'ไม่พบข้อมูล',
            text: 'ไม่มีข้อมูลธุรกรรมสำหรับส่งออก',
            confirmButtonColor: '#4f46e5'
        });
        return null;
    }

    return currentFilteredData.map((t, index) => {
        const orderIdFormat = `ORD2026${String(t.id).padStart(5, '0')}`;
        const dateObj = new Date(t.createdAt || t.created_at || new Date());
        const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
        
        let customerName = 'ลูกค้าทั่วไป';
        if (t.shippingAddress?.fullname) {
            customerName = t.shippingAddress.fullname;
        } else if (t.user?.name || t.user?.username) {
            customerName = t.user.name || t.user.username;
        }

        const customerEmail = t.user?.email || '-';

        let productName = 'ไม่ระบุสินค้า';
        if (t.orderItems && t.orderItems.length > 0) {
            productName = t.orderItems[0].productName || t.orderItems[0].product_name || 'ไม่ระบุสินค้า';
            if (t.orderItems.length > 1) {
                productName += ` (+${t.orderItems.length - 1} รายการ)`;
            }
        }

        const grandTotal = Number(t.grandTotal || t.grand_total || 0);

        const method = (t.paymentMethod || 'promptpay').toLowerCase();
        let methodText = 'PromptPay';
        if (method.includes('card') || method.includes('stripe')) methodText = 'Credit Card';
        else if (method.includes('wallet')) methodText = 'E-Wallet';
        else if (method.includes('cod')) methodText = 'เก็บเงินปลายทาง (COD)';

        const pStatus = (t.paymentStatus || t.payment_status || 'PENDING').toUpperCase();
        let paymentStatusText = 'รอชำระเงิน';
        if (pStatus === 'PAID') paymentStatusText = 'ชำระเงินสำเร็จ';
        else if (pStatus.includes('REFUND')) paymentStatusText = 'คืนเงินแล้ว';
        else if (pStatus === 'CANCELLED') paymentStatusText = 'ยกเลิก';

        const oStatus = (t.orderStatus || t.order_status || 'PROCESSING').toUpperCase();
        let shippingStatusText = 'Pending';
        if (oStatus === 'COMPLETED' || oStatus === 'DELIVERED') shippingStatusText = 'Delivered';
        else if (oStatus === 'PROCESSING' || pStatus === 'PAID') shippingStatusText = 'Processing';

        return {
            'ลำดับ': index + 1,
            'รหัสคำสั่งซื้อ': orderIdFormat,
            'วันที่-เวลา': dateStr,
            'ชื่อลูกค้า': customerName,
            'อีเมล': customerEmail,
            'รายการสินค้า': productName,
            'ยอดสุทธิ (บาท)': grandTotal,
            'ช่องทางชำระเงิน': methodText,
            'สถานะการชำระ': paymentStatusText,
            'สถานะการจัดส่ง': shippingStatusText
        };
    });
}

function exportToCSV() {
    const data = prepareExportData();
    if (!data) return;

    try {
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => 
                headers.map(fieldName => {
                    let val = row[fieldName] !== undefined && row[fieldName] !== null ? String(row[fieldName]) : '';
                    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                        val = `"${val.replace(/"/g, '""')}"`;
                    }
                    return val;
                }).join(',')
            )
        ];

        const csvString = csvRows.join('\r\n');
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const timestamp = new Date().toISOString().slice(0, 10);
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        Swal.fire({
            icon: 'success',
            title: 'ส่งออก CSV สำเร็จ!',
            text: `ดาวน์โหลดไฟล์เรียบร้อยแล้ว (${data.length} รายการ)`,
            timer: 2000,
            showConfirmButton: false
        });
    } catch (err) {
        console.error('CSV Export Error:', err);
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถส่งออกไฟล์ CSV ได้', 'error');
    }
}

function exportToExcel() {
    const data = prepareExportData();
    if (!data) return;

    if (typeof XLSX === 'undefined') {
        Swal.fire('ข้อผิดพลาด', 'ไม่พบไลบรารี SheetJS (XLSX) ในหน้าเว็บ', 'error');
        return;
    }

    try {
        const ws = XLSX.utils.json_to_sheet(data);
        ws['!cols'] = [
            { wch: 8 },  { wch: 18 }, { wch: 20 }, { wch: 22 },
            { wch: 26 }, { wch: 30 }, { wch: 16 }, { wch: 20 },
            { wch: 18 }, { wch: 16 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'รายการธุรกรรม');

        const timestamp = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `transactions_${timestamp}.xlsx`);

        Swal.fire({
            icon: 'success',
            title: 'ส่งออก Excel สำเร็จ!',
            text: `ดาวน์โหลดไฟล์เรียบร้อยแล้ว (${data.length} รายการ)`,
            timer: 2000,
            showConfirmButton: false
        });
    } catch (err) {
        console.error('Excel Export Error:', err);
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถส่งออกไฟล์ Excel ได้', 'error');
    }
}