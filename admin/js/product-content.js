// admin/js/product-content.js

let allProducts = [];
let currentProduct = null;
const API_URL = 'http://localhost:3000/products';
const SUPABASE_BASE_URL = 'http://192.168.1.199:8000';

document.addEventListener('DOMContentLoaded', () => {
    fetchProductsForDropdown();
});

// ฟังก์ชันช่วยปรับ URL ของรูปภาพ
function fixImageUrl(url) {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;
    
    let cleanUrl = url
        .replace(/https:\/\/qzgfjnjrnenncgxqbrqe\.supabase\.co/g, SUPABASE_BASE_URL)
        .replace(/\/product-images\//g, '/products/');

    if (cleanUrl.startsWith('/storage/v1/')) {
        cleanUrl = `${SUPABASE_BASE_URL}${cleanUrl}`;
    }
    return cleanUrl;
}

// 1. ดึงรายชื่อสินค้าลง Dropdown
async function fetchProductsForDropdown() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('ไม่สามารถดึงรายการสินค้าได้');
        const products = await res.json();
        allProducts = products;
        
        const select = document.getElementById('productSelect');
        select.innerHTML = '<option value="">-- เลือกสินค้าที่ต้องการจัดการ --</option>';
        
        products.forEach(p => {
            select.innerHTML += `<option value="${p.id}">[ID: ${p.id}] ${p.name}</option>`;
        });
    } catch (err) {
        console.error(err);
        Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อระบบหลังบ้านได้', 'error');
    }
}

