// admin/js/kb-image-picker.js
// เปลี่ยนช่อง URL รูปภาพให้เป็นตัวเลือกรูป: กดเลือก/ลากไฟล์มาวาง → อัปโหลด → เก็บ URL ไว้ใน input เดิม
// ใช้: <div data-image-picker="f-featuredImageUrl"></div> + <input type="hidden" id="f-featuredImageUrl">
(() => {
    const MAX_MB = 5;
    const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const pickers = [];

    function token() {
        if (typeof getAuthToken === 'function') return getAuthToken();
        return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    }

    function build(host) {
        const input = document.getElementById(host.dataset.imagePicker);
        if (!input) return;
        const hint = host.dataset.hint || '';

        host.innerHTML = `
            <div class="kb-picker group relative flex items-center gap-4 p-3 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors">
                <div class="kb-picker-thumb w-24 h-24 flex-shrink-0 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center text-gray-300">
                    <i class="fas fa-image text-3xl"></i>
                </div>
                <div class="min-w-0 flex-1">
                    <p class="kb-picker-status text-sm font-medium text-gray-700">ยังไม่มีรูปภาพ</p>
                    <p class="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP หรือ GIF ไม่เกิน ${MAX_MB} MB · ลากไฟล์มาวางได้${hint ? ' · ' + hint : ''}</p>
                    <div class="flex flex-wrap gap-2 mt-2">
                        <button type="button" class="kb-picker-choose bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                            <i class="fas fa-upload mr-1"></i> <span>เลือกรูปภาพ</span>
                        </button>
                        <button type="button" class="kb-picker-remove hidden bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                            <i class="fas fa-trash mr-1"></i> ลบรูป
                        </button>
                    </div>
                </div>
                <input type="file" accept="${TYPES.join(',')}" class="hidden">
            </div>`;

        const box = host.querySelector('.kb-picker');
        const thumb = host.querySelector('.kb-picker-thumb');
        const status = host.querySelector('.kb-picker-status');
        const choose = host.querySelector('.kb-picker-choose');
        const remove = host.querySelector('.kb-picker-remove');
        const file = host.querySelector('input[type=file]');

        function render() {
            const url = input.value.trim();
            remove.classList.toggle('hidden', !url);
            choose.querySelector('span').textContent = url ? 'เปลี่ยนรูป' : 'เลือกรูปภาพ';
            if (!url) {
                thumb.innerHTML = '<i class="fas fa-image text-3xl"></i>';
                status.textContent = 'ยังไม่มีรูปภาพ';
                return;
            }
            const img = new Image();
            img.alt = '';
            img.className = 'w-full h-full object-contain';
            img.onerror = () => { thumb.innerHTML = '<i class="fas fa-triangle-exclamation text-2xl text-amber-400"></i>'; status.textContent = 'โหลดรูปไม่ได้ — ลองเลือกรูปใหม่'; };
            img.src = url;
            thumb.replaceChildren(img);
            status.textContent = decodeURIComponent(url.split('/').pop() || 'รูปภาพ');
            status.title = url;
        }

        async function upload(f) {
            if (!f) return;
            if (!TYPES.includes(f.type)) return alertError('รองรับเฉพาะไฟล์ JPG, PNG, WEBP หรือ GIF');
            if (f.size > MAX_MB * 1024 * 1024) return alertError(`ไฟล์ใหญ่เกิน ${MAX_MB} MB กรุณาย่อขนาดรูปก่อน`);

            box.classList.add('opacity-60', 'pointer-events-none');
            status.textContent = 'กำลังอัปโหลด...';
            thumb.innerHTML = '<i class="fas fa-spinner fa-spin text-2xl text-indigo-400"></i>';
            try {
                const body = new FormData();
                body.append('file', f);
                const res = await fetch(`${window.location.origin}/api/admin/kb-images`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token()}` },
                    body,
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data.url) throw new Error(data.message || 'อัปโหลดไม่สำเร็จ');
                input.value = data.url;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            } catch (e) {
                alertError(e.message);
            } finally {
                box.classList.remove('opacity-60', 'pointer-events-none');
                file.value = '';
                render();
            }
        }

        function alertError(text) {
            if (window.Swal) Swal.fire({ icon: 'error', title: 'อัปโหลดรูปไม่สำเร็จ', text, confirmButtonColor: '#4f46e5' });
            else alert(text);
        }

        choose.addEventListener('click', () => file.click());
        file.addEventListener('change', () => upload(file.files[0]));
        remove.addEventListener('click', () => { input.value = ''; input.dispatchEvent(new Event('change', { bubbles: true })); render(); });
        box.addEventListener('dragover', (e) => { e.preventDefault(); box.classList.add('border-indigo-400', 'bg-indigo-50'); });
        box.addEventListener('dragleave', () => box.classList.remove('border-indigo-400', 'bg-indigo-50'));
        box.addEventListener('drop', (e) => { e.preventDefault(); box.classList.remove('border-indigo-400', 'bg-indigo-50'); upload(e.dataTransfer.files[0]); });

        pickers.push(render);
        render();
    }

    function init() { document.querySelectorAll('[data-image-picker]').forEach(build); }
    // ฟอร์มเติมค่าด้วยโค้ดแล้วส่ง cw:refresh — อัปเดตภาพตัวอย่างตามค่าใหม่
    document.addEventListener('cw:refresh', () => pickers.forEach((r) => r()));
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
