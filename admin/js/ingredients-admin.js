
const EXTRA_FIELDS = ["primaryKeywordTh","primaryKeywordEn","secondaryKeywordsTh","secondaryKeywordsEn","ogTitleTh","ogTitleEn","ogDescriptionTh","ogDescriptionEn","restrictedClaims"];
const LIST_FIELDS = new Set(['secondaryKeywordsTh','secondaryKeywordsEn','restrictedClaims']);
document.addEventListener('DOMContentLoaded', () => {
 const anchor = document.getElementById('f-seoTitleTh')?.parentElement?.parentElement;
 if (anchor) EXTRA_FIELDS.forEach(field => { const label=document.createElement('label'); label.className='block text-sm mt-4'; label.textContent=field + (LIST_FIELDS.has(field) ? ' (หนึ่งรายการต่อบรรทัด)' : ''); const input=document.createElement('textarea'); input.id='f-'+field; input.className='field-input'; label.append(input); anchor.append(label); });
});
// admin/js/ingredients-admin.js
// จัดการคลังความรู้ส่วนผสม (Ascender Ingredient Knowledge Base)

const API_BASE = window.location.origin;

let globalIngredients = [];
let globalCategories = [];
let globalProducts = [];
let globalWellnessTopics = [];
let currentEditing = null; // null = สร้างใหม่, object = กำลังแก้ไข

// ฟิลด์เนื้อหาด้านสุขภาพ
const HEALTH_CONTENT_FIELDS = [
    'shortDescriptionTh', 'shortDescriptionEn',
    'fullDescriptionTh', 'fullDescriptionEn',
    'keyFunctionsTh', 'keyFunctionsEn',
    'howItWorksTh', 'howItWorksEn',
    'uniquePropertiesTh', 'uniquePropertiesEn',
    'scientificEvidenceTh', 'scientificEvidenceEn',
    'safetyInformationTh', 'safetyInformationEn'
];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

function parseCommaList(value) {
    return String(value || '')
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);
}

function parseLineList(value) {
    return String(value || '')
        .split('\n')
        .map(v => v.trim())
        .filter(v => v.length > 0);
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
    void loadAll().catch(error => console.error('โหลดข้อมูลส่วนผสมไม่สำเร็จ', error));
});

async function loadAll() {
    await Promise.all([loadCategories(), loadProducts(), loadWellnessTopics()]);
    await loadIngredients();
}

