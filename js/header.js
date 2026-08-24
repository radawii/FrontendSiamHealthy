class MyHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="main-header">
        <div class="header-container">
          <!-- Logo ฝั่งซ้าย -->
          <a href="/index.html" class="logo-section">
            <span class="brand-name">Siam-Healthy</span>
          </a>

          <!-- กลุ่มฝั่งขวา -->
          <div class="header-right-actions">
            <!-- Nav Menu -->
            <nav class="nav-menu" id="navMenu">
              <a href="/shop/" class="nav-tab">ผลิตภัณฑ์ทั้งหมด</a>
              <a href="/about/" class="nav-tab">เกี่ยวกับเรา</a>
              <a href="/articles/" class="nav-tab">บทความ</a>
              <a href="/contact/" class="nav-tab" id="contactNavBtn">ติดต่อเรา</a>

              <!-- ไอคอนแสดงในเมนูเบอร์เกอร์ (Mobile) -->
              <div class="mobile-nav-icons">
                <a href="/cart/" class="mobile-icon-link">
                  <div class="icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <span class="cart-badge" style="display: none;"></span>
                  </div>
                  <span>ตะกร้าของคุณ</span>
                </a>

                <!-- Mobile Profile Container with Dropdown -->
                <div class="mobile-profile-container" id="mobileProfileContainer">
                  <a href="javascript:void(0);" class="mobile-icon-link" id="mobileProfileToggle">
                    <div class="icon-wrapper">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <span id="mobileProfileText">บัญชีของฉัน</span>
                  </a>
                  <div class="profile-dropdown-menu" id="mobileProfileDropdown">
                    <!-- เนื้อหา Dropdown จะถูก render ด้วย JS ตามสถานะ Login -->
                  </div>
                </div>
              </div>
            </nav>

            <!-- Search Icon Button -->
            <button class="icon-btn search-toggle-btn" id="searchToggleBtn" title="ค้นหา" aria-label="Toggle Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            <!-- กลุ่มไอคอนบน Desktop -->
            <div class="desktop-action-icons">
              <a href="/cart/" class="icon-btn cart-btn" title="ตะกร้าของคุณ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span class="cart-badge" style="display: none;"></span>
              </a>

              <!-- Desktop Profile Container with Dropdown -->
              <div class="desktop-profile-container" id="desktopProfileContainer" style="position: relative; display: inline-block;">
                <button class="icon-btn profile-btn" id="desktopProfileToggle" title="บัญชีผู้ใช้" aria-label="Profile Menu">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>
                <div class="profile-dropdown-menu" id="desktopProfileDropdown">
                  <!-- เนื้อหา Dropdown จะถูก render ด้วย JS ตามสถานะ Login -->
                </div>
              </div>
            </div>

            <!-- Mobile Hamburger Button -->
            <button class="hamburger-btn" id="hamburgerBtn" aria-label="Toggle navigation">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        <!-- Sliding Search Bar Overlay -->
        <div class="search-overlay-bar" id="searchOverlay">
          <div class="search-overlay-container">
            <div class="search-input-box">
              <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" id="searchInput" placeholder="ค้นหาสินค้า หรือปัญหาสุขภาพ" autocomplete="off" />
            </div>
            <button class="search-close-btn" id="searchCloseBtn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
          </div>

          <div class="search-results-container">
            <div class="search-results-dropdown" id="searchResults"></div>
          </div>
        </div>
      </header>
    `;

    this.initHamburgerMenu();
    this.initSearchToggle();
    this.initSearchSystem();
    this.initContactScroll();
    this.initProfileSystem();

    this.updateCartBadge();

    window.addEventListener("cartUpdated", () => {
      this.updateCartBadge();
    });
  }

  // ==========================================
  // 🔐 ฟังก์ชันจัดการสถานะ Login และ Dropdown Menu
  // ==========================================
  initProfileSystem() {
    const customToken = localStorage.getItem('siam_healthy_user');
    const supabaseToken = localStorage.getItem('sb-qqzgfnjrnenncgxbrqel-auth-token');

    const hasCustomAuth = customToken && customToken !== 'null' && customToken !== 'undefined' && customToken.trim() !== '' && customToken !== '[]' && customToken !== '{}';
    const hasSupabaseAuth = supabaseToken && supabaseToken !== 'null' && supabaseToken !== 'undefined' && supabaseToken !== '[]' && supabaseToken !== '{}';

    const isLoggedIn = hasCustomAuth || hasSupabaseAuth;

    // Set HTML content for Dropdowns (แก้ไขลิงก์ชี้ไปที่ /cart/orders.html)
    const dropdownContent = isLoggedIn ? `
      <a href="/cart/orders.html" class="dropdown-item" style="display: flex; align-items: center; gap: 8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        ดูรายละเอียดคำสั่งซื้อ
      </a>
      <a href="javascript:void(0);" class="dropdown-item logout-btn" style="display: flex; align-items: center; gap: 8px; color: #e11d48;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        ออกจากระบบ
      </a>
    ` : `
      <a href="/login.html" class="dropdown-item" style="display: flex; align-items: center; gap: 8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <polyline points="10 17 15 12 10 7"></polyline>
          <line x1="15" y1="12" x2="3" y2="12"></line>
        </svg>
        เข้าสู่ระบบ / ลงทะเบียน
      </a>
    `;

    const desktopDropdown = this.querySelector('#desktopProfileDropdown');
    const mobileDropdown = this.querySelector('#mobileProfileDropdown');
    
    if (desktopDropdown) desktopDropdown.innerHTML = dropdownContent;
    if (mobileDropdown) mobileDropdown.innerHTML = dropdownContent;

    // Toggle Dropdown Event (Desktop)
    const desktopToggle = this.querySelector('#desktopProfileToggle');
    const desktopContainer = this.querySelector('#desktopProfileContainer');
    
    if (desktopToggle && desktopContainer) {
      desktopToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        desktopContainer.classList.toggle('active');
      });
    }

    // Toggle Dropdown Event (Mobile)
    const mobileToggle = this.querySelector('#mobileProfileToggle');
    const mobileContainer = this.querySelector('#mobileProfileContainer');

    if (mobileToggle && mobileContainer) {
      mobileToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        mobileContainer.classList.toggle('active');
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      if (desktopContainer) desktopContainer.classList.remove('active');
      if (mobileContainer) mobileContainer.classList.remove('active');
    });

    // Logout Handler Function
    const execSwalLogout = () => {
      Swal.fire({
        title: 'ออกจากระบบ?',
        text: 'คุณต้องการออกจากระบบใช่หรือไม่?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#e11d48',
        cancelButtonColor: '#cbd5e1',
        confirmButtonText: 'ออกจากระบบ',
        cancelButtonText: 'ยกเลิก'
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem('siam_healthy_user');
          localStorage.removeItem('sb-qqzgfnjrnenncgxbrqel-auth-token');
          
          Swal.fire({
            icon: 'success',
            title: 'ออกจากระบบสำเร็จ',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            window.location.reload();
          });
        }
      });
    };

    // Bind Logout Event to all logout buttons inside component
    this.querySelectorAll('.logout-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof Swal === 'undefined') {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
          script.onload = () => execSwalLogout();
          document.head.appendChild(script);
        } else {
          execSwalLogout();
        }
      });
    });
  }

  initContactScroll() {
    const contactBtn = this.querySelector('#contactNavBtn');
    if (contactBtn) {
      contactBtn.addEventListener('click', (e) => {
        const targetSection = document.querySelector('contact-section') || document.querySelector('mega-footer');
        if (targetSection) {
          e.preventDefault();
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const btn = this.querySelector("#hamburgerBtn");
          const menu = this.querySelector("#navMenu");
          if (btn) btn.classList.remove("active");
          if (menu) menu.classList.remove("active");
        } else {
          window.location.href = '/index.html#contact';
        }
      });
    }
  }

  updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem("siam_healthy_cart")) || [];
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    this.querySelectorAll(".cart-badge").forEach((badge) => {
      if (totalCount > 0) {
        badge.innerText = totalCount;
        badge.style.display = "flex";
      } else {
        badge.innerText = "";
        badge.style.display = "none";
      }
    });
  }

  initHamburgerMenu() {
    const btn = this.querySelector("#hamburgerBtn");
    const menu = this.querySelector("#navMenu");

    if (btn && menu) {
      btn.addEventListener("click", () => {
        btn.classList.toggle("active");
        menu.classList.toggle("active");
      });

      this.querySelectorAll(".nav-tab, .mobile-icon-link:not(#mobileProfileToggle)").forEach((link) => {
        link.addEventListener("click", () => {
          btn.classList.remove("active");
          menu.classList.remove("active");
        });
      });
    }
  }

  initSearchToggle() {
    const toggleBtn = this.querySelector("#searchToggleBtn");
    const closeBtn = this.querySelector("#searchCloseBtn");
    const overlay = this.querySelector("#searchOverlay");
    const input = this.querySelector("#searchInput");

    const openSearch = () => {
      overlay.classList.add("active");
      setTimeout(() => input.focus(), 150);
    };

    const closeSearch = () => {
      overlay.classList.remove("active");
      input.value = "";
      const results = this.querySelector("#searchResults");
      if (results) {
        results.classList.remove("active");
        results.innerHTML = "";
      }
    };

    if (toggleBtn && overlay && closeBtn) {
      toggleBtn.addEventListener("click", () => {
        if (overlay.classList.contains("active")) {
          closeSearch();
        } else {
          openSearch();
        }
      });
      closeBtn.addEventListener("click", closeSearch);
    }
  }

  initSearchSystem() {
    const input = this.querySelector("#searchInput");
    const resultsContainer = this.querySelector("#searchResults");

    const searchData = [
      // ... (ใส่ข้อมูล searchData 17 รายการ + หมวดหมู่ + บทความ เหมือนเดิม) ...
      { name: "Andicellix (แอนไดเซลลิกซ์)", type: "product", tag: "การได้ยิน, หูอื้อ, หูดับ, เสียงดังในหู, เสียงจิ้งหรีด, บ้านหมุน, เส้นประสาทหู", url: "/shop/product.html?id=1" },
      { name: "Astin (แอสติน)", type: "product", tag: "เบาหวาน, คุมน้ำตาล, ความดัน, ไขมันในเลือด, หัวใจ, หลอดเลือด, ชาปลายมือปลายเท้า", url: "/shop/product.html?id=2" },
      { name: "Back Pro (แบคโปร)", type: "product", tag: "ต่อมลูกหมาก, ต่อมลูกหมากโต, ปัสสาวะบ่อย, ปัสสาวะไม่สุด, สุขภาพเพศชาย, ฮอร์โมนชาย", url: "product.html?id=3" },
      { name: "Black Rhino (แบล็ก ไรโน)", type: "product", tag: "ต่อมลูกหมาก, ฮอร์โมนเพศชาย, สมรรถภาพ, ปัสสาวะแสบขัด, อ่อนเพลีย", url: "product.html?id=4" },
      { name: "Carthisin (คาร์ธิซิน)", type: "product", tag: "กระดูก, ข้อต่อ, ปวดเข่า, ข้อเข่าเสื่อม, น้ำเลี้ยงข้อ, เก๊าท์, กระดูกพรุน", url: "product.html?id=5" },
      { name: "Elsie (เอลซี่)", type: "product", tag: "ผิวหนัง, เชื้อรา, สะเก็ดเงิน, เล็บเปราะ, เชื้อราที่เล็บ, ภูมิคุ้มกันผิว, ผิวอักเสบ", url: "product.html?id=6" },
      { name: "Extera (เอ็กซ์ทีร่า)", type: "product", tag: "ดีท็อกซ์ลำไส้, พยาธิ, ปรสิต, หูด, ติ่งเนื้อ, ท้องผูก, ขับถ่าย, ภูมิคุ้มกัน", url: "product.html?id=7" },
      { name: "Genesis Caps (จินิซิส แคปส์)", type: "product", tag: "การได้ยิน, หูอื้อ, เสียงวิ้งในหู, น้ำในหูไม่เท่ากัน, เวียนหัว, บ้านหมุน, เส้นประสาทหู", url: "product.html?id=8" },
      { name: "Geralox (จีราล็อกซ์)", type: "product", tag: "ริดสีดวงทวาร, ติ่งริดสีดวง, ขับถ่าย, ท้องผูกเรื้อรัง, ลำไส้, ถ่ายเป็นเลือด", url: "product.html?id=9" },
      { name: "Helmina (เฮลมีน่า)", type: "product", tag: "ดีท็อกซ์, ลำไส้, หูดติ่งเนื้อ, พยาธิ, สารพิษตกค้าง, ท้องอืด, ท้องเฟ้อ", url: "product.html?id=10" },
      { name: "Oclarizin (โอคลาริซิน)", type: "product", tag: "ดวงตา, สายตา, ตาพร่ามัว, ตาแห้ง, ต้อกระจก, ต้อหิน, ต้อลม, แสงสีฟ้า", url: "product.html?id=11" },
      { name: "Onix (โอนิกซ์)", type: "product", tag: "ลดน้ำหนัก, กระตุ้นเผาผลาญ, บล็อกแป้ง, บล็อกไขมัน, คุมหิว, เซลลูไลท์, สัดส่วน", url: "product.html?id=12" },
      { name: "Philola (ฟิโลล่า)", type: "product", tag: "ดวงตา, สายตา, ตาพร่ามัว, ตาแห้ง, โรคต้อ, จอประสาทตา, ปวดกระบอกตา", url: "product.html?id=13" },
      { name: "S-Complex (เอส-คอมเพล็กซ์)", type: "product", tag: "ผิวขาวใส, ลดริ้วรอย, ฝ้ากระ, จุดด่างดำ, คอลลาเจน, ยกกระชับหน้า, หน้าเด็ก", url: "product.html?id=14" },
      { name: "T-Chrome (ที-โครม)", type: "product", tag: "ลดน้ำหนัก, ระบบเผาผลาญ, คุมน้ำตาล, เซลลูไลท์, คุมหิว, ลดความอยากอาหาร", url: "product.html?id=15" },
      { name: "Turbine (เทอร์บิน)", type: "product", tag: "ต่อมลูกหมาก, ปัสสาวะ, สุขภาพเพศชาย, สมรรถภาพ, พละกำลัง, ไหลเวียนเลือด", url: "product.html?id=16" },
      { name: "Cartirex (คาร์ติเร็กซ์)", type: "product", tag: "กระดูก, ข้อต่อ, ปวดข้อ, ข้อเข่าเสื่อม, เพิ่มมวลกระดูก, อักเสบข้อ", url: "product.html?id=17" },

      { name: "กระดูกและข้อต่อ", type: "category", tag: "ปวดเข่า, ข้อเข่าเสื่อม, กระดูกเสื่อม, เพิ่มน้ำเลี้ยงข้อ", url: "/shop/?category=bone-immunity" },
      { name: "หัวใจและหลอดเลือด", type: "category", tag: "ความดัน, ไขมันในเลือด, สุขภาพหัวใจ", url: "/shop/?category=blood-sugar" },
      { name: "เบาหวาน", type: "category", tag: "คุมระดับน้ำตาล, อินซูลิน, เบาหวาน", url: "/shop/?category=blood-sugar" },
      { name: "ลดน้ำหนัก", type: "category", tag: "เร่งการเผาผลาญ, คุมหิว, ลดความอ้วน, เซลลูไลท์", url: "/shop/?category=weight-metabolism" },
      { name: "ผิวหนังและเล็บ", type: "category", tag: "บำรุงเซลล์ผิว, เล็บเปราะ, สะเก็ดเงิน, เชื้อรา", url: "/shop/?category=skin-aging" },
      { name: "ดวงตา", type: "category", tag: "ตาแห้ง, ตาพร่ามัว, กรองแสงสีฟ้า, สายตา, โรคต้อ", url: "/shop/?category=eyes-ears" },
      { name: "การได้ยิน", type: "category", tag: "ฟื้นฟูประสาทหู, หูอื้อตามวัย, การได้ยิน, เสียงวิ้งในหู, บ้านหมุน", url: "/shop/?category=eyes-ears" },
      { name: "ลำไส้และการขับถ่าย", type: "category", tag: "ปรับสมดุลจุลินทรีย์, แก้ท้องผูก, ท้องอืด, ลำไส้, ริดสีดวง, ดีท็อกซ์", url: "/shop/?category=gut-digestive" },
      { name: "ความงาม", type: "category", tag: "ผิวกระจ่างใส, ชะลอวัย, ออร่า, สุขภาพผิว, ลดริ้วรอย, ฝ้ากระ", url: "/shop/?category=skin-aging" },
      { name: "สุขภาพเพศชาย", type: "category", tag: "เพิ่มพละกำลัง, ฟื้นฟูกำลัง, สมดุลฮอร์โมนชาย, ต่อมลูกหมาก, ปัสสาวะ", url: "/shop/?category=mens-health" },

      { name: "ลุกก็โอย นั่งก็โอย เจ็บหัวเข่าแปล๊บๆ... สัญญาณข้อเข่าเสื่อม", type: "article", tag: "บทความ, กระดูก, ข้อเข่า, ปวดเข่า, ข้อเสื่อม, ข้อเข่าเสื่อม", url: "/articles/article1.html" },
      { name: "หน้าจอมือถือทำลายดวงตามากกว่าที่คิด วิธีดูแลตาพร่ามัว-ตาแห้งเรื้อรัง", type: "article", tag: "บทความ, ดวงตา, สายตา, ตาพร่ามัว, ตาแห้ง, แสงสีฟ้า", url: "article2.html" },
      { name: "หูอื้อ ฟังไม่ชัด คุยไม่รู้เรื่อง... สัญญาณเตือนประสาทหูเสื่อมตามวัย", type: "article", tag: "บทความ, การได้ยิน, หูอื้อ, ฟังไม่ชัด, ประสาทหูเสื่อม", url: "article3.html" },
      { name: "พฤติกรรมนั่งเล่นมือถือในห้องน้ำ ตัวการกระตุ้นริดสีดวงทวารหนัก", type: "article", tag: "บทความ, ลำไส้, ขับถ่าย, ริดสีดวง, ริดสีดวงทวาร", url: "article4.html" },
      { name: "เช็ก 3 พฤติกรรมยิ่งแก้ ยิ่งท้องผูก! เผยวิธีใหม่ช่วยให้ขับถ่ายง่าย", type: "article", tag: "บทความ, ท้องผูก, ขับถ่าย, ลำไส้, ปรับสมดุลลำไส้, ดีท็อกซ์", url: "article5.html" },
      { name: "ไม่อยากกินยาคุมเบาหวานไปตลอดชีวิต? เผย 5 สมุนไพรธรรมชาติ", type: "article", tag: "บทความ, เบาหวาน, คุมเบาหวาน, คุมน้ำตาล, ลดน้ำตาล", url: "article6.html" },
      { name: "สัญญาณเตือนความดันโลหิตสูง วิธีสังเกตอาการ โดยไม่ต้องใช้เครื่องวัด", type: "article", tag: "บทความ, ความดัน, ความดันโลหิตสูง, หัวใจ, หลอดเลือด", url: "article7.html" },
      { name: "ลดน้ำหนักแบบคนขี้เกียจ 5 เคล็ดลับเบิร์นไขมันเก่า", type: "article", tag: "บทความ, ลดน้ำหนัก, เบิร์นไขมัน, ไขมัน, หุ่นลีน", url: "article8.html" },
      { name: "เสื่อมสมรรถภาพ ปัสสาวะแสบขัด เจาะลึกปัญหาต่อมลูกหมากโต", type: "article", tag: "บทความ, สุขภาพชาย, ต่อมลูกหมาก, ต่อมลูกหมากโต, ปัสสาวะแสบขัด, สมรรถภาพ", url: "article9.html" }
    ];

    if (!input || !resultsContainer) return;

    input.addEventListener("input", (e) => {
      const rawQuery = e.target.value.trim().toLowerCase();

      if (rawQuery.length === 0) {
        resultsContainer.classList.remove("active");
        resultsContainer.innerHTML = "";
        return;
      }

      // 🔹 1. แยกข้อความค้นหาออกเป็น Keywords แต่ละคำ (ตัดช่องว่าง)
      const keywords = rawQuery.split(/\s+/).filter(word => word.length > 0);

      // 🔹 2. ค้นหาแบบ Keyword (ทุก Keyword ต้องมีอยู่ใน name หรือ tag)
      let filtered = searchData.filter((item) => {
        const itemText = `${item.name} ${item.tag}`.toLowerCase();
        
        // เช็กว่าทุกคำที่พิมพ์มา มีปรากฏอยู่ในข้อมูลของชิ้นนั้น ๆ หรือไม่
        return keywords.every(keyword => itemText.includes(keyword));
      });

      // 🔹 3. จัดลำดับผลลัพธ์ (คะแนนความแม่นยำ)
      filtered.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        const getScore = (name, tag) => {
          let score = 0;
          
          // 1. ความสำคัญสูงสุด: ตรงกันเป๊ะ (เช่น พิมพ์ Astin เจอ Astin)
          if (name === rawQuery) {
            score += 1000; 
          } 
          // 2. ความสำคัญรองลงมา: ชื่อขึ้นต้นด้วยคำที่พิมพ์ (พิมพ์ A เจอ Andicellix ก่อน)
          else if (name.startsWith(rawQuery)) {
            score += 500; 
          } 
          // 3. มีคำที่พิมพ์ เป็นส่วนหนึ่งของชื่อสินค้า (พิมพ์ ธิซิน เจอ Carthisin (คาร์ธิซิน))
          else if (name.includes(rawQuery)) {
            score += 100;
          }

          // 4. ตรวจสอบ Keyword ย่อยๆ ในชื่อและ Tag
          keywords.forEach(word => {
            // ถ้า Keyword อยู่ในชื่อสินค้า ให้คะแนนมากกว่า Tag
            if (name.includes(word)) score += 10;
            // ถ้า Keyword อยู่ใน Tag
            if (tag.toLowerCase().includes(word)) score += 3;
          });

          // 5. โบนัส: เรียงตามตัวอักษร หากคะแนนเท่ากัน 
          // (เผื่อพิมพ์ A แล้วเจอ Andicellix กับ Astin จะได้เรียงตาม ABC)
          return score;
        };

        const scoreA = getScore(aName, a.tag);
        const scoreB = getScore(bName, b.tag);

        if (scoreB !== scoreA) {
             return scoreB - scoreA; // เรียงตามคะแนนมากไปน้อย
        } else {
             // ถ้าคะแนนเท่ากัน ให้เรียงตามตัวอักษร (A-Z)
             return aName.localeCompare(bName); 
        }
      });

      // 🔹 4. เรนเดอร์ผลลัพธ์
      if (filtered.length > 0) {
        resultsContainer.innerHTML = filtered
          .map(
            (item) => `
          <a href="${item.url}" class="search-item">
            <span class="item-name">${item.name}</span>
            <span class="item-badge ${item.type}">${
              item.type === "product" ? "สินค้า" : item.type === "article" ? "บทความ" : "หมวดหมู่"
            }</span>
          </a>
        `
          )
          .join("");
      } else {
        resultsContainer.innerHTML = `
          <div class="search-no-result">ไม่พบข้อมูลที่เกี่ยวข้องกับ "${e.target.value}"</div>
        `;
      }

      resultsContainer.classList.add("active");
    });
  }
}

customElements.define("my-header", MyHeader);

window.addEventListener('load', () => {
  if (window.location.hash === '#contact') {
    const targetSection = document.querySelector('contact-section') || document.querySelector('mega-footer');
    if (targetSection) {
      setTimeout(() => {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }
});