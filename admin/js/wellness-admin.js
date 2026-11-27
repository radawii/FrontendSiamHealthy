const SEO_FIELDS=["primaryKeywordTh","primaryKeywordEn","secondaryKeywordsTh","secondaryKeywordsEn"];
document.addEventListener('DOMContentLoaded',()=>{const anchor=document.getElementById('f-seoTitleTh')?.parentElement?.parentElement;if(anchor) SEO_FIELDS.forEach(f=>{const label=document.createElement('label');label.textContent=f;const input=document.createElement('input');input.id='f-'+f;input.className='field-input';label.append(input);anchor.append(label)});});
// admin/js/wellness-admin.js
// จัดการหัวข้อสุขภาพ (Wellness Topics) ของคลังความรู้ส่วนผสม

const API_BASE = window.location.origin;

let globalTopics = [];
let globalIngredients = [];
let currentEditing = null;

// เนื้อหาด้านสุขภาพของหัวข้อ
const HEALTH_CONTENT_FIELDS = ['descriptionTh', 'descriptionEn'];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// 12 หัวข้อมาตรฐานตามขอบเขตโครงการ (ใส่เฉพาะชื่อ ไม่สร้างเนื้อหาขึ้นเอง)
const STANDARD_TOPICS = [
  {
    "slug": "heart-health",
    "nameTh": "หัวใจและหลอดเลือด",
    "nameEn": "Heart & Circulation"
  },
  {
    "slug": "joint-mobility",
    "nameTh": "กระดูกและข้อต่อ",
    "nameEn": "Bones & Joints"
  },
  {
    "slug": "skin-beauty",
    "nameTh": "ผิวพรรณและความงาม",
    "nameEn": "Skin & Beauty"
  },
  {
    "slug": "digestion",
    "nameTh": "ลำไส้และการขับถ่าย",
    "nameEn": "Digestive Health"
  },
  {
    "slug": "weight-metabolism",
    "nameTh": "ลดน้ำหนักและการเผาผลาญ",
    "nameEn": "Weight & Metabolism"
  },
  {
    "slug": "eye-health",
    "nameTh": "ดวงตาและการมองเห็น",
    "nameEn": "Eye Health & Vision"
  },
  {
    "slug": "hearing",
    "nameTh": "การได้ยิน",
    "nameEn": "Hearing Health"
  },
  {
    "slug": "mens-wellness",
    "nameTh": "สุขภาพผู้ชาย",
    "nameEn": "Men's Wellness"
  },
  {
    "slug": "immune-support",
    "nameTh": "ระบบภูมิคุ้มกัน",
    "nameEn": "Immune Health"
  },
  {
    "slug": "focus",
    "nameTh": "สมองและระบบประสาท",
    "nameEn": "Brain & Nervous System"
  }
];

// ===================================================
// 1. Auth helpers (รูปแบบเดียวกับ admin/js/users.js)
// ===================================================
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

    if (response.status === 401) {
        handleUnauthorized('โทเคนหมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่');
        throw new Error('Unauthorized');
    }

    if (response.status === 403) {
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

// ===================================================
// 2. Utilities
// ===================================================
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

function formatThaiDate(value) {
    if (!value) return '-';
    try {
        return new Intl.DateTimeFormat('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
            .format(new Date(value));
    } catch (e) {
        return '-';
    }
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value === null || value === undefined ? '' : value;
}

function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function getMultiSelectValues(id) {
    const el = document.getElementById(id);
    if (!el) return [];
    return Array.from(el.selectedOptions).map(opt => Number(opt.value)).filter(n => !Number.isNaN(n));
}

function setMultiSelectValues(id, values) {
    const el = document.getElementById(id);
    if (!el) return;
    const wanted = new Set(asArray(values).map(v => String(v)));
    Array.from(el.options).forEach(opt => { opt.selected = wanted.has(opt.value); });
}

// ===================================================
// 3. Badges
// ===================================================
function publicationBadge(status) {
    if (status === 'PUBLISHED') {
        return `<span class="inline-flex items-center px-2.5 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-semibold"><i class="fas fa-globe mr-1.5"></i> เผยแพร่แล้ว</span>`;
    }
    return `<span class="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"><i class="fas fa-pen mr-1.5"></i> ฉบับร่าง</span>`;
}

document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    void loadAll().catch(error => console.error('โหลดหัวข้อสุขภาพไม่สำเร็จ', error));
});

