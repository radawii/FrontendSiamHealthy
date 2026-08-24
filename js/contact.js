class ContactSection extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
      <section class="mega-footer-wrapper">
        <div class="footer-container">
          <div class="footer-grid">
            
            <!-- Column 1: PRODUCTS & DBD -->
            <div class="footer-col">
              <div>
                <h3 class="footer-heading">PRODUCTS</h3>
                <ul class="footer-links" style="column-count: 2; column-gap: 16px;">
                <li><a href="/shop/product.html?id=andicellix">Andicellix</a></li>
                <li><a href="/shop/product.html?id=astin">Astin</a></li>
                <li><a href="/shop/product.html?id=backpro">Back Pro</a></li>
                <li><a href="/shop/product.html?id=blackrhino">Black Rhino</a></li>
                <li><a href="/shop/product.html?id=carthisin">Carthisin</a></li>
                <li><a href="/shop/product.html?id=cartirex">Cartirex</a></li>
                <li><a href="/shop/product.html?id=elsie">Elsie</a></li>
                <li><a href="/shop/product.html?id=extera">Extera</a></li>
                <li><a href="/shop/product.html?id=genesis">Genesis Caps</a></li>
                <li><a href="/shop/product.html?id=geralox">Geralox</a></li>
                <li><a href="/shop/product.html?id=helmina">Helmina</a></li>
                <li><a href="/shop/product.html?id=oclarizin">Oclarizin</a></li>
                <li><a href="/shop/product.html?id=onix">Onix</a></li>
                <li><a href="/shop/product.html?id=philola">Philola</a></li>
                <li><a href="/shop/product.html?id=scomplex">S-Complex</a></li>
                <li><a href="/shop/product.html?id=tchrome">T-Chrome</a></li>
                <li><a href="/shop/product.html?id=turbine">Turbine</a></li>
              </ul>
              </div>
            </div>

            <!-- Column 2: SITEMAP -->
            <div class="footer-col">
              <h3 class="footer-heading">SITEMAP</h3>
              <ul class="footer-links">
                <li><a href="/index.html">หน้าแรก</a></li>
                <li><a href="/shop">ผลิตภัณฑ์ทั้งหมด</a></li>
                <li><a href="/articles">บทความสุขภาพ</a></li>
                <li><a href="/about">เกี่ยวกับเรา</a></li>
                <li><a href="/cart">ตะกร้าสินค้า</a></li>
              </ul>
            </div>

            <!-- Column 3: CONCERNS -->
            <div class="footer-col">
              <h3 class="footer-heading">CONCERNS</h3>
              <ul class="footer-links">
                <li><a href="/shop/?category=eyes-ears">สายตาและการได้ยิน</a></li>
                <li><a href="/shop/?category=mens-health">สุขภาพผู้ชาย</a></li>
                <li><a href="/shop/?category=skin-aging">ผิวพรรณและชะลอวัย</a></li>
                <li><a href="/shop/?category=weight-metabolism">หุ่นและระบบเผาพลาญ</a></li>
                <li><a href="/shop/?category=gut-digestive">ลำไส้และการขับถ่าย</a></li>
                <li><a href="/shop/?category=bone-immunity">กระดูก ข้อ และภูมิคุ้มกัน</a></li>
                <li><a href="/shop/?category=blood-sugar">ระบบหัวใจและหลอดเลือด</a></li>
              </ul>
            </div>

            <!-- Column 4: CONTACT TABS -->
            <div class="footer-col">
              
              <div class="contact-header-wrap">
                <h3>ช่องทางติดต่อและสั่งซื้อ</h3>
                <p>เลือกช่องทางที่คุณสะดวก เพื่อรับคำปรึกษาหรือสั่งซื้อสินค้าได้ทันที</p>
              </div>

              <div class="contact-tabs-container">
                
                <!-- 1. LINE Official -->
                <a href="https://lin.ee/i0aQZCJ" target="_blank" class="contact-tab tab-line">
                  <div class="tab-icon">
                    <svg viewBox="0 0 512 512" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2">
                      <path d="M506 102.186v307.628C506 462.9 462.9 506 409.814 506H102.186C49.1 506 6 462.9 6 409.814V102.186C6 49.1 49.1 6 102.186 6h307.628C462.9 6 506 49.1 506 102.186z" fill="#06c755"/>
                      <path d="M422.656 232.437c0-74.593-74.781-135.28-166.703-135.28S89.25 157.843 89.25 232.436c0 66.875 59.375 122.891 139.406 133.47 5.438 1.171 12.828 3.577 14.688 8.218 1.687 4.219 1.11 10.828.547 15.078 0 0-1.953 11.766-2.375 14.266-.735 4.218-3.36 16.484 14.437 9 17.797-7.485 96-56.531 130.969-96.797 24.156-26.485 35.734-53.422 35.734-83.235z" fill="#fff" fill-rule="nonzero"/>
                      <path d="M367.188 275.516h-46.875a3.14 3.14 0 01-3.125-3.125v-72.735a3.14 3.14 0 013.125-3.125h46.875a3.14 3.14 0 013.125 3.125v11.828a3.14 3.14 0 01-3.125 3.125h-31.829v12.266h31.829a3.14 3.14 0 013.125 3.125v11.938a3.14 3.14 0 01-3.125 3.125h-31.829v12.28h31.829a3.14 3.14 0 013.125 3.126v11.812l.001.11a3.14 3.14 0 01-3.125 3.125h-.001zM193.953 275.516a3.14 3.14 0 003.125-3.125v-11.813a3.14 3.14 0 00-3.125-3.125h-31.828v-57.812a3.14 3.14 0 00-3.125-3.125h-11.875A3.14 3.14 0 00144 199.64v72.703a3.14 3.14 0 003.125 3.125H194l-.047.047z" fill="#06c755" fill-rule="nonzero"/>
                      <path d="M225.328 199.11v73.685a2.721 2.721 0 01-2.72 2.72H209.86a2.721 2.721 0 01-2.72-2.72v-73.684a2.721 2.721 0 012.72-2.72h12.747a2.721 2.721 0 012.72 2.72z" fill="#06c755"/>
                      <path d="M302.625 196.39h-11.813a3.14 3.14 0 00-3.125 3.126v43.218l-33.28-44.953a1.922 1.922 0 00-.266-.328l-.188-.187-.172-.141h-.093l-.172-.125h-.094l-.172-.094h-13.234a3.14 3.14 0 00-3.125 3.125v72.75a3.14 3.14 0 003.125 3.125h11.828a3.14 3.14 0 003.125-3.125v-43.64l33.328 45c.219.318.494.593.812.812l.188.125h.094l.156.078h.484c.277.069.56.105.844.11h11.75a3.14 3.14 0 003.125-3.125v-72.563-.062a3.14 3.14 0 00-3.125-3.125z" fill="#06c755" fill-rule="nonzero"/>
                    </svg>
                  </div>
                  <div class="tab-info">
                    <h4>LINE Official</h4>
                    <p>ส่วนลดราคาพิเศษ / พูดคุยกับแอดมินโดยตรง</p>
                    <span class="tab-cta">เพิ่มเพื่อน</span>
                  </div>
                </a>

                <!-- 2. Facebook Page -->
                <a href="https://www.facebook.com/AscenderThailand/" target="_blank" class="contact-tab tab-fb">
                  <div class="tab-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </div>
                  <div class="tab-info">
                    <h4>Facebook Page</h4>
                    <p>สอบถามข้อมูลโปรโมชั่น / ติดตามข่าวสาร</p>
                    <span class="tab-cta">ส่งข้อความ</span>
                  </div>
                </a>

                <!-- 3. TikTok -->
                <a href="https://www.tiktok.com/@siam_healthy?is_from_webapp=1&sender_device=pc" target="_blank" class="contact-tab tab-tk">
                  <div class="tab-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.13 4.41-2.91 5.68-1.85 1.34-4.4 1.62-6.57.82-2.12-.76-3.86-2.5-4.42-4.66-.54-2.16-.06-4.63 1.34-6.37 1.39-1.74 3.73-2.6 5.92-2.34v4.06c-1.39-.12-2.88.4-3.6 1.57-.69 1.1-.42 2.75.56 3.56 1.09.89 2.94.94 4.09.13 1.19-.84 1.58-2.39 1.56-3.8V.02z"/></svg>
                  </div>
                  <div class="tab-info">
                    <h4>TikTok Video & Live</h4>
                    <p>รับชมรีวิวไลฟ์ประจำวัน / สาระสุขภาพ</p>
                    <span class="tab-cta">เยี่ยมชม TikTok</span>
                  </div>
                </a>

                <!-- 4. Shopee -->
                <a href="https://s.shopee.co.th/80BTRyG09q" target="_blank" class="contact-tab tab-sp">
                  <div class="tab-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                  </div>
                  <div class="tab-info">
                    <h4>Shopee Official Store</h4>
                    <p>เก็บโค้ดส่วนลด / จัดส่งฟรีทั่วไทย</p>
                    <span class="tab-cta">Shop Now</span>
                  </div>
                </a>

                <!-- 5. Customer Support -->
                <a href="tel:0955303986" class="contact-tab tab-cs">
                  <div class="tab-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </div>
                  <div class="tab-info">
                    <h4>Customer Support</h4>
                    <p>บริการหลังการขาย จ-ศ 09:00 - 18:00 น.</p>
                    <span class="tab-cta">ปรึกษาฟรี 095-5303986</span>
                  </div>
                </a>

              </div>
            </div>

          </div>
        </div>
      </section>
    `;
    }
}

customElements.define("contact-section", ContactSection);
