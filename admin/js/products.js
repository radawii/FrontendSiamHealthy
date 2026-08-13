// admin/js/products.js

let globalProducts = [];
const SUPABASE_BASE_URL = 'http://192.168.1.199:8000';

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});

// ฟังก์ชันปรับแต่ง URL รูปภาพ
function fixImageUrl(url) {
    if (!url || typeof url !== 'string') return '';
    let cleanUrl = url
        .replace(/https:\/\/qzgfjnjrnenncgxqbrqe\.supabase\.co/g, SUPABASE_BASE_URL)
        .replace(/\/product-images\//g, '/products/');

    if (cleanUrl.startsWith('/storage/v1/')) {
        cleanUrl = `${SUPABASE_BASE_URL}${cleanUrl}`;
    }
    return cleanUrl;
}

// 1. ดึงข้อมูลสินค้าจาก Backend
async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:3000/products');
        if (!response.ok) throw new Error('Network response was not ok');
        const products = await response.json();
        globalProducts = products; 
        renderProductsTable(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('productsTableBody').innerHTML = `
            <tr>
                <td colspan="11" class="p-12 text-center text-red-500 font-medium">
                    <i class="fas fa-exclamation-triangle text-3xl mb-3"></i>
                    <p>ไม่สามารถเชื่อมต่อฐานข้อมูลสินค้าได้</p>
                </td>
            </tr>
        `;
    }
}