async function loadAll() {
    await loadIngredientOptions();
    await loadTopics();
}

async function loadTopics() {
    try {
        const res = await authFetch(`${API_BASE}/api/admin/wellness`);
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลหัวข้อสุขภาพได้');
        globalTopics = await res.json();
        renderTable();
    } catch (error) {
        console.error('Error loading wellness topics:', error);
        const tbody = document.getElementById('topicsTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="p-12 text-center text-rose-500 font-medium">
                        <i class="fas fa-exclamation-triangle text-3xl mb-3"></i>
                        <p>ไม่สามารถเชื่อมต่อฐานข้อมูลหัวข้อสุขภาพได้ หรือเซสชันหมดอายุ</p>
                        <p class="text-xs text-gray-400 mt-2">หากเป็นการติดตั้งครั้งแรก กรุณาตรวจสอบว่ารัน migration ฐานข้อมูลแล้ว</p>
                    </td>
                </tr>`;
        }
    }
}

async function loadIngredientOptions() {
    try {
        const res = await authFetch(`${API_BASE}/api/admin/ingredients`);
        if (!res.ok) return;
        globalIngredients = await res.json();
        const select = document.getElementById('f-ingredientIds');
        if (select) {
            select.innerHTML = globalIngredients.map(ing => {
                const status = ing.publicationStatus === 'PUBLISHED'  ? '● ' : '○ ';
                return `<option value="${escapeHtml(ing.id)}">${escapeHtml(status + ing.nameTh)} (${escapeHtml(ing.nameEn)})</option>`;
            }).join('');
        }
    } catch (e) {
        console.error('Error loading ingredients:', e);
    }
}

// ===================================================
// 5. Table rendering & filtering
// ===================================================
function getFilteredTopics() {
    const term = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
    const statusFilter = document.getElementById('statusFilter')?.value || '';

    return globalTopics.filter(topic => {
        const haystack = [topic.nameTh, topic.nameEn, topic.slug].filter(Boolean).join(' ').toLowerCase();
        const matchesTerm = !term || haystack.includes(term);

        let matchesStatus = true;
        if (statusFilter === 'PUBLISHED') matchesStatus = topic.publicationStatus === 'PUBLISHED';
        else if (statusFilter === 'DRAFT') matchesStatus = topic.publicationStatus !== 'PUBLISHED';

        return matchesTerm && matchesStatus;
    }).sort((a, b) => Number(a.id) - Number(b.id)); // เรียงตาม ID จากน้อยไปมาก
}

function renderTable() {
    const tbody = document.getElementById('topicsTableBody');
    if (!tbody) return;

    const list = getFilteredTopics();

    const badge = document.getElementById('totalCountBadge');
    if (badge) badge.innerText = `${list.length} รายการ`;

    const pagInfo = document.getElementById('paginationInfo');
    if (pagInfo) {
        const published = globalTopics.filter(t => t.publicationStatus === 'PUBLISHED').length;
        pagInfo.innerHTML = `
            <span>ทั้งหมด ${escapeHtml(globalTopics.length)} รายการ · แสดงบนเว็บ ${escapeHtml(published)}</span>
            <span class="text-xs text-gray-400">แสดง ${escapeHtml(list.length)} รายการตามตัวกรอง</span>
        `;
    }

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="p-12 text-center text-gray-400">
                    <i class="fas fa-heart-pulse text-4xl mb-3 text-gray-300"></i>
                    <p class="font-medium text-gray-500">ไม่พบหัวข้อสุขภาพที่ตรงกับเงื่อนไข</p>
                    <p class="text-xs text-gray-400 mt-1">กด "สร้างหัวข้อมาตรฐาน 12 หัวข้อ" เพื่อเริ่มต้นได้</p>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = list.map(topic => {
        const ingredientCount = asArray(topic.ingredientLinks).length;
        return `
            <tr class="hover:bg-indigo-50/30 transition-colors">
                <td class="p-5 font-mono text-xs text-indigo-600 font-semibold">${escapeHtml(topic.id)}</td>
                <td class="p-5">
                    <p class="font-semibold text-gray-800">${escapeHtml(topic.nameTh)}</p>
                    <p class="text-xs text-gray-500">${escapeHtml(topic.nameEn)}</p>
                </td>
                <td class="p-5 font-mono text-xs text-gray-500">${escapeHtml(topic.slug)}</td>
                <td class="p-5">
                    <div class="flex flex-wrap gap-1.5">
                        ${publicationBadge(topic.publicationStatus)}
                    </div>
                </td>
                <td class="p-5 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-semibold">${escapeHtml(ingredientCount)}</span>
                </td>
                <td class="p-5 text-xs text-gray-500">${escapeHtml(formatThaiDate(topic.updatedAt))}</td>
                <td class="p-5 text-center">${visibilitySwitch(topic)}</td>
                <td class="p-5 text-center">
                    <button class="js-edit text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors" data-id="${escapeHtml(topic.id)}">
                        <i class="fas fa-pen-to-square mr-1"></i> แก้ไข
                    </button>
                    <button class="js-preview text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors" data-id="${escapeHtml(topic.id)}">
                        <i class="fas fa-eye mr-1"></i> ดูตัวอย่าง
                    </button>
                </td>
            </tr>`;
    }).join('');

    tbody.querySelectorAll('.js-visibility').forEach(btn => {
        btn.addEventListener('click', () => toggleVisibility(btn, globalTopics, 'wellness', loadTopics));
    });
    tbody.querySelectorAll('.js-edit').forEach(btn => {
        btn.addEventListener('click', () => openPanel(Number(btn.dataset.id), 'edit'));
    });
    tbody.querySelectorAll('.js-preview').forEach(btn => {
        btn.addEventListener('click', () => openPanel(Number(btn.dataset.id), 'preview'));
    });
}

// ===================================================
// 6. Form modal
// ===================================================
function bindEvents() {
    document.getElementById('searchInput')?.addEventListener('input', renderTable);
    document.getElementById('statusFilter')?.addEventListener('change', renderTable);
    document.getElementById('addTopicBtn')?.addEventListener('click', () => openPanel(null, 'edit'));
    document.getElementById('seedTopicsBtn')?.addEventListener('click', seedStandardTopics);
    document.getElementById('closePanelBtn')?.addEventListener('click', closePanel);
    // ปิดฟอร์มได้เฉพาะปุ่มกากบาท — คลิกนอกกรอบหรือกด Esc จะไม่ปิด กันข้อมูลที่กรอกหาย
    document.getElementById('saveBtn')?.addEventListener('click', saveTopic);
    
    document.getElementById('publishBtn')?.addEventListener('click', publishTopic);
    document.getElementById('unpublishBtn')?.addEventListener('click', unpublishTopic);
    document.getElementById('deleteBtn')?.addEventListener('click', deleteTopic);

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.tab === tab);
    });
    document.getElementById('tabEdit')?.classList.toggle('hidden', tab !== 'edit');
    document.getElementById('tabPreview')?.classList.toggle('hidden', tab !== 'preview');
    if (tab === 'preview') renderPreview();
}

async function openPanel(id, tab) {
    clearForm();

    if (id) {
        try {
            const res = await authFetch(`${API_BASE}/api/admin/wellness/${id}`);
            if (!res.ok) throw new Error('ไม่พบข้อมูลหัวข้อนี้');
            currentEditing = await res.json();
        } catch (e) {
            Swal.fire({ icon: 'error', title: 'โหลดข้อมูลไม่สำเร็จ', text: e.message, confirmButtonColor: '#4f46e5' });
            return;
        }
        fillForm(currentEditing);
        document.getElementById('panelTitle').innerText = `แก้ไข: ${currentEditing.nameTh}`;
    } else {
        currentEditing = null;
        document.getElementById('panelTitle').innerText = 'เพิ่มหัวข้อสุขภาพใหม่';
    }

    document.dispatchEvent(new Event("cw:refresh"));
    renderPanelStatus();
    switchTab(tab || 'edit');

    document.getElementById('panelBackdrop')?.classList.remove('hidden');
    document.getElementById('formPanel')?.classList.remove('is-closed');
    document.body.classList.add('kb-modal-open');
}

function closePanel() {
    document.getElementById('formPanel')?.classList.add('is-closed');
    document.getElementById('panelBackdrop')?.classList.add('hidden');
    document.body.classList.remove('kb-modal-open');
    currentEditing = null;
}

function renderPanelStatus() {
    const container = document.getElementById('panelStatusBadges');
    const infoBox = document.getElementById('complianceInfoBox');
    const publishBtn = document.getElementById('publishBtn');
    const unpublishBtn = document.getElementById('unpublishBtn');
    const deleteBtn = document.getElementById('deleteBtn');

    if (!currentEditing) {
        if (container) container.innerHTML = `<span class="text-xs text-gray-400">หัวข้อใหม่จะถูกบันทึกเป็นฉบับร่าง</span>`;
        if (infoBox) infoBox.innerHTML = 'บันทึกหัวข้อก่อน จึงจะสามารถเปิดแสดงบนเว็บได้';
        [publishBtn, unpublishBtn, deleteBtn].forEach(b => b?.classList.add('hidden'));
        return;
    }

    if (container) {
        container.innerHTML = `
            ${publicationBadge(currentEditing.publicationStatus)}
        `;
    }


    publishBtn?.classList.toggle('hidden', currentEditing.publicationStatus === 'PUBLISHED');
    unpublishBtn?.classList.toggle('hidden', currentEditing.publicationStatus !== 'PUBLISHED');
    deleteBtn?.classList.remove('hidden');
}

function clearForm() {
    SEO_FIELDS.forEach(f=>setValue('f-'+f,''));
    ['f-nameTh', 'f-nameEn', 'f-slug', 'f-descriptionTh', 'f-descriptionEn',
     'f-seoTitleTh', 'f-seoTitleEn', 'f-metaDescriptionTh', 'f-metaDescriptionEn']
        .forEach(id => setValue(id, ''));
    setMultiSelectValues('f-ingredientIds', []);
}

function fillForm(topic) {
    SEO_FIELDS.forEach(f=>setValue('f-'+f,Array.isArray(topic[f])?topic[f].join(', '):topic[f]));
    setValue('f-nameTh', topic.nameTh);
    setValue('f-nameEn', topic.nameEn);
    setValue('f-slug', topic.slug);
    setValue('f-descriptionTh', topic.descriptionTh);
    setValue('f-descriptionEn', topic.descriptionEn);
    setValue('f-seoTitleTh', topic.seoTitleTh);
    setValue('f-seoTitleEn', topic.seoTitleEn);
    setValue('f-metaDescriptionTh', topic.metaDescriptionTh);
    setValue('f-metaDescriptionEn', topic.metaDescriptionEn);
    setMultiSelectValues('f-ingredientIds', asArray(topic.ingredientLinks).map(l => l.ingredientId));
}

// ===================================================
// 7. Save / workflow actions
// ===================================================
function collectPayload() {
    return {
        ...Object.fromEntries(SEO_FIELDS.map(f=>[f,f.startsWith('secondary')?getValue('f-'+f).split(',').map(s=>s.trim()).filter(Boolean):getValue('f-'+f)])),
        slug: getValue('f-slug'),
        nameTh: getValue('f-nameTh'),
        nameEn: getValue('f-nameEn'),
        descriptionTh: getValue('f-descriptionTh'),
        descriptionEn: getValue('f-descriptionEn'),
        seoTitleTh: getValue('f-seoTitleTh'),
        seoTitleEn: getValue('f-seoTitleEn'),
        metaDescriptionTh: getValue('f-metaDescriptionTh'),
        metaDescriptionEn: getValue('f-metaDescriptionEn'),
        ingredientIds: getMultiSelectValues('f-ingredientIds')
    };
}

function touchesHealthContent(payload) {
    if (!currentEditing) return false;
    return HEALTH_CONTENT_FIELDS.some(field => (payload[field] || '') !== (currentEditing[field] || ''));
}

async function saveTopic() {
    const payload = collectPayload();

    if (!payload.nameTh || !payload.nameEn || !payload.slug) {
        Swal.fire({ icon: 'warning', title: 'ข้อมูลไม่ครบ', text: 'กรุณากรอกชื่อภาษาไทย ชื่อภาษาอังกฤษ และ slug', confirmButtonColor: '#4f46e5' });
        return;
    }

    if (!SLUG_PATTERN.test(payload.slug)) {
        Swal.fire({
            icon: 'warning',
            title: 'รูปแบบ slug ไม่ถูกต้อง',
            text: 'slug ต้องเป็นตัวอักษรภาษาอังกฤษตัวเล็ก ตัวเลข และขีดกลางเท่านั้น เช่น eye-health',
            confirmButtonColor: '#4f46e5'
        });
        return;
    }


    Swal.fire({ title: 'กำลังบันทึกข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const isUpdate = Boolean(currentEditing);
        const url = isUpdate ? `${API_BASE}/api/admin/wellness/${currentEditing.id}` : `${API_BASE}/api/admin/wellness`;
        const res = await authFetch(url, {
            method: isUpdate ? 'PATCH' : 'POST',
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            const message = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'บันทึกข้อมูลไม่สำเร็จ');
            throw new Error(message);
        }

        const saved = await res.json();
        currentEditing = saved;

        await loadTopics();
        fillForm(saved);
        renderPanelStatus();
        document.getElementById('panelTitle').innerText = `แก้ไข: ${saved.nameTh}`;

        Swal.fire({
            icon: 'success',
            title: 'บันทึกสำเร็จ',
            text: saved.publicationStatus === 'PUBLISHED'
                ? 'บันทึกข้อมูลเรียบร้อย หน้าเว็บจะอัปเดตภายในไม่กี่วินาที'
                : 'บันทึกเรียบร้อย — เปิดสวิตช์ "แสดงบนเว็บ" เมื่อต้องการให้แสดงบนหน้าเว็บ',
            confirmButtonColor: '#4f46e5',
            timer: 2600
        });
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'บันทึกไม่สำเร็จ', text: error.message, confirmButtonColor: '#4f46e5' });
    }
}

async function workflowAction(action, successText, body) {
    if (!currentEditing) return;
    try {
        const res = await authFetch(`${API_BASE}/api/admin/wellness/${currentEditing.id}/${action}`, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || 'ดำเนินการไม่สำเร็จ');
        }
        const fresh = await authFetch(`${API_BASE}/api/admin/wellness/${currentEditing.id}`);
        currentEditing = await fresh.json();

        await loadTopics();
        fillForm(currentEditing);
        renderPanelStatus();

        Swal.fire({ icon: 'success', title: successText, confirmButtonColor: '#4f46e5', timer: 2200 });
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'ไม่สามารถดำเนินการได้', text: error.message, confirmButtonColor: '#4f46e5' });
    }
}

async function publishTopic() {
    const confirm = await Swal.fire({
        icon: 'question',
        title: 'เผยแพร่หัวข้อนี้?',
        html: `
            <div class="text-left text-sm text-gray-700">
                <p>หัวข้อนี้จะถูกตั้งสถานะเป็นเผยแพร่ในฐานข้อมูล</p>
                <p class="mt-2">หน้าเว็บสาธารณะจะอัปเดตอัตโนมัติภายในไม่กี่วินาที</p>
            </div>`,
        showCancelButton: true,
        confirmButtonText: 'เผยแพร่',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#0284c7',
        cancelButtonColor: '#9ca3af'
    });
    if (confirm.isConfirmed) workflowAction('visibility', 'ตั้งสถานะเผยแพร่เรียบร้อย', { visible: true });
}

async function unpublishTopic() {
    const confirm = await Swal.fire({
        icon: 'warning',
        title: 'ยกเลิกการเผยแพร่?',
        text: 'หน้าสาธารณะของหัวข้อนี้จะถูกซ่อนจากเว็บไซต์ทันที',
        showCancelButton: true,
        confirmButtonText: 'ยกเลิกการเผยแพร่',
        cancelButtonText: 'ไม่ใช่',
        confirmButtonColor: '#d97706',
        cancelButtonColor: '#9ca3af'
    });
    if (confirm.isConfirmed) workflowAction('visibility', 'ยกเลิกการเผยแพร่เรียบร้อย', { visible: false });
}

async function deleteTopic() {
    if (!currentEditing) return;
    const confirm = await Swal.fire({
        icon: 'warning',
        title: 'ลบหัวข้อนี้?',
        html: `<p class="text-sm text-gray-700">หัวข้อ "<strong>${escapeHtml(currentEditing.nameTh)}</strong>"
               และความเชื่อมโยงกับส่วนผสมทั้งหมดจะถูกลบอย่างถาวร (ข้อมูลส่วนผสมจะไม่ถูกลบ)</p>`,
        showCancelButton: true,
        confirmButtonText: 'ยืนยันลบ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#e11d48',
        cancelButtonColor: '#9ca3af'
    });
    if (!confirm.isConfirmed) return;

    try {
        const res = await authFetch(`${API_BASE}/api/admin/wellness/${currentEditing.id}`, { method: 'DELETE' });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || 'ลบข้อมูลไม่สำเร็จ');
        }
        closePanel();
        await loadTopics();
        Swal.fire({ icon: 'success', title: 'ลบข้อมูลเรียบร้อย', confirmButtonColor: '#4f46e5', timer: 2000 });
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'ลบไม่สำเร็จ', text: error.message, confirmButtonColor: '#4f46e5' });
    }
}

// ===================================================
// 8. สร้างหัวข้อมาตรฐาน 12 หัวข้อ
// ===================================================
async function seedStandardTopics() {
    const existingSlugs = new Set(globalTopics.map(t => t.slug));
    const missing = STANDARD_TOPICS.filter(t => !existingSlugs.has(t.slug));

    if (missing.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'มีหัวข้อมาตรฐานครบแล้ว',
            text: 'หัวข้อมาตรฐานทั้ง 12 หัวข้อมีอยู่ในระบบแล้ว',
            confirmButtonColor: '#4f46e5'
        });
        return;
    }

    const confirm = await Swal.fire({
        icon: 'question',
        title: `สร้างหัวข้อมาตรฐาน ${missing.length} หัวข้อ?`,
        html: `
            <div class="text-left text-sm text-gray-700">
                <p>ระบบจะสร้างหัวข้อต่อไปนี้เป็น<strong>ฉบับร่าง</strong> (ยังไม่เผยแพร่):</p>
                <ul class="mt-2 text-xs text-gray-600 space-y-0.5 max-h-48 overflow-y-auto">
                    ${missing.map(t => `<li>• ${escapeHtml(t.nameTh)} (${escapeHtml(t.nameEn)})</li>`).join('')}
                </ul>
                <p class="mt-2 text-xs text-amber-700">ระบบจะใส่เฉพาะชื่อหัวข้อเท่านั้น คำอธิบายต้องให้ทีมเนื้อหากรอกและตรวจสอบเอง</p>
            </div>`,
        showCancelButton: true,
        confirmButtonText: 'สร้างเลย',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#9ca3af'
    });
    if (!confirm.isConfirmed) return;

    Swal.fire({ title: 'กำลังสร้างหัวข้อ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    let created = 0;
    const failed = [];

    for (const topic of missing) {
        try {
            const res = await authFetch(`${API_BASE}/api/admin/wellness`, {
                method: 'POST',
                body: JSON.stringify({ slug: topic.slug, nameTh: topic.nameTh, nameEn: topic.nameEn })
            });
            if (res.ok) created++;
            else failed.push(topic.nameTh);
        } catch (e) {
            failed.push(topic.nameTh);
        }
    }

    await loadTopics();

    Swal.fire({
        icon: failed.length === 0 ? 'success' : 'warning',
        title: `สร้างแล้ว ${created} หัวข้อ`,
        html: failed.length === 0
            ? '<p class="text-sm text-gray-700">ทุกหัวข้อถูกสร้างเป็นฉบับร่างเรียบร้อย</p>'
            : `<p class="text-sm text-gray-700">สร้างไม่สำเร็จ ${escapeHtml(failed.length)} หัวข้อ: ${escapeHtml(failed.join(', '))}</p>`,
        confirmButtonColor: '#4f46e5'
    });
}

// ===================================================
// 9. Preview (ภายในระบบแอดมินเท่านั้น)
// ===================================================
function renderPreview() {
    const container = document.getElementById('previewContent');
    if (!container) return;

    const data = collectPayload();

    const selected = globalIngredients.filter(ing => data.ingredientIds.includes(Number(ing.id)));
    const publicOnes = selected.filter(ing => ing.publicationStatus === 'PUBLISHED' );
    const draftOnes = selected.filter(ing => !(ing.publicationStatus === 'PUBLISHED' ));

    container.innerHTML = `
        <header class="pb-4 border-b border-gray-100">
            ${data.nameEn ? `<p class="text-sm text-gray-500">${escapeHtml(data.nameEn)}</p>` : ''}
            <h3 class="text-2xl font-semibold text-gray-800">${escapeHtml(data.nameTh || '(ยังไม่ระบุชื่อ)')}</h3>
            ${data.descriptionTh ? `<div class="mt-3 whitespace-pre-line text-gray-700">${escapeHtml(data.descriptionTh)}</div>` : '<p class="mt-3 text-xs text-gray-400">ยังไม่มีคำอธิบายภาษาไทย</p>'}
        </header>

        <section>
            <h4 class="font-semibold text-gray-800 border-b border-gray-100 pb-1.5 mb-2">
                ส่วนผสมที่จะแสดงบนหน้านี้ (${escapeHtml(publicOnes.length)})
            </h4>
            ${publicOnes.length
                ? `<div class="flex flex-wrap gap-2">${publicOnes.map(ing =>
                    `<span class="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs">${escapeHtml(ing.nameTh)}</span>`).join('')}</div>`
                : '<p class="text-xs text-gray-400">ยังไม่มีส่วนผสมที่เปิดแสดงบนเว็บในหัวข้อนี้</p>'}
        </section>

        ${draftOnes.length ? `
        <section>
            <h4 class="font-semibold text-gray-800 border-b border-gray-100 pb-1.5 mb-2">
                ส่วนผสมที่เลือกไว้แต่ยังไม่เผยแพร่ (${escapeHtml(draftOnes.length)})
            </h4>
            <div class="flex flex-wrap gap-2">
                ${draftOnes.map(ing => `<span class="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-xs">${escapeHtml(ing.nameTh)}</span>`).join('')}
            </div>
            <p class="text-xs text-amber-700 mt-2">รายการเหล่านี้จะไม่ปรากฏบนหน้าเว็บจนกว่าจะเปิดสวิตช์ "แสดงบนเว็บ"</p>
        </section>` : ''}

        ${data.descriptionEn ? `
        <section class="pt-4 border-t border-gray-100">
            <h4 class="font-semibold text-sky-700 mb-2"><i class="fas fa-globe mr-1.5"></i> English version (จะถูกสร้างที่ /en/)</h4>
            <div class="whitespace-pre-line text-gray-700">${escapeHtml(data.descriptionEn)}</div>
        </section>`
        : '<p class="text-xs text-gray-400 pt-4 border-t border-gray-100">ยังไม่มีคำอธิบายภาษาอังกฤษ — หน้า /en/ จะไม่ถูกสร้าง</p>'}
    `;
}

// ===================================================
// สวิตช์เปิด/ปิดการแสดงบนหน้าเว็บ (ใช้สถานะเผยแพร่เดิม: เปิด = PUBLISHED, ปิด = DRAFT)
// ===================================================
function visibilitySwitch(item) {
    const on = item.publicationStatus === 'PUBLISHED';
    const title = on ? 'แสดงบนหน้าเว็บอยู่ — กดเพื่อปิด' : 'ซ่อนอยู่ — กดเพื่อเปิดแสดงบนหน้าเว็บ';
    return `
        <button type="button" role="switch" aria-checked="${on}" title="${escapeHtml(title)}"
            class="js-visibility inline-flex items-center gap-2 group" data-id="${escapeHtml(item.id)}" data-on="${on}">
            <span class="relative inline-block w-10 h-6 rounded-full transition-colors ${on ? 'bg-indigo-600' : 'bg-gray-300'}">
                <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-4' : ''}"></span>
            </span>
            <span class="text-xs font-medium ${on ? 'text-indigo-700' : 'text-gray-500'}">${on ? 'เปิด' : 'ปิด'}</span>
        </button>`;
}

async function toggleVisibility(btn, list, resource, reload) {
    const id = Number(btn.dataset.id);
    const item = list.find(x => Number(x.id) === id);
    if (!item) return;
    const turnOn = btn.dataset.on !== 'true';
    btn.disabled = true;
    try {
        const res = await authFetch(`${API_BASE}/api/admin/${resource}/${id}/visibility`, {
            method: 'POST',
            body: JSON.stringify({ visible: turnOn })
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || 'ดำเนินการไม่สำเร็จ');
        }
        await reload();
        Swal.fire({
            toast: true, position: 'top-end', timer: 2200, showConfirmButton: false, icon: 'success',
            title: turnOn ? 'เปิดแสดงบนหน้าเว็บแล้ว' : 'ปิดแล้ว — ไม่แสดงบนหน้าเว็บ'
        });
    } catch (error) {
        btn.disabled = false;
        Swal.fire({ icon: 'error', title: 'เปลี่ยนสถานะไม่สำเร็จ', text: error.message, confirmButtonColor: '#4f46e5' });
    }
}
