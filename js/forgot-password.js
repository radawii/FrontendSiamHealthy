document.addEventListener('DOMContentLoaded', () => {
  // Elements Reference
  const stepEmail = document.getElementById('stepEmail');
  const stepOtp = document.getElementById('stepOtp');
  const stepNewPassword = document.getElementById('stepNewPassword');

  const forgotEmail = document.getElementById('forgotEmail');
  const displayTarget = document.getElementById('displayTarget');
  const inputLabel = document.getElementById('inputLabel');
  const inputIcon = document.getElementById('inputIcon');
  const step1Desc = document.getElementById('step1Desc');
  const toggleMethodBtn = document.getElementById('toggleMethodBtn');

  const otpCode = document.getElementById('otpCode');
  const otpCountdown = document.getElementById('otpCountdown');
  const newPassword = document.getElementById('newPassword');
  const confirmPassword = document.getElementById('confirmPassword');

  const sendEmailBtn = document.getElementById('sendEmailBtn');
  const verifyOtpBtn = document.getElementById('verifyOtpBtn');
  const savePasswordBtn = document.getElementById('savePasswordBtn');
  const resendOtp = document.getElementById('resendOtp');

  // Password Real-time Validation Rules
  const ruleLength = document.getElementById('ruleLength');
  const ruleLetter = document.getElementById('ruleLetter');
  const ruleNumber = document.getElementById('ruleNumber');
  const ruleNoSpecial = document.getElementById('ruleNoSpecial');

  // Strict Password Regex
  const passwordStrictRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/;

  // สถานะช่องทางรับ OTP ('email' หรือ 'phone')
  let currentMethod = 'email';

  // ตัวแปรสำหรับจับเวลา OTP
  let otpTimer = null;
  let totalSeconds = 300; // 5 นาที = 300 วินาที
  let isOtpExpired = false;

  // SVG Icons
  const emailIconSVG = `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>`;
  const phoneIconSVG = `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`;

  // Real-time Password Validation Checklist
  if (newPassword) {
    newPassword.addEventListener('input', () => {
      const val = newPassword.value;
      const isTyping = val.length > 0;

      // 1. ความยาวอย่างน้อย 8 ตัวอักษรขึ้นไป
      const isLengthValid = val.length >= 8;
      updateRuleState(ruleLength, isLengthValid, isTyping);

      // 2. มีตัวอักษรภาษาอังกฤษอย่างน้อย 1 ตัว (a-z หรือ A-Z)
      const isLetterValid = /[a-zA-Z]/.test(val);
      updateRuleState(ruleLetter, isLetterValid, isTyping);

      // 3. มีตัวเลข (0-9) อย่างน้อย 1 ตัว
      const isNumberValid = /\d/.test(val);
      updateRuleState(ruleNumber, isNumberValid, isTyping);

      // 4. ห้ามใช้อักขระภาษาไทยหรืออักขระพิเศษ
      const isNoSpecialValid = isTyping && /^[a-zA-Z0-9]+$/.test(val);
      updateRuleState(ruleNoSpecial, isNoSpecialValid, isTyping);
    });
  }

  // ฟังก์ชันสลับคลาส (เขียว/แดง/เทา) และไอคอน (✓/✗/•)
  function updateRuleState(element, isValid, isTyping) {
    if (!element) return;
    const bullet = element.querySelector('.rule-bullet');

    if (!isTyping) {
      element.classList.remove('valid', 'invalid');
      if (bullet) bullet.textContent = '•';
    } else if (isValid) {
      element.classList.add('valid');
      element.classList.remove('invalid');
      if (bullet) bullet.textContent = '✓';
    } else {
      element.classList.add('invalid');
      element.classList.remove('valid');
      if (bullet) bullet.textContent = '✗';
    }
  }

  // ฟังก์ชันสลับการรับ OTP (อีเมล/เบอร์โทรศัพท์)
  if (toggleMethodBtn) {
    toggleMethodBtn.addEventListener('click', (e) => {
      e.preventDefault();
      forgotEmail.value = '';

      if (currentMethod === 'email') {
        currentMethod = 'phone';
        inputLabel.textContent = 'เบอร์โทรศัพท์';
        forgotEmail.type = 'tel';
        forgotEmail.placeholder = '08X-XXX-XXXX';
        forgotEmail.maxLength = 10;
        inputIcon.innerHTML = phoneIconSVG;
        step1Desc.textContent = 'กรอกเบอร์โทรศัพท์ที่คุณใช้ลงทะเบียน เพื่อรับรหัส OTP ยืนยันตัวตน';
        toggleMethodBtn.textContent = 'ต้องการรับ OTP ผ่านอีเมล?';
      } else {
        currentMethod = 'email';
        inputLabel.textContent = 'อีเมล';
        forgotEmail.type = 'email';
        forgotEmail.placeholder = 'กรอกอีเมลของคุณ';
        forgotEmail.removeAttribute('maxLength');
        inputIcon.innerHTML = emailIconSVG;
        step1Desc.textContent = 'กรอกอีเมลที่คุณใช้ลงทะเบียน เพื่อรับรหัส OTP ยืนยันตัวตน';
        toggleMethodBtn.textContent = 'ต้องการรับ OTP ผ่านเบอร์โทรศัพท์?';
      }
    });
  }

  // ฟังก์ชันเริ่มจับถอยหลัง OTP 5 นาที
  function startOtpTimer() {
    clearInterval(otpTimer);
    totalSeconds = 300;
    isOtpExpired = false;

    if (otpCode) {
      otpCode.disabled = false;
      otpCode.value = '';
    }
    if (verifyOtpBtn) {
      verifyOtpBtn.disabled = false;
      verifyOtpBtn.style.opacity = '1';
      verifyOtpBtn.style.cursor = 'pointer';
    }

    updateTimerDisplay(totalSeconds);

    otpTimer = setInterval(() => {
      totalSeconds--;
      updateTimerDisplay(totalSeconds);

      if (totalSeconds <= 0) {
        clearInterval(otpTimer);
        isOtpExpired = true;

        if (otpCode) otpCode.disabled = true;
        if (verifyOtpBtn) {
          verifyOtpBtn.disabled = true;
          verifyOtpBtn.style.opacity = '0.5';
          verifyOtpBtn.style.cursor = 'not-allowed';
        }

        Swal.fire({
          icon: 'error',
          title: 'รหัส OTP หมดอายุ',
          text: 'รหัส OTP หมดอายุการใช้งานแล้ว กรุณากดส่งรหัสใหม่อีกครั้ง',
          confirmButtonColor: '#0d5c2e'
        });
      }
    }, 1000);
  }

  function updateTimerDisplay(seconds) {
    if (!otpCountdown) return;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    otpCountdown.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // 1. Toggle Password Visibility (เปิด/ปิดตา รหัสผ่าน)
  const togglePasswordBtns = document.querySelectorAll('.toggle-password');
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.style.color = isPassword ? '#0f766e' : '#94a3b8';
    });
  });

  // 2. Step 1: ส่งรหัส OTP
  if (sendEmailBtn) {
    sendEmailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetVal = forgotEmail ? forgotEmail.value.trim() : '';

      if (currentMethod === 'email') {
        if (!targetVal || !forgotEmail.checkValidity()) {
          Swal.fire({
            icon: 'warning',
            title: 'กรอกข้อมูลไม่ถูกต้อง',
            text: 'กรุณากรอกอีเมลของคุณให้ถูกต้องก่อนดำเนินการต่อ',
            confirmButtonColor: '#0d5c2e'
          });
          forgotEmail.focus();
          return;
        }
      } else {
        const isPhoneValid = /^[0-9]{9,10}$/.test(targetVal);
        if (!targetVal || !isPhoneValid) {
          Swal.fire({
            icon: 'warning',
            title: 'กรอกข้อมูลไม่ถูกต้อง',
            text: 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง',
            confirmButtonColor: '#0d5c2e'
          });
          forgotEmail.focus();
          return;
        }
      }

      if (displayTarget) displayTarget.textContent = targetVal;

      const targetText = currentMethod === 'email' ? `อีเมล ${targetVal}` : `เบอร์โทรศัพท์ ${targetVal}`;

      Swal.fire({
        icon: 'success',
        title: 'ส่งรหัส OTP สำเร็จ!',
        text: `กรุณาตรวจสอบรหัส 6 หลักที่ส่งไปทาง ${targetText} (มีอายุ 5 นาที)`,
        confirmButtonColor: '#0d5c2e',
        timer: 1800,
        showConfirmButton: false
      }).then(() => {
        stepEmail.style.display = 'none';
        stepOtp.style.display = 'block';
        startOtpTimer();
      });
    });
  }

  // 3. Step 2: ยืนยันรหัส OTP
  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener('click', (e) => {
      e.preventDefault();

      if (isOtpExpired) {
        Swal.fire({
          icon: 'error',
          title: 'รหัส OTP หมดอายุ',
          text: 'กรุณากด "ส่งใหม่อีกครั้ง" เพื่อขอรับรหัสชุดใหม่',
          confirmButtonColor: '#0d5c2e'
        });
        return;
      }

      const otpVal = otpCode ? otpCode.value.trim() : '';

      if (!otpVal || otpVal.length < 6) {
        Swal.fire({
          icon: 'warning',
          title: 'รหัส OTP ไม่ถูกต้อง',
          text: 'กรุณากรอกรหัส OTP ให้ครบ 6 หลัก',
          confirmButtonColor: '#0d5c2e'
        });
        otpCode.focus();
        return;
      }

      clearInterval(otpTimer);

      Swal.fire({
        icon: 'success',
        title: 'ยืนยันตัวตนสำเร็จ!',
        text: 'สามารถตั้งรหัสผ่านใหม่ของคุณได้เลยครับ',
        confirmButtonColor: '#0d5c2e',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        stepOtp.style.display = 'none';
        stepNewPassword.style.display = 'block';
      });
    });
  }

  // 4. ปุ่มส่งรหัส OTP ใหม่อีกครั้ง
  if (resendOtp) {
    resendOtp.addEventListener('click', (e) => {
      e.preventDefault();

      startOtpTimer();

      const targetText = currentMethod === 'email' ? 'อีเมล' : 'เบอร์โทรศัพท์';

      Swal.fire({
        icon: 'info',
        title: 'ส่งรหัสใหม่อีกครั้ง',
        text: `ระบบได้ส่งรหัส OTP ชุดใหม่ไปยัง ${targetText} ของคุณเรียบร้อยแล้ว`,
        confirmButtonColor: '#0d5c2e'
      });
    });
  }

  // 5. Step 3: บันทึกรหัสผ่านใหม่
  if (savePasswordBtn) {
    savePasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const passVal = newPassword ? newPassword.value : '';
      const confirmVal = confirmPassword ? confirmPassword.value : '';

      // ตรวจสอบเงื่อนไขรหัสผ่านอย่างละเอียด
      if (!passwordStrictRegex.test(passVal)) {
        Swal.fire({
          icon: 'warning',
          title: 'รูปแบบรหัสผ่านไม่ถูกต้อง',
          html: `
            <div style="text-align: left; font-size: 0.9rem; color: #475569; line-height: 1.6;">
              <strong>รหัสผ่านต้องตรงตามเงื่อนไขต่อไปนี้:</strong>
              <ul style="margin-top: 8px; padding-left: 20px; margin-bottom: 0;">
                <li>ความยาวอย่างน้อย 8 ตัวอักษรขึ้นไป</li>
                <li>มีตัวอักษรภาษาอังกฤษอย่างน้อย 1 ตัว (พิมพ์เล็กหรือพิมพ์ใหญ่ก็ได้)</li>
                <li>มีตัวเลข (0-9) อย่างน้อย 1 ตัว</li>
                <li>ห้ามใช้อักขระภาษาไทยหรืออักขระพิเศษ</li>
              </ul>
            </div>
          `,
          confirmButtonColor: '#0d5c2e'
        });
        newPassword.focus();
        return;
      }

      if (passVal !== confirmVal) {
        Swal.fire({
          icon: 'error',
          title: 'รหัสผ่านไม่ตรงกัน',
          text: 'กรุณากรอกยืนยันรหัสผ่านใหม่ให้ตรงกันทั้งสองช่อง',
          confirmButtonColor: '#0d5c2e'
        });
        confirmPassword.focus();
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'เปลี่ยนรหัสผ่านสำเร็จ!',
        text: 'กรุณารอสักครู่ ระบบกำลังนำคุณไปหน้าเข้าสู่ระบบ',
        confirmButtonColor: '#0d5c2e',
        timer: 1800,
        showConfirmButton: false
      }).then(() => {
        window.location.href = 'login.html';
      });
    });
  }
});