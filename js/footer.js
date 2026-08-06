class MyFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .footer {
          background-color: #082d16;
          color: #ffffff;
          padding: 16px 20px;
          text-align: center;
          font-size: 0.65rem;
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

        .mobile-break { display: none; }

        @media screen and (max-width: 576px) {
          .mobile-break { display: inline; }
          .footer {
            padding: 12px 16px;
            margin-top: 20px;
            font-size: 0.75rem;
          }
        }
      </style>

      <footer class="footer">
        <div class="footer-container">
          <p>Copyright © 2026 Siam-Healthy.<br class="mobile-break"> All rights reserved.</p>
        </div>
      </footer>
    `;
  }
}

// ลงทะเบียน Custom Element
customElements.define("my-footer", MyFooter);