async function loadIngredients() {
    try {
        const res = await authFetch(`${API_BASE}/api/admin/ingredients`);
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลส่วนผสมได้');
        globalIngredients = await res.json();
        renderTable();
    } catch (error) {
        console.error('Error loading ingredients:', error);
        const tbody = document.getElementById('ingredientsTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="p-12 text-center text-rose-500 font-medium">
                        <i class="fas fa-exclamation-triangle text-3xl mb-3"></i>
                        <p>ไม่สามารถเชื่อมต่อฐานข้อมูลส่วนผสมได้ หรือเซสชันหมดอายุ</p>
                        <p class="text-xs text-gray-400 mt-2">หากเป็นการติดตั้งครั้งแรก กรุณาตรวจสอบว่ารัน migration ฐานข้อมูลแล้ว</p>
                    </td>
                </tr>`;
        }
    }
}

async function loadCategories() {
    try {
        const res = await authFetch(`${API_BASE}/api/admin/ingredients/categories`);
        if (!res.ok) return;
        globalCategories = await res.json();
        const select = document.getElementById('f-categoryId');
        if (select) {
            select.innerHTML = '<option value="">— ไม่ระบุ —</option>' +
                globalCategories.map(c =>
                    `<option value="${escapeHtml(c.id)}">${escapeHtml(c.nameTh)} (${escapeHtml(c.nameEn)})</option>`
                ).join('');
        }
    } catch (e) {
        console.error('Error loading categories:', e);
    }
}

async function loadProducts() {
    try {
        const res = await fetch(`${API_BASE}/products`);
        if (!res.ok) return;
        globalProducts = await res.json();
        const select = document.getElementById('f-productIds');
        if (select) {
            select.innerHTML = globalProducts.map(p =>
                `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)}</option>`
            ).join('');
        }
    } catch (e) {
        console.error('Error loading products:', e);
    }
}

async function loadWellnessTopics() {
    try {
        const res = await authFetch(`${API_BASE}/api/admin/wellness`);
        if (!res.ok) return;
        globalWellnessTopics = await res.json();
        const select = document.getElementById('f-wellnessTopicIds');
        if (select) {
            select.innerHTML = globalWellnessTopics.map(w =>
                `<option value="${escapeHtml(w.id)}">${escapeHtml(w.nameTh)} (${escapeHtml(w.nameEn)})</option>`
            ).join('');
        }
    } catch (e) {
        console.error('Error loading wellness topics:', e);
    }
}

function refreshRelatedIngredientOptions() {
    const select = document.getElementById('f-relatedIngredientIds');
    if (!select) return;
    const editingId = currentEditing ? currentEditing.id : null;
    select.innerHTML = globalIngredients
        .filter(ing => ing.id !== editingId)
        .map(ing => `<option value="${escapeHtml(ing.id)}">${escapeHtml(ing.nameTh)} (${escapeHtml(ing.nameEn)})</option>`)
        .join('');
}

// ===================================================
// 5. Table rendering & filtering
// ===================================================
function getFilteredIngredients() {
    const term = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
    const statusFilter = document.getElementById('statusFilter')?.value || '';

    return globalIngredients.filter(ing => {
        const haystack = [ing.nameTh, ing.nameEn, ing.slug, ing.scientificName]
            .filter(Boolean).join(' ').toLowerCase();
        const matchesTerm = !term || haystack.includes(term);

        let matchesStatus = true;
        if (statusFilter === 'PUBLISHED') matchesStatus = ing.publicationStatus === 'PUBLISHED';
        else if (statusFilter === 'DRAFT') matchesStatus = ing.publicationStatus !== 'PUBLISHED';

        return matchesTerm && matchesStatus;
    }).sort((a, b) => Number(a.id) - Number(b.id)); // เรียงตาม ID จากน้อยไปมาก
}

function renderTable() {
    const tbody = document.getElementById('ingredientsTableBody');
    if (!tbody) return;

    const list = getFilteredIngredients();

    const badge = document.getElementById('totalCountBadge');
    if (badge) badge.innerText = `${list.length} รายการ`;

    const pagInfo = document.getElementById('paginationInfo');
    if (pagInfo) {
        const published = globalIngredients.filter(i => i.publicationStatus === 'PUBLISHED').length;
        pagInfo.innerHTML = `
            <span>ทั้งหมด ${escapeHtml(globalIngredients.length)} รายการ · แสดงบนเว็บ ${escapeHtml(published)}</span>
            <span class="text-xs text-gray-400">แสดง ${escapeHtml(list.length)} รายการตามตัวกรอง</span>
        `;
    }

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="p-12 text-center text-gray-400">
                    <i class="fas fa-seedling text-4xl mb-3 text-gray-300"></i>
                    <p class="font-medium text-gray-500">ไม่พบข้อมูลส่วนผสมที่ตรงกับเงื่อนไข</p>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = list.map(ing => {
        const productCount = asArray(ing.productLinks).length;
        const categoryName = ing.category ? ing.category.nameTh : '—';

        return `
            <tr class="hover:bg-indigo-50/30 transition-colors">
                <td class="p-5 font-mono text-xs text-indigo-600 font-semibold">${escapeHtml(ing.id)}</td>
                <td class="p-5">
                    <p class="font-semibold text-gray-800">${escapeHtml(ing.nameTh)}</p>
                    <p class="text-xs text-gray-500">${escapeHtml(ing.nameEn)}</p>
                    ${ing.scientificName ? `<p class="text-xs text-gray-400 italic">${escapeHtml(ing.scientificName)}</p>` : ''}
                </td>
                <td class="p-5 font-mono text-xs text-gray-500">${escapeHtml(ing.slug)}</td>
                <td class="p-5 text-xs text-gray-600">${escapeHtml(categoryName)}</td>
                <td class="p-5">
                    <div class="flex flex-wrap gap-1.5">
                        ${publicationBadge(ing.publicationStatus)}
                    </div>
                </td>
                <td class="p-5 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-md text-xs font-semibold">${escapeHtml(productCount)}</span>
                </td>
                <td class="p-5 text-xs text-gray-500">${escapeHtml(formatThaiDate(ing.updatedAt))}</td>
                <td class="p-5 text-center">${visibilitySwitch(ing)}</td>
                <td class="p-5 text-center">
                    <button class="js-edit text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors" data-id="${escapeHtml(ing.id)}">
                        <i class="fas fa-pen-to-square mr-1"></i> แก้ไข
                    </button>
                    <button class="js-preview text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors" data-id="${escapeHtml(ing.id)}">
                        <i class="fas fa-eye mr-1"></i> ดูตัวอย่าง
                    </button>
                </td>
            </tr>`;
    }).join('');

    tbody.querySelectorAll('.js-visibility').forEach(btn => {
        btn.addEventListener('click', () => toggleVisibility(btn, globalIngredients, 'ingredients', loadIngredients));
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
    document.getElementById('addIngredientBtn')?.addEventListener('click', () => openPanel(null, 'edit'));
    document.getElementById('addCategoryBtn')?.addEventListener('click', openCategoryModal);
    document.getElementById('closePanelBtn')?.addEventListener('click', closePanel);
    // ปิดฟอร์มได้เฉพาะปุ่มกากบาท — คลิกนอกกรอบหรือกด Esc จะไม่ปิด กันข้อมูลที่กรอกหาย
    document.getElementById('saveBtn')?.addEventListener('click', saveIngredient);
    
    document.getElementById('publishBtn')?.addEventListener('click', publishIngredient);
    document.getElementById('unpublishBtn')?.addEventListener('click', unpublishIngredient);
    document.getElementById('deleteBtn')?.addEventListener('click', deleteIngredient);
    document.getElementById('addReferenceBtn')?.addEventListener('click', () => addReferenceRow());

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
            const res = await authFetch(`${API_BASE}/api/admin/ingredients/${id}`);
            if (!res.ok) throw new Error('ไม่พบข้อมูลส่วนผสมนี้');
            currentEditing = await res.json();
        } catch (e) {
            Swal.fire({ icon: 'error', title: 'โหลดข้อมูลไม่สำเร็จ', text: e.message, confirmButtonColor: '#4f46e5' });
            return;
        }
    } else {
        currentEditing = null;
    }

    refreshRelatedIngredientOptions();

    if (currentEditing) {
        fillForm(currentEditing);
        document.getElementById('panelTitle').innerText = `แก้ไข: ${currentEditing.nameTh}`;
    } else {
        document.getElementById('panelTitle').innerText = 'เพิ่มส่วนผสมใหม่';
        addReferenceRow();
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
        if (container) container.innerHTML = `<span class="text-xs text-gray-400">รายการใหม่จะถูกบันทึกเป็นฉบับร่าง</span>`;
        if (infoBox) infoBox.innerHTML = 'บันทึกรายการก่อน จึงจะสามารถเปิดแสดงบนเว็บได้';
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
    const ids = [
        'f-nameTh', 'f-nameEn', 'f-slug', 'f-scientificName', 'f-sourceOrigin',
        'f-alternativeNames', 'f-synonyms', 'f-featuredImageUrl', 'f-ogImageUrl',
        'f-shortDescriptionTh', 'f-fullDescriptionTh', 'f-keyFunctionsTh', 'f-howItWorksTh',
        'f-uniquePropertiesTh', 'f-scientificEvidenceTh', 'f-safetyInformationTh',
        'f-shortDescriptionEn', 'f-fullDescriptionEn', 'f-keyFunctionsEn', 'f-howItWorksEn',
        'f-uniquePropertiesEn', 'f-scientificEvidenceEn', 'f-safetyInformationEn',
        'f-seoTitleTh', 'f-seoTitleEn', 'f-metaDescriptionTh', 'f-metaDescriptionEn',
        'f-relatedArticleSlugs'
    ];
    ids.forEach(id => setValue(id, ''));
    EXTRA_FIELDS.forEach(field => setValue('f-'+field, ''));
    setValue('f-categoryId', '');
    ['f-productIds', 'f-wellnessTopicIds', 'f-relatedIngredientIds'].forEach(id => setMultiSelectValues(id, []));
    const refList = document.getElementById('referencesList');
    if (refList) refList.innerHTML = '';
}

function fillForm(ing) {
    EXTRA_FIELDS.forEach(field => setValue('f-'+field, LIST_FIELDS.has(field) ? asArray(ing[field]).join('\n') : ing[field]));
    setValue('f-nameTh', ing.nameTh);
    setValue('f-nameEn', ing.nameEn);
    setValue('f-slug', ing.slug);
    setValue('f-scientificName', ing.scientificName);
    setValue('f-sourceOrigin', ing.sourceOrigin);
    setValue('f-alternativeNames', asArray(ing.alternativeNames).join(', '));
    setValue('f-synonyms', asArray(ing.synonyms).map(s => s.term).join(', '));
    setValue('f-featuredImageUrl', ing.featuredImageUrl);
    setValue('f-ogImageUrl', ing.ogImageUrl);
    setValue('f-categoryId', ing.categoryId || '');

    setValue('f-shortDescriptionTh', ing.shortDescriptionTh);
    setValue('f-fullDescriptionTh', ing.fullDescriptionTh);
    setValue('f-keyFunctionsTh', asArray(ing.keyFunctionsTh).join('\n'));
    setValue('f-howItWorksTh', ing.howItWorksTh);
    setValue('f-uniquePropertiesTh', ing.uniquePropertiesTh);
    setValue('f-scientificEvidenceTh', ing.scientificEvidenceTh);
    setValue('f-safetyInformationTh', ing.safetyInformationTh);

    setValue('f-shortDescriptionEn', ing.shortDescriptionEn);
    setValue('f-fullDescriptionEn', ing.fullDescriptionEn);
    setValue('f-keyFunctionsEn', asArray(ing.keyFunctionsEn).join('\n'));
    setValue('f-howItWorksEn', ing.howItWorksEn);
    setValue('f-uniquePropertiesEn', ing.uniquePropertiesEn);
    setValue('f-scientificEvidenceEn', ing.scientificEvidenceEn);
    setValue('f-safetyInformationEn', ing.safetyInformationEn);

    setValue('f-seoTitleTh', ing.seoTitleTh);
    setValue('f-seoTitleEn', ing.seoTitleEn);
    setValue('f-metaDescriptionTh', ing.metaDescriptionTh);
    setValue('f-metaDescriptionEn', ing.metaDescriptionEn);

    setValue('f-relatedArticleSlugs', asArray(ing.relatedArticleSlugs).join('\n'));

    setMultiSelectValues('f-productIds', asArray(ing.productLinks).map(l => l.productId));
    setMultiSelectValues('f-wellnessTopicIds', asArray(ing.wellnessLinks).map(l => l.wellnessTopicId));
    setMultiSelectValues('f-relatedIngredientIds', asArray(ing.relatedFrom).map(l => l.relatedIngredientId));

    const refList = document.getElementById('referencesList');
    if (refList) {
        refList.innerHTML = '';
        asArray(ing.references).forEach(ref => addReferenceRow(ref));
        if (asArray(ing.references).length === 0) addReferenceRow();
    }
}

// ===================================================
// 7. References (repeatable rows)
// ===================================================
function addReferenceRow(ref) {
    const list = document.getElementById('referencesList');
    if (!list) return;

    const row = document.createElement('div');
    row.className = 'js-reference-row border border-gray-200 rounded-lg p-3 bg-gray-50/60 space-y-2';
    row.innerHTML = `
        <div class="flex items-start gap-2">
            <input type="text" class="field-input js-ref-title" placeholder="ชื่อเรื่อง / Publication title *">
            <button type="button" class="js-remove-ref text-rose-500 hover:bg-rose-50 w-9 h-9 rounded-lg flex-shrink-0 transition-colors" title="ลบรายการนี้">
                <i class="fas fa-trash text-xs"></i>
            </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input type="text" class="field-input js-ref-authors" placeholder="ผู้เขียน (Authors)">
            <input type="text" class="field-input js-ref-journal" placeholder="วารสาร (Journal)">
            <input type="number" class="field-input js-ref-year" placeholder="ปี (ค.ศ.)" min="1800" max="2100">
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input type="text" class="field-input js-ref-doi" placeholder="DOI">
            <input type="text" class="field-input js-ref-pubmed" placeholder="PubMed ID">
            <select data-enhance-select class="field-input js-ref-evidence">
                <option value="">— ประเภทหลักฐาน —</option>
                <option value="RCT">RCT (การทดลองแบบสุ่ม)</option>
                <option value="META_ANALYSIS">Meta-analysis</option>
                <option value="SYSTEMATIC_REVIEW">Systematic review</option>
                <option value="OBSERVATIONAL">Observational study</option>
                <option value="IN_VITRO">In vitro / preclinical</option>
                <option value="REGULATORY">เอกสารหน่วยงานกำกับดูแล</option>
                <option value="MANUFACTURER_SPEC">สเปกจากผู้ผลิต</option>
            </select>
        </div>
        <input type="url" class="field-input js-ref-url" placeholder="URL แหล่งข้อมูล">
        <input type="text" class="field-input js-ref-claims" placeholder="คำกล่าวอ้างที่เกี่ยวข้อง (Related claims)">
    `;

    if (ref) {
        row.querySelector('.js-ref-title').value = ref.title || '';
        row.querySelector('.js-ref-authors').value = ref.authors || '';
        row.querySelector('.js-ref-journal').value = ref.journal || '';
        row.querySelector('.js-ref-year').value = ref.publicationYear || '';
        row.querySelector('.js-ref-doi').value = ref.doi || '';
        row.querySelector('.js-ref-pubmed').value = ref.pubmedId || '';
        row.querySelector('.js-ref-evidence').value = ref.evidenceType || '';
        row.querySelector('.js-ref-url').value = ref.sourceUrl || '';
        row.querySelector('.js-ref-claims').value = ref.relatedClaims || '';
    }

    row.querySelector('.js-remove-ref').addEventListener('click', () => row.remove());
    list.appendChild(row);
}

function collectReferences() {
    const rows = Array.from(document.querySelectorAll('.js-reference-row'));
    return rows.map(row => {
        const title = row.querySelector('.js-ref-title').value.trim();
        if (!title) return null;
        const yearRaw = row.querySelector('.js-ref-year').value.trim();
        const ref = { title };
        const authors = row.querySelector('.js-ref-authors').value.trim();
        const journal = row.querySelector('.js-ref-journal').value.trim();
        const doi = row.querySelector('.js-ref-doi').value.trim();
        const pubmedId = row.querySelector('.js-ref-pubmed').value.trim();
        const evidenceType = row.querySelector('.js-ref-evidence').value;
        const sourceUrl = row.querySelector('.js-ref-url').value.trim();
        const relatedClaims = row.querySelector('.js-ref-claims').value.trim();

        if (authors) ref.authors = authors;
        if (journal) ref.journal = journal;
        if (yearRaw && !Number.isNaN(Number(yearRaw))) ref.publicationYear = Number(yearRaw);
        if (doi) ref.doi = doi;
        if (pubmedId) ref.pubmedId = pubmedId;
        if (evidenceType) ref.evidenceType = evidenceType;
        if (sourceUrl) ref.sourceUrl = sourceUrl;
        if (relatedClaims) ref.relatedClaims = relatedClaims;
        return ref;
    }).filter(Boolean);
}

// ===================================================
// 8. Save / workflow actions
// ===================================================
function collectPayload() {
    const categoryIdRaw = getValue('f-categoryId');

    return {
        ...Object.fromEntries(EXTRA_FIELDS.map(field => [field, LIST_FIELDS.has(field) ? parseLineList(getValue('f-'+field)) : getValue('f-'+field)])),
        slug: getValue('f-slug'),
        nameTh: getValue('f-nameTh'),
        nameEn: getValue('f-nameEn'),
        scientificName: getValue('f-scientificName'),
        sourceOrigin: getValue('f-sourceOrigin'),
        alternativeNames: parseCommaList(getValue('f-alternativeNames')),
        synonyms: parseCommaList(getValue('f-synonyms')),
        featuredImageUrl: getValue('f-featuredImageUrl'),
        ogImageUrl: getValue('f-ogImageUrl'),
        categoryId: categoryIdRaw ? Number(categoryIdRaw) : undefined,

        shortDescriptionTh: getValue('f-shortDescriptionTh'),
        fullDescriptionTh: getValue('f-fullDescriptionTh'),
        keyFunctionsTh: parseLineList(getValue('f-keyFunctionsTh')),
        howItWorksTh: getValue('f-howItWorksTh'),
        uniquePropertiesTh: getValue('f-uniquePropertiesTh'),
        scientificEvidenceTh: getValue('f-scientificEvidenceTh'),
        safetyInformationTh: getValue('f-safetyInformationTh'),

        shortDescriptionEn: getValue('f-shortDescriptionEn'),
        fullDescriptionEn: getValue('f-fullDescriptionEn'),
        keyFunctionsEn: parseLineList(getValue('f-keyFunctionsEn')),
        howItWorksEn: getValue('f-howItWorksEn'),
        uniquePropertiesEn: getValue('f-uniquePropertiesEn'),
        scientificEvidenceEn: getValue('f-scientificEvidenceEn'),
        safetyInformationEn: getValue('f-safetyInformationEn'),

        seoTitleTh: getValue('f-seoTitleTh'),
        seoTitleEn: getValue('f-seoTitleEn'),
        metaDescriptionTh: getValue('f-metaDescriptionTh'),
        metaDescriptionEn: getValue('f-metaDescriptionEn'),

        relatedArticleSlugs: parseLineList(getValue('f-relatedArticleSlugs')),
        references: collectReferences(),
        productIds: getMultiSelectValues('f-productIds'),
        wellnessTopicIds: getMultiSelectValues('f-wellnessTopicIds'),
        relatedIngredientIds: getMultiSelectValues('f-relatedIngredientIds')
    };
}

function touchesHealthContent(payload) {
    if (!currentEditing) return false;
    return HEALTH_CONTENT_FIELDS.some(field => {
        const next = payload[field];
        const prev = currentEditing[field];
        if (Array.isArray(next)) {
            return JSON.stringify(next) !== JSON.stringify(asArray(prev));
        }
        return (next || '') !== (prev || '');
    });
}

async function saveIngredient() {
    const payload = collectPayload();

    if (!payload.nameTh || !payload.nameEn || !payload.slug) {
        Swal.fire({ icon: 'warning', title: 'ข้อมูลไม่ครบ', text: 'กรุณากรอกชื่อภาษาไทย ชื่อภาษาอังกฤษ และ slug', confirmButtonColor: '#4f46e5' });
        return;
    }

    if (!SLUG_PATTERN.test(payload.slug)) {
        Swal.fire({
            icon: 'warning',
            title: 'รูปแบบ slug ไม่ถูกต้อง',
            text: 'slug ต้องเป็นตัวอักษรภาษาอังกฤษตัวเล็ก ตัวเลข และขีดกลางเท่านั้น เช่น korean-ginseng',
            confirmButtonColor: '#4f46e5'
        });
        return;
    }


    Swal.fire({ title: 'กำลังบันทึกข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const isUpdate = Boolean(currentEditing);
        const url = isUpdate ? `${API_BASE}/api/admin/ingredients/${currentEditing.id}` : `${API_BASE}/api/admin/ingredients`;
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

        await loadIngredients();
        refreshRelatedIngredientOptions();
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
        const res = await authFetch(`${API_BASE}/api/admin/ingredients/${currentEditing.id}/${action}`, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || 'ดำเนินการไม่สำเร็จ');
        }
        // อ่านข้อมูลใหม่เพื่อให้สถานะบนหน้าจอตรงกับฐานข้อมูลจริง
        const fresh = await authFetch(`${API_BASE}/api/admin/ingredients/${currentEditing.id}`);
        currentEditing = await fresh.json();

        await loadIngredients();
        fillForm(currentEditing);
        renderPanelStatus();

        Swal.fire({ icon: 'success', title: successText, confirmButtonColor: '#4f46e5', timer: 2200 });
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'ไม่สามารถดำเนินการได้', text: error.message, confirmButtonColor: '#4f46e5' });
    }
}

async function publishIngredient() {
    const confirm = await Swal.fire({
        icon: 'question',
        title: 'เผยแพร่ส่วนผสมนี้?',
        html: `
            <div class="text-left text-sm text-gray-700">
                <p>รายการนี้จะถูกตั้งสถานะเป็นเผยแพร่ในฐานข้อมูล</p>
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

async function unpublishIngredient() {
    const confirm = await Swal.fire({
        icon: 'warning',
        title: 'ยกเลิกการเผยแพร่?',
        text: 'หน้าสาธารณะของส่วนผสมนี้จะถูกซ่อนจากเว็บไซต์ทันที',
        showCancelButton: true,
        confirmButtonText: 'ยกเลิกการเผยแพร่',
        cancelButtonText: 'ไม่ใช่',
        confirmButtonColor: '#d97706',
        cancelButtonColor: '#9ca3af'
    });
    if (confirm.isConfirmed) workflowAction('visibility', 'ยกเลิกการเผยแพร่เรียบร้อย', { visible: false });
}

async function deleteIngredient() {
    if (!currentEditing) return;
    const confirm = await Swal.fire({
        icon: 'warning',
        title: 'ลบส่วนผสมนี้?',
        html: `<p class="text-sm text-gray-700">ข้อมูล "<strong>${escapeHtml(currentEditing.nameTh)}</strong>"
               รวมถึงคำพ้อง เอกสารอ้างอิง และความเชื่อมโยงทั้งหมดจะถูกลบอย่างถาวร</p>`,
        showCancelButton: true,
        confirmButtonText: 'ยืนยันลบ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#e11d48',
        cancelButtonColor: '#9ca3af'
    });
    if (!confirm.isConfirmed) return;

    try {
        const res = await authFetch(`${API_BASE}/api/admin/ingredients/${currentEditing.id}`, { method: 'DELETE' });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || 'ลบข้อมูลไม่สำเร็จ');
        }
        closePanel();
        await loadIngredients();
        Swal.fire({ icon: 'success', title: 'ลบข้อมูลเรียบร้อย', confirmButtonColor: '#4f46e5', timer: 2000 });
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'ลบไม่สำเร็จ', text: error.message, confirmButtonColor: '#4f46e5' });
    }
}

