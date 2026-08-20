// admin/js/sidebar.js

// 🟢 1. ระบบ Auth Guard: ตรวจสอบการเข้าสู่ระบบทันทีที่โหลดสคริปต์
(function checkAdminAuth() {
    const currentPath = window.location.pathname;

    // หากเปิดหน้า login.html หรือ forgot-password.html ไม่ต้องเช็ค Token
    if (currentPath.includes('login.html') || currentPath.includes('forgot-password.html')) {
        return;
    }

    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');

    // ถ้าไม่มี Token หรือไม่มีข้อมูลแอดมิน ให้เตะกลับไปหน้า Login ทันที
    if (!token || !adminData) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const user = JSON.parse(adminData);
        // ตรวจสอบ Role หากไม่ใช่ ADMIN ให้ล้างค่า แล้วเตะออกทันที
        if (user.role !== 'ADMIN' && user.role !== 'admin') {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            window.location.href = 'login.html';
        }
    } catch (e) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        window.location.href = 'login.html';
    }
})();

// 🟢 2. โหลดและสร้าง Sidebar UI
document.addEventListener('DOMContentLoaded', () => {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;

    // หาชื่อไฟล์ปัจจุบันเพื่อ Highlight เมนูที่เปิดอยู่
    let currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    // ถ้าอยู่หน้า order-details ให้ถือว่าอยู่ในหมวดรายการธุรกรรม
    if (currentPath.includes('order-details')) {
        currentPath = 'transactions.html';
    }

    // 🟢 รายการเมนู (เพิ่ม "จัดการโค้ดส่วนลด" แล้ว)
    const menuItems = [
        { name: 'ภาพรวม (Dashboard)', icon: 'fas fa-home', link: 'index.html' },
        { name: 'รายการธุรกรรม', icon: 'fas fa-receipt', link: 'transactions.html' },
        { name: 'จัดการสินค้า', icon: 'fas fa-box', link: 'products.html' },
        { name: 'รีวิว & สารสกัด', icon: 'fas fa-star', link: 'product-content.html' },
        { name: 'ที่อยู่จัดส่ง', icon: 'fas fa-map-marked-alt', link: 'shipping.html' },
        { name: 'ผู้ใช้งาน', icon: 'fas fa-users', link: 'users.html' },
        { name: 'จัดการโค้ดส่วนลด', icon: 'fas fa-ticket', link: 'coupons.html' }
    ];

    // โครงสร้าง HTML ของ Sidebar
    const sidebarHTML = `
        <aside class="w-64 bg-white h-screen flex flex-col justify-between flex-shrink-0 border-r border-gray-100 shadow-sm relative z-20">
            <div>
                <!-- Header / Logo -->
                <div class="p-6 border-b border-gray-50 flex items-center gap-3">
                    <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                        A
                    </div>
                    <span class="text-2xl font-bold tracking-wide text-indigo-600">Admin</span>
                </div>

                <!-- Navigation Menu -->
                <nav class="p-4 space-y-1.5">
                    ${menuItems.map(item => {
                        const isActive = currentPath === item.link;
                        
                        const activeClasses = isActive 
                            ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm ring-1 ring-indigo-100/50' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600 font-medium transition-colors';
                            
                        return `
                            <a href="${item.link}" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeClasses}">
                                <i class="${item.icon} w-5 text-center ${isActive ? 'text-indigo-600' : 'text-gray-400'}"></i>
                                <span>${item.name}</span>
                            </a>
                        `;
                    }).join('')}
                </nav>
            </div>

            <!-- User Info / Logout Footer -->
            <div class="p-4 border-t border-gray-50 bg-gray-50/50">
                <button id="logout-btn" class="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white py-2.5 px-4 rounded-xl transition-all duration-300 text-sm font-semibold shadow-sm border border-rose-100 hover:border-rose-500">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>ออกจากระบบ</span>
                </button>
            </div>
        </aside>
    `;

    sidebarContainer.innerHTML = sidebarHTML;

    // 🟢 3. ผูก Event กดปุ่มออกจากระบบ (Logout)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// 🟢 4. ฟังก์ชันสำหรับจัดการการออกจากระบบ (SweetAlert2)
function handleLogout() {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'ออกจากระบบ?',
            text: 'คุณต้องการออกจากระบบผู้ดูแลระบบใช่หรือไม่',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'ใช่, ออกจากระบบ',
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'rounded-xl shadow-xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminData');
                window.location.href = 'login.html';
            }
        });
    } else {
        if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            window.location.href = 'login.html';
        }
    }
}