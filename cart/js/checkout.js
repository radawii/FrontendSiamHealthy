// js/checkout.js

window.savedAddresses = [];
window.currentAddress = null;
let editingIndex = null;
let checkPaymentInterval = null;

// 🔒 ฟังก์ชันตรวจสอบว่าลูกค้าล็อกอินแล้วหรือยัง
function checkUserLoginStatus() {
    try {
        const storedUser = localStorage.getItem('siam_healthy_user');
        if (storedUser && storedUser !== 'login_success_token') {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && (parsedUser.id || parsedUser.user_id)) {
                return parsedUser;
            }
        }

        const supabaseAuth = localStorage.getItem('sb-qqzgfnjrnenncgxbrqel-auth-token');
        if (supabaseAuth) {
            const parsedAuth = JSON.parse(supabaseAuth);
            if (parsedAuth.user && parsedAuth.user.id) {
                return parsedAuth.user;
            }
        }
    } catch (e) {
        console.warn('เกิดข้อผิดพลาดในการตรวจสอบสถานะผู้ใช้งาน', e);
    }
    return null;
}

function promptLogin() {
    Swal.fire({
        icon: 'warning',
        title: 'กรุณาเข้าสู่ระบบ',
        text: 'คุณต้องเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้า',
        confirmButtonText: 'เข้าสู่ระบบทันที',
        showCancelButton: true,
        cancelButtonText: 'กลับไปหน้าหลัก',
        confirmButtonColor: '#0f766e',
        cancelButtonColor: '#94a3b8',
        allowOutsideClick: false
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.setItem('siam_healthy_redirect_after_login', window.location.href);
            window.location.href = '../login.html'; 
        } else {
            window.location.href = '../shop/';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = checkUserLoginStatus();
    if (!currentUser) {
        promptLogin();
        return;
    }

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

    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updatePaymentUI(e.target.value);
        });
    });
});

