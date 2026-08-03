document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authPanels = document.querySelectorAll('.auth-panel');

    // 1. Tab Switching Logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            authPanels.forEach(panel => panel.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${targetTab}Form`).classList.add('active');
        });
    });

    // 2. Toggle Password Visibility
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Toggle icon opacity/color on show
            btn.style.color = type === 'text' ? '#0f766e' : '#94a3b8';
        });
    });

    // 3. Simple Form Handlers (Replace with your API endpoint calls)
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        console.log('Logging in with:', { email, password });
        // TODO: fetch('/api/login', { method: 'POST', body: JSON.stringify(...) })
    });

    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const phone = document.getElementById('regPhone').value;
        const password = document.getElementById('regPassword').value;

        console.log('Registering user:', { username, email, phone, password });
        // TODO: fetch('/api/register', { method: 'POST', body: JSON.stringify(...) })
    });
});