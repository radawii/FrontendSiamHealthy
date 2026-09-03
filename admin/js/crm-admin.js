// admin/js/crm-admin.js

const API_BASE = 'http://localhost:3000/api/admin/crm';
let currentActiveTab = 'mappings';

function switchTab(tabName, el) {
  currentActiveTab = tabName;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

  if (el) el.classList.add('active');
  document.getElementById(`tab-${tabName}`).classList.remove('hidden');

  if (tabName === 'mappings') loadMappings();
  if (tabName === 'orders') loadOrders();
  if (tabName === 'logs') loadLogs();
}

function refreshCurrentTab() {
  if (currentActiveTab === 'mappings') loadMappings();
  if (currentActiveTab === 'orders') loadOrders();
  if (currentActiveTab === 'logs') loadLogs();
}

// ==========================================
// 1. MAPPINGS LOGIC
// ==========================================
async function loadMappings() {
  const tbody = document.getElementById('mappings-table-body');
  try {
    const res = await fetch(`${API_BASE}/mappings`);
    const data = await res.json();
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center p-4 text-gray-400">ยังไม่มีรายการ Mapping ในระบบ</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(m => `
      <tr class="hover:bg-gray-50/50 transition">
        <td class="p-3 font-semibold text-gray-600">#${m.id}</td>
        <td class="p-3 font-semibold text-gray-800">${m.domain}</td>
        <td class="p-3">${m.productSku}</td>
        <td class="p-3"><span class="badge bg-blue-50 text-blue-700">Product: ${m.crmProductId}</span></td>
        <td class="p-3">${m.crmOfferId ? `<span class="badge bg-amber-50 text-amber-700">Offer: ${m.crmOfferId}</span>` : '-'}</td>
        <td class="p-3">
          <span class="badge ${m.isActive ? 'badge-success' : 'badge-danger'}">
            ${m.isActive ? 'เปิดใช้งาน' : 'ระงับการใช้'}
          </span>
        </td>
        <td class="p-3 text-right space-x-1">
          <button class="px-2.5 py-1 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition" onclick="toggleMappingStatus(${m.id}, ${!m.isActive})">
            ${m.isActive ? 'ปิด' : 'เปิด'}
          </button>
          <button class="px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition" onclick="deleteMapping(${m.id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-rose-500 text-center p-4">โหลดไม่สำเร็จ: ${e.message}</td></tr>`;
  }
}

async function openAddMappingModal() {
  const { value: formValues } = await Swal.fire({
    title: 'เพิ่ม Product Mapping ใหม่',
    html: `
      <div class="space-y-3 text-left">
        <div>
          <label class="text-xs font-semibold text-gray-500">Domain เว็บไซต์</label>
          <input id="swal-domain" class="w-full mt-1 p-2.5 border border-gray-200 rounded-xl text-sm" placeholder="เช่น chiwitchiwa.com" value="chiwitchiwa.com">
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-500">Product SKU หรือชื่อสินค้าบนเว็บ</label>
          <input id="swal-sku" class="w-full mt-1 p-2.5 border border-gray-200 rounded-xl text-sm" placeholder="เช่น Astin หรือ Andicellix">
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-500">CRM Product ID (ตัวเลข)</label>
          <input id="swal-prod-id" class="w-full mt-1 p-2.5 border border-gray-200 rounded-xl text-sm" placeholder="เช่น 68">
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-500">CRM Offer ID (เว้นว่างได้)</label>
          <input id="swal-offer-id" class="w-full mt-1 p-2.5 border border-gray-200 rounded-xl text-sm" placeholder="เช่น 62">
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'บันทึก',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#4f46e5',
    customClass: { popup: 'rounded-2xl' },
    preConfirm: () => {
      const domain = document.getElementById('swal-domain').value.trim();
      const productSku = document.getElementById('swal-sku').value.trim();
      const crmProductId = document.getElementById('swal-prod-id').value.trim();
      const crmOfferId = document.getElementById('swal-offer-id').value.trim();

      if (!domain || !productSku || !crmProductId) {
        Swal.showValidationMessage('กรุณากรอกข้อมูล Domain, SKU และ Product ID ให้ครบถ้วน');
        return false;
      }

      return { domain, productSku, crmProductId, crmOfferId };
    }
  });

  if (formValues) {
    try {
      const res = await fetch(`${API_BASE}/mappings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', timer: 1200, showConfirmButton: false });
        loadMappings();
      } else {
        const err = await res.json();
        Swal.fire({ icon: 'error', title: 'บันทึกไม่สำเร็จ', text: err.message });
      }
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.message });
    }
  }
}

async function toggleMappingStatus(id, isActive) {
  try {
    await fetch(`${API_BASE}/mappings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive })
    });
    loadMappings();
  } catch (e) {
    console.error('Toggle status error:', e);
  }
}