// 2. วาดตารางแสดงรายการสินค้า
function renderProductsTable(productsToRender) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    if (productsToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="p-12 text-center text-gray-400">
                    <i class="fas fa-box-open text-4xl mb-3 text-gray-300"></i>
                    <p class="text-gray-500 font-medium">ไม่พบรายการสินค้าที่ตรงกับการค้นหา</p>
                </td>
            </tr>
        `;
        document.getElementById('paginationInfo').innerHTML = 'ไม่พบข้อมูล';
        return;
    }

    const sortedProducts = productsToRender.sort((a, b) => b.id - a.id);

    sortedProducts.forEach(product => {
        let rawImgUrl = product.images || product.imageUrl || product.image_url || product.image;
        if (Array.isArray(rawImgUrl) && rawImgUrl.length > 0) {
            rawImgUrl = rawImgUrl[0]; 
        }

        const displayImgUrl = fixImageUrl(rawImgUrl);
        const imageHtml = displayImgUrl 
            ? `<img src="${displayImgUrl}" alt="${product.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'fas fa-image text-gray-400 text-xl\\'></i>';">`
            : `<i class="fas fa-image text-gray-400 text-xl"></i>`;

        const oldPriceVal = product.oldPrice !== undefined ? product.oldPrice : product.old_price;
        const oldPriceHtml = (oldPriceVal && Number(oldPriceVal) > 0)
            ? `<span class="text-red-400 line-through">฿${Number(oldPriceVal).toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>`
            : `<span class="text-gray-400 italic">-</span>`;

        const stockNum = Number(product.stock || 0);
        let stockBadge = '';
        if (stockNum <= 5) {
            stockBadge = `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">${stockNum} ชิ้น</span>`;
        } else if (stockNum <= 20) {
            stockBadge = `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">${stockNum} ชิ้น</span>`;
        } else {
            stockBadge = `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">${stockNum} ชิ้น</span>`;
        }

        const dateObj = new Date(product.createdAt || product.created_at || new Date());
        const dateFormatted = `<div class="font-medium text-gray-900">${dateObj.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
                               <div class="text-xs text-gray-400">${dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</div>`;

        // ปรับแต่ง Description & FDA พร้อมระบบตัดคำ (Hover อ่านเต็มได้)
        const descHtml = product.description 
            ? `<div class="truncate max-w-[180px] text-xs" title="${product.description.replace(/"/g, '&quot;')}">${product.description}</div>` 
            : `<span class="text-gray-400 italic text-xs">-</span>`;
            
        const fdaHtml = product.fda 
            ? `<div class="truncate max-w-[120px] text-xs" title="${product.fda.replace(/"/g, '&quot;')}">${product.fda}</div>` 
            : `<span class="text-gray-400 italic text-xs">-</span>`;

        // 🟢 เช็คสถานะการเปิด/ปิด (ถ้าไม่มีค่าถือว่าเปิดใช้งาน)
        const isActive = product.isActive !== false; 
        
        // 🟢 สร้างปุ่ม Toggle Switch
        const statusToggleHtml = `
            <label class="relative inline-flex items-center cursor-pointer" title="คลิกเพื่อเปิด/ปิดการแสดงผลหน้าร้าน">
                <input type="checkbox" class="sr-only peer" ${isActive ? 'checked' : ''} onchange="toggleProductStatus(${product.id}, this.checked)">
                <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
        `;

        // นำข้อมูลประกอบเป็น Row
        const row = `
            <tr class="hover:bg-indigo-50/50 transition duration-150 border-b border-gray-50">
                <td class="p-4">
                    <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                        ${imageHtml}
                    </div>
                </td>
                <td class="p-4 font-mono text-xs text-indigo-600 font-medium">${product.id}</td>
                <td class="p-4 font-medium text-gray-900 whitespace-nowrap">${product.name}</td>
                <td class="p-4 text-gray-600">${descHtml}</td>
                <td class="p-4 text-gray-600">${fdaHtml}</td>
                <td class="p-4 font-bold text-gray-900 whitespace-nowrap">฿${Number(product.price).toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
                <td class="p-4 text-xs whitespace-nowrap">${oldPriceHtml}</td>
                <td class="p-4 text-center whitespace-nowrap">${stockBadge}</td>
                <td class="p-4 whitespace-nowrap">${dateFormatted}</td>
                <!-- 🟢 แทรกคอลัมน์ปุ่มเปิด/ปิด -->
                <td class="p-4 text-center whitespace-nowrap">${statusToggleHtml}</td>
                <td class="p-4 text-center whitespace-nowrap">
                    <button onclick='openEditProductModal(${JSON.stringify(product).replace(/'/g, "&apos;")})' class="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-lg hover:bg-indigo-100 transition inline-block" title="แก้ไข">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProduct(${product.id})" class="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-100 transition inline-block ml-1" title="ลบ">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    document.getElementById('paginationInfo').innerHTML = `แสดงข้อมูลทั้งหมด <span class="font-medium text-gray-900">${sortedProducts.length}</span> รายการ`;
}

// 3. ค้นหาสินค้า
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const filtered = globalProducts.filter(p => {
        return p.name.toLowerCase().includes(searchTerm) || String(p.id).toLowerCase().includes(searchTerm);
    });
    renderProductsTable(filtered);
}

// ตัวแปรเก็บสถานะรูปภาพ Real-time สล็อต 1 - 6
let currentModalImages = Array(6).fill(null);

function renderImageSlotsUI() {
    const container = document.getElementById('image-slots-container');
    if (!container) return;

    const slotLabels = [
        'สล็อต 1 (รูปหลัก/หน้าปก)',
        'สล็อต 2 (รายละเอียด)',
        'สล็อต 3 (ส่วนประกอบ)',
        'สล็อต 4 (โภชนาการ)',
        'สล็อต 5 (รีวิว/ผลลัพธ์)',
        'สล็อต 6 (อย./ใบรับรอง)'
    ];

    let html = '';
    for (let i = 0; i < 6; i++) {
        const item = currentModalImages[i];
        let previewSrc = '';

        if (item) {
            if (item.previewUrl) {
                previewSrc = item.previewUrl;
            } else if (item.file) {
                previewSrc = URL.createObjectURL(item.file);
            } else if (item.url && !item.isError) {
                previewSrc = fixImageUrl(item.url);
            }
        }

        const hasImg = Boolean(previewSrc);

        const previewContent = hasImg 
            ? `<img src="${previewSrc}" class="w-full h-full object-cover rounded-lg" onerror="handleImageError(this, ${i})">`
            : `<div class="text-gray-400 text-center flex flex-col items-center"><i class="fas fa-cloud-upload-alt text-xl mb-1 text-indigo-400"></i><span class="text-[10px]">คลิกเพิ่มรูป</span></div>`;

        let slotOptionsHtml = '';
        for (let s = 0; s < 6; s++) {
            slotOptionsHtml += `<option value="${s}" ${s === i ? 'selected' : ''}>ย้ายไปสล็อต ${s + 1}</option>`;
        }

        html += `
            <div class="p-2 border border-gray-200 rounded-xl bg-gray-50 flex flex-col justify-between items-center relative shadow-sm hover:border-indigo-300 transition">
                <span class="text-[11px] font-semibold text-indigo-600 mb-1 truncate w-full text-center">${slotLabels[i]}</span>
                
                <div class="w-24 h-24 bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden my-1 relative cursor-pointer hover:border-indigo-500 transition" onclick="triggerSingleSlotUpload(${i})">
                    ${previewContent}
                    <input type="file" id="single-file-input-${i}" accept="image/*" class="hidden" onchange="handleSingleSlotChange(${i}, this.files)">
                </div>

                ${hasImg ? `
                    <div class="w-full flex items-center gap-1 mt-1">
                        <select onchange="moveImageSlot(${i}, parseInt(this.value))" class="text-[10px] p-1 border rounded bg-white w-full focus:outline-none focus:ring-1 focus:ring-indigo-500">
                            ${slotOptionsHtml}
                        </select>
                        <button type="button" onclick="removeImageSlot(${i})" class="text-red-500 hover:text-red-700 p-1.5 bg-white border rounded hover:bg-red-50" title="ลบรูปนี้">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                    </div>
                ` : `
                    <button type="button" onclick="triggerSingleSlotUpload(${i})" class="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium mt-1">
                        + เลือกรูปภาพ
                    </button>
                `}
            </div>
        `;
    }
    container.innerHTML = html;
}

function handleImageError(imgElem, slotIndex) {
    if (currentModalImages[slotIndex]) {
        currentModalImages[slotIndex].isError = true;
    }
    imgElem.parentElement.innerHTML = `
        <div class="text-amber-600 text-center p-1 flex flex-col items-center justify-center h-full">
            <i class="fas fa-exclamation-triangle text-lg mb-1 text-amber-500"></i>
            <span class="text-[9px] block font-medium leading-tight">ไม่มีไฟล์รูปเดิม</span>
            <span class="text-[9px] text-indigo-600 font-bold underline mt-1 block">คลิกเปลี่ยนรูปใหม่</span>
        </div>
    `;
}

function triggerSingleSlotUpload(slotIndex) {
    const input = document.getElementById(`single-file-input-${slotIndex}`);
    if (input) input.click();
}

function handleSingleSlotChange(slotIndex, files) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const previewUrl = URL.createObjectURL(file);
    currentModalImages[slotIndex] = { file: file, previewUrl: previewUrl, isError: false };
    renderImageSlotsUI();
}

function handleBulkImageUpload(files) {
    if (!files || files.length === 0) return;

    let fileIdx = 0;
    for (let i = 0; i < 6 && fileIdx < files.length; i++) {
        if (!currentModalImages[i] || currentModalImages[i].isError) {
            const file = files[fileIdx];
            currentModalImages[i] = { 
                file: file, 
                previewUrl: URL.createObjectURL(file),
                isError: false
            };
            fileIdx++;
        }
    }

    for (let i = 0; i < 6 && fileIdx < files.length; i++) {
        if (!currentModalImages[i].file) {
            const file = files[fileIdx];
            currentModalImages[i] = { 
                file: file, 
                previewUrl: URL.createObjectURL(file),
                isError: false
            };
            fileIdx++;
        }
    }

    renderImageSlotsUI();
}

function moveImageSlot(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    const temp = currentModalImages[fromIndex];
    currentModalImages[fromIndex] = currentModalImages[toIndex];
    currentModalImages[toIndex] = temp;
    renderImageSlotsUI();
}

function removeImageSlot(index) {
    currentModalImages[index] = null;
    renderImageSlotsUI();
}

function buildFormData(name, price, stock, oldPrice, description, fda, imagesArray) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', Number(price));
    formData.append('stock', Number(stock));
    if (oldPrice) formData.append('oldPrice', Number(oldPrice));
    
    formData.append('description', description || '');
    formData.append('fda', fda || '');

    const existingUrls = [];

    for (let i = 0; i < 6; i++) {
        const item = imagesArray[i];
        if (item) {
            if (item.file) {
                formData.append('images', item.file);
            } else if (item.url && !item.isError) {
                existingUrls.push(item.url);
            }
        }
    }

    if (existingUrls.length > 0) {
        formData.append('existingImages', JSON.stringify(existingUrls));
    }

    return formData;
}

// 4. Modal เพิ่มสินค้าใหม่
function openAddProductModal() {
    currentModalImages = Array(6).fill(null);

    Swal.fire({
        title: 'เพิ่มสินค้าใหม่',
        html: `
            <div class="text-left space-y-3 mt-2 text-sm text-gray-700">
                <div>
                    <label class="block font-medium text-gray-700 mb-1">ชื่อสินค้า <span class="text-red-500">*</span></label>
                    <input type="text" id="swal-name" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="ระบุชื่อสินค้า" required>
                </div>
                <div class="flex gap-3">
                    <div class="w-1/2">
                        <label class="block font-medium text-gray-700 mb-1">ราคาปัจจุบัน <span class="text-red-500">*</span></label>
                        <input type="number" id="swal-price" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" required min="0">
                    </div>
                    <div class="w-1/2">
                        <label class="block font-medium text-gray-700 mb-1">ราคาเดิม</label>
                        <input type="number" id="swal-oldPrice" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="เว้นว่างได้" min="0">
                    </div>
                </div>
                <div>
                    <label class="block font-medium text-gray-700 mb-1">จำนวนสต็อก <span class="text-red-500">*</span></label>
                    <input type="number" id="swal-stock" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required min="0" value="1">
                </div>
                
                <div>
                    <label class="block font-medium text-gray-700 mb-1">เลข อย. / ข้อมูลรับรอง (FDA)</label>
                    <input type="text" id="swal-fda" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="เช่น ผ่านการรับรองจาก อย. เลขที่: 11-1-xxxx...">
                </div>

                <div>
                    <label class="block font-medium text-gray-700 mb-1">รายละเอียดสินค้า (Description)</label>
                    <textarea id="swal-description" rows="3" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="กรอกรายละเอียดสินค้า..."></textarea>
                </div>

                <div class="pt-2 border-t border-gray-200">
                    <label class="block font-medium text-gray-700 mb-1">เลือก/ลากรูปภาพมาลงพร้อมกัน <span class="text-indigo-600 font-normal">(พรีวิว Real-time)</span></label>
                    <input type="file" id="bulk-file-input" multiple accept="image/*" class="w-full p-2 border border-indigo-200 rounded-lg bg-indigo-50/50 text-xs text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer">
                </div>

                <div>
                    <label class="block font-medium text-gray-700 mb-1 text-xs">จัดตำแหน่งสล็อตรูปภาพ (สล็อต 1 - 6)</label>
                    <div id="image-slots-container" class="grid grid-cols-3 gap-2"></div>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'บันทึกสินค้า',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#4f46e5',
        width: '680px',
        customClass: { popup: 'rounded-xl shadow-xl' },
        didOpen: () => {
            renderImageSlotsUI();
            document.getElementById('bulk-file-input').addEventListener('change', (e) => {
                handleBulkImageUpload(e.target.files);
            });
        },
        preConfirm: () => {
            const name = document.getElementById('swal-name').value;
            const price = document.getElementById('swal-price').value;
            const oldPrice = document.getElementById('swal-oldPrice').value;
            const stock = document.getElementById('swal-stock').value;
            const description = document.getElementById('swal-description').value;
            const fda = document.getElementById('swal-fda').value;

            if (!name || !price || !stock) {
                Swal.showValidationMessage('กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน');
                return false;
            }

            return buildFormData(name, price, stock, oldPrice, description, fda, currentModalImages);
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({ title: 'กำลังบันทึกข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            try {
                const res = await fetch('http://localhost:3000/products', {
                    method: 'POST',
                    body: result.value
                });
                if (!res.ok) throw new Error('บันทึกข้อมูลไม่สำเร็จ');
                Swal.fire('สำเร็จ!', 'เพิ่มสินค้าใหม่เรียบร้อยแล้ว', 'success').then(() => fetchProducts());
            } catch (err) {
                Swal.fire('ข้อผิดพลาด', err.message, 'error');
            }
        }
    });
}

