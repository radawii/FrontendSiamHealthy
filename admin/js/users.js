// admin/js/users.js

let globalUsers = [];

// 1. กำหนด Base URL ชี้ไปที่ NestJS Backend
const API_BASE = 'http://localhost:3000';

// ชุดสีสำหรับ Avatar วงกลมตัวย่อชื่อ
const avatarColors = [
    'bg-emerald-100 text-emerald-700', 
    'bg-rose-100 text-rose-700', 
    'bg-cyan-100 text-cyan-700', 
    'bg-amber-100 text-amber-700', 
    'bg-indigo-100 text-indigo-700',
    'bg-fuchsia-100 text-fuchsia-700'
];

// 2. ฟังก์ชันช่วยดึง Token และดึง ID ของผู้ใช้ปัจจุบัน
function cleanStoredToken(token) {
    const cleaned = token ? String(token).trim().replace(/^"|"$/g, '') : null;
    return cleaned ? cleaned.replace(/^Bearer\s+/i, '').trim() : null;
}

function getAuthToken() {
    const directToken = cleanStoredToken(
        localStorage.getItem('adminToken') ||
        sessionStorage.getItem('adminToken') ||
        localStorage.getItem('token') ||
        sessionStorage.getItem('token')
    );

    if (directToken) return directToken;

    const storageKeys = ['adminData', 'siam_healthy_user'];
    for (const key of storageKeys) {
        const rawUser = localStorage.getItem(key) || sessionStorage.getItem(key);
        if (!rawUser) continue;

        try {
            const user = JSON.parse(rawUser);
            const nestedToken = cleanStoredToken(user.accessToken || user.adminToken || user.token);
            if (nestedToken) return nestedToken;
        } catch (e) {
            console.error(`Error parsing ${key}:`, e);
        }
    }

    return null;
}

function getCurrentUserId() {
    try {
        const rawAdmin = localStorage.getItem('adminData') || sessionStorage.getItem('adminData');
        if (rawAdmin) {
            const admin = JSON.parse(rawAdmin);
            return admin.id || admin.user_id || null;
        }
    } catch (e) {
        console.error('Error parsing adminData:', e);
    }
    return localStorage.getItem('currentUserId') || sessionStorage.getItem('currentUserId') || null;
}

// ฟังก์ชัน Wrapper สำหรับยิง API พร้อมแนบ Bearer Token
async function authFetch(url, options = {}) {
    const token = getAuthToken();

    if (!token) {
        console.warn('⚠️ ไม่พบ Token ใน localStorage หรือ sessionStorage');
        handleUnauthorized('ไม่พบโทเคนการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่');
        throw new Error('No token found');
    }

    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, { ...options, headers });

    // 🛡️ ดักจับกรณี Unauthorized หรือ Forbidden
    if (response.status === 401) {
        console.error('❌ Server ตีกลับ 401 (Unauthorized): Token หมดอายุ ไม่ถูกต้อง หรือ Signature ไม่ตรงกัน');
        handleUnauthorized('โทเคนหมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่');
        throw new Error('Unauthorized');
    }

    if (response.status === 403) {
        console.error('❌ Server ตีกลับ 403 (Forbidden): ไม่มีสิทธิ์ระดับ ADMIN');
        Swal.fire({
            icon: 'error',
            title: 'ไม่มีสิทธิ์เข้าถึง (403 Forbidden)',
            text: 'บัญชีนี้ไม่มีสิทธิ์ระดับ ADMIN กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ',
            confirmButtonColor: '#4f46e5'
        }).then(() => {
            window.location.href = '/admin/login.html';
        });
        throw new Error('Forbidden');
    }

    return response;
}

// 🛡️ เคลียร์ Token ทั้งหมด
function handleUnauthorized(message) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('token');
    localStorage.removeItem('siam_healthy_user');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('adminData');
    sessionStorage.removeItem('siam_healthy_user');

    Swal.fire({
        icon: 'warning',
        title: 'การแจ้งเตือนความปลอดภัย',
        text: message,
        confirmButtonColor: '#4f46e5'
    }).then(() => {
        window.location.href = '/admin/login.html';
    });
}

// 3. ฟังก์ชัน Escape HTML เพื่อป้องกัน Stored XSS
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
});

// 4. ดึงข้อมูลผู้ใช้งานทั้งหมด
async function fetchUsers() {
    try {
        const response = await authFetch(`${API_BASE}/users`);
        if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
        
        const users = await response.json();
        globalUsers = users;
        renderUsersTable(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        const tbody = document.getElementById('usersTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="p-12 text-center text-red-500 font-medium">
                        <i class="fas fa-exclamation-triangle text-3xl mb-3"></i>
                        <p>ไม่สามารถเชื่อมต่อฐานข้อมูลผู้ใช้งานได้ หรือเซสชันหมดอายุ</p>
                    </td>
                </tr>
            `;
        }
    }
}

// 5. วาดตารางข้อมูลผู้ใช้งาน
function renderUsersTable(usersToRender) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const headerCount = document.getElementById('total-users-header');
    if (headerCount) headerCount.innerText = `(${usersToRender.length} รายการ)`;

    if (usersToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="p-12 text-center text-gray-400">
                    <i class="fas fa-users-slash text-4xl mb-3 text-gray-300"></i>
                    <p class="font-medium text-gray-500">ไม่พบข้อมูลผู้ใช้งานที่ตรงกับการค้นหา</p>
                </td>
            </tr>`;
        const pagInfo = document.getElementById('paginationInfo');
        if (pagInfo) pagInfo.innerHTML = 'ไม่พบข้อมูล';
        return;
    }

    const sortedUsers = [...usersToRender].sort((a, b) => {
        const idA = a.id !== undefined ? a.id : (a.user_id || 0);
        const idB = b.id !== undefined ? b.id : (b.user_id || 0);
        return idB - idA;
    });

    sortedUsers.forEach((user) => {
        const realId = user.id !== undefined ? user.id : (user.user_id !== undefined ? user.user_id : 0);
        const userIdStr = String(realId).padStart(3, '0');
        
        const safeName = escapeHtml(user.username || user.name || 'User');
        const safeEmail = escapeHtml(user.email || '-');
        const safePhone = escapeHtml(user.phoneNumber || user.phone_number || user.phone || '-');
        const initials = safeName.substring(0, 2).toUpperCase();

        const colorClass = avatarColors[Math.abs(realId) % avatarColors.length];

        const role = user.role ? String(user.role).toUpperCase() : 'USER';
        let roleBadge = '';
        if (role === 'ADMIN') {
            roleBadge = `<span class="inline-flex items-center px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold"><i class="fas fa-shield-alt mr-1.5"></i> Admin</span>`;
        } else {
            roleBadge = `<span class="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"><i class="fas fa-user mr-1.5"></i> User</span>`;
        }
        
        const row = document.createElement('tr');
        row.className = 'hover:bg-indigo-50/30 transition-colors group';
        row.innerHTML = `
            <td class="p-5 font-mono text-xs text-indigo-600 font-semibold">${userIdStr}</td>
            <td class="p-5 flex items-center space-x-3">
                <div class="w-9 h-9 rounded-full ${colorClass} flex items-center justify-center font-bold text-xs shadow-sm">
                    ${initials}
                </div>
                <span class="font-semibold text-gray-900">${safeName}</span>
            </td>
            <td class="p-5 text-gray-600 font-medium">${safeEmail}</td>
            <td class="p-5 text-gray-600 text-sm">${safePhone}</td>
            <td class="p-5">${roleBadge}</td>
            <td class="p-5 text-center">
                <div class="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button id="btn-edit-${realId}" class="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-colors" title="แก้ไข">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button id="btn-del-${realId}" class="w-8 h-8 rounded-lg flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white transition-colors" title="ลบ">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(row);

        const editBtn = row.querySelector(`#btn-edit-${realId}`);
        const delBtn = row.querySelector(`#btn-del-${realId}`);
        if (editBtn) editBtn.addEventListener('click', () => openEditUserModal(user));
        if (delBtn) delBtn.addEventListener('click', () => deleteUser(realId, user.username || user.name || 'User'));
    });

    const pagInfo = document.getElementById('paginationInfo');
    if (pagInfo) {
        pagInfo.innerHTML = `แสดงข้อมูล <span class="font-semibold text-gray-800">1</span> ถึง <span class="font-semibold text-gray-800">${sortedUsers.length}</span> จากทั้งหมด <span class="font-semibold text-gray-800">${sortedUsers.length}</span> รายการ`;
    }
}

// 6. ค้นหาผู้ใช้งานแบบ Real-time
function searchUsers() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filtered = globalUsers.filter(u => {
        const name = (u.username || u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const phone = (u.phoneNumber || u.phone_number || u.phone || '').toLowerCase();
        const role = (u.role || '').toLowerCase();
        const idStr = String(u.id || u.user_id || '').toLowerCase();
        return name.includes(searchTerm) || email.includes(searchTerm) || phone.includes(searchTerm) || role.includes(searchTerm) || idStr.includes(searchTerm);
    });
    renderUsersTable(filtered);
}

// 7. Validation รูปแบบอีเมล
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 8. Modal เพิ่มผู้ใช้งานใหม่
function openAddUserModal() {
    Swal.fire({
        title: 'เพิ่มผู้ใช้งานใหม่',
        html: `
            <div class="text-left space-y-4 mt-4 text-sm text-gray-700">
                <div>
                    <label class="block font-medium text-gray-700 mb-1.5">ชื่อ - นามสกุล <span class="text-rose-500">*</span></label>
                    <input type="text" id="swal-username" class="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors" placeholder="ระบุชื่อผู้ใช้งาน" required maxlength="100">
                </div>
                <div>
                    <label class="block font-medium text-gray-700 mb-1.5">อีเมล (Login) <span class="text-rose-500">*</span></label>
                    <input type="email" id="swal-email" class="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors" placeholder="example@email.com" required maxlength="120">
                </div>
                <div>
                    <label class="block font-medium text-gray-700 mb-1.5">รหัสผ่านเริ่มต้น <span class="text-rose-500">*</span></label>
                    <input type="password" id="swal-password" class="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors" placeholder="อย่างน้อย 6 ตัวอักษร" required minlength="6">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-medium text-gray-700 mb-1.5">เบอร์โทรศัพท์</label>
                        <input type="text" id="swal-phone" class="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors" placeholder="08X-XXX-XXXX" maxlength="20">
                    </div>
                    <div>
                        <label class="block font-medium text-gray-700 mb-1.5">สิทธิ์การใช้งาน (Role)</label>
                        <select id="swal-role" class="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors bg-white">
                            <option value="USER">User (ผู้ใช้งานทั่วไป)</option>
                            <option value="ADMIN">Admin (ผู้ดูแลระบบ)</option>
                        </select>
                    </div>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-save mr-1.5"></i> บันทึก',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#f1f5f9',
        width: '500px',
        customClass: { 
            popup: 'rounded-2xl shadow-xl border border-gray-100',
            cancelButton: 'text-gray-700 hover:bg-gray-200'
        },
        preConfirm: () => {
            const username = document.getElementById('swal-username').value.trim();
            const email = document.getElementById('swal-email').value.trim();
            const password = document.getElementById('swal-password').value;
            const phone = document.getElementById('swal-phone').value.trim();
            const role = document.getElementById('swal-role').value;

            if (!username || !email || !password) {
                Swal.showValidationMessage('กรุณากรอกชื่อ อีเมล และรหัสผ่านให้ครบถ้วน');
                return false;
            }
            if (!isValidEmail(email)) {
                Swal.showValidationMessage('รูปแบบอีเมลไม่ถูกต้อง');
                return false;
            }
            if (password.length < 6) {
                Swal.showValidationMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
                return false;
            }
            return { username, email, password, phoneNumber: phone, role };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({ title: 'กำลังบันทึกข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            try {
                const res = await authFetch(`${API_BASE}/users`, {
                    method: 'POST',
                    body: JSON.stringify(result.value)
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || 'บันทึกข้อมูลไม่สำเร็จ อาจมีอีเมลนี้ในระบบแล้ว');
                }
                
                Swal.fire({ icon: 'success', title: 'สำเร็จ!', text: 'เพิ่มผู้ใช้งานเรียบร้อยแล้ว', confirmButtonColor: '#4f46e5' })
                .then(() => fetchUsers());
            } catch (err) {
                Swal.fire('ข้อผิดพลาด', err.message, 'error');
            }
        }
    });
}

// 9. Modal แก้ไขผู้ใช้งาน
function openEditUserModal(user) {
    const realId = user.id !== undefined ? user.id : user.user_id;
    const currentName = user.username || user.name || '';
    const currentPhone = user.phoneNumber || user.phone_number || user.phone || '';
    const currentRole = user.role ? user.role.toUpperCase() : 'USER';

    Swal.fire({
        title: 'แก้ไขข้อมูลผู้ใช้งาน',
        html: `
            <div class="text-left space-y-4 mt-4 text-sm text-gray-700">
                <div class="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mb-2 flex items-center gap-2 text-indigo-700 font-medium">
                    <i class="fas fa-hashtag text-indigo-400"></i> รหัสผู้ใช้งาน: ${String(realId).padStart(3, '0')}
                </div>
                <div>
                    <label class="block font-medium text-gray-700 mb-1.5">ชื่อ - นามสกุล <span class="text-rose-500">*</span></label>
                    <input type="text" id="edit-username" value="${escapeHtml(currentName)}" class="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors" required maxlength="100">
                </div>
                <div>
                    <label class="block font-medium text-gray-700 mb-1.5">อีเมล (Login) <span class="text-rose-500">*</span></label>
                    <input type="email" id="edit-email" value="${escapeHtml(user.email)}" class="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors" required maxlength="120">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-medium text-gray-700 mb-1.5">เบอร์โทรศัพท์</label>
                        <input type="text" id="edit-phone" value="${escapeHtml(currentPhone)}" class="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors" maxlength="20">
                    </div>
                    <div>
                        <label class="block font-medium text-gray-700 mb-1.5">สิทธิ์การใช้งาน (Role)</label>
                        <select id="edit-role" class="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors bg-white">
                            <option value="USER" ${currentRole === 'USER' ? 'selected' : ''}>User</option>
                            <option value="ADMIN" ${currentRole === 'ADMIN' ? 'selected' : ''}>Admin</option>
                        </select>
                    </div>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-save mr-1.5"></i> อัปเดตข้อมูล',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#f1f5f9',
        width: '500px',
        customClass: { 
            popup: 'rounded-2xl shadow-xl border border-gray-100',
            cancelButton: 'text-gray-700 hover:bg-gray-200'
        },
        preConfirm: () => {
            const username = document.getElementById('edit-username').value.trim();
            const email = document.getElementById('edit-email').value.trim();
            const phone = document.getElementById('edit-phone').value.trim();
            const role = document.getElementById('edit-role').value;

            if (!username || !email) {
                Swal.showValidationMessage('กรุณากรอกชื่อและอีเมลให้ครบถ้วน');
                return false;
            }
            if (!isValidEmail(email)) {
                Swal.showValidationMessage('รูปแบบอีเมลไม่ถูกต้อง');
                return false;
            }
            return { username, email, phoneNumber: phone, role };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({ title: 'กำลังอัปเดต...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            try {
                const res = await authFetch(`${API_BASE}/users/${realId}`, {
                    method: 'PATCH',
                    body: JSON.stringify(result.value)
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || 'อัปเดตข้อมูลไม่สำเร็จ');
                }
                
                Swal.fire({ icon: 'success', title: 'สำเร็จ!', text: 'แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว', confirmButtonColor: '#4f46e5' })
                .then(() => fetchUsers());
            } catch (err) {
                Swal.fire('ข้อผิดพลาด', err.message, 'error');
            }
        }
    });
}

// 10. ลบผู้ใช้งาน
function deleteUser(id, name) {
    const currentAdminId = getCurrentUserId();
    if (currentAdminId && String(currentAdminId) === String(id)) {
        Swal.fire({
            icon: 'error',
            title: 'การดำเนินการไม่ถูกต้อง',
            text: 'คุณไม่สามารถลบบัญชีผู้ดูแลระบบที่กำลังใช้งานอยู่ในปัจจุบันได้',
            confirmButtonColor: '#4f46e5'
        });
        return;
    }

    Swal.fire({
        title: 'ยืนยันการลบ?',
        html: `คุณต้องการลบผู้ใช้งาน <span class="font-bold text-gray-900">${escapeHtml(name)}</span><br>รหัส ${String(id).padStart(3, '0')} ใช่หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#f1f5f9',
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก',
        customClass: { 
            popup: 'rounded-2xl shadow-xl',
            cancelButton: 'text-gray-700 hover:bg-gray-200'
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({ title: 'กำลังลบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            try {
                const res = await authFetch(`${API_BASE}/users/${id}`, {
                    method: 'DELETE'
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || 'ไม่สามารถลบได้ (อาจมีข้อมูลคำสั่งซื้อผูกอยู่)');
                }
                
                Swal.fire({ icon: 'success', title: 'ลบสำเร็จ!', text: 'ผู้ใช้งานนี้ถูกลบออกจากระบบแล้ว', confirmButtonColor: '#4f46e5' })
                .then(() => fetchUsers());
            } catch (err) {
                Swal.fire('ลบไม่สำเร็จ', err.message, 'error');
            }
        }
    });
}
