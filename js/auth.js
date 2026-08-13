// js/auth.js
const API_BASE_URL = 'http://localhost:3000';
// 📌 ตั้งค่า URL ของ Backend
const API_URL = 'http://localhost:3000/auth/login';

document.addEventListener('DOMContentLoaded', () => {
    console.log("🟢 Auth.js โหลดเสร็จสมบูรณ์ พร้อมทำงาน!");

    // ----------------------------------------------------
    // 0. ดึงข้อมูลที่เคยจดจำไว้มาเติมอัตโนมัติ (Remember Me Auto-fill)
    // ----------------------------------------------------
    const savedIdentifier = localStorage.getItem('remembered_identifier');
    const savedPassword = localStorage.getItem('remembered_password');
    const savedStatus = localStorage.getItem('remembered_status');

    if (savedStatus === 'true' && savedIdentifier) {
        const loginIdentifierInput = document.getElementById('loginIdentifier');
        const loginPasswordInput = document.getElementById('loginPassword');
        const rememberMeCheckbox = document.getElementById('rememberMe');

        if (loginIdentifierInput) loginIdentifierInput.value = savedIdentifier;
        if (loginPasswordInput && savedPassword) loginPasswordInput.value = savedPassword;
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
            document.getElementById(`${tabId}Form`).classList.add('active');
        });
    });

    // ----------------------------------------------------
    // 2. ระบบเปิด/ปิด การมองเห็นรหัสผ่าน
    // ----------------------------------------------------
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);

            if (type === 'text') {
                this.style.opacity = '0.5';
            } else {
                this.style.opacity = '1';
            }
        });
    });

    // ----------------------------------------------------
    // 3. ระบบเชื่อมต่อ Backend - การสมัครสมาชิก (Register)
    // ----------------------------------------------------
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // ป้องกันการรีเฟรชหน้าเว็บ
            console.log("👉 กดปุ่ม 'สมัครสมาชิก' แล้ว!");

            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const phone = document.getElementById('regPhone').value;
            const password = document.getElementById('regPassword').value;
            const acceptTerms = document.getElementById('acceptTerms').checked;

            if (!acceptTerms) {
                Swal.fire({ icon: 'warning', text: 'กรุณายอมรับเงื่อนไขการใช้งานก่อนสมัครสมาชิก' });
                return;
            }

            try {
                console.log("กำลังส่งข้อมูลไปที่:", `${API_BASE_URL}/auth/register`);

                // ยิง API ไปที่ Backend
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        username: username, 
                        email: email, 
                        phone: phone, 
                        password: password 
                    })
                });

                const data = await response.json();
                console.log("Backend ตอบกลับมาว่า:", data);

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'สมัครสมาชิกสำเร็จ!',
                        text: 'กรุณาเข้าสู่ระบบด้วยบัญชีที่คุณเพิ่งสร้าง',
                        confirmButtonColor: '#0f766e'
                    }).then(() => {
                        // สลับไปหน้าเข้าสู่ระบบอัตโนมัติ
                        document.querySelector('[data-tab="login"]').click();
                        document.getElementById('loginIdentifier').value = username;
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
                    text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (กรุณาเช็ค CORS หรือ Backend)'
                });
            }
        });
    } else {
        console.error("❌ หา Form 'registerForm' ไม่เจอในหน้าเว็บ");
    }

    // ----------------------------------------------------
    // 4. ระบบเชื่อมต่อ Backend - การเข้าสู่ระบบ (Login)
    // ----------------------------------------------------
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("👉 กดปุ่ม 'เข้าสู่ระบบ' แล้ว!");

            const identifier = document.getElementById('loginIdentifier').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe') ? document.getElementById('rememberMe').checked : false;

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: identifier, password: password }) 
                });

                const data = await response.json();
                console.log("Backend ตอบกลับมาว่า:", data);

                if (response.ok) {
                    // 🛠️ จัดการการจดจำข้อมูลเข้าสู่ระบบ (Remember Me)
                    if (rememberMe) {
                        localStorage.setItem('remembered_identifier', identifier);
                        localStorage.setItem('remembered_password', password);
                        localStorage.setItem('remembered_status', 'true');
                    } else {
                        localStorage.removeItem('remembered_identifier');
                        localStorage.removeItem('remembered_password');
                        localStorage.removeItem('remembered_status');
                    }

                    const token = data.access_token || data.token || 'login_success_token';

                    // 🟢 1. แกะอีเมลจาก Response ที่ Backend ส่งกลับมา
                    let userEmail = data.user?.email || data.email || '';

                    // 🟢 2. ถ้ากรอกช่อง Identifier มาเป็นอีเมล ให้ใช้ค่านั้นทันที
                    if (!userEmail && identifier.includes('@')) {
                        userEmail = identifier;
                    }

                    // 🟢 3. ถ้ายังหาอีเมลไม่เจอ (กรณีล็อกอินด้วย Username เช่น 'IT') ให้ลองดึงข้อมูล Profile เพิ่มเติม
                    if (!userEmail && token !== 'login_success_token') {
                        try {
                            const profileRes = await fetch(`${API_BASE_URL}/auth/profile`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (profileRes.ok) {
                                const profileData = await profileRes.json();
                                userEmail = profileData.email || profileData.user?.email || '';
                            }
                        } catch (err) {
                            console.warn("⚠️ ไม่สามารถดึงอีเมลจาก Profile ได้:", err);
                        }
                    }

                    // 🟢 ปรับปรุงการเซฟข้อมูลลง siam_healthy_user ให้เป็น JSON มีโครงสร้างที่สมบูรณ์
                    const userObj = {
                        token: token,
                        id: data.user?.id || data.userId || null,
                        email: userEmail,
                        username: data.user?.username || identifier,
                        name: data.user?.name || data.user?.fullname || identifier
                    };

                    // บันทึกเข้า Local Storage เป็น JSON String
                    localStorage.setItem('siam_healthy_user', JSON.stringify(userObj));

                    Swal.fire({
                        icon: 'success',
                        title: 'เข้าสู่ระบบสำเร็จ!',
                        text: 'ยินดีต้อนรับกลับมาครับ',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        if (document.referrer && document.referrer.includes('cart')) {
                            window.history.back(); 
                        } else {
                            window.location.href = '../index.html'; 
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