// 5. Modal แก้ไขสินค้า
function openEditProductModal(product) {
    const oldPriceVal = product.oldPrice !== undefined ? product.oldPrice : (product.old_price || '');
    const existingImgs = Array.isArray(product.images) ? product.images : [];

    currentModalImages = Array(6).fill(null);
    for (let i = 0; i < 6 && i < existingImgs.length; i++) {
        if (existingImgs[i]) {
            currentModalImages[i] = { url: existingImgs[i], isError: false };
        }
    }

    Swal.fire({
        title: 'แก้ไขสินค้า',
        html: `
            <div class="text-left space-y-3 mt-2 text-sm text-gray-700">
                <div class="flex gap-3">
                    <div class="w-1/3">
                        <label class="block font-medium text-gray-700 mb-1">Product ID</label>
                        <input type="text" value="${product.id}" class="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed outline-none" readonly>
                    </div>
                    <div class="w-2/3">
                        <label class="block font-medium text-gray-700 mb-1">ชื่อสินค้า <span class="text-red-500">*</span></label>
                        <input type="text" id="edit-name" value="${product.name}" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                    </div>
                </div>
                <div class="flex gap-3">
                    <div class="w-1/3">
                        <label class="block font-medium text-gray-700 mb-1">ราคาปัจจุบัน <span class="text-red-500">*</span></label>
                        <input type="number" id="edit-price" value="${product.price}" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required min="0">
                    </div>
                    <div class="w-1/3">
                        <label class="block font-medium text-gray-700 mb-1">ราคาเดิม</label>
                        <input type="number" id="edit-oldPrice" value="${oldPriceVal}" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" min="0">
                    </div>
                    <div class="w-1/3">
                        <label class="block font-medium text-gray-700 mb-1">สต็อก <span class="text-red-500">*</span></label>
                        <input type="number" id="edit-stock" value="${product.stock}" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required min="0">
                    </div>
                </div>

                <div>
                    <label class="block font-medium text-gray-700 mb-1">เลข อย. / ข้อมูลรับรอง (FDA)</label>
                    <input type="text" id="edit-fda" value="${product.fda || ''}" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="เช่น ผ่านการรับรองจาก อย. เลขที่: 11-1-xxxx...">
                </div>

                <div>
                    <label class="block font-medium text-gray-700 mb-1">รายละเอียดสินค้า (Description)</label>
                    <textarea id="edit-description" rows="4" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="กรอกรายละเอียดสินค้า...">${product.description || ''}</textarea>
                </div>

                <div class="pt-2 border-t border-gray-200">
                    <label class="block font-medium text-gray-700 mb-1">เลือกรูปภาพเพื่อลงทับสล็อตเดิม <span class="text-indigo-600 font-normal">(รูปจะเปลี่ยนโชว์ Real-time ทันที)</span></label>
                    <input type="file" id="bulk-file-input" multiple accept="image/*" class="w-full p-2 border border-indigo-200 rounded-lg bg-indigo-50/50 text-xs text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer">
                </div>

                <div>
                    <label class="block font-medium text-gray-700 mb-1 text-xs">จัดตำแหน่งสล็อตรูปภาพ (สล็อต 1 - 6)</label>
                    <div id="image-slots-container" class="grid grid-cols-3 gap-2"></div>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'บันทึกการแก้ไข',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#4f46e5',
        width: '680px',
        customClass: { popup: 'rounded-xl shadow-xl' },
        didOpen: () => {
            renderImageSlotsUI();
            document.getElementById('bulk-file-input').addEventListener('change', (e) => {
                handleBulkImageUpload(e.target.files);
            });
        },
        preConfirm: () => {
            const name = document.getElementById('edit-name').value;
            const price = document.getElementById('edit-price').value;
            const oldPrice = document.getElementById('edit-oldPrice').value;
            const stock = document.getElementById('edit-stock').value;
            const description = document.getElementById('edit-description').value;
            const fda = document.getElementById('edit-fda').value;

            if (!name || !price || !stock) {
                Swal.showValidationMessage('กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน');
                return false;
            }

            return buildFormData(name, price, stock, oldPrice, description, fda, currentModalImages);
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({ title: 'กำลังบันทึกการแก้ไข...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            try {
                const res = await fetch(`http://localhost:3000/products/${product.id}`, {
                    method: 'PATCH',
                    body: result.value 
                });
                if (!res.ok) throw new Error('อัปเดตไม่สำเร็จ');
                Swal.fire('สำเร็จ!', 'แก้ไขข้อมูลสินค้าเรียบร้อยแล้ว', 'success').then(() => fetchProducts());
            } catch (err) {
                Swal.fire('ข้อผิดพลาด', err.message, 'error');
            }
        }
    });
}