async function deleteMapping(id) {
  const confirmResult = await Swal.fire({
    title: 'ยืนยันการลบ?',
    text: 'คุณต้องการลบกฎการ Mapping นี้ใช่หรือไม่',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'ลบข้อมูล',
    cancelButtonText: 'ยกเลิก',
    customClass: { popup: 'rounded-2xl' }
  });

  if (confirmResult.isConfirmed) {
    try {
      await fetch(`${API_BASE}/mappings/${id}`, { method: 'DELETE' });
      loadMappings();
    } catch (e) {
      console.error('Delete mapping error:', e);
    }
  }
}

// ==========================================
// 2. ORDERS LOGIC
// ==========================================
async function loadOrders() {
  const tbody = document.getElementById('orders-table-body');
  const filter = document.getElementById('order-filter-status').value;
  try {
    const res = await fetch(`${API_BASE}/orders?status=${filter}`);
    const data = await res.json();
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center p-4 text-gray-400">ไม่พบข้อมูลออเดอร์</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(o => `
      <tr class="hover:bg-gray-50/50 transition">
        <td class="p-3 font-semibold text-gray-800">#${o.id}</td>
        <td class="p-3">฿${Number(o.grandTotal || o.grand_total || 0).toLocaleString()}</td>
        <td class="p-3"><span class="badge ${(o.paymentStatus || o.payment_status) === 'PAID' ? 'badge-success' : 'badge-danger'}">${o.paymentStatus || o.payment_status || 'PENDING'}</span></td>
        <td class="p-3"><span class="badge ${o.syncStatus === 'SYNCED' ? 'badge-success' : 'badge-danger'}">${o.syncStatus || 'PENDING'}</span></td>
        <td class="p-3">${o.crmOrderId ? `<a href="${o.crmUrl || '#'}" target="_blank" class="text-indigo-600 font-semibold hover:underline">#${o.crmOrderId} <i class="fas fa-arrow-up-right-from-square text-xs"></i></a>` : '-'}</td>
        <td class="p-3 max-w-xs truncate text-rose-600 text-xs" title="${o.syncError || ''}">${o.syncError || '-'}</td>
        <td class="p-3 text-right">
          <button class="px-2.5 py-1 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition" onclick="retryOrderSync('${o.id}')" title="สั่งส่งเข้า CRM ซ้ำ">
            <i class="fas fa-arrow-rotate-right mr-1"></i> Retry
          </button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-rose-500 text-center p-4">โหลดไม่สำเร็จ: ${e.message}</td></tr>`;
  }
}

async function retryOrderSync(orderId) {
  Swal.fire({ title: 'กำลัง Retry Sync...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/retry`, { method: 'POST' });
    const result = await res.json();
    if (res.ok) {
      Swal.fire({ icon: 'success', title: 'สำเร็จ', text: result.message, timer: 1500, showConfirmButton: false });
      loadOrders();
    } else {
      Swal.fire({ icon: 'error', title: 'ไม่สำเร็จ', text: result.message });
    }
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: err.message });
  }
}

// ==========================================
// 3. LOGS LOGIC
// ==========================================
async function loadLogs() {
  const tbody = document.getElementById('logs-table-body');
  const filter = document.getElementById('log-filter-level').value;
  try {
    const res = await fetch(`${API_BASE}/logs?level=${filter}`);
    const data = await res.json();
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-gray-400">ไม่มีข้อมูล Log</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(l => `
      <tr class="hover:bg-gray-50/50 transition">
        <td class="p-3 text-xs text-gray-500">${new Date(l.createdAt).toLocaleTimeString()}</td>
        <td class="p-3"><span class="badge ${l.level === 'ERROR' ? 'badge-danger' : 'badge-success'}">${l.level}</span></td>
        <td class="p-3 font-mono text-xs text-gray-600">${l.step}</td>
        <td class="p-3 font-semibold text-gray-700">${l.orderId ? `#${l.orderId}` : '-'}</td>
        <td class="p-3 text-xs">${l.message}</td>
        <td class="p-3 text-right">
          ${l.details ? `<button class="px-2 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition" onclick="viewLogDetail('${encodeURIComponent(l.details)}')">ดู JSON</button>` : '-'}
        </td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-rose-500 text-center p-4">โหลดไม่สำเร็จ: ${e.message}</td></tr>`;
  }
}

function viewLogDetail(encodedJson) {
  const parsed = JSON.parse(decodeURIComponent(encodedJson));
  Swal.fire({
    title: 'รายละเอียด Log',
    html: `<pre class="text-left bg-gray-50 p-3 rounded-xl text-xs max-h-72 overflow-y-auto font-mono text-gray-700">${JSON.stringify(parsed, null, 2)}</pre>`,
    customClass: { popup: 'rounded-2xl' }
  });
}

// เรียกโหลดเริ่มต้น
document.addEventListener('DOMContentLoaded', () => {
  loadMappings();
});