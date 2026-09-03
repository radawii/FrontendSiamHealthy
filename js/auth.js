// Frontend/js/auth.js

const API_BASE_URL = 'http://localhost:3000';

function cleanStoredToken(token) {
    const cleaned = token ? String(token).trim().replace(/^"|"$/g, '') : null;
    return cleaned ? cleaned.replace(/^Bearer\s+/i, '').trim() : null;
}

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 0. ดึงข้อมูลที่เคยจดจำไว้มาเติมอัตโนมัติ (Username / Email)
    // ----------------------------------------------------
    const savedIdentifier = localStorage.getItem('remembered_identifier');
    const savedStatus = localStorage.getItem('remembered_status');

    if (savedStatus === 'true' && savedIdentifier) {
        const loginIdentifierInput = document.getElementById('loginIdentifier');
        const rememberMeCheckbox = document.getElementById('rememberMe');

        if (loginIdentifierInput) loginIdentifierInput.value = savedIdentifier;
        if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
    }

    // ----------------------------------------------------
    // 1. ระบบจัดการ Tabs (เข้าสู่ระบบ / สมัครสมาชิก)
    // ----------------------------------------------------
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authPanels = document.querySelectorAll('.auth-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            authPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            const targetPanel = document.getElementById(`${tabId}Form`);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });

    // ----------------------------------------------------
    // 2. ระบบเปิด/ปิด การมองเห็นรหัสผ่าน
    // ----------------------------------------------------
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.previousElementSibling;
            if (!input) return;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.style.opacity = (type === 'text') ? '0.5' : '1';
        });
    });

    // ----------------------------------------------------
    // 3. ระบบเชื่อมต่อ Backend - การสมัครสมาชิก (Register)
    // ----------------------------------------------------
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('regUsername').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const phone = document.getElementById('regPhone').value.trim();
            const password = document.getElementById('regPassword').value;
            const acceptTerms = document.getElementById('acceptTerms')?.checked;

            if (!acceptTerms) {
                Swal.fire({ icon: 'warning', text: 'กรุณายอมรับเงื่อนไขการใช้งานก่อนสมัครสมาชิก' });
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, phone, password })
                });

                const data = await response.json();

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'สมัครสมาชิกสำเร็จ!',
                        text: 'กรุณาเข้าสู่ระบบด้วยบัญชีที่คุณเพิ่งสร้าง',
                        confirmButtonColor: '#0f766e'
                    }).then(() => {
                        const loginTab = document.querySelector('[data-tab="login"]');
                        if (loginTab) loginTab.click();
                        const loginIdInput = document.getElementById('loginIdentifier');
                        if (loginIdInput) loginIdInput.value = username;
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'สมัครสมาชิกล้มเหลว',
                        text: data.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์'
                    });
                }
            } catch (error) {
                console.error('❌ Register Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'ข้อผิดพลาดระบบ',
                    text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
                });
            }
        });
    }

    // ----------------------------------------------------
    // 4. ระบบเชื่อมต่อ Backend - การเข้าสู่ระบบ (Login)
    // ----------------------------------------------------
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const identifier = document.getElementById('loginIdentifier').value.trim();
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe')?.checked || false;

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: identifier, password: password })
                });

                const data = await response.json();

                if (response.ok) {
                    // จัดการข้อมูลจดจำการเข้าสู่ระบบ
                    if (rememberMe) {
                        localStorage.setItem('remembered_identifier', identifier);
                        localStorage.setItem('remembered_status', 'true');
                    } else {
                        localStorage.removeItem('remembered_identifier');
                        localStorage.removeItem('remembered_status');
                    }
                    localStorage.removeItem('remembered_password');

                    // ดึง Token
                    const token = cleanStoredToken(data.access_token || data.accessToken || data.token);

                    if (!token) {
                        throw new Error('ระบบไม่ได้ส่ง Token กลับมา กรุณาตรวจสอบ Backend');
                    }

                    // ดึง User Object
                    const userPayload = data.user || data.data || data;
                    const resolvedId = userPayload.id ?? userPayload.userId ?? userPayload.user_id ?? data.userId ?? data.id;

                    let userEmail = userPayload.email || '';
                    if (!userEmail && identifier.includes('@')) {
                        userEmail = identifier;
                    }

                    const userRole = (userPayload.role || data.role || 'USER').toUpperCase();

                    // 🟢 บันทึก Token ให้ครบทุกคีย์ (เผื่อให้สิทธิ์เข้าถึง Admin ถ้ากดลิงก์ไปเอง)
                    localStorage.setItem('token', token);
                    localStorage.setItem('adminToken', token);
                    sessionStorage.setItem('adminToken', token);

                    const userObj = {
                        token,
                        id: resolvedId,
                        user_id: resolvedId,
                        email: userEmail,
                        username: userPayload.username || identifier,
                        name: userPayload.name || userPayload.fullname || identifier,
                        role: userRole
                    };

                    localStorage.setItem('siam_healthy_user', JSON.stringify(userObj));
                    localStorage.setItem('adminData', JSON.stringify(userObj));

                    Swal.fire({
                        icon: 'success',
                        title: 'เข้าสู่ระบบสำเร็จ!',
                        text: 'ยินดีต้อนรับกลับมาครับ',
                        timer: 1200,
                        showConfirmButton: false
                    }).then(() => {
                        // 🟢 นำทางไปหน้าแรกของฝั่งลูกค้า (ลบเงื่อนไขเช็ค userRole === 'ADMIN' ออกแล้ว)
                        const redirectUrl = localStorage.getItem('siam_healthy_redirect_after_login');
                        
                        if (redirectUrl) {
                            localStorage.removeItem('siam_healthy_redirect_after_login');
                            window.location.replace(redirectUrl);
                        } else if (document.referrer && (document.referrer.includes('cart') || document.referrer.includes('orders') || document.referrer.includes('order-detail'))) {
                            window.location.replace(document.referrer);
                        } else {
                            window.location.replace('../index.html'); // กลับไปหน้าแรกเสมอ
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'เข้าสู่ระบบล้มเหลว',
                        text: data.message || 'อีเมล/Username หรือรหัสผ่านไม่ถูกต้อง'
                    });
                }
            } catch (error) {
                console.error('❌ Login Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'ข้อผิดพลาดระบบ',
                    text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
                });
            }
        });
    }
});