// ===================================================
// 9. หมวดหมู่
// ===================================================
async function openCategoryModal() {
    const result = await Swal.fire({
        title: 'เพิ่มหมวดหมู่ส่วนผสม',
        html: `
            <div class="text-left space-y-4 mt-4 text-sm text-gray-700">
                <div>
                    <label class="block font-medium text-gray-700 mb-1.5">ชื่อหมวดหมู่ (ไทย) <span class="text-rose-500">*</span></label>
                    <input type="text" id="swal-cat-th" class="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" placeholder="เช่น สารสกัดจากพืช">
                </div>
                <div>
                    <label class="block font-medium text-gray-700 mb-1.5">ชื่อหมวดหมู่ (อังกฤษ) <span class="text-rose-500">*</span></label>
                    <input type="text" id="swal-cat-en" class="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" placeholder="e.g. Botanical Extract">
                </div>
                <div>
                    <label class="block font-medium text-gray-700 mb-1.5">slug <span class="text-rose-500">*</span></label>
                    <input type="text" id="swal-cat-slug" class="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 font-mono" placeholder="botanical-extract">
                </div>
            </div>`,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-save mr-1.5"></i> บันทึก',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#f1f5f9',
        width: '500px',
        customClass: { popup: 'rounded-2xl shadow-xl border border-gray-100', cancelButton: 'text-gray-700 hover:bg-gray-200' },
        preConfirm: () => {
            const nameTh = document.getElementById('swal-cat-th').value.trim();
            const nameEn = document.getElementById('swal-cat-en').value.trim();
            const slug = document.getElementById('swal-cat-slug').value.trim();
            if (!nameTh || !nameEn || !slug) {
                Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง');
                return false;
            }
            if (!SLUG_PATTERN.test(slug)) {
                Swal.showValidationMessage('slug ต้องเป็นตัวอักษรอังกฤษตัวเล็ก ตัวเลข และขีดกลางเท่านั้น');
                return false;
            }
            return { nameTh, nameEn, slug };
        }
    });

    if (!result.isConfirmed) return;

    try {
        const res = await authFetch(`${API_BASE}/api/admin/ingredients/categories`, {
            method: 'POST',
            body: JSON.stringify(result.value)
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || 'เพิ่มหมวดหมู่ไม่สำเร็จ (slug อาจซ้ำ)');
        }
        await loadCategories();
        Swal.fire({ icon: 'success', title: 'เพิ่มหมวดหมู่เรียบร้อย', confirmButtonColor: '#4f46e5', timer: 2000 });
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'เพิ่มหมวดหมู่ไม่สำเร็จ', text: error.message, confirmButtonColor: '#4f46e5' });
    }
}

