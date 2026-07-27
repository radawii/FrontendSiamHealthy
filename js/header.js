class MyHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="main-header">
        <div class="header-container">
          <!-- Logo ฝั่งซ้าย -->
          <a href="../index.html" class="logo-section">
            <span class="brand-name">Siam-Healthy</span>
          </a>

          <!-- กลุ่มฝั่งขวา -->
          <div class="header-right-actions">
            <!-- Nav Menu (Desktop แสดงข้อความ / Mobile เปิดผ่าน Hamburger) -->
            <nav class="nav-menu" id="navMenu">
              <a href="../shop/" class="nav-tab">ผลิตภัณฑ์ทั้งหมด</a>
              <a href="../articles/" class="nav-tab">บทความ</a>
              <a href="#" class="nav-tab">ติดต่อเรา</a>

              <!-- ไอคอนที่จะแสดงด้านในเมนูเบอร์เกอร์ เฉพาะบน Mobile -->
              <div class="mobile-nav-icons">
                <a href="#" class="mobile-icon-link">
                  <div class="icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <span class="cart-badge">2</span>
                  </div>
                  <span>รถเข็นของคุณ</span>
                </a>

                <a href="#" class="mobile-icon-link">
                  <div class="icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <span>โปรไฟล์</span>
                </a>
              </div>
            </nav>

            <!-- 1. Search Icon Button (แสดงไว้ข้างนอกตลอดเพื่อกดค้นหาสินค้าได้เร็ว) -->
            <button class="icon-btn search-toggle-btn" id="searchToggleBtn" title="ค้นหา" aria-label="Toggle Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            <!-- กลุ่มไอคอนบน Desktop เท่านั้น -->
            <div class="desktop-action-icons">
              <a href="#" class="icon-btn cart-btn" title="รถเข็นของคุณ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span class="cart-badge">2</span>
              </a>

              <a href="#" class="icon-btn profile-btn" title="โปรไฟล์">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </a>
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
              <input type="text" id="searchInput" placeholder="ค้นหาสินค้า หรือปัญหาสุขภาพ (เช่น ข้อต่อ, สายตา, Elsie)..." autocomplete="off" />
            </div>
            <button class="search-close-btn" id="searchCloseBtn">ปิด</button>
          </div>

          <!-- Live Results Dropdown -->
          <div class="search-results-container">
            <div class="search-results-dropdown" id="searchResults"></div>
          </div>
        </div>
      </header>
    `;

    this.initHamburgerMenu();
    this.initSearchToggle();
    this.initSearchSystem();
  }

  initHamburgerMenu() {
    const btn = this.querySelector('#hamburgerBtn');
    const menu = this.querySelector('#navMenu');

    if (btn && menu) {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        menu.classList.toggle('active');
      });

      this.querySelectorAll('.nav-tab, .mobile-icon-link').forEach(link => {
        link.addEventListener('click', () => {
          btn.classList.remove('active');
          menu.classList.remove('active');
        });
      });
    }
  }

  initSearchToggle() {
    const toggleBtn = this.querySelector('#searchToggleBtn');
    const closeBtn = this.querySelector('#searchCloseBtn');
    const overlay = this.querySelector('#searchOverlay');
    const input = this.querySelector('#searchInput');

    const openSearch = () => {
      overlay.classList.add('active');
      setTimeout(() => input.focus(), 150);
    };

    const closeSearch = () => {
      overlay.classList.remove('active');
      input.value = '';
      const results = this.querySelector('#searchResults');
      if (results) {
        results.classList.remove('active');
        results.innerHTML = '';
      }
    };

    if (toggleBtn && overlay && closeBtn) {
      toggleBtn.addEventListener('click', () => {
        if (overlay.classList.contains('active')) {
          closeSearch();
        } else {
          openSearch();
        }
      });

      closeBtn.addEventListener('click', closeSearch);
    }
  }

  initSearchSystem() {
    const input = this.querySelector('#searchInput');
    const resultsContainer = this.querySelector('#searchResults');

    const searchData = [
      { name: 'Elsie (เอลซี่)', type: 'product', tag: 'กระดูกและข้อต่อ, ข้อเข่าเสื่อม', url: '../shop/elsie' },
      { name: 'Extera (เอ็กซ์เทอร่า)', type: 'product', tag: 'การได้ยิน, ประสาทหู, หูอื้อ', url: '../shop/extera' },
      { name: 'Oclarizin (โอคลาริซิน)', type: 'product', tag: 'ดวงตา, ตาพร่ามัว, แสงสีฟ้า', url: '../shop/oclarizin' },
      { name: 'T-Chrome (ที-โครม)', type: 'product', tag: 'เบาหวาน, ลดน้ำหนัก, ระบบเผาผลาญ', url: '../shop/tchrome' },
      { name: 'ดูแลกระดูกและข้อต่อ', type: 'category', tag: 'ปัญหากระดูก, ข้อเข่า', url: '../shop?category=joints' },
      { name: 'ดูแลดวงตาและสายตา', type: 'category', tag: 'ปัญหาดวงตา, ตาแห้ง', url: '../shop?category=eyes' },
      { name: 'คุมน้ำตาลและเบาหวาน', type: 'category', tag: 'ปัญหาเบาหวาน, คุมน้ำตาล', url: '../shop?category=diabetes' }
    ];

    if (!input || !resultsContainer) return;

    input.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();

      if (query.length === 0) {
        resultsContainer.classList.remove('active');
        resultsContainer.innerHTML = '';
        return;
      }

      const filtered = searchData.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.tag.toLowerCase().includes(query)
      );

      if (filtered.length > 0) {
        resultsContainer.innerHTML = filtered.map(item => `
          <a href="${item.url}" class="search-item">
            <span class="item-name">${item.name}</span>
            <span class="item-badge ${item.type}">${item.type === 'product' ? 'สินค้า' : 'หมวดหมู่'}</span>
          </a>
        `).join('');
      } else {
        resultsContainer.innerHTML = `
          <div class="search-no-result">ไม่พบข้อมูลที่เกี่ยวข้องกับ "${e.target.value}"</div>
        `;
      }

      resultsContainer.classList.add('active');
    });
  }
}

customElements.define('my-header', MyHeader);