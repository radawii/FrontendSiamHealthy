class MyHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="main-header">
        <div class="header-container">
          <a href="../index.html" class="logo-section">
            <span class="brand-name">Siam-Healthy</span>
          </a>

          <!-- ปุ่ม Hamburger Menu สำหรับ Mobile -->
          <button class="hamburger-btn" id="hamburgerBtn" aria-label="Toggle navigation">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <!-- แถบเมนูหลัก -->
          <nav class="nav-menu" id="navMenu">
            <a href="../shop/" class="nav-tab">ผลิตภัณฑ์ทั้งหมด</a>
            <a href="../articles/" class="nav-tab">บทความ</a>
            <a href="#" class="nav-tab">ติดต่อเรา</a>
            <a href="#" class="nav-tab">รถเข็นของคุณ</a>
            <a href="#" class="nav-tab">โปรไฟล์</a>
          </nav>
        </div>
      </header>
    `;

    this.initHamburgerMenu();
  }

  initHamburgerMenu() {
    const btn = this.querySelector('#hamburgerBtn');
    const menu = this.querySelector('#navMenu');

    if (btn && menu) {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        menu.classList.toggle('active');
      });

      // ปิดเมนูเมื่อคลิกลิงก์
      this.querySelectorAll('.nav-tab').forEach(link => {
        link.addEventListener('click', () => {
          btn.classList.remove('active');
          menu.classList.remove('active');
        });
      });
    }
  }
}

customElements.define('my-header', MyHeader);