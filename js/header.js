class MyHeader extends HTMLElement {
  connectedCallback() {
    // วางโค้ด HTML ที่คุณต้องการให้เหมือนกันทุกหน้าไว้ในนี้
    this.innerHTML = `
            <header class="main-header">
                <div class="header-container">
                    <a href="../index.html" class="logo-section">
                        <!-- <svg class="logo-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M12 2s-8 6-8 12c0 4.42 3.58 8 8 8s8-3.58 8-8c0-6-8-12-8-12zm0 18c-3.31 0-6-2.69-6-6 0-3.37 3.19-7.29 6-10.22 2.81 2.93 6 6.85 6 10.22 0 3.31-2.69 6-6 6z" />
                        </svg> -->
                        <span class="brand-name">Siam-Healthy</span>
                    </a>

                    <nav class="nav-menu">
                        <a href="../shop/" class="nav-tab">ผลิตภัณฑ์ทั้งหมด</a>
                        <a href="../articles/" class="nav-tab">บทความ</a>
                        <a href="#" class="nav-tab">ติดต่อเรา</a>
                        <a href="#" class="nav-tab">รถเข็นของคุณ</a>
                        <a href="#" class="nav-tab">โปรไฟล์</a>
                    </nav>
                </div>
            </header>
        `;
  }
}

customElements.define('my-header', MyHeader);