// 2. ดึงรายละเอียดสินค้า (สารสกัด + รีวิว)
async function loadProductDetails() {
    const productId = document.getElementById('productSelect').value;
    const workspace = document.getElementById('contentWorkspace');
    
    if (!productId) {
        workspace.classList.add('hidden');
        currentProduct = null;
        return;
    }

    Swal.fire({ title: 'กำลังโหลดข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    try {
        const res = await fetch(`${API_URL}/${productId}`);
        if (!res.ok) throw new Error(`ไม่พบสินค้ารหัส ${productId}`);
        
        currentProduct = await res.json();
        
        renderIngredients();
        renderReviews();
        workspace.classList.remove('hidden');
        Swal.close();
    } catch (err) {
        console.error('Fetch Product Error:', err);
        workspace.classList.add('hidden');
        Swal.fire('ข้อผิดพลาด', err.message, 'error');
    }
}

// 3. สลับแท็บ
function switchTab(tabName) {
    document.getElementById('tab-ingredients').classList.remove('active');
    document.getElementById('tab-reviews').classList.remove('active');
    document.getElementById('content-ingredients').classList.add('hidden');
    document.getElementById('content-reviews').classList.add('hidden');

    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.getElementById(`content-${tabName}`).classList.remove('hidden');
}

// ==========================================
// 🌿 4. ส่วนจัดการสารสกัด (Ingredients)
// ==========================================
function renderIngredients() {
    const container = document.getElementById('ingredientsList');
    const items = currentProduct.product_ingredients || [];
    
    if (items.length === 0) {
        container.innerHTML = `<div class="col-span-full p-8 text-center text-gray-400 border-2 border-dashed rounded-xl">ยังไม่มีข้อมูลสารสกัดสำหรับสินค้าตัวนี้</div>`;
        return;
    }

    container.innerHTML = items.map(ing => {
        // 🟢 ตรวจสอบรูปภาพทั้งจาก Base64, URL Direct และ Streaming API
        let imgUrl = '';
        if (ing.image_data) {
            imgUrl = ing.image_data.startsWith('data:') 
                ? ing.image_data 
                : `data:${ing.image_type || 'image/png'};base64,${ing.image_data}`;
        } else if (ing.image_url) {
            imgUrl = fixImageUrl(ing.image_url);
        } else if (ing.id) {
            imgUrl = `${API_URL}/images/ingredient/${ing.id}`;
        }

        const imgHtml = imgUrl 
            ? `<img src="${imgUrl}" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'fas fa-leaf text-gray-300 text-xl\\'></i>';">`
            : `<i class="fas fa-leaf text-gray-300 text-xl"></i>`;

        let propsList = [];
        if (Array.isArray(ing.properties)) {
            propsList = ing.properties;
        } else if (typeof ing.properties === 'string') {
            try { propsList = JSON.parse(ing.properties); } catch { propsList = [ing.properties]; }
        }

        const jsonString = JSON.stringify(ing).replace(/'/g, "&apos;");

        return `
            <div class="border rounded-xl p-4 flex flex-col items-center bg-gray-50 relative group hover:shadow-md transition">
                <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onclick='openEditIngredientModal(${jsonString})' class="text-indigo-600 hover:text-indigo-800 p-1.5 bg-white rounded-full shadow-sm" title="แก้ไขสารสกัด">
                        <i class="fas fa-pen text-xs"></i>
                    </button>
                    <button onclick="deleteItem('ingredients', ${ing.id})" class="text-red-500 hover:text-red-700 p-1.5 bg-white rounded-full shadow-sm" title="ลบสารสกัด">
                        <i class="fas fa-trash-alt text-xs"></i>
                    </button>
                </div>

                <div class="w-16 h-16 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden mb-3">
                    ${imgHtml}
                </div>
                <h4 class="font-bold text-gray-800 text-sm mb-2 text-center">${ing.name}</h4>
                <ul class="text-xs text-gray-600 text-left w-full list-disc pl-4 space-y-1">
                    ${propsList.map(p => `<li>${p}</li>`).join('')}
                </ul>
            </div>
        `;
    }).join('');
}

function openIngredientModal() {
    Swal.fire({
        title: 'เพิ่มสารสกัดใหม่',
        html: `
            <div class="space-y-3 text-left text-sm">
                <div>
                    <label class="font-medium text-gray-700">ชื่อสารสกัด <span class="text-red-500">*</span></label>
                    <input type="text" id="ingName" class="w-full p-2 border border-gray-300 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="เช่น โสมเกาหลี">
                </div>
                <div>
                    <label class="font-medium text-gray-700">คุณสมบัติ / ประโยชน์ <span class="text-indigo-600 text-xs">(ขึ้นบรรทัดใหม่เพื่อแยกข้อ)</span></label>
                    <textarea id="ingProps" rows="4" class="w-full p-2 border border-gray-300 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="ลดโอกาสความเสื่อมของเซลล์&#10;กระตุ้นการไหลเวียนเลือด"></textarea>
                </div>
                <div>
                    <label class="font-medium text-gray-700">รูปภาพไอคอนสารสกัด</label>
                    <input type="file" id="ingFile" accept="image/*" class="w-full p-1.5 border border-gray-300 rounded-lg mt-1 text-xs">
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'บันทึกสารสกัด',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#059669',
        customClass: { popup: 'rounded-xl' },
        preConfirm: () => {
            const name = document.getElementById('ingName').value.trim();
            const propsRaw = document.getElementById('ingProps').value;
            const props = propsRaw.split('\n').map(p => p.trim()).filter(p => p !== '');
            const file = document.getElementById('ingFile').files[0];
            if (!name) return Swal.showValidationMessage('กรุณาระบุชื่อสารสกัด');
            return { name, properties: props, file };
        }
    }).then(result => {
        if (result.isConfirmed) submitData('ingredients', result.value);
    });
}

function openEditIngredientModal(ing) {
    let propsText = '';
    if (Array.isArray(ing.properties)) {
        propsText = ing.properties.join('\n');
    } else if (typeof ing.properties === 'string') {
        try { propsText = JSON.parse(ing.properties).join('\n'); } catch { propsText = ing.properties; }
    }

    Swal.fire({
        title: 'แก้ไขสารสกัด',
        html: `
            <div class="space-y-3 text-left text-sm">
                <div>
                    <label class="font-medium text-gray-700">ชื่อสารสกัด <span class="text-red-500">*</span></label>
                    <input type="text" id="editIngName" value="${ing.name}" class="w-full p-2 border border-gray-300 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                    <label class="font-medium text-gray-700">คุณสมบัติ / ประโยชน์ <span class="text-indigo-600 text-xs">(ขึ้นบรรทัดใหม่เพื่อแยกข้อ)</span></label>
                    <textarea id="editIngProps" rows="4" class="w-full p-2 border border-gray-300 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500">${propsText}</textarea>
                </div>
                <div>
                    <label class="font-medium text-gray-700">เปลี่ยนรูปภาพไอคอน <span class="text-gray-400 text-xs">(ถ้าไม่เปลี่ยนให้เว้นว่าง)</span></label>
                    <input type="file" id="editIngFile" accept="image/*" class="w-full p-1.5 border border-gray-300 rounded-lg mt-1 text-xs">
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'บันทึกการแก้ไข',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#4f46e5',
        customClass: { popup: 'rounded-xl' },
        preConfirm: () => {
            const name = document.getElementById('editIngName').value.trim();
            const propsRaw = document.getElementById('editIngProps').value;
            const props = propsRaw.split('\n').map(p => p.trim()).filter(p => p !== '');
            const file = document.getElementById('editIngFile').files[0];
            if (!name) return Swal.showValidationMessage('กรุณาระบุชื่อสารสกัด');
            return { id: ing.id, name, properties: props, file };
        }
    }).then(result => {
        if (result.isConfirmed) updateData('ingredients', result.value);
    });
}

// ==========================================
// ⭐ 5. ส่วนจัดการรีวิว (Reviews)
// ==========================================
function renderReviews() {
    const container = document.getElementById('reviewsList');
    const items = currentProduct.product_reviews || [];
    
    if (items.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-gray-400 border-2 border-dashed rounded-xl">ยังไม่มีรีวิวสำหรับสินค้าตัวนี้</div>`;
        return;
    }

    container.innerHTML = items.map(rev => {
        let imgUrl = '';
        if (rev.image_data) {
            imgUrl = rev.image_data.startsWith('data:') 
                ? rev.image_data 
                : `data:${rev.image_type || 'image/png'};base64,${rev.image_data}`;
        } else if (rev.image_url) {
            imgUrl = fixImageUrl(rev.image_url);
        } else if (rev.id) {
            imgUrl = `${API_URL}/images/review/${rev.id}`;
        }

        let rawRating = Number(rev.rating);
        if (isNaN(rawRating) || rawRating < 1) rawRating = 5;
        const ratingVal = Math.min(5, Math.max(1, Math.round(rawRating)));
        const emptyStars = Math.max(0, 5 - ratingVal);

        const jsonString = JSON.stringify(rev).replace(/'/g, "&apos;");

        return `
            <div class="border border-gray-100 rounded-xl p-4 bg-gray-50 flex justify-between items-start group hover:border-indigo-200 transition">
                <div class="flex gap-4">
                    ${imgUrl ? `<img src="${imgUrl}" class="w-16 h-16 rounded-lg object-cover border bg-white flex-shrink-0" onerror="this.style.display='none'">` : ''}
                    <div>
                        <h4 class="font-bold text-gray-800 text-sm">${rev.reviewer_name || 'ผู้รีวิว'}</h4>
                        <div class="text-amber-400 text-xs my-1">
                            ${Array(ratingVal).fill('<i class="fas fa-star"></i>').join('')}
                            ${Array(emptyStars).fill('<i class="far fa-star text-gray-300"></i>').join('')}
                            <span class="text-gray-500 text-[11px] ml-1">(${rev.rating} ดาว)</span>
                        </div>
                        <p class="text-xs text-gray-600 mt-1 leading-relaxed">${rev.review_text || '-'}</p>
                    </div>
                </div>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onclick='openEditReviewModal(${jsonString})' class="text-indigo-600 hover:text-indigo-800 p-1.5 bg-white rounded-lg border shadow-sm" title="แก้ไขรีวิว">
                        <i class="fas fa-pen text-xs"></i>
                    </button>
                    <button onclick="deleteItem('reviews', ${rev.id})" class="text-red-500 hover:text-red-700 p-1.5 bg-white rounded-lg border shadow-sm" title="ลบรีวิว">
                        <i class="fas fa-trash-alt text-xs"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function openReviewModal() {
    Swal.fire({
        title: 'เพิ่มรีวิวใหม่',
        html: `
            <div class="space-y-3 text-left text-sm">
                <div>
                    <label class="font-medium text-gray-700">ชื่อผู้รีวิว <span class="text-red-500">*</span></label>
                    <input type="text" id="revName" class="w-full p-2 border border-gray-300 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="เช่น เสกสรร บรรเจิดสุข">
                </div>
                <div>
                    <label class="font-medium text-gray-700">ให้คะแนน (1 - 5 ดาว) <span class="text-red-500">*</span></label>
                    <select id="revRating" class="w-full p-2 border border-gray-300 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="5" selected>⭐⭐⭐⭐⭐ (5 ดาว)</option>
                        <option value="4">⭐⭐⭐⭐ (4 ดาว)</option>
                        <option value="3">⭐⭐⭐ (3 ดาว)</option>
                        <option value="2">⭐⭐ (2 ดาว)</option>
                        <option value="1">⭐ (1 ดาว)</option>
                    </select>
                </div>
                <div>
                    <label class="font-medium text-gray-700">ข้อความรีวิว</label>
                    <textarea id="revText" rows="3" class="w-full p-2 border border-gray-300 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="กรอกความรู้สึกหลังใช้งานจริง..."></textarea>
                </div>
                <div>
                    <label class="font-medium text-gray-700">รูปภาพรีวิว / รูปสินค้าจริง</label>
                    <input type="file" id="revFile" accept="image/*" class="w-full p-1.5 border border-gray-300 rounded-lg mt-1 text-xs">
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'บันทึกรีวิว',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#2563eb',
        customClass: { popup: 'rounded-xl' },
        preConfirm: () => {
            const reviewer_name = document.getElementById('revName').value.trim();
            const rating = parseFloat(document.getElementById('revRating').value);
            const review_text = document.getElementById('revText').value;
            const file = document.getElementById('revFile').files[0];
            if (!reviewer_name) return Swal.showValidationMessage('กรุณาระบุชื่อผู้รีวิว');
            return { reviewer_name, rating, review_text, file };
        }
    }).then(result => {
        if (result.isConfirmed) submitData('reviews', result.value);
    });
}

function openEditReviewModal(rev) {
    const curRating = Math.round(Number(rev.rating) || 5);

    Swal.fire({
        title: 'แก้ไขรีวิว',
        html: `
            <div class="space-y-3 text-left text-sm">
                <div>
                    <label class="font-medium text-gray-700">ชื่อผู้รีวิว <span class="text-red-500">*</span></label>
                    <input type="text" id="editRevName" value="${rev.reviewer_name || ''}" class="w-full p-2 border border-gray-300 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                    <label class="font-medium text-gray-700">ให้คะแนน (1 - 5 ดาว) <span class="text-red-500">*</span></label>
                    <select id="editRevRating" class="w-full p-2 border border-gray-300 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="5" ${curRating === 5 ? 'selected' : ''}>⭐⭐⭐⭐⭐ (5 ดาว)</option>
                        <option value="4" ${curRating === 4 ? 'selected' : ''}>⭐⭐⭐⭐ (4 ดาว)</option>
                        <option value="3" ${curRating === 3 ? 'selected' : ''}>⭐⭐⭐ (3 ดาว)</option>
                        <option value="2" ${curRating === 2 ? 'selected' : ''}>⭐⭐ (2 ดาว)</option>
                        <option value="1" ${curRating === 1 ? 'selected' : ''}>⭐ (1 ดาว)</option>
                    </select>
                </div>
                <div>
                    <label class="font-medium text-gray-700">ข้อความรีวิว</label>
                    <textarea id="editRevText" rows="3" class="w-full p-2 border border-gray-300 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500">${rev.review_text || ''}</textarea>
                </div>
                <div>
                    <label class="font-medium text-gray-700">เปลี่ยนรูปภาพรีวิว <span class="text-gray-400 text-xs">(ถ้าไม่เปลี่ยนให้เว้นว่าง)</span></label>
                    <input type="file" id="editRevFile" accept="image/*" class="w-full p-1.5 border border-gray-300 rounded-lg mt-1 text-xs">
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'บันทึกการแก้ไข',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#4f46e5',
        customClass: { popup: 'rounded-xl' },
        preConfirm: () => {
            const reviewer_name = document.getElementById('editRevName').value.trim();
            const rating = parseFloat(document.getElementById('editRevRating').value);
            const review_text = document.getElementById('editRevText').value;
            const file = document.getElementById('editRevFile').files[0];
            if (!reviewer_name) return Swal.showValidationMessage('กรุณาระบุชื่อผู้รีวิว');
            return { id: rev.id, reviewer_name, rating, review_text, file };
        }
    }).then(result => {
        if (result.isConfirmed) updateData('reviews', result.value);
    });
}

// ==========================================
// 🚀 6. ฟังก์ชันส่ง API (เพิ่ม / แก้ไข / ลบ)
// ==========================================

async function submitData(type, data) {
    const formData = new FormData();
    if (data.file) formData.append('file', data.file);

    if (type === 'ingredients') {
        formData.append('name', data.name);
        formData.append('properties', JSON.stringify(data.properties));
    } else {
        formData.append('reviewer_name', data.reviewer_name);
        formData.append('rating', data.rating);
        formData.append('review_text', data.review_text || '');
    }

    Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    try {
        const res = await fetch(`${API_URL}/${currentProduct.id}/${type}`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('บันทึกไม่สำเร็จ');
        Swal.fire('สำเร็จ!', 'บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
        loadProductDetails();
    } catch (err) {
        Swal.fire('ข้อผิดพลาด', err.message, 'error');
    }
}

async function updateData(type, data) {
    const formData = new FormData();
    if (data.file) formData.append('file', data.file);

    if (type === 'ingredients') {
        formData.append('name', data.name);
        formData.append('properties', JSON.stringify(data.properties));
    } else {
        formData.append('reviewer_name', data.reviewer_name);
        formData.append('rating', data.rating);
        formData.append('review_text', data.review_text || '');
    }

    Swal.fire({ title: 'กำลังอัปเดตข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    try {
        const res = await fetch(`${API_URL}/${currentProduct.id}/${type}/${data.id}`, {
            method: 'PATCH',
            body: formData
        });
        if (!res.ok) throw new Error('อัปเดตไม่สำเร็จ');
        Swal.fire('สำเร็จ!', 'แก้ไขข้อมูลเรียบร้อยแล้ว', 'success');
        loadProductDetails();
    } catch (err) {
        Swal.fire('ข้อผิดพลาด', err.message, 'error');
    }
}

async function deleteItem(type, itemId) {
    const titleText = type === 'ingredients' ? 'ลบสารสกัดนี้?' : 'ลบรีวิวนี้?';
    
    const confirmRes = await Swal.fire({
        title: titleText,
        text: 'ข้อมูลนี้จะถูกลบออกจากสินค้าตัวนี้ทันที',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#9ca3af',
        confirmButtonText: 'ลบเลย',
        cancelButtonText: 'ยกเลิก',
        customClass: { popup: 'rounded-xl' }
    });

    if (!confirmRes.isConfirmed) return;

    Swal.fire({ title: 'กำลังลบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const res = await fetch(`${API_URL}/${currentProduct.id}/${type}/${itemId}`, { 
            method: 'DELETE' 
        });
        if (!res.ok) throw new Error('ลบไม่สำเร็จ');
        Swal.fire('ลบสำเร็จ!', 'ลบข้อมูลเรียบร้อยแล้ว', 'success');
        loadProductDetails();
    } catch (err) {
        Swal.fire('ข้อผิดพลาด', err.message, 'error');
    }
}