/* Description: ระบบจัดการการแจ้งเตือน Real-time (SSE) */

// 1. Notification Global State
let globalNotifications = JSON.parse(localStorage.getItem('admin_notifications')) || [];

document.addEventListener('DOMContentLoaded', () => {
    renderGlobalNotifications();
    connectRealtimeStream();
});

// 2. เชื่อมต่อ Server-Sent Events (SSE) กับ Node.js Server (Port 3000)
function connectRealtimeStream() {
    const evtSource = new EventSource('http://localhost:3000/api/notifications/stream');

    evtSource.onopen = () => {
        console.log('[Notification System] Connected to Real-time Stream Server (localhost:3000)');
    };

    evtSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleIncomingWebhook(data);
    };

    evtSource.onerror = () => {
        console.warn('[Notification System] Lost connection to SSE Server. Retrying...');
    };
}

// 3. จัดการข้อมูล Webhook จาก Postman -> สร้าง Notification
function handleIncomingWebhook(data) {
    let title = '';
    let message = '';

    switch (data.type) {
        case 'PAYMENT_SUCCESS':
            title = 'ชำระเงินสำเร็จ';
            message = `รายการ ${data.orderId} ชำระเงินจำนวน ฿${Number(data.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} สำเร็จแล้ว`;
            break;
        case 'PAYMENT_FAILED':
            title = 'ธุรกรรมผิดพลาด';
            message = `รายการ ${data.orderId} ชำระเงินไม่สำเร็จ (${data.customMessage || 'ระบบปฏิเสธการชำระ'})`;
            break;
        case 'WEBHOOK_MISSING':
            title = 'ไม่ได้รับ Webhook ตามเวลา';
            message = `รายการ ${data.orderId} รอนานเกินเวลาที่กำหนด ไม่ได้รับสัญญาณ Webhook`;
            break;
        case 'AMOUNT_MISMATCH':
            title = 'ยอดเงินได้รับไม่ตรงกับคำสั่งซื้อ';
            message = `รายการ ${data.orderId} ยอดชำระไม่ตรง (${data.customMessage || `ได้รับจริง ฿${Number(data.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`})`;
            break;
        case 'DUPLICATE_ATTEMPTS':
            title = 'พบความพยายามชำระเงินซ้ำ';
            message = `รายการ ${data.orderId} มีความพยายามชำระเงินซ้ำซ้อนหลายครั้ง`;
            break;
        default:
            title = 'การแจ้งเตือนใหม่';
            message = `รายการ ${data.orderId} - ${data.type}`;
    }

    const newNotif = {
        id: data.id || Date.now(),
        type: data.type,
        title: title,
        message: message,
        orderId: data.orderId,
        time: data.time || new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        isRead: false
    };

    globalNotifications.unshift(newNotif);
    localStorage.setItem('admin_notifications', JSON.stringify(globalNotifications));

    renderGlobalNotifications();
    showToastNotification(newNotif);

    // Custom Event ออกไปให้หน้า HTML ไปอัปเดตตารางต่อ
    window.dispatchEvent(new CustomEvent('onRealtimeWebhookReceived', { detail: data }));
}

// 4. แสดงผลรายการการแจ้งเตือน (เพิ่มปุ่มสำหรับลบทีละอัน)
function renderGlobalNotifications() {
    const listEl = document.getElementById('notifList');
    const badgeEl = document.getElementById('notifBadge');
    const unreadTagEl = document.getElementById('unreadCountTag');

    if (!listEl || !badgeEl || !unreadTagEl) return;

    const unreadCount = globalNotifications.filter(n => !n.isRead).length;

    // อัปเดต Badge จำนวนยังไม่อ่าน
    if (unreadCount > 0) {
        badgeEl.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badgeEl.classList.remove('hidden');
        unreadTagEl.textContent = `${unreadCount} ใหม่`;
    } else {
        badgeEl.classList.add('hidden');
        unreadTagEl.textContent = `0 ใหม่`;
    }

    // กรณีไม่มีการแจ้งเตือนเหลืออยู่
    if (globalNotifications.length === 0) {
        listEl.innerHTML = `
            <div class="p-6 text-center text-gray-400">
                <i class="fas fa-bell-slash text-2xl mb-2"></i>
                <p class="text-xs">ไม่มีการแจ้งเตือนในขณะนี้</p>
            </div>
        `;
        return;
    }

    // Render รายการลงใน Dropdown พร้อมปุ่มกากบาทลบทีละอัน
    listEl.innerHTML = globalNotifications.map(n => {
        const style = getEventStyle(n.type);
        return `
            <div onclick="markAsRead(${n.id}, '${n.orderId}')" 
                class="p-3.5 hover:bg-gray-50 transition cursor-pointer flex items-start space-x-3 group relative ${n.isRead ? 'opacity-60' : 'bg-indigo-50/30'}">
                <div class="w-8 h-8 rounded-xl ${style.bgColor} ${style.textColor} flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i class="${style.icon}"></i>
                </div>
                <div class="flex-1 min-w-0 pr-6">
                    <div class="flex justify-between items-baseline">
                        <p class="font-semibold text-gray-800 truncate">${n.title}</p>
                        <span class="text-[10px] text-gray-400 whitespace-nowrap ml-2">${n.time}</span>
                    </div>
                    <p class="text-gray-600 mt-0.5 line-clamp-2">${n.message}</p>
                </div>
                
                <!-- ปุ่มกากบาทลบรายการนี้ -->
                <button onclick="deleteNotification(${n.id}, event)" 
                    class="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition p-1 rounded-full hover:bg-gray-100"
                    title="ลบการแจ้งเตือนนี้">
                    <i class="fas fa-times text-xs"></i>
                </button>
            </div>
        `;
    }).join('');
}

// 5. แสดง Toast Notification ป๊อปอัปมุมขวาบน
function showToastNotification(notif) {
    let container = document.getElementById('toastContainer');

    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'fixed top-5 right-5 z-50 space-y-3 max-w-sm w-full pointer-events-none';
        document.body.appendChild(container);
    }

    const style = getEventStyle(notif.type);

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto bg-white rounded-2xl shadow-xl border-l-4 ${style.borderColor} p-4 border border-gray-100 flex items-start space-x-3 animate-slide-in`;
    toast.innerHTML = `
        <div class="w-8 h-8 rounded-xl ${style.bgColor} ${style.textColor} flex items-center justify-center flex-shrink-0">
            <i class="${style.icon}"></i>
        </div>
        <div class="flex-1 min-w-0">
            <h4 class="text-xs font-bold text-gray-800">${notif.title}</h4>
            <p class="text-xs text-gray-600 mt-0.5">${notif.message}</p>
        </div>
        <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xs"></i>
        </button>
    `;

    container.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 5000);
}

// 6. Config สไตล์สีและไอคอนตาม event_type
function getEventStyle(type) {
    switch (type) {
        case 'PAYMENT_SUCCESS':
            return { icon: 'fas fa-check-circle', bgColor: 'bg-green-100', textColor: 'text-green-600', borderColor: 'border-green-500' };
        case 'PAYMENT_FAILED':
            return { icon: 'fas fa-times-circle', bgColor: 'bg-red-100', textColor: 'text-red-600', borderColor: 'border-red-500' };
        case 'WEBHOOK_MISSING':
            return { icon: 'fas fa-exclamation-triangle', bgColor: 'bg-amber-100', textColor: 'text-amber-600', borderColor: 'border-amber-500' };
        case 'AMOUNT_MISMATCH':
            return { icon: 'fas fa-coins', bgColor: 'bg-rose-100', textColor: 'text-rose-700', borderColor: 'border-rose-600' };
        case 'DUPLICATE_ATTEMPTS':
            return { icon: 'fas fa-redo', bgColor: 'bg-purple-100', textColor: 'text-purple-600', borderColor: 'border-purple-500' };
        default:
            return { icon: 'fas fa-bell', bgColor: 'bg-gray-100', textColor: 'text-gray-600', borderColor: 'border-gray-300' };
    }
}

// 7. Helper UI Actions (เคลียร์ทั้งหมด / ลบทีละอัน / เปิด-ปิด Dropdown)

// ลบการแจ้งเตือนทั้งหมด
function clearAllNotifications() {
    globalNotifications = [];
    localStorage.setItem('admin_notifications', JSON.stringify(globalNotifications));
    renderGlobalNotifications();
}

// ลบการแจ้งเตือนเฉพาะรายการที่เลือก
function deleteNotification(id, event) {
    if (event) event.stopPropagation();
    globalNotifications = globalNotifications.filter(n => n.id !== id);
    localStorage.setItem('admin_notifications', JSON.stringify(globalNotifications));
    renderGlobalNotifications();
}

function markAsRead(id, orderId) {
    const notif = globalNotifications.find(n => n.id === id);
    if (notif) notif.isRead = true;
    localStorage.setItem('admin_notifications', JSON.stringify(globalNotifications));
    renderGlobalNotifications();
    window.location.href = `order-details.html?order_id=${orderId}`;
}

function toggleNotifMenu() {
    const userDropdown = document.getElementById('userDropdown');
    const notifDropdown = document.getElementById('notifDropdown');
    if (userDropdown) userDropdown.classList.add('hidden');
    if (notifDropdown) notifDropdown.classList.toggle('hidden');
}

function toggleUserMenu() {
    const notifDropdown = document.getElementById('notifDropdown');
    const userDropdown = document.getElementById('userDropdown');
    if (notifDropdown) notifDropdown.classList.add('hidden');
    if (userDropdown) userDropdown.classList.toggle('hidden');
}

window.addEventListener('click', (e) => {
    const notifBtn = document.getElementById('notifMenuBtn');
    const notifDrop = document.getElementById('notifDropdown');
    const userBtn = document.getElementById('userMenuBtn');
    const userDrop = document.getElementById('userDropdown');

    if (notifBtn && notifDrop && !notifBtn.contains(e.target) && !notifDrop.contains(e.target)) {
        notifDrop.classList.add('hidden');
    }
    if (userBtn && userDrop && !userBtn.contains(e.target) && !userDrop.contains(e.target)) {
        userDrop.classList.add('hidden');
    }
});