// ===================================================
// 10. Preview (ภายในระบบแอดมินเท่านั้น)
// ===================================================
function previewSection(title, body) {
    if (!body) return '';
    return `
        <section>
            <h4 class="font-semibold text-gray-800 border-b border-gray-100 pb-1.5 mb-2">${escapeHtml(title)}</h4>
            <div class="whitespace-pre-line text-gray-700">${escapeHtml(body)}</div>
        </section>`;
}

function previewList(title, items) {
    const list = asArray(items);
    if (list.length === 0) return '';
    return `
        <section>
            <h4 class="font-semibold text-gray-800 border-b border-gray-100 pb-1.5 mb-2">${escapeHtml(title)}</h4>
            <ul class="space-y-1.5">
                ${list.map(item => `<li class="flex gap-2"><span class="text-emerald-600 font-bold">✓</span><span>${escapeHtml(item)}</span></li>`).join('')}
            </ul>
        </section>`;
}

function renderPreview() {
    const container = document.getElementById('previewContent');
    if (!container) return;

    // ใช้ค่าในฟอร์มปัจจุบัน เพื่อให้เห็นตัวอย่างของสิ่งที่กำลังแก้ไขอยู่
    const data = collectPayload();
    const referenceItems = asArray(data.references);

    const synonyms = asArray(data.synonyms);
    const altNames = asArray(data.alternativeNames);

    const productNames = globalProducts
        .filter(p => data.productIds.includes(Number(p.id)))
        .map(p => p.name);
    const wellnessNames = globalWellnessTopics
        .filter(w => data.wellnessTopicIds.includes(Number(w.id)))
        .map(w => w.nameTh);
    const relatedNames = globalIngredients
        .filter(i => data.relatedIngredientIds.includes(Number(i.id)))
        .map(i => i.nameTh);

    container.innerHTML = `
        <header class="pb-4 border-b border-gray-100">
            ${data.nameEn ? `<p class="text-sm text-gray-500">${escapeHtml(data.nameEn)}</p>` : ''}
            <h3 class="text-2xl font-semibold text-gray-800">${escapeHtml(data.nameTh || '(ยังไม่ระบุชื่อ)')}</h3>
            <div class="flex flex-wrap gap-2 mt-2">
                ${data.scientificName ? `<span class="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs italic">${escapeHtml(data.scientificName)}</span>` : ''}
                ${data.sourceOrigin ? `<span class="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">แหล่งที่มา: ${escapeHtml(data.sourceOrigin)}</span>` : ''}
                ${wellnessNames.map(n => `<span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs">${escapeHtml(n)}</span>`).join('')}
            </div>
            ${altNames.length ? `<p class="text-xs text-gray-500 mt-2">ชื่ออื่น: ${escapeHtml(altNames.join(', '))}</p>` : ''}
            ${synonyms.length ? `<p class="text-xs text-gray-400 mt-1">คำค้นหา: ${escapeHtml(synonyms.join(', '))}</p>` : ''}
            ${data.shortDescriptionTh ? `<p class="mt-3 text-gray-700">${escapeHtml(data.shortDescriptionTh)}</p>` : ''}
        </header>

        ${previewSection('ข้อมูลทั่วไป', data.fullDescriptionTh)}
        ${previewList('คุณสมบัติสำคัญ', data.keyFunctionsTh)}
        ${previewSection('กลไกการทำงานในร่างกาย', data.howItWorksTh)}
        ${previewSection('จุดเด่นเฉพาะตัว', data.uniquePropertiesTh)}
        ${previewSection('ข้อมูลงานวิจัย', data.scientificEvidenceTh)}
        ${data.safetyInformationTh ? `
        <section>
            <h4 class="font-semibold text-gray-800 border-b border-gray-100 pb-1.5 mb-2">ข้อมูลความปลอดภัยและข้อควรระวัง</h4>
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 whitespace-pre-line text-amber-900">${escapeHtml(data.safetyInformationTh)}</div>
        </section>` : ''}

        ${referenceItems.length ? `
        <section>
            <h4 class="font-semibold text-gray-800 border-b border-gray-100 pb-1.5 mb-2">เอกสารอ้างอิง (${escapeHtml(referenceItems.length)})</h4>
            <ul class="space-y-2.5">
                ${referenceItems.map(ref => `
                    <li class="border-l-2 border-gray-200 pl-3 text-xs text-gray-600">
                        ${ref.authors ? `${escapeHtml(ref.authors)}. ` : ''}<strong class="text-gray-800">${escapeHtml(ref.title)}</strong>.
                        ${ref.journal ? `<em>${escapeHtml(ref.journal)}</em>. ` : ''}${ref.publicationYear ? `${escapeHtml(ref.publicationYear)}. ` : ''}
                        ${ref.doi ? `DOI: ${escapeHtml(ref.doi)}. ` : ''}${ref.pubmedId ? `PMID: ${escapeHtml(ref.pubmedId)}. ` : ''}
                        ${ref.evidenceType ? `<span class="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">${escapeHtml(ref.evidenceType)}</span>` : ''}
                    </li>`).join('')}
            </ul>
        </section>` : '<p class="text-xs text-rose-500">ยังไม่มีเอกสารอ้างอิง — เนื้อหาด้านสุขภาพควรมีแหล่งอ้างอิงที่ตรวจสอบได้ก่อนเผยแพร่</p>'}

        ${productNames.length ? `
        <section>
            <h4 class="font-semibold text-gray-800 border-b border-gray-100 pb-1.5 mb-2">ผลิตภัณฑ์ที่มีส่วนผสมนี้</h4>
            <div class="flex flex-wrap gap-2">
                ${productNames.map(n => `<span class="px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg text-xs">${escapeHtml(n)}</span>`).join('')}
            </div>
        </section>` : ''}

        ${relatedNames.length ? `
        <section>
            <h4 class="font-semibold text-gray-800 border-b border-gray-100 pb-1.5 mb-2">ส่วนผสมที่เกี่ยวข้อง</h4>
            <div class="flex flex-wrap gap-2">
                ${relatedNames.map(n => `<span class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs">${escapeHtml(n)}</span>`).join('')}
            </div>
        </section>` : ''}

        ${data.shortDescriptionEn || data.fullDescriptionEn ? `
        <section class="pt-4 border-t border-gray-100">
            <h4 class="font-semibold text-sky-700 mb-2"><i class="fas fa-globe mr-1.5"></i> English version (จะถูกสร้างที่ /en/)</h4>
            ${data.shortDescriptionEn ? `<p class="text-gray-700 mb-2">${escapeHtml(data.shortDescriptionEn)}</p>` : ''}
            ${data.fullDescriptionEn ? `<div class="whitespace-pre-line text-gray-700">${escapeHtml(data.fullDescriptionEn)}</div>` : ''}
        </section>` : '<p class="text-xs text-gray-400 pt-4 border-t border-gray-100">ยังไม่มีเนื้อหาภาษาอังกฤษ — หน้า /en/ จะไม่ถูกสร้าง</p>'}
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
