// admin/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const toggleBtn = document.getElementById('toggleVisibilityBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', togglePasswordVisibility);
    }

    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
        window.location.href = 'index.html';
    }
});

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function hideError() {
    document.getElementById('errorAlert').classList.add('hidden');
}

function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorAlert.classList.remove('hidden');
}

async function handleLogin(event) {
    event.preventDefault();
    hideError();

    const emailInput = document.getElementById('email').value.trim();
    const passwordInput = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember').checked;
    const submitBtn = document.getElementById('submitBtn');

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> กำลังตรวจสอบ...';

    try {
        // 🟢 ยิงไปที่ Path สำหรับ Admin Login โดยเฉพาะ
        const response = await fetch('http://localhost:3000/auth/admin-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: emailInput,
                username: emailInput, // ส่งเผื่อไว้กรณี backend รับเป็น username
                password: passwordInput
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        }

        // 🟢 ตรวจสอบ Role ซ้ำอีกรอบเพื่อความปลอดภัย
        if (data.user && (data.user.role !== 'ADMIN' && data.user.role !== 'admin')) {
            throw new Error('คุณไม่มีสิทธิ์เข้าถึงระบบผู้ดูแลระบบ (Admin Only)');
        }

        // บันทึก Token
        localStorage.setItem('adminToken', data.accessToken);
        localStorage.setItem('adminData', JSON.stringify(data.user));

        submitBtn.classList.replace('bg-indigo-600', 'bg-green-500');
        submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i> เข้าสู่ระบบสำเร็จ!';
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);

    } catch (error) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>เข้าสู่ระบบ</span><i class="fas fa-arrow-right ml-2" id="btnIcon"></i>';
        submitBtn.classList.replace('bg-green-500', 'bg-indigo-600');
        showError(error.message);
    }
}