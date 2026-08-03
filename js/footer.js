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
        
        .footer p {
          margin: 0;
          letter-spacing: 0.5px;
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