function handleSuccessfulRedirectReturn() {
    localStorage.removeItem('siam_healthy_payment_session');

    const cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
    const selectedItems = cart.filter(i => i.selected);
    
    if (selectedItems.length > 0) {
        const remainingCart = cart.filter(i => !i.selected);
        const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const savedCoupon = JSON.parse(localStorage.getItem('siam_healthy_coupon'));
        const discount = savedCoupon ? savedCoupon.discount : 0;
        const grandTotal = Math.max(0, subtotal - discount);
    
        localStorage.setItem('siam_healthy_cart', JSON.stringify(remainingCart));
        
        const savedAddress = localStorage.getItem('siam_healthy_last_address');
        if (savedAddress) {
            window.currentAddress = JSON.parse(savedAddress);
        }

        const urlParams = new URLSearchParams(window.location.search);
        const orderIdFromUrl = urlParams.get('order_id') || ('SH-' + Date.now().toString().slice(-6));
        const paymentMethodFromUrl = urlParams.get('method') || 'promptpay';
        const orderData = {
            orderId: orderIdFromUrl,
            date: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
            items: selectedItems,
            shippingAddress: window.currentAddress,
            paymentMethod: paymentMethodFromUrl,
            subtotal: subtotal,
            discount: discount,
            grandTotal: grandTotal
        };
        localStorage.setItem('latest_order', JSON.stringify(orderData));

        localStorage.removeItem('siam_healthy_coupon');

        Swal.fire({
            icon: 'success',
            title: 'ชำระเงินสำเร็จ!',
            text: 'ระบบได้รับยอดชำระของคุณและส่งอีเมลยืนยันเรียบร้อยแล้ว',
            confirmButtonColor: '#0f766e'
        }).then(() => {
            window.history.replaceState({}, document.title, window.location.pathname);
            showReceiptModal(paymentMethodFromUrl, selectedItems, subtotal, discount, grandTotal);
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
        try {
            window.savedAddresses = JSON.parse(stored);
        } catch(e) {
            window.savedAddresses = [];
        }
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
            if (isSelected && !window.currentAddress) {
                window.currentAddress = addr;
            }

            const card = document.createElement('div');
            card.className = `address-card ${isSelected ? 'selected' : ''}`;
            card.style.cssText = "border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; cursor: pointer; transition: all 0.2s; margin-bottom: 14px; background: #ffffff;";
            
            const displayAddress = buildFullAddress(addr);
            const displayPhone = maskPhone(addr.phone);

            card.innerHTML = `
                <div style="display: flex; align-items: flex-start; gap: 14px; flex: 1;" onclick="selectAddress('${addr.id}')">
                    <input type="radio" name="selectedAddress" value="${addr.id}" ${isSelected ? 'checked' : ''} style="margin-top: 4px; accent-color: var(--primary-color); transform: scale(1.2); cursor: pointer;" onchange="selectAddress('${addr.id}')">
                    <div class="address-info">
                        <h4 style="margin: 0 0 6px 0; font-size: 1.05rem; color: #1e293b; font-weight: 600;">
                            ${addr.fullname} <span style="font-weight:400; font-size: 0.9rem; color: var(--text-muted);">(${displayPhone})</span>
                        </h4>
                        <p style="margin: 0 0 4px 0; font-size: 0.92rem; color: #475569; line-height: 1.5;">${displayAddress}</p>
                        <p style="margin: 0; font-size: 0.85rem; color: var(--primary-color);">อีเมล: ${addr.email || '-'}</p>
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button type="button" class="addr-action-btn edit" onclick="event.stopPropagation(); showAddressForm(${index})" title="แก้ไขที่อยู่" style="background: transparent; border: 1px solid #e2e8f0; color: #64748b; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" class="addr-action-btn delete" onclick="event.stopPropagation(); deleteAddress(${index})" title="ลบที่อยู่" style="background: transparent; border: 1px solid #e2e8f0; color: #e11d48; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        if (viewContainer) viewContainer.style.display = 'block';
        if (formContainer) formContainer.style.display = 'none';
    } else {
        if (viewContainer) viewContainer.style.display = 'none';
        if (formContainer) formContainer.style.display = 'block';
        showAddressForm();
    }
}

function showAddressForm(index = null) {
    const viewContainer = document.getElementById('saved-addresses-view');
    const formContainer = document.getElementById('new-address-form-container');
    const formTitle = document.getElementById('address-form-title');
    const form = document.getElementById('shipping-form');

    if (viewContainer) viewContainer.style.display = 'none';
    if (formContainer) formContainer.style.display = 'block';
    if (form) form.reset();

    if (index !== null && index !== undefined && window.savedAddresses[index]) {
        editingIndex = index;
        if (formTitle) formTitle.innerText = 'แก้ไขที่อยู่จัดส่ง';
        
        const addr = window.savedAddresses[index];
        document.getElementById('fullname').value = addr.fullname || '';
        document.getElementById('phone').value = addr.phone || '';
        document.getElementById('email').value = addr.email || '';
        document.getElementById('houseNo').value = addr.houseNo || '';
        document.getElementById('moo').value = addr.moo || '';
        document.getElementById('village').value = addr.village || '';
        document.getElementById('soi').value = addr.soi || '';
        document.getElementById('road').value = addr.road || '';
        document.getElementById('subdistrict').value = addr.subdistrict || '';
        document.getElementById('district').value = addr.district || '';
        document.getElementById('province').value = addr.province || '';
        document.getElementById('zipcode').value = addr.zipcode || '';
    } else {
        editingIndex = null;
        if (formTitle) formTitle.innerText = 'ที่อยู่ในการรับสินค้าใหม่';
    }
}

function cancelAddressForm() {
    editingIndex = null;
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
        const radio = card.querySelector('input[type="radio"]');
        if (radio && radio.value === id) {
            radio.checked = true;
            card.classList.add('selected');
        }
    });
}

function deleteAddress(index) {
    Swal.fire({
        title: 'ลบที่อยู่นี้?',
        text: 'คุณต้องการลบที่อยู่จัดส่งนี้ออกจากระบบใช่หรือไม่',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e11d48',
        cancelButtonColor: '#cbd5e1',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            window.savedAddresses.splice(index, 1);
            localStorage.setItem('siam_healthy_addresses', JSON.stringify(window.savedAddresses));
            renderSavedAddresses();
        }
    });
}

function useSelectedAddressAndGoToStep3() {
    if (!window.currentAddress && window.savedAddresses.length > 0) {
        window.currentAddress = window.savedAddresses[0];
    }
    
    if (!window.currentAddress) {
        Swal.fire('แจ้งเตือน', 'กรุณาเลือกหรือเพิ่มที่อยู่สำหรับจัดส่ง', 'warning');
        showAddressForm();
        return;
    }
    updateShippingSummaryUI();
    goToTypeStep(3);
}

function validateAndGoToStep3() {
    const form = document.getElementById('shipping-form');
    
    if (form && form.checkValidity()) {
        const addressData = {
            id: (editingIndex !== null && window.savedAddresses[editingIndex]) ? window.savedAddresses[editingIndex].id : ('addr_' + Date.now()),
            fullname: document.getElementById('fullname').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
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
        window.currentAddress = addressData;

        if (isSaveChecked) {
            if (editingIndex !== null && editingIndex !== undefined && window.savedAddresses[editingIndex]) {
                window.savedAddresses[editingIndex] = addressData;
            } else {
                window.savedAddresses.unshift(addressData);
            }
            localStorage.setItem('siam_healthy_addresses', JSON.stringify(window.savedAddresses));
        }

        editingIndex = null;
        updateShippingSummaryUI();
        goToTypeStep(3);
    } else if (form) {
        form.reportValidity();
    }
}

// 📦 ฟังก์ชันเรนเดอร์รายการสินค้าที่เลือกสำหรับตรวจสอบใน Step 3 
function renderCheckoutReviewItems() {
    const container = document.getElementById('checkoutItemsReviewList');
    if (!container) return;

    const cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
    const selectedItems = cart.filter(i => i.selected);

    if (selectedItems.length === 0) {
        container.innerHTML = `
            <p style="color: var(--text-muted); text-align: center; font-size: 0.9rem; padding: 10px 0;">
                ไม่มีสินค้าที่เลือกในตะกร้า
            </p>
        `;
        return;
    }

    let html = '';
    selectedItems.forEach(item => {
        let imgPath = item.image || '';
        if (imgPath) {
            imgPath = imgPath.replace(/^\.\//, '').replace(/^\//, '');
            if (!imgPath.startsWith('../shop/') && !imgPath.startsWith('http')) {
                imgPath = imgPath.startsWith('shop/') ? '../' + imgPath : '../shop/' + imgPath;
            }
        } else {
            imgPath = '../shop/img/elsie/elsie1.png';
        }

        html += `
            <div style="display: flex; align-items: flex-start; gap: 16px; padding: 16px; background: #fafcfb; border-radius: 12px; border: 1px solid #f0f4f1;">
                <div style="width: 90px; height: 90px; background: #ffffff; border-radius: 12px; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid #f1f5f9;">
                    <img src="${imgPath}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='../shop/img/elsie/elsie1.png';">
                </div>
                <div style="flex: 1; min-width: 0;">
                    <h3 style="font-size: 1.05rem; font-weight: 600; color: #1e293b; margin: 0 0 2px 0;">${item.name}</h3>
                    <p style="font-size: 0.8rem; color: #64748b; margin: 0 0 2px 0;">จัดจำหน่ายโดย: Siam-Healthy Official</p>
                    <p style="font-size: 0.78rem; color: var(--primary-color); margin-bottom: 8px;">${item.tag || '#ผลิตภัณฑ์เสริมอาหาร'}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <div style="display: flex; align-items: baseline; gap: 8px;">
                            <span style="font-size: 1.05rem; font-weight: 600; color: var(--primary-color);">฿${(item.price || 0).toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
                            ${item.oldPrice ? `<span style="font-size: 0.85rem; color: #b7bfc9; text-decoration: line-through;">฿${item.oldPrice.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>` : ''}
                        </div>
                        <div style="font-size: 0.88rem; font-weight: 500; color: #475569; background: #e2e8f033; padding: 2px 10px; border-radius: 20px;">
                            จำนวน: ${item.quantity} ชิ้น
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function updateShippingSummaryUI() {
    const summaryBox = document.getElementById('summaryAddressText');
    if (summaryBox && window.currentAddress) {
        const displayAddress = buildFullAddress(window.currentAddress);
        const displayPhone = maskPhone(window.currentAddress.phone);
        summaryBox.innerHTML = `
            <div style="font-weight: 600; color: var(--text-heading); font-size: 0.95rem; margin-bottom: 6px;">
                ${window.currentAddress.fullname} <span style="font-weight: 400; color: var(--text-muted); margin: 0 8px;">|</span> <span style="font-weight: 400; color: var(--text-dark);">${displayPhone}</span>
            </div>
            <div style="color: var(--text-dark); margin-bottom: 4px; line-height: 1.6; font-size: 0.88rem;">
                ${displayAddress}
            </div>
            <div style="color: var(--primary-color); font-size: 0.85rem;">
                อีเมล: ${window.currentAddress.email || '-'}
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

// ฟังก์ชันสำหรับถาม Backend ทุกๆ 3 วินาที (Polling) - อัปเดตดักทาง paymentStatus CamelCase
function startPaymentPolling(orderId, items, subtotal, discount, grandTotal) {
    if (checkPaymentInterval) clearInterval(checkPaymentInterval);
    
    checkPaymentInterval = setInterval(async () => {
        try {
            const response = await fetch(`http://localhost:3000/orders/${orderId}`);
            if (response.ok) {
                const responseData = await response.json();
                
                // ดักเผื่อ Backend ห่อข้อมูลมาใน .data หรือส่งมาเป็น Array
                const order = responseData.data || responseData[0] || responseData;
                
                // หัวใจสำคัญ: ดักรับทั้ง paymentStatus (CamelCase) และ payment_status
                const currentStatus = order.paymentStatus || order.payment_status || order.status || '';
                
                // ปรับให้เป็นตัวพิมพ์ใหญ่ทั้งหมดเพื่อเช็คค่า
                const statusStr = currentStatus.toString().trim().toUpperCase();
                
                // รายชื่อคำที่ถือว่าชำระเงินสำเร็จ
                const successStatuses = ['PAID', 'SUCCESS', 'COMPLETED', 'ชำระเงินสำเร็จ'];
                
                if (successStatuses.includes(statusStr)) {
                    // ถ้าตรงกับเงื่อนไข ให้หยุดถาม Backend แล้วโชว์ใบเสร็จทันที!
                    clearInterval(checkPaymentInterval);
                    triggerPaymentSuccess(orderId, items, subtotal, discount, grandTotal);
                }
            }
        } catch (error) {
            console.log('กำลังรอการชำระเงิน...', error);
        }
    }, 3000); 
}

// ฟังก์ชันแสดงผลเมื่อชำระเงินสำเร็จ (รันทันทีที่ Backend บอกว่า PAID)
function triggerPaymentSuccess(orderId, items, subtotal, discount, grandTotal) {
    Swal.close(); 
    
    const cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
    const remainingCart = cart.filter(i => !i.selected);
    localStorage.setItem('siam_healthy_cart', JSON.stringify(remainingCart));
    
    localStorage.removeItem('siam_healthy_payment_session');
    localStorage.removeItem('siam_healthy_coupon');

    const savedAddress = localStorage.getItem('siam_healthy_last_address');
    if (savedAddress) {
        window.currentAddress = JSON.parse(savedAddress);
    }

    const orderData = {
        orderId: orderId,
        date: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
        items: items,
        shippingAddress: window.currentAddress,
        paymentMethod: 'promptpay',
        subtotal: subtotal,
        discount: discount,
        grandTotal: grandTotal
    };
    localStorage.setItem('latest_order', JSON.stringify(orderData));

    Swal.fire({
        icon: 'success',
        title: 'ชำระเงินสำเร็จ!',
        text: 'ระบบได้รับยอดชำระของคุณเรียบร้อยแล้ว',
        confirmButtonColor: '#0f766e',
        allowOutsideClick: false
    }).then(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        showReceiptModal('promptpay', items, subtotal, discount, grandTotal);
    });
}

// 🚀 ฟังก์ชันหลักเมื่อกดปุ่ม "ยืนยันการชำระเงิน"
async function processPayment() {
    const currentUser = checkUserLoginStatus();
    if (!currentUser) {
        promptLogin();
        return;
    }

    const userId = currentUser.id || currentUser.user_id;
    const userEmail = currentUser.email || window.currentAddress?.email || '';

    const paymentInputs = document.querySelectorAll('input[name="paymentMethod"]:checked');
    const selectedPayment = paymentInputs.length > 0 ? paymentInputs[0].value : 'promptpay';
    
    const cart = JSON.parse(localStorage.getItem('siam_healthy_cart')) || [];
    const selectedItems = cart.filter(i => i.selected);

    if (selectedItems.length === 0) {
        Swal.fire('ข้อผิดพลาด', 'ไม่มีสินค้าที่เลือกในตะกร้า', 'warning');
        return;
    }

    const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const savedCoupon = JSON.parse(localStorage.getItem('siam_healthy_coupon'));
    const discount = savedCoupon ? savedCoupon.discount : 0;
    const grandTotal = Math.max(0, subtotal - discount);

    Swal.fire({
        title: 'กำลังเตรียมระบบชำระเงิน...',
        html: 'กรุณารอสักครู่ ระบบกำลังเปิดหน้าต่างชำระเงิน',
        allowOutsideClick: false,
        showConfirmButton: false, 
        didOpen: () => { Swal.showLoading(); }
    });

    const savedSessionStr = localStorage.getItem('siam_healthy_payment_session');
    if (savedSessionStr) {
        const savedSession = JSON.parse(savedSessionStr);
        const isNotExpired = (Date.now() - savedSession.timestamp) < (15 * 60 * 1000); 

        if (isNotExpired && savedSession.grandTotal === grandTotal && savedSession.paymentMethod === selectedPayment) {
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
                user_id: userId,
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

        let stripePublishableKey = intentData.publishableKey || intentData.stripePublicKey;
        if (!stripePublishableKey) {
            stripePublishableKey = await fetchStripePublishableKey();
        }

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
            text: 'ไม่พบ Stripe Publishable Key จากระบบ',
            confirmButtonColor: '#0f766e'
        });
        return;
    }

    const stripe = Stripe(publishableKey);

    if (paymentType === 'promptpay') {
        Swal.fire({
            title: 'กำลังรอการชำระเงิน...',
            html: 'กรุณาสแกน QR Code ที่หน้าต่าง Stripe<br><br><span style="color: #e11d48; font-size: 0.9em; font-weight: bold;">⚠️ โปรดอย่าปิดหน้าต่างนี้จนกว่าการชำระเงินจะสำเร็จ (อาจใช้เวลา 10-30 วินาที)</span>',
            allowOutsideClick: false, // ล็อคไม่ให้คลิกพื้นหลังปิด
            showConfirmButton: false, 
            didOpen: () => { Swal.showLoading(); }
        });

        setTimeout(() => {
            Swal.close(); 
            
            // เรียกใช้ Polling ทันที
            startPaymentPolling(orderId, selectedItems, subtotal, discount, grandTotal);

            stripe.confirmPromptPayPayment(clientSecret, {
                payment_method: {
                    billing_details: {
                        name: window.currentAddress?.fullname || 'Siam-Healthy Customer',
                        email: userEmail || 'customer@siam-healthy.com' 
                    }
                },
                return_url: window.location.href.split('?')[0] + `?payment=success&order_id=${orderId}&method=promptpay`
            }).then(async ({ error }) => {
                if (error) {
                    // ดักเผื่อลูกค้าจ่ายตังค์แล้ว แต่เผลอกดปิด Modal QR Code
                    try {
                        const res = await fetch(`http://localhost:3000/orders/${orderId}`);
                        const data = await res.json();
                        const order = data.data || data[0] || data;
                        
                        const currentStatus = order.paymentStatus || order.payment_status || order.status || '';
                        const statusStr = currentStatus.toString().trim().toUpperCase();
                        const successStatuses = ['PAID', 'SUCCESS', 'COMPLETED', 'ชำระเงินสำเร็จ'];
                        
                        if (successStatuses.includes(statusStr)) {
                            triggerPaymentSuccess(orderId, selectedItems, subtotal, discount, grandTotal);
                            return;
                        }
                    } catch (e) { console.log(e); }

                    // ถ้ายังไม่ได้จ่ายจริงๆ
                    if (checkPaymentInterval) clearInterval(checkPaymentInterval);
                    
                    Swal.fire({
                        icon: 'warning',
                        title: 'ยังชำระเงินไม่สมบูรณ์',
                        text: 'หากชำระเงินไปแล้วกรุณารอประมวลผล หากยังไม่ชำระเงิน คุณสามารถกด "ยืนยันและชำระเงิน" อีกครั้งได้ครับ',
                        confirmButtonColor: '#0f766e'
                    });
                }
            });
        }, 800); 
        
        return; 
    }

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
                return_url: window.location.href.split('?')[0] + `?payment=success&order_id=${orderId}&method=credit`,
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

            const orderData = {
                orderId: orderId,
                date: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
                items: selectedItems,
                shippingAddress: window.currentAddress,
                paymentMethod: 'credit',
                subtotal: subtotal,
                discount: discount,
                grandTotal: grandTotal
            };
            localStorage.setItem('latest_order', JSON.stringify(orderData));

            localStorage.removeItem('siam_healthy_coupon');

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

function formatOrderId(id) {
    if (!id) return '-';
    if (id.toString().startsWith('ORD')) return id;
    const cleanId = id.toString().replace('SH-', '');
    if (cleanId.length <= 6) {
        return `ORD2026${cleanId.padStart(6, '0')}`;
    }
    return `ORD${cleanId}`;
}

function showReceiptModal(paymentMethod = 'promptpay', items = [], subtotal = 0, discount = 0, grandTotal = 0) {
    const receiptPaper = document.getElementById('receiptPaper');
    if (receiptPaper && window.currentAddress) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        
        const latestOrder = JSON.parse(localStorage.getItem('latest_order')) || {};
        const rawOrderId = latestOrder.orderId || ('SH-' + Date.now().toString().slice(-6));
        const orderNo = formatOrderId(rawOrderId);

        const displayAddress = buildFullAddress(window.currentAddress);

        let paymentStr = (paymentMethod === 'promptpay') ? 'สแกน QR Code / พร้อมเพย์' : 'บัตรเครดิต / Stripe';

        receiptPaper.innerHTML = `
            <div style="text-align: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 10px; margin-bottom: 12px;">
                <strong style="font-size: 1.1rem;">Siam-Healthy Official</strong><br>
                <span style="font-size: 0.8rem; color: #64748b;">ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ</span><br>
                <span style="font-size: 0.8rem; color: #64748b;">เลขที่: ${orderNo} | ${dateStr}</span>
            </div>
            <div style="margin-bottom: 12px; font-size: 0.85rem; line-height: 1.6;">
                <strong>ผู้รับ:</strong> ${window.currentAddress.fullname} (${window.currentAddress.phone})<br>
                <strong>อีเมล:</strong> ${window.currentAddress.email || '-'}<br>
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
            <div style="font-size: 1rem; display: flex; justify-content: space-between; font-weight: 700; color: #0d5c2e; border-top: 1px solid #cbd5e1; padding-top: 10px; margin-top: 10px;">
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

function viewOrderDetails() {
    window.location.href = './order-detail.html'; 
}

function validateAndSaveAddress() {
    validateAndGoToStep3();
}