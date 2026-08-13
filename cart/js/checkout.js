// js/checkout.js

window.savedAddresses = [];
window.currentAddress = null;

document.addEventListener('DOMContentLoaded', () => {
    // 🛠️ 1. เช็คว่าถ้าเด้งกลับมาจากการแสกน PromptPay สำเร็จ ให้แสดงใบเสร็จ
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
        handleSuccessfulRedirectReturn();
        return; 
    }

    loadSavedAddresses();
    
    const addAddressBtn = document.getElementById('add-new-address-btn');
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', () => {
            showAddressForm();
        });
    }

    // ดักจับการเปลี่ยนช่องทางชำระเงินเพื่อเคลียร์ UI
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updatePaymentUI(e.target.value);
        });
    });
});

// ฟังก์ชันจัดการตอนเด้งกลับมาจากหน้า QR Code Stripe
function handleSuccessfulRedirectReturn() {
    // 🧹 ล้าง Session การจ่ายเงินที่ค้างอยู่ทิ้งเมื่อจ่ายสำเร็จ
    localStorage.removeItem('siam_healthy_payment_session');

    const cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
    const selectedItems = cart.filter(i => i.selected);
    
    if (selectedItems.length > 0) {
        const remainingCart = cart.filter(i => !i.selected);
        const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = subtotal > 0 ? 100 : 0; 
        const grandTotal = Math.max(0, subtotal - discount);

        localStorage.setItem('siam_healthy_cart', JSON.stringify(remainingCart));
        
        const savedAddress = localStorage.getItem('siam_healthy_last_address');
        if (savedAddress) {
            window.currentAddress = JSON.parse(savedAddress);
        }

        Swal.fire({
            icon: 'success',
            title: 'ชำระเงินสำเร็จ!',
            text: 'ระบบได้รับยอดชำระของคุณและส่งอีเมลยืนยันเรียบร้อยแล้ว',
            confirmButtonColor: '#0f766e'
        }).then(() => {
            window.history.replaceState({}, document.title, window.location.pathname);
            showReceiptModal('promptpay', selectedItems, subtotal, discount, grandTotal);
        });
    } else {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

function maskPhone(phone) {
    if (!phone) return '';
    phone = phone.replace(/\D/g, '');
    if (phone.length >= 8) {
        return phone.substring(0, 3) + '-XXX-' + phone.substring(phone.length - 4);
    }
    return phone;
}

function buildFullAddress(addr) {
    let parts = [];
    if(addr.houseNo) parts.push(`เลขที่ ${addr.houseNo}`);
    if(addr.moo) parts.push(`หมู่ที่ ${addr.moo}`);
    if(addr.village) parts.push(`หมู่บ้าน ${addr.village}`);
    if(addr.soi) parts.push(`ซอย ${addr.soi}`);
    if(addr.road) parts.push(`ถนน ${addr.road}`);
    if(addr.subdistrict) parts.push(`ต.${addr.subdistrict}`);
    if(addr.district) parts.push(`อ.${addr.district}`);
    if(addr.province) parts.push(`จ.${addr.province}`);
    if(addr.zipcode) parts.push(`${addr.zipcode}`);
    return parts.join(' ');
}

function loadSavedAddresses() {
    const stored = localStorage.getItem('siam_healthy_addresses');
    if (stored) {
        window.savedAddresses = JSON.parse(stored);
    } else {
        window.savedAddresses = [];
    }
}

function renderSavedAddresses() {
    const viewContainer = document.getElementById('saved-addresses-view');
    const container = document.getElementById('saved-addresses-container');
    const formContainer = document.getElementById('new-address-form-container');
    
    if (!container) return;
    container.innerHTML = '';

    if (window.savedAddresses.length > 0) {
        window.savedAddresses.forEach((addr, index) => {
            const isSelected = (window.currentAddress && window.currentAddress.id === addr.id) || (!window.currentAddress && index === 0);
            if(isSelected && !window.currentAddress) window.currentAddress = addr;

            const card = document.createElement('label');
            card.className = `address-card ${isSelected ? 'selected' : ''}`;
            
            const displayAddress = buildFullAddress(addr);
            const displayPhone = maskPhone(addr.phone);

            card.innerHTML = `
                <input type="radio" name="selectedAddress" value="${addr.id}" ${isSelected ? 'checked' : ''} style="margin-top: 4px;" onchange="selectAddress('${addr.id}')">
                <div class="address-info">
                    <h4>${addr.fullname} <span style="font-weight:400; color:var(--text-muted);">${displayPhone}</span></h4>
                    <p>${displayAddress}</p>
                </div>
            `;
            container.appendChild(card);
        });

        if (viewContainer) viewContainer.style.display = 'block';
        if (formContainer) formContainer.style.display = 'none';
    } else {
        if (viewContainer) viewContainer.style.display = 'none';
        if (formContainer) formContainer.style.display = 'block';
    }
}

function showAddressForm() {
    const viewContainer = document.getElementById('saved-addresses-view');
    const formContainer = document.getElementById('new-address-form-container');

    if (viewContainer) viewContainer.style.display = 'none';
    if (formContainer) formContainer.style.display = 'block';

    const form = document.getElementById('shipping-form');
    if (form) form.reset();
    
    window.currentAddress = null; 
}

function cancelAddressForm() {
    if (window.savedAddresses.length > 0) {
        renderSavedAddresses();
    } else {
        goToTypeStep(1); 
    }
}

function selectAddress(id) {
    window.currentAddress = window.savedAddresses.find(a => a.id === id);
    document.querySelectorAll('.address-card').forEach(card => {
        card.classList.remove('selected');
        if(card.querySelector('input').value === id) {
            card.classList.add('selected');
        }
    });
}

function useSelectedAddressAndGoToStep3() {
    if (!window.currentAddress) {
        Swal.fire('แจ้งเตือน', 'กรุณาเลือกที่อยู่สำหรับจัดส่ง', 'warning');
        return;
    }
    updateShippingSummaryUI();
    goToTypeStep(3);
}

function validateAndGoToStep3() {
    const form = document.getElementById('shipping-form');
    
    if (form && form.checkValidity()) {
        const newAddress = {
            id: 'addr_' + Date.now(),
            fullname: document.getElementById('fullname').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            zipcode: document.getElementById('zipcode').value.trim(),
            province: document.getElementById('province').value.trim(),
            district: document.getElementById('district').value.trim(),
            subdistrict: document.getElementById('subdistrict').value.trim(),
            houseNo: document.getElementById('houseNo').value.trim(),
            moo: document.getElementById('moo').value.trim(),
            village: document.getElementById('village').value.trim(),
            soi: document.getElementById('soi').value.trim(),
            road: document.getElementById('road').value.trim()
        };

        const isSaveChecked = document.getElementById('saveAddressCheckbox') ? document.getElementById('saveAddressCheckbox').checked : true;
        window.currentAddress = newAddress;

        if (isSaveChecked) {
            window.savedAddresses.push(newAddress);
            localStorage.setItem('siam_healthy_addresses', JSON.stringify(window.savedAddresses));
            
            Swal.fire({
                icon: 'success',
                title: 'บันทึกที่อยู่สำเร็จ',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                renderSavedAddresses();
                updateShippingSummaryUI();
                goToTypeStep(3);
            });
        } else {
            updateShippingSummaryUI();
            goToTypeStep(3);
        }
    } else if (form) {
        form.reportValidity();
    }
}

function updateShippingSummaryUI() {
    const summaryBox = document.getElementById('summaryAddressText');
    if (summaryBox && window.currentAddress) {
        const displayAddress = buildFullAddress(window.currentAddress);
        summaryBox.innerHTML = `
            <div style="font-weight: 600; color: var(--text-heading); font-size: 0.95rem; margin-bottom: 6px;">
                ${window.currentAddress.fullname} <span style="font-weight: 400; color: var(--text-muted); margin: 0 8px;">|</span> <span style="font-weight: 400; color: var(--text-dark);">${window.currentAddress.phone}</span>
            </div>
            <div style="color: var(--text-dark); margin-bottom: 4px; line-height: 1.6; font-size: 0.88rem;">
                ${displayAddress}
            </div>
        `;
    }
}

function updatePaymentUI(method) {
    const container = document.getElementById('creditCardFormContainer');
    if (container) {
        container.style.display = 'none'; 
        container.innerHTML = '';
    }
    const originalCheckoutBtn = document.getElementById('checkoutBtn');
    if (originalCheckoutBtn) {
        originalCheckoutBtn.style.display = 'block'; 
    }
}

// 🟢 ฟังก์ชันช่วยดึง Stripe Publishable Key จาก Backend สำรองไว้
async function fetchStripePublishableKey() {
    try {
        const res = await fetch('http://localhost:3000/payments/config');
        if (res.ok) {
            const data = await res.json();
            return data.publishableKey || data.stripePublicKey || data.key || null;
        }
    } catch (e) {
        console.warn('ไม่สามารถดึง Stripe Config จาก /payments/config ได้', e);
    }
    return null;
}

// 🚀 ฟังก์ชันหลักเมื่อกดปุ่ม "ยืนยันการชำระเงิน"
async function processPayment() {
    const paymentInputs = document.querySelectorAll('input[name="paymentMethod"]:checked');
    const selectedPayment = paymentInputs.length > 0 ? paymentInputs[0].value : 'promptpay';
    
    const cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
    const selectedItems = cart.filter(i => i.selected);

    if (selectedItems.length === 0) {
        Swal.fire('ข้อผิดพลาด', 'ไม่มีสินค้าที่เลือกในตะกร้า', 'warning');
        return;
    }

    const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal > 0 ? 100 : 0; 
    const grandTotal = Math.max(0, subtotal - discount);

    let userId = null;
    let userEmail = ''; 
    
    // 🟢 1. พยายามดึงข้อมูล User จาก Local Storage
    try {
        const storedUser = localStorage.getItem('siam_healthy_user');
        if (storedUser && storedUser !== 'login_success_token') {
            const parsedUser = JSON.parse(storedUser);
            userEmail = parsedUser.email || '';
            userId = parsedUser.id || parsedUser.username || null;
        }

        if (!userEmail) {
            const supabaseAuth = localStorage.getItem('sb-qqzgfnjrnenncgxbrqel-auth-token');
            if (supabaseAuth) {
                const parsedAuth = JSON.parse(supabaseAuth);
                userId = parsedAuth.user?.id || userId;
                userEmail = parsedAuth.user?.email || userEmail; 
            }
        }
    } catch (e) {
        console.warn("ไม่สามารถดึงข้อมูล User ID / Email ได้", e);
    }

    // 🟢 2. ดึงจาก Cache เก่า
    if (!userEmail) {
        userEmail = localStorage.getItem('siam_healthy_customer_email') || '';
    }

    // 🟢 3. ถ้าดึงจากระบบไม่ได้ ให้ถามลูกค้า
    if (!userEmail) {
        const { value: emailInput } = await Swal.fire({
            title: 'กรุณาระบุอีเมล',
            text: 'เพื่อใช้สำหรับส่งใบเสร็จรับเงิน',
            input: 'email',
            inputPlaceholder: 'example@email.com',
            showCancelButton: true,
            confirmButtonText: 'ยืนยันชำระเงิน',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#0f766e',
            cancelButtonColor: '#cbd5e1'
        });

        if (!emailInput) {
            return; 
        }
        userEmail = emailInput;
        localStorage.setItem('siam_healthy_customer_email', userEmail);
    }

    Swal.fire({
        title: 'กำลังเตรียมระบบชำระเงิน...',
        html: 'กรุณารอสักครู่ ระบบกำลังเปิดหน้าต่างชำระเงิน',
        allowOutsideClick: false,
        showConfirmButton: false, 
        didOpen: () => { Swal.showLoading(); }
    });

    // 🟢 เช็ค Cache Session เดิมที่ยังไม่หมดอายุ (15 นาที)
    const savedSessionStr = localStorage.getItem('siam_healthy_payment_session');
    if (savedSessionStr) {
        const savedSession = JSON.parse(savedSessionStr);
        const isNotExpired = (Date.now() - savedSession.timestamp) < (15 * 60 * 1000); 

        if (isNotExpired && savedSession.grandTotal === grandTotal && savedSession.paymentMethod === selectedPayment) {
            console.log("🔄 Re-using active payment session...");
            
            // 🛠️ ดึง Key สำรองกรณีใน Session ไม่มี
            let pubKey = savedSession.publishableKey;
            if (!pubKey) {
                pubKey = await fetchStripePublishableKey();
            }

            initStripePayment(
                savedSession.clientSecret, 
                pubKey, 
                savedSession.orderId, 
                selectedPayment, 
                cart, 
                selectedItems, 
                subtotal, 
                discount, 
                grandTotal,
                userEmail 
            );
            return; 
        } else {
            localStorage.removeItem('siam_healthy_payment_session');
        }
    }

    try {
        if (window.currentAddress) {
            localStorage.setItem('siam_healthy_last_address', JSON.stringify(window.currentAddress));
        }

        const orderResponse = await fetch('http://localhost:3000/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId || userEmail || null, 
                total_amount: subtotal,
                discount_amount: discount,
                shipping_fee: 0,
                grand_total: grandTotal,
                payment_method: selectedPayment,
                order_status: 'PENDING',
                payment_status: 'PENDING',
                shipping_address: window.currentAddress,
                items: selectedItems.map(item => ({
                    product_id: Number(item.id || item.product_id) || 1,
                    product_name: item.name || item.product_name,
                    price: Number(item.price),
                    quantity: Number(item.quantity)
                }))
            })
        });

        const orderResult = await orderResponse.json();
        if (!orderResponse.ok || !orderResult.order_id) {
            throw new Error(orderResult.message || 'ไม่สามารถสร้างออเดอร์ในระบบได้');
        }

        const createdOrderId = orderResult.order_id;

        if (selectedPayment === 'cod') {
            Swal.close();
            const remainingCart = cart.filter(i => !i.selected);
            localStorage.setItem('siam_healthy_cart', JSON.stringify(remainingCart));
            showReceiptModal('cod', selectedItems, subtotal, discount, grandTotal);
            return;
        }

        const paymentType = (selectedPayment === 'promptpay') ? 'promptpay' : 'card';
        const paymentIntentRes = await fetch(`http://localhost:3000/payments/create-payment-intent/${createdOrderId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                paymentMethodType: paymentType,
                email: userEmail 
            })
        });

        const intentData = await paymentIntentRes.json();
        if (!paymentIntentRes.ok || !intentData.clientSecret) {
            throw new Error(intentData.message || 'ไม่สามารถสร้าง PaymentIntent ได้');
        }

        // 🟢 🛠️ ดักจับ Publishable Key: ถ้าคีย์ที่คืนกลับมาไม่มี ให้ยิงไปดึงจาก config สำรองทันที
        let stripePublishableKey = intentData.publishableKey || intentData.stripePublicKey;
        if (!stripePublishableKey) {
            stripePublishableKey = await fetchStripePublishableKey();
        }

        // 🟢 บันทึก Cache ลง LocalStorage
        localStorage.setItem('siam_healthy_payment_session', JSON.stringify({
            orderId: createdOrderId,
            clientSecret: intentData.clientSecret,
            publishableKey: stripePublishableKey,
            grandTotal: grandTotal,
            paymentMethod: selectedPayment,
            timestamp: Date.now()
        }));

        initStripePayment(
            intentData.clientSecret, 
            stripePublishableKey, 
            createdOrderId, 
            selectedPayment, 
            cart, 
            selectedItems, 
            subtotal, 
            discount, 
            grandTotal,
            userEmail 
        );

    } catch (error) {
        console.error('Payment Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: error.message || 'ไม่สามารถเชื่อมต่อระบบชำระเงินได้',
            confirmButtonColor: '#0f766e'
        });
    }
}

// 💳 ฟังก์ชันเรียกใช้ Stripe
function initStripePayment(clientSecret, publishableKey, orderId, paymentType, cart, selectedItems, subtotal, discount, grandTotal, userEmail) {
    if (!publishableKey) {
        Swal.fire({
            icon: 'error',
            title: 'ข้อผิดพลาด',
            text: 'ไม่พบ Stripe Publishable Key จากระบบ (กรุณาเช็คการตั้งค่า STRIPE_PUBLISHABLE_KEY ใน .env ของ Backend)',
            confirmButtonColor: '#0f766e'
        });
        return;
    }

    const stripe = Stripe(publishableKey);

    // 🚀 กรณีที่ 1: ลูกค้าเลือก PromptPay (สแกน QR Code)
    if (paymentType === 'promptpay') {
        Swal.update({
            title: 'กำลังโหลด QR Code...',
            html: 'กรุณารอสักครู่ ระบบกำลังเปิดหน้าจอชำระเงิน',
            showConfirmButton: false 
        });

        setTimeout(() => {
            Swal.close(); 
            stripe.confirmPromptPayPayment(clientSecret, {
                payment_method: {
                    billing_details: {
                        name: window.currentAddress?.fullname || 'Siam-Healthy Customer',
                        email: userEmail || 'customer@siam-healthy.com' 
                    }
                },
                return_url: window.location.href.split('?')[0] + `?payment=success&order_id=${orderId}`
            }).then(({ error }) => {
                if (error) {
                    Swal.fire('ชำระเงินไม่สำเร็จ', error.message, 'error');
                    localStorage.removeItem('siam_healthy_payment_session');
                }
            });
        }, 800); 
        
        return; 
    }

    // 💳 กรณีที่ 2: ลูกค้าเลือกบัตรเครดิต
    Swal.close(); 
    
    const elements = stripe.elements({ 
        clientSecret,
        appearance: { theme: 'stripe' }
    });
    
    const paymentElementOptions = {
        defaultValues: {
            billingDetails: {
                name: window.currentAddress?.fullname || '',
                email: userEmail || ''
            }
        }
    };
    
    const paymentElement = elements.create('payment', paymentElementOptions);
    
    const container = document.getElementById('creditCardFormContainer');
    if (!container) return;
    
    container.style.display = 'block';
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <p style="font-weight: 600; color: #0f766e; margin: 0;">ชำระเงินผ่านบัตรเครดิต/เดบิต</p>
            <span style="font-size: 0.75rem; color: #64748b;">(ปลอดภัยด้วย Stripe)</span>
        </div>
        <div id="stripe-payment-element" style="margin-bottom: 15px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;"></div>
        <button type="button" id="confirmStripePaymentBtn" class="checkout-btn" style="width: 100%; background: #0f766e; color: white; padding: 12px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600;">
            ยืนยันและชำระเงิน ฿${grandTotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}
        </button>
    `;

    paymentElement.mount('#stripe-payment-element');

    const originalCheckoutBtn = document.getElementById('checkoutBtn');
    if (originalCheckoutBtn) originalCheckoutBtn.style.display = 'none';

    container.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const confirmBtn = document.getElementById('confirmStripePaymentBtn');
    confirmBtn.onclick = async () => {
        Swal.fire({
            title: 'กำลังดำเนินการตัดเงิน...',
            html: 'กรุณารอสักครู่ ห้ามปิดหน้าต่างนี้',
            allowOutsideClick: false,
            showConfirmButton: false, 
            didOpen: () => { Swal.showLoading(); }
        });

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href.split('?')[0] + `?payment=success&order_id=${orderId}`,
                receipt_email: userEmail || undefined, 
            },
        });

        if (error) {
            Swal.fire('ชำระเงินไม่สำเร็จ', error.message, 'error');
            localStorage.removeItem('siam_healthy_payment_session');
        } else {
            localStorage.removeItem('siam_healthy_payment_session');
            const remainingCart = cart.filter(i => !i.selected);
            localStorage.setItem('siam_healthy_cart', JSON.stringify(remainingCart));

            Swal.fire({
                icon: 'success',
                title: 'ชำระเงินสำเร็จ!',
                text: 'ระบบได้รับยอดชำระผ่านบัตรเครดิตและส่งอีเมลยืนยันเรียบร้อยแล้ว',
                confirmButtonColor: '#0f766e'
            }).then(() => {
                showReceiptModal('credit', selectedItems, subtotal, discount, grandTotal);
            });
        }
    };
}

