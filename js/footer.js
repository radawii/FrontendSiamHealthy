class MyFooter extends HTMLElement {
  connectedCallback() {
    if (document.body.classList.contains("kb-site")) {
      const en = document.documentElement.lang === "en",
        locale = en ? "en" : "th";
      this.innerHTML = `<footer class="kb-footer"><div class="kb-container"><div class="kb-footer-top"><div><span class="kb-footer-brand">Siam-Healthy</span><p>${en ? "Explore the ingredients. Understand your wellness." : "รู้จักส่วนผสม เข้าใจการดูแลสุขภาพของคุณ"}</p></div><nav aria-label="${en ? "Footer navigation" : "เมนูส่วนท้าย"}"><a href="/${locale}/ingredients/">${en ? "Ingredient library" : "คลังความรู้ส่วนผสม"}</a><a href="/${locale}/wellness/">${en ? "Wellness topics" : "หัวข้อสุขภาพ"}</a><a href="/shop/">${en ? "Products" : "ผลิตภัณฑ์"}</a></nav></div><div class="kb-footer-bottom">© ${new Date().getFullYear()} Siam-Healthy. ${en ? "All rights reserved." : "สงวนลิขสิทธิ์"}</div></div></footer>`;
      return;
    }

    this.innerHTML = `
      <style>
        .footer {
          background-color: #082d16;
          color: #ffffff;
          padding: 16px 20px;
          text-align: center;
          font-size: 0.8rem;
          font-family: 'Prompt', sans-serif;
        }
        
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px;
        }

        .footer p {
          margin: 0;
          letter-spacing: 0.3px;
          line-height: 1.3;
        }

        /* Responsive สำหรับมือถือ */
        @media screen and (max-width: 576px) {
          .footer {
            padding: 12px 16px;
            margin-top: 20px;
            font-size: 0.78rem;
          }
        }
      </style>

      <footer class="footer">
        <div class="footer-container">
          <p>Copyright © 2026 Siam-Healthy. All rights reserved.</p>
        </div>
      </footer>
    `;
  }
}

// ลงทะเบียน Custom Element
customElements.define("my-footer", MyFooter);
