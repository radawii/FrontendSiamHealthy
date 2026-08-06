document.addEventListener('DOMContentLoaded', () => {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const authPanels = document.querySelectorAll('.auth-panel');

  // Regex ตรวจสอบรหัสผ่าน:
  // 1. มีตัวอักษรภาษาอังกฤษอย่างน้อย 1 ตัว (a-z หรือ A-Z)
  // 2. มีตัวเลขอย่างน้อย 1 ตัว (0-9)
  // 3. ประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลขเท่านั้น ความยาวตั้งแต่ 8 ตัวขึ้นไป
  const passwordStrictRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/;

  // 1. Tab Switching Logic (สลับ Login / Register)
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      authPanels.forEach(panel => panel.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`${targetTab}Form`)?.classList.add('active');
    });
  });

  // 2. Toggle Password Visibility (เปิด/ปิดตา รหัสผ่าน)
  const togglePasswordBtns = document.querySelectorAll('.toggle-password');
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (!input) return;

      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);

      btn.style.color = type === 'text' ? '#0f766e' : '#94a3b8';
    });
  });

  // Real-Time Password Validation Checklist
  const regPasswordInput = document.getElementById('regPassword');
  const ruleLength = document.getElementById('ruleLength');
  const ruleLetter = document.getElementById('ruleLetter');
  const ruleNumber = document.getElementById('ruleNumber');
  const ruleNoSpecial = document.getElementById('ruleNoSpecial');

  if (regPasswordInput) {
    regPasswordInput.addEventListener('input', () => {
      const val = regPasswordInput.value;
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

      // 4. ห้ามใช้อักขระภาษาไทยหรืออักขระพิเศษ (อนุญาตเฉพาะ a-z, A-Z, 0-9)
      const isNoSpecialValid = isTyping && /^[a-zA-Z0-9]+$/.test(val);
      updateRuleState(ruleNoSpecial, isNoSpecialValid, isTyping);
    });
  }

  // ฟังก์ชันสลับคลาส (เขียว/แดง/เทา) และไอคอน (✓/✗/•)
  function updateRuleState(element, isValid, isTyping) {
    if (!element) return;
    const bullet = element.querySelector('.rule-bullet');

    if (!isTyping) {
      // สถานะเริ่มต้นเมื่อช่องรหัสผ่านว่างเปล่า (สีเทาปกติ)
      element.classList.remove('valid', 'invalid');
      if (bullet) bullet.textContent = '•';
    } else if (isValid) {
      // เมื่อผ่านเงื่อนไข (สีเขียว + ✓)
      element.classList.add('valid');
      element.classList.remove('invalid');
      if (bullet) bullet.textContent = '✓';
    } else {
      // เมื่อไม่ผ่านเงื่อนไข (สีแดง + ✗)
      element.classList.add('invalid');
      element.classList.remove('valid');
      if (bullet) bullet.textContent = '✗';
    }
  }

  // 3. Mock Login Handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const identifierInput = document.getElementById('loginIdentifier');
      const passwordInput = document.getElementById('loginPassword');
      const rememberMe = document.getElementById('rememberMe')?.checked;

      const identifier = identifierInput ? identifierInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';

      if (!identifier || !password) {
        Swal.fire({
          icon: 'warning',
          title: 'กรอกข้อมูลไม่ครบ',
          text: 'กรุณากรอกอีเมล หรือ เบอร์โทรศัพท์ และรหัสผ่านให้ครบถ้วน',
          confirmButtonColor: '#0d5c2e'
        });
        return;
      }

      const isEmail = identifier.includes('@');
      const isPhone = /^[0-9+\-\s]{9,15}$/.test(identifier);

      if (!isEmail && !isPhone) {
        Swal.fire({
          icon: 'warning',
          title: 'รูปแบบข้อมูลไม่ถูกต้อง',
          text: 'กรุณากรอกอีเมล หรือ เบอร์โทรศัพท์ ให้ถูกต้อง',
          confirmButtonColor: '#0d5c2e'
        });
        return;
      }

      let derivedUsername = isEmail ? identifier.split('@')[0] : `User_${identifier.slice(-4)}`;
      let derivedEmail = isEmail ? identifier : `${identifier}@example.com`;
      let derivedPhone = isPhone ? identifier : '-';

      const mockUser = {
        username: derivedUsername,
        email: derivedEmail,
        phone: derivedPhone,
        role: 'member',
        isLoggedIn: true,
        loginTime: new Date().toISOString()
      };

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('siam_healthy_user', JSON.stringify(mockUser));
      localStorage.setItem('siam_healthy_is_logged_in', 'true');

      Swal.fire({
        icon: 'success',
        title: 'เข้าสู่ระบบสำเร็จ',
        text: 'ยินดีต้อนรับกลับมาสู่ Siam-Healthy',
        confirmButtonColor: '#0d5c2e',
        timer: 1800,
        showConfirmButton: false
      }).then(() => {
        window.location.href = '../index.html';
      });
    });
  }

  // 4. Register Handler (สมัครสมาชิก + ยืนยัน OTP 5 นาที)
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const username = document.getElementById('regUsername')?.value.trim();
      const email = document.getElementById('regEmail')?.value.trim();
      const phone = document.getElementById('regPhone')?.value.trim();
      const password = document.getElementById('regPassword')?.value;
      const acceptTerms = document.getElementById('acceptTerms')?.checked;

      if (!username || !email || !phone || !password) {
        Swal.fire({
          icon: 'warning',
          title: 'ข้อมูลไม่ครบถ้วน',
          text: 'กรุณากรอกข้อมูลการลงทะเบียนให้ครบทุกช่อง',
          confirmButtonColor: '#0d5c2e'
        });
        return;
      }

      if (!passwordStrictRegex.test(password)) {
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
        return;
      }

      if (!acceptTerms) {
        Swal.fire({
          icon: 'info',
          title: 'ข้อตกลงและเงื่อนไข',
          text: 'กรุณายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว',
          confirmButtonColor: '#0d5c2e'
        });
        return;
      }

      // แสดง Popup ยืนยัน OTP แบบนับถอยหลัง 5 นาที (300 วินาที)
      let countdownTimer;
      let totalSeconds = 300;

      Swal.fire({
        title: 'ยืนยันรหัส OTP',
        html: `
          <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 12px;">
            กรอกรหัส 6 หลักที่เราได้ส่งไปที่อีเมล <strong style="color: #0d5c2e;">${email}</strong>
          </p>
          <input type="text" id="regOtpInput" class="swal2-input" placeholder="------" maxlength="6" 
            style="text-align: center; letter-spacing: 8px; font-weight: 600; font-size: 1.2rem; width: 80%; margin: 10px auto;">
          <div style="font-size: 0.85rem; color: #64748b; margin-top: 10px;">
            รหัส OTP จะหมดอายุใน <span id="regOtpCountdown" style="font-weight: 600; color: #ef4444;">05:00</span> นาที
          </div>
        `,
        confirmButtonText: 'ยืนยันรหัส OTP',
        confirmButtonColor: '#0d5c2e',
        showCancelButton: true,
        cancelButtonText: 'ยกเลิก',
        allowOutsideClick: false,
        didOpen: () => {
          const timerDisplay = document.getElementById('regOtpCountdown');
          const otpInput = document.getElementById('regOtpInput');
          if (otpInput) otpInput.focus();

          countdownTimer = setInterval(() => {
            totalSeconds--;
            const mins = Math.floor(totalSeconds / 60);
            const secs = totalSeconds % 60;
            if (timerDisplay) {
              timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            }

            if (totalSeconds <= 0) {
              clearInterval(countdownTimer);
              Swal.showValidationMessage('รหัส OTP หมดอายุแล้ว กรุณาลงทะเบียนใหม่อีกครั้ง');
              const confirmBtn = Swal.getConfirmButton();
              if (confirmBtn) confirmBtn.disabled = true;
            }
          }, 1000);
        },
        willClose: () => {
          clearInterval(countdownTimer);
        },
        preConfirm: () => {
          const otpVal = document.getElementById('regOtpInput')?.value.trim();
          if (!otpVal || otpVal.length < 6) {
            Swal.showValidationMessage('กรุณากรอกรหัส OTP ให้ครบ 6 หลัก');
            return false;
          }
          return otpVal;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          registerForm.reset();

          // รีเซ็ตสถานะตัวหนังสือข้อต่างๆ กลับเป็นสีเทาปกติ (•)
          [ruleLength, ruleLetter, ruleNumber, ruleNoSpecial].forEach(el => updateRuleState(el, false, false));

          Swal.fire({
            icon: 'success',
            title: 'ลงทะเบียนสำเร็จ!',
            text: 'ลงทะเบียนเรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยอีเมล หรือ เบอร์โทรศัพท์ของคุณ',
            confirmButtonColor: '#0d5c2e',
            confirmButtonText: 'ไปหน้าเข้าสู่ระบบ'
          }).then(() => {
            const loginTabBtn = document.querySelector('.tab-btn[data-tab="login"]');
            if (loginTabBtn) {
              loginTabBtn.click();
            }

            const loginIdentifier = document.getElementById('loginIdentifier');
            if (loginIdentifier) {
              loginIdentifier.value = email || phone;
              document.getElementById('loginPassword')?.focus();
            }
          });
        }
      });
    });
  }

  // 5. Mock Google Authentication Handler
  const handleGoogleAuth = (isRegister = false) => {
    const mockGoogleUser = {
      username: 'GoogleUser',
      email: 'user.google@gmail.com',
      role: 'member',
      isLoggedIn: true,
      authProvider: 'google',
      loginTime: new Date().toISOString()
    };

    localStorage.setItem('siam_healthy_user', JSON.stringify(mockGoogleUser));
    localStorage.setItem('siam_healthy_is_logged_in', 'true');

    const alertTitle = isRegister ? 'ลงทะเบียนผ่าน Google สำเร็จ' : 'เข้าสู่ระบบด้วย Google สำเร็จ';
    const alertText = isRegister ? 'ระบบได้ทำการลงทะเบียนและนำคุณเข้าสู่ระบบเรียบร้อยแล้ว' : 'ยินดีต้อนรับกลับมาสู่ Siam-Healthy';

    Swal.fire({
      icon: 'success',
      title: alertTitle,
      text: alertText,
      confirmButtonColor: '#0d5c2e',
      timer: 1800,
      showConfirmButton: false
    }).then(() => {
      window.location.href = '../index.html';
    });
  };

  document.getElementById('googleLoginBtn')?.addEventListener('click', () => handleGoogleAuth(false));
  document.getElementById('googleRegBtn')?.addEventListener('click', () => handleGoogleAuth(true));
});