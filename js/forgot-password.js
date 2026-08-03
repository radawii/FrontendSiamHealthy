document.addEventListener('DOMContentLoaded', () => {
    const stepEmail = document.getElementById('stepEmail');
    const stepOtp = document.getElementById('stepOtp');
    const stepNewPassword = document.getElementById('stepNewPassword');
    
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    const displayEmail = document.getElementById('displayEmail');
    const resendOtp = document.getElementById('resendOtp');

    // ฟังก์ชันสร้างและแสดง Toast Popup
    function showToast(title, message, type = 'success') {
        let toast = document.getElementById('authToast');
        
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'authToast';
            document.body.appendChild(toast);
        }

        // กำหนดสีและไอคอนตามประเภท (success หรือ error)
        const iconHTML = type === 'success' 
            ? '<i class="fa-solid fa-circle-check" style="color: #10b981;"></i>' 
            : '<i class="fa-solid fa-circle-exclamation" style="color: #ef4444;"></i>';

        toast.className = type;
        toast.innerHTML = `
            ${iconHTML}
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;

        // แสดง Toast
        setTimeout(() => toast.classList.add('show'), 10);

        clearTimeout(window.toastTimer);
        window.toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }

    // ขั้นตอนที่ 1: กดส่งอีเมลเพื่อขอรับ OTP
    sendEmailBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('forgotEmail');

        if (!emailInput.value || !emailInput.checkValidity()) {
            showToast('กรุณากรอกข้อมูล', 'กรุณากรอกอีเมลให้ถูกต้องก่อนดำเนินการต่อ', 'error');
            emailInput.focus();
            return;
        }

        // แสดงอีเมลที่ผู้ใช้กรอกไว้ที่หน้า OTP
        displayEmail.textContent = emailInput.value;

        // สลับไปหน้าจอ Step 2 (กรอก OTP)
        stepEmail.style.display = 'none';
        stepOtp.style.display = 'block';

        showToast('ส่งรหัส OTP สำเร็จ', 'กรุณาตรวจสอบรหัส 6 หลักในอีเมลของคุณ');
    });

    // ขั้นตอนที่ 2: กด Verify รหัส OTP
    verifyOtpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const otpInput = document.getElementById('otpCode');

        if (otpInput.value.length < 6) {
            showToast('รหัส OTP ไม่ถูกต้อง', 'กรุณากรอกรหัส OTP ให้ครบ 6 หลัก', 'error');
            otpInput.focus();
            return;
        }

        // จำลองตรวจสอบรหัส OTP สำเร็จ แล้วสลับไป Step 3 (ตั้งรหัสผ่านใหม่)
        stepOtp.style.display = 'none';
        stepNewPassword.style.display = 'block';

        showToast('ยืนยันตัวตนสำเร็จ', 'สามารถตั้งรหัสผ่านใหม่ของคุณได้เลยครับ');
    });

    // ปุ่มกดส่งรหัส OTP อีกครั้ง
    resendOtp.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('ส่งรหัสใหม่อีกครั้ง', 'ระบบได้ส่งรหัส OTP ไปยังอีเมลของคุณเรียบร้อยแล้ว');
    });

    // ขั้นตอนที่ 3: บันทึกรหัสผ่านใหม่
    savePasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword.length < 8) {
            showToast('รหัสผ่านสั้นเกินไป', 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษรขึ้นไป', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('รหัสผ่านไม่ตรงกัน', 'กรุณากรอกยืนยันรหัสผ่านใหม่ให้ตรงกันทั้งสองช่อง', 'error');
            return;
        }

        showToast('เปลี่ยนรหัสผ่านสำเร็จ!', 'กำลังพาคุณกลับไปหน้าเข้าสู่ระบบ...');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1800);
    });

    // ระบบกดปุ่มลูกตาเพื่อเปิด/ปิด ซ่อนรหัสผ่าน
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
            } else {
                input.type = 'password';
            }
        });
    });
});