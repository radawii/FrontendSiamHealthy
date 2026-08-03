class MyFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .footer {
          background-color: #082d16;
          color: #ffffff;
          padding: 32px 20px;
          margin-top: 60px;
          text-align: center;
          font-size: 0.9rem;
          font-family: 'Prompt', sans-serif;
        }
        
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px;
        }

        .footer p {
          margin: 0;
          letter-spacing: 0.5px;
          line-height: 1.5;
        }

        /* Responsive สำหรับมือถือ */
        @media screen and (max-width: 576px) {
          .footer {
            padding: 24px 16px;
            margin-top: 40px;
            font-size: 0.85rem;
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