// 6. ลบสินค้า
function deleteProduct(id) {
    Swal.fire({
        title: 'ยืนยันการลบสินค้า?',
        text: `คุณต้องการลบสินค้ารหัส ${id} ใช่หรือไม่? ข้อมูลนี้ไม่สามารถกู้คืนได้`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#9ca3af',
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก',
        customClass: { popup: 'rounded-xl shadow-xl' }
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({ title: 'กำลังลบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            try {
                const res = await fetch(`http://localhost:3000/products/${id}`, {
                    method: 'DELETE'
                });
                if (!res.ok) throw new Error('ไม่สามารถลบสินค้านี้ได้');
                Swal.fire('ลบสำเร็จ!', 'สินค้านี้ถูกลบออกจากระบบแล้ว', 'success').then(() => fetchProducts());
            } catch (err) {
                Swal.fire('ลบไม่สำเร็จ', err.message, 'error');
            }
        }
    });
}

// 🟢 7. ฟังก์ชันสำหรับยิง API เพื่อสลับการแสดงผล (เปิด/ปิดสินค้า)
async function toggleProductStatus(id, newStatus) {
    try {
        const formData = new FormData();
        formData.append('isActive', newStatus);

        const res = await fetch(`http://localhost:3000/products/${id}`, {
            method: 'PATCH',
            body: formData
        });

        if (!res.ok) throw new Error('ไม่สามารถอัปเดตสถานะได้');

        // แสดงแจ้งเตือนแบบ Toast น่ารักๆ มุมขวาบน
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
        });

        Toast.fire({
            icon: 'success',
            title: newStatus ? 'เปิดแสดงสินค้าหน้าร้านแล้ว' : 'ซ่อนสินค้าจากหน้าร้านแล้ว'
        });

        // อัปเดตข้อมูลใน globalProducts ทันทีเพื่อให้เวลาค้นหาข้อมูลไม่เพี้ยน
        const productIndex = globalProducts.findIndex(p => p.id === id);
        if (productIndex !== -1) {
            globalProducts[productIndex].isActive = newStatus;
        }
    } catch (err) {
        Swal.fire('ข้อผิดพลาด', err.message, 'error');
        fetchProducts(); // ถ้า Error ให้รีเฟรชใหม่เพื่อให้สวิตช์เด้งกลับตำแหน่งเดิม
    }
}