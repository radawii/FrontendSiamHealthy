document.addEventListener('DOMContentLoaded', () => {
    const stepEmail = document.getElementById('stepEmail');
    const stepOtp = document.getElementById('stepOtp');
    const stepNewPassword = document.getElementById('stepNewPassword');
    
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    const displayEmail = document.getElementById('displayEmail');
    const resendOtp = document.getElementById('resendOtp');

    // ขั้นตอนที่ 1: กดส่งอีเมลเพื่อขอรับ OTP
    sendEmailBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('forgotEmail');

        if (!emailInput.value || !emailInput.checkValidity()) {
            alert('กรุณากรอกอีเมลให้ถูกต้อง');
            emailInput.focus();
            return;
        }

        // แสดงอีเมลที่ผู้ใช้กรอกไว้ที่หน้า OTP
        displayEmail.textContent = emailInput.value;

        // สลับไปหน้าจอ Step 2 (กรอก OTP)
        stepEmail.style.display = 'none';
        stepOtp.style.display = 'block';
    });

    // ขั้นตอนที่ 2: กด Verify รหัส OTP
    verifyOtpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const otpInput = document.getElementById('otpCode');

        if (otpInput.value.length < 6) {
            alert('กรุณากรอกรหัส OTP ให้ครบ 6 หลัก');
            otpInput.focus();
            return;
        }

        // จำลองตรวจสอบรหัส OTP สำเร็จ แล้วสลับไป Step 3 (ตั้งรหัสผ่านใหม่)
        stepOtp.style.display = 'none';
        stepNewPassword.style.display = 'block';
    });

    // ปุ่มกดส่งรหัส OTP อีกครั้ง
    resendOtp.addEventListener('click', (e) => {
        e.preventDefault();
        alert('ระบบได้ส่งรหัส OTP ไปยังอีเมลของคุณใหม่อีกครั้งแล้ว');
    });

    // ขั้นตอนที่ 3: บันทึกรหัสผ่านใหม่
    savePasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword.length < 8) {
            alert('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
            return;
        }

        alert('เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่');
        window.location.href = 'login.html';
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