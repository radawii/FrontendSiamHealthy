// admin/js/users.js

let globalUsers = [];

// ชุดสีสำหรับ Avatar วงกลมตัวย่อชื่อ
const avatarColors = [
    'bg-emerald-100 text-emerald-700', 
    'bg-rose-100 text-rose-700', 
    'bg-cyan-100 text-cyan-700', 
    'bg-amber-100 text-amber-700', 
    'bg-indigo-100 text-indigo-700',
    'bg-fuchsia-100 text-fuchsia-700'
];

document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
});

// 1. ดึงข้อมูลผู้ใช้งานทั้งหมดจาก Backend
async function fetchUsers() {
    try {
        const response = await fetch('http://localhost:3000/users');
        if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
        
        const users = await response.json();
        globalUsers = users;
        renderUsersTable(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        document.getElementById('usersTableBody').innerHTML = `
            <tr>
                <td colspan="6" class="p-12 text-center text-red-500 font-medium">
                    <i class="fas fa-exclamation-triangle text-3xl mb-3"></i>
                    <p>ไม่สามารถเชื่อมต่อฐานข้อมูลผู้ใช้งานได้</p>
                </td>
            </tr>
        `;
    }
}

// 2. วาดตารางข้อมูลผู้ใช้งาน
function renderUsersTable(usersToRender) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    // อัปเดตตัวเลขบนหัวตาราง (ถ้ามี)
    const headerCount = document.getElementById('total-users-header');
    if(headerCount) headerCount.innerText = `(${usersToRender.length} รายการ)`;

    if (usersToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="p-12 text-center text-gray-400">
                    <i class="fas fa-users-slash text-4xl mb-3 text-gray-300"></i>
                    <p class="font-medium text-gray-500">ไม่พบข้อมูลผู้ใช้งานที่ตรงกับการค้นหา</p>
                </td>
            </tr>`;
        document.getElementById('paginationInfo').innerHTML = 'ไม่พบข้อมูล';
        return;
    }

    // เรียงจากสมัครล่าสุด (อิงตาม ID)
    const sortedUsers = usersToRender.sort((a, b) => {
        const idA = a.id !== undefined ? a.id : (a.user_id || 0);
        const idB = b.id !== undefined ? b.id : (b.user_id || 0);
        return idB - idA;
    });

    sortedUsers.forEach((user, index) => {
        const realId = user.id !== undefined ? user.id : (user.user_id !== undefined ? user.user_id : 0);
        const userIdStr = String(realId).padStart(3, '0');
        
        const name = user.username || user.name || 'User';
        const initials = name.substring(0, 2).toUpperCase();

        // สุ่มสี Avatar จาก ID
        const colorClass = avatarColors[realId % avatarColors.length];

        // ตรวจสอบ Role เพื่อทำ Badge แสดงผล
        const role = user.role ? user.role.toUpperCase() : 'USER';
        let roleBadge = '';
        if (role === 'ADMIN') {
            roleBadge = `<span class="inline-flex items-center px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold"><i class="fas fa-shield-alt mr-1.5"></i> Admin</span>`;
        } else {
            roleBadge = `<span class="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"><i class="fas fa-user mr-1.5"></i> User</span>`;
        }
        
        const row = `
            <tr class="hover:bg-indigo-50/30 transition-colors group">
                <td class="p-5 font-mono text-xs text-indigo-600 font-semibold">${userIdStr}</td>
                <td class="p-5 flex items-center space-x-3">
                    <div class="w-9 h-9 rounded-full ${colorClass} flex items-center justify-center font-bold text-xs shadow-sm">
                        ${initials}
                    </div>
                    <span class="font-semibold text-gray-900">${name}</span>
                </td>
                <td class="p-5 text-gray-600 font-medium">${user.email}</td>
                <td class="p-5 text-gray-600 text-sm">${user.phone_number || user.phone || '-'}</td>
                <td class="p-5">${roleBadge}</td>
                <td class="p-5 text-center">
                    <div class="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onclick='openEditUserModal(${JSON.stringify(user).replace(/'/g, "&apos;")})' class="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-colors" title="แก้ไข">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteUser(${realId}, '${name}')" class="w-8 h-8 rounded-lg flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white transition-colors" title="ลบ">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    document.getElementById('paginationInfo').innerHTML = `แสดงข้อมูล <span class="font-semibold text-gray-800">1</span> ถึง <span class="font-semibold text-gray-800">${sortedUsers.length}</span> จากทั้งหมด <span class="font-semibold text-gray-800">${sortedUsers.length}</span> รายการ`;
}

// 3. ค้นหาผู้ใช้งานแบบ Real-time
function searchUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const filtered = globalUsers.filter(u => {
        const name = (u.username || u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const phone = (u.phone_number || u.phone || '').toLowerCase();
        const role = (u.role || '').toLowerCase();
        const idStr = String(u.id || u.user_id || '').toLowerCase();
        return name.includes(searchTerm) || email.includes(searchTerm) || phone.includes(searchTerm) || role.includes(searchTerm) || idStr.includes(searchTerm);
    });
    renderUsersTable(filtered);
}

// 4. Modal เพิ่มผู้ใช้งานใหม่
function openAddUserModal() {
    Swal.fire({
        title: 'เพิ่มผู้ใช้งานใหม่',
        html: `
            <div class="text-left space-y-4 mt-4 text-sm text-gray-700">
                <div>
                    <label class="block font-medium text-gray-700 mb-1.5">ชื่อ - นามสกุล <span class="text-rose-500">*</span></label>
                    <input type="text" id="swal-username" class="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors" placeholder="ระบุชื่อผู้ใช้งาน" required>
                </div>
                <div>
                    <label class="block font-medium text-gray-700 mb-1.5">อีเมล (Login) <span class="text-rose-500">*</span></label>
                    <input type="email" id="swal-email" class="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors" placeholder="example@email.com" required>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-medium text-gray-700 mb-1.5">เบอร์โทรศัพท์</label>
                        <input type="text" id="swal-phone" class="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors" placeholder="08X-XXX-XXXX">
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
            const username = document.getElementById('swal-username').value;
            const email = document.getElementById('swal-email').value;
            const phone = document.getElementById('swal-phone').value;
            const role = document.getElementById('swal-role').value;

            if (!username || !email) {
                Swal.showValidationMessage('กรุณากรอกชื่อและอีเมลให้ครบถ้วน');
                return false;
            }
            return { username, email, phone_number: phone, role };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({ title: 'กำลังบันทึกข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            try {
                const res = await fetch('http://localhost:3000/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(result.value)
                });
                if (!res.ok) throw new Error('บันทึกข้อมูลไม่สำเร็จ อาจมีอีเมลนี้ในระบบแล้ว');
                
                Swal.fire({ icon: 'success', title: 'สำเร็จ!', text: 'เพิ่มผู้ใช้งานเรียบร้อยแล้ว', confirmButtonColor: '#4f46e5' })
                .then(() => fetchUsers());
            } catch (err) {
                Swal.fire('ข้อผิดพลาด', err.message, 'error');
            }
        }
    });
}

// 5. Modal แก้ไขผู้ใช้งาน
function openEditUserModal(user) {
    const realId = user.id !== undefined ? user.id : user.user_id;
    const currentName = user.username || user.name || '';
    const currentPhone = user.phone_number || user.phone || '';
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
                    <input type="text" id="edit-username" value="${currentName}" class="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors" required>
                </div>
                <div>
                    <label class="block font-medium text-gray-700 mb-1.5">อีเมล (Login) <span class="text-rose-500">*</span></label>
                    <input type="email" id="edit-email" value="${user.email}" class="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors" required>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-medium text-gray-700 mb-1.5">เบอร์โทรศัพท์</label>
                        <input type="text" id="edit-phone" value="${currentPhone}" class="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors">
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
            const username = document.getElementById('edit-username').value;
            const email = document.getElementById('edit-email').value;
            const phone = document.getElementById('edit-phone').value;
            const role = document.getElementById('edit-role').value;

            if (!username || !email) {
                Swal.showValidationMessage('กรุณากรอกชื่อและอีเมลให้ครบถ้วน');
                return false;
            }
            return { username, email, phone_number: phone, role };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({ title: 'กำลังอัปเดต...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            try {
                const res = await fetch(`http://localhost:3000/users/${realId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(result.value)
                });
                if (!res.ok) throw new Error('อัปเดตข้อมูลไม่สำเร็จ');
                
                Swal.fire({ icon: 'success', title: 'สำเร็จ!', text: 'แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว', confirmButtonColor: '#4f46e5' })
                .then(() => fetchUsers());
            } catch (err) {
                Swal.fire('ข้อผิดพลาด', err.message, 'error');
            }
        }
    });
}

// 6. ลบผู้ใช้งาน
function deleteUser(id, name) {
    Swal.fire({
        title: 'ยืนยันการลบ?',
        html: `คุณต้องการลบผู้ใช้งาน <span class="font-bold text-gray-900">${name}</span><br>รหัส ${String(id).padStart(3, '0')} ใช่หรือไม่?`,
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
                const res = await fetch(`http://localhost:3000/users/${id}`, {
                    method: 'DELETE'
                });
                if (!res.ok) throw new Error('ไม่สามารถลบได้ (อาจมีข้อมูลคำสั่งซื้อผูกอยู่)');
                
                Swal.fire({ icon: 'success', title: 'ลบสำเร็จ!', text: 'ผู้ใช้งานนี้ถูกลบออกจากระบบแล้ว', confirmButtonColor: '#4f46e5' })
                .then(() => fetchUsers());
            } catch (err) {
                Swal.fire('ลบไม่สำเร็จ', err.message, 'error');
            }
        }
    });
}