// 🧾 ฟังก์ชันแสดงใบเสร็จรับเงิน
function showReceiptModal(paymentMethod = 'promptpay', items = [], subtotal = 0, discount = 0, grandTotal = 0) {
    const receiptPaper = document.getElementById('receiptPaper');
    if (receiptPaper && window.currentAddress) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const orderNo = 'SH-' + Date.now().toString().slice(-6);
        const displayAddress = buildFullAddress(window.currentAddress);

        let paymentStr = '';
        if (paymentMethod === 'promptpay') paymentStr = 'สแกน QR Code / พร้อมเพย์';
        else if (paymentMethod === 'credit' || paymentMethod === 'card' || paymentMethod === 'stripe') paymentStr = 'บัตรเครดิต / Stripe';
        else paymentStr = 'เก็บเงินปลายทาง (COD)';

        receiptPaper.innerHTML = `
            <div style="text-align: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 10px; margin-bottom: 12px;">
                <strong style="font-size: 1.1rem;">Siam-Healthy Official</strong><br>
                <span style="font-size: 0.8rem; color: #64748b;">ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ</span><br>
                <span style="font-size: 0.8rem; color: #64748b;">เลขที่: ${orderNo} | ${dateStr}</span>
            </div>
            <div style="margin-bottom: 12px; font-size: 0.85rem; line-height: 1.6;">
                <strong>ผู้รับ:</strong> ${window.currentAddress.fullname} (${window.currentAddress.phone})<br>
                <strong>ที่อยู่:</strong> ${displayAddress}
            </div>
            <div style="margin-bottom: 12px; font-size: 0.85rem;">
                <strong>ช่องทางชำระเงิน:</strong> ${paymentStr}
            </div>
            <div style="border-bottom: 1px dashed #cbd5e1; padding-bottom: 10px; margin-bottom: 10px;">
                ${items.map(i => `
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                        <span>${i.name || i.product_name} (x${i.quantity})</span>
                        <span>฿${((i.price || 0) * (i.quantity || 1)).toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
                    </div>
                `).join('')}
            </div>
            <div style="font-size: 0.85rem; display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>ยอดรวมสินค้า:</span>
                <span>฿${subtotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
            </div>
            <div style="font-size: 0.85rem; display: flex; justify-content: space-between; margin-bottom: 4px; color: #e11d48;">
                <span>ส่วนลดคูปอง:</span>
                <span>-฿${discount.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
            </div>
            <div style="font-size: 1rem; display: flex; justify-content: space-between; font-weight: 700; color: #0f766e; border-top: 1px solid #cbd5e1; padding-top: 10px; margin-top: 10px;">
                <span>ยอดชำระสุทธิ:</span>
                <span>฿${grandTotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
            </div>
        `;
    }

    const modal = document.getElementById('receiptModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function cancelOrder() {
    Swal.fire({
        title: 'ยืนยันการยกเลิก?',
        text: "คุณต้องการยกเลิกการสั่งซื้อและกลับไปหน้าตะกร้าใช่หรือไม่",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e11d48',
        cancelButtonColor: '#cbd5e1',
        confirmButtonText: 'ใช่, ยกเลิก',
        cancelButtonText: 'ไม่, ทำรายการต่อ'
    }).then((result) => {
        if (result.isConfirmed) {
            goToTypeStep(1);
        }
    });
}