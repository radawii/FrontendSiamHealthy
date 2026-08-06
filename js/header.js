class MyHeader extends HTMLElement {
  connectedCallback() {
    this.ensureSweetAlert2();

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

                <!-- Dropdown สำหรับ Mobile -->
                <div class="profile-dropdown-wrapper">
                  <button type="button" class="mobile-icon-link profile-toggle-btn">
                    <div class="icon-wrapper">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <span class="profile-label">โปรไฟล์</span>
                  </button>

                  <div class="profile-menu-dropdown" id="mobileProfileDropdown"></div>
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

              <div class="profile-dropdown-wrapper">
                <button type="button" class="icon-btn profile-btn profile-toggle-btn" title="โปรไฟล์">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>

                <div class="profile-menu-dropdown" id="desktopProfileDropdown"></div>
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
              <input type="text" id="searchInput" placeholder="ค้นหาสินค้า หรือปัญหาสุขภาพ (เช่น ข้อต่อ, สายตา, Elsie)..." autocomplete="off" />
            </div>
            <button class="search-close-btn" id="searchCloseBtn">ปิด</button>
          </div>

          <div class="search-results-container">
            <div class="search-results-dropdown" id="searchResults"></div>
          </div>
        </div>
      </header>
    `;

    this.renderProfileDropdown();
    this.initHamburgerMenu();
    this.initSearchToggle();
    this.initSearchSystem();
    this.initContactScroll();
    this.initProfileMenu();
    this.updateCartBadge();

    window.addEventListener("cartUpdated", () => {
      this.updateCartBadge();
    });

    window.addEventListener("authStateChanged", () => {
      this.renderProfileDropdown();
    });
  }

  // ฟังก์ชันโหลด SweetAlert2 CDN อัตโนมัติ
  ensureSweetAlert2() {
    if (typeof Swal === "undefined" && !document.getElementById("swal2-cdn-script")) {
      const script = document.createElement("script");
      script.id = "swal2-cdn-script";
      script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
      document.head.appendChild(script);
    }
  }

  renderProfileDropdown() {
    const isLoggedIn =
      localStorage.getItem("siam_healthy_is_logged_in") === "true" ||
      sessionStorage.getItem("siam_healthy_is_logged_in") === "true";

    const desktopDropdown = this.querySelector("#desktopProfileDropdown");
    const mobileDropdown = this.querySelector("#mobileProfileDropdown");

    let menuHTML = "";

    if (isLoggedIn) {
      menuHTML = `
        <a href="/cart/orders.html" class="profile-menu-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>ดูประวัติการสั่งซื้อ</span>
        </a>
        <a href="javascript:void(0);" class="profile-menu-item logout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>ลงชื่อออก</span>
        </a>
      `;
    } else {
      menuHTML = `
        <a href="/login.html" class="profile-menu-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          <span>เข้าสู่ระบบ / ลงทะเบียน</span>
        </a>
      `;
    }

    if (desktopDropdown) desktopDropdown.innerHTML = menuHTML;
    if (mobileDropdown) mobileDropdown.innerHTML = menuHTML;

    this.initLogoutHandler();
  }

  initLogoutHandler() {
    const logoutBtns = this.querySelectorAll(".logout-btn");

    logoutBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();

        // ตรวจสอบจนแน่ใจว่า Swal โหลดเสร็จเรียบร้อย
        const triggerSwal = () => {
          Swal.fire({
            icon: "warning",
            title: "ยืนยันการลงชื่อออก",
            text: "คุณต้องการลงชื่อออกจากระบบใช่หรือไม่?",
            showCancelButton: true,
            confirmButtonColor: "#0d5c2e",
            cancelButtonColor: "#64748b",
            confirmButtonText: "ยืนยัน",
            cancelButtonText: "ยกเลิก"
          }).then((result) => {
            if (result.isConfirmed) {
              this.processLogout();
            }
          });
        };

        if (typeof Swal !== "undefined") {
          triggerSwal();
        } else {
          setTimeout(() => {
            if (typeof Swal !== "undefined") {
              triggerSwal();
            } else if (confirm("คุณต้องการลงชื่อออกจากระบบใช่หรือไม่?")) {
              this.processLogout();
            }
          }, 200);
        }
      });
    });
  }

  processLogout() {
    localStorage.removeItem("siam_healthy_user");
    localStorage.removeItem("siam_healthy_is_logged_in");
    sessionStorage.removeItem("siam_healthy_user");
    sessionStorage.removeItem("siam_healthy_is_logged_in");

    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "success",
        title: "ลงชื่อออกสำเร็จ",
        text: "ระบบได้ทำการลงชื่อออกจากบัญชีของคุณเรียบร้อยแล้ว",
        confirmButtonColor: "#0d5c2e",
        timer: 1800,
        showConfirmButton: false
      }).then(() => {
        window.location.href = "/index.html";
      });
    } else {
      window.location.href = "/index.html";
    }
  }

  initProfileMenu() {
    const toggleBtns = this.querySelectorAll(".profile-toggle-btn");

    toggleBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();

        const wrapper = btn.closest(".profile-dropdown-wrapper");
        const dropdown = wrapper ? wrapper.querySelector(".profile-menu-dropdown") : null;

        this.querySelectorAll(".profile-menu-dropdown").forEach((d) => {
          if (d !== dropdown) d.classList.remove("active");
        });

        if (dropdown) {
          dropdown.classList.toggle("active");
        }
      });
    });

    document.addEventListener("click", (e) => {
      this.querySelectorAll(".profile-menu-dropdown.active").forEach((dropdown) => {
        if (!this.contains(e.target)) {
          dropdown.classList.remove("active");
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

      this.querySelectorAll(".nav-tab, a.mobile-icon-link, .profile-menu-item").forEach((link) => {
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
      { name: "Elsie (เอลซี่)", type: "product", tag: "กระดูกและข้อต่อ, ข้อเข่าเสื่อม", url: "/shop/elsie" },
      { name: "Extera (เอ็กซ์เทอร่า)", type: "product", tag: "การได้ยิน, ประสาทหู, หูอื้อ", url: "/shop/extera" },
      { name: "Oclarizin (โอคลาริซิน)", type: "product", tag: "ดวงตา, ตาพร่ามัว, แสงสีฟ้า", url: "/shop/oclarizin" },
      { name: "T-Chrome (ที-โครม)", type: "product", tag: "เบาหวาน, ลดน้ำหนัก, ระบบเผาผลาญ", url: "/shop/tchrome" },
      { name: "ดูแลกระดูกและข้อต่อ", type: "category", tag: "ปัญหากระดูก, ข้อเข่า", url: "/shop?category=joints" },
      { name: "ดูแลดวงตาและสายตา", type: "category", tag: "ปัญหาดวงตา, ตาแห้ง", url: "/shop?category=eyes" },
      { name: "คุมน้ำตาลและเบาหวาน", type: "category", tag: "ปัญหาเบาหวาน, คุมน้ำตาล", url: "/shop?category=diabetes" },
    ];

    if (!input || !resultsContainer) return;

    input.addEventListener("input", (e) => {
      const query = e.target.value.trim().toLowerCase();

      if (query.length === 0) {
        resultsContainer.classList.remove("active");
        resultsContainer.innerHTML = "";
        return;
      }

      const filtered = searchData.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.tag.toLowerCase().includes(query)
      );

      if (filtered.length > 0) {
        resultsContainer.innerHTML = filtered
          .map(
            (item) => `
          <a href="${item.url}" class="search-item">
            <span class="item-name">${item.name}</span>
            <span class="item-badge ${item.type}">${
              item.type === "product" ? "สินค้า" : "หมวดหมู่"
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

window.addEventListener("load", () => {
  if (window.location.hash === "#contact") {
    const targetSection = document.querySelector("contact-section") || document.querySelector("mega-footer");
    if (targetSection) {
      setTimeout(() => {
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    }
  }
});