/* Public UI translations. Product descriptions, article bodies and form values stay authored. */
(function (root) {
  "use strict";
  const phrases = `
หน้าแรก=>Home
ผลิตภัณฑ์ทั้งหมด=>Products
คลังความรู้ส่วนผสม=>Ingredients
หัวข้อสุขภาพ=>Wellness
เกี่ยวกับเรา=>Our story
บทความ=>Journal
บทความสุขภาพ=>Health journal
ติดต่อเรา=>Contact
ตะกร้าของคุณ=>Shopping bag
ตะกร้าสินค้า=>Shopping bag
บัญชีของฉัน=>My account
บัญชีผู้ใช้=>Account
ค้นหา=>Search
กรุณารอสักครู่...=>Please wait…
ค้นหาสินค้า หรือปัญหาสุขภาพ=>Search products or wellness topics
เข้าสู่ระบบในชื่อ=>Signed in as
ดูรายละเอียดคำสั่งซื้อ=>My orders
ออกจากระบบ=>Sign out
เข้าสู่ระบบ=>Sign in
เข้าสู่ระบบ / ลงทะเบียน=>Sign in / Register
เข้าสู่ระบบ / สมัครสมาชิก=>Sign in / Register
สมัครสมาชิก=>Register
สินค้า=>Product
หมวดหมู่=>Category
ยกเลิก=>Cancel
ยืนยัน=>Confirm
ตกลง=>OK
ปิด=>Close
บันทึก=>Save
แก้ไข=>Edit
ลบ=>Remove
ย้อนกลับ=>Back
ถัดไป=>Next
ดูรายละเอียด=>View details
กลับสู่หน้าแรก=>Back to home
เลือกทั้งหมด=>Select all
ลบรายการที่เลือก=>Remove selected
จำนวน=>Quantity
ราคา=>Price
รวม=>Total
ฟรี=>Free
เลือกจากความสนใจ=>Shop by interest
ทั้งหมด=>All
สายตาและการได้ยิน=>Vision & hearing
สุขภาพผู้ชาย=>Men's wellness
ผิวพรรณและชะลอวัย=>Skin & healthy aging
หุ่นและระบบเผาผลาญ=>Weight & metabolism
หุ่นและระบบเผาพลาญ=>Weight & metabolism
ลำไส้และการขับถ่าย=>Digestive wellness
กระดูก ข้อ และภูมิคุ้มกัน=>Bones, joints & immunity
ระบบหัวใจและหลอดเลือด=>Heart & circulation
กำลังเตรียมข้อมูล...=>Loading products…
กำลังโหลด...=>Loading…
เรียงตาม: แนะนำ=>Sort: Recommended
ราคา: ต่ำไปสูง=>Price: Low to high
ราคา: สูงไปต่ำ=>Price: High to low
เพิ่มลงตะกร้า=>Add to bag
ซื้อเลย=>Buy now
สั่งซื้อทันที=>Order now
ยืนยันประสิทธิภาพจากผู้ใช้จริง=>Customer experiences
เจาะลึกสารสกัดหลัก ฟื้นฟูจากภายใน=>Explore the key ingredients
ที่อยู่จัดส่ง=>Delivery address
ชำระเงิน=>Payment
เลือกที่อยู่ในการรับสินค้า=>Choose a delivery address
เพิ่มที่อยู่ในการรับสินค้าใหม่=>Add a new delivery address
ที่อยู่ในการรับสินค้า=>Delivery address
ชื่อ - นามสกุล=>Full name
ชื่อ-นามสกุล=>Full name
เบอร์โทรศัพท์=>Phone number
อีเมล=>Email
เลขที่=>House number
หมู่=>Village number
หมู่บ้าน / อาคารชุด=>Village / Building
ซอย=>Lane
ถนน=>Street
ตำบล / แขวง=>Subdistrict
อำเภอ / เขต=>District
จังหวัด=>Province
รหัสไปรษณีย์=>Postal code
บันทึกที่อยู่นี้ไว้ใช้ในครั้งถัดไป=>Save this address for next time
บันทึกและไปชำระเงิน=>Save and continue to payment
ตรวจสอบรายการสินค้า=>Review your items
เลือกช่องทางการชำระเงิน=>Choose a payment method
สแกน QR Code / พร้อมเพย์=>QR code / PromptPay
บัตรเครดิต / บัตรเดบิต=>Credit / Debit card
ยกเลิกการสั่งซื้อ=>Cancel order
คูปองส่วนลด=>Discount code
ใส่โค้ดรับส่วนลดพิเศษเพิ่มทันที=>Enter a code to apply your discount
ใช้โค้ด=>Apply code
สรุปยอดคำสั่งซื้อ=>Order summary
ยอดรวมสินค้า=>Subtotal
ส่วนลดจากคูปอง=>Coupon discount
ค่าจัดส่ง=>Shipping
ยอดชำระสุทธิ=>Order total
ยืนยันการชำระเงิน=>Confirm payment
ชำระเงินสำเร็จ!=>Payment successful!
ขอบคุณที่ไว้วางใจใช้บริการ Siam-Healthy=>Thank you for shopping with Siam-Healthy
ชื่อ นามสกุลผู้รับ=>Recipient's full name
บ้านเลขที่ / อาคาร=>House number / Building
หมู่ที่ (ถ้ามี)=>Village number (optional)
ชื่อหมู่บ้าน / คอนโด=>Village / Condominium name
ตรอก / ซอย=>Alley / Lane
ชื่อถนน=>Street name
รหัสไปรษณีย์ 5 หลัก=>5-digit postal code
กรอกโค้ดส่วนลด=>Enter discount code
สร้างบัญชีใหม่=>Create an account
ยินดีต้อนรับกลับมา=>Welcome back
เข้าสู่ระบบเพื่อจัดการคำสั่งซื้อและรับสิทธิประโยชน์=>Sign in to manage your orders and enjoy member benefits
อีเมล หรือ Username=>Email or username
รหัสผ่าน=>Password
ลืมรหัสผ่าน?=>Forgot password?
จดจำการเข้าสู่ระบบ=>Remember me
หรือเข้าสู่ระบบด้วย=>Or sign in with
สร้างบัญชีใหม่เพื่อจัดการคำสั่งซื้อและรับสิทธิประโยชน์=>Create an account to manage orders and enjoy member benefits
ชื่อผู้ใช้งาน (Username)=>Username
ฉันยอมรับ=>I agree to the
เงื่อนไขการใช้งาน=>Terms of use
และ=>and
นโยบายความเป็นส่วนตัว=>Privacy policy
หรือสมัครสมาชิกด้วย=>Or register with
กรอกอีเมล หรือ Username=>Enter email or username
กรอกรหัสผ่านของคุณ=>Enter your password
ตั้งชื่อผู้ใช้งาน=>Choose a username
อย่างน้อย 8 ตัวอักษร=>At least 8 characters
ลืมรหัสผ่าน=>Forgot password
กรอกอีเมลที่คุณใช้สมัครสมาชิก เพื่อรับรหัส OTP ยืนยันตัวตน=>Enter your registered email to receive a verification code
ส่งรหัส OTP=>Send verification code
ยืนยันรหัส OTP=>Verify code
กรอกรหัส 6 หลักที่เราได้ส่งไปที่อีเมล=>Enter the 6-digit code sent to
รหัส OTP=>Verification code
ไม่ได้รับรหัส? ส่งใหม่อีกครั้ง=>Didn't receive a code? Resend
ตั้งรหัสผ่านใหม่=>Reset password
กรอกรหัสผ่านใหม่ที่คุณต้องการใช้งาน=>Enter your new password
รหัสผ่านใหม่=>New password
ยืนยันรหัสผ่านใหม่=>Confirm new password
บันทึกรหัสผ่านใหม่=>Save new password
กลับไปหน้าเข้าสู่ระบบ=>Back to sign in
กรอกรหัสผ่านใหม่อีกครั้ง=>Re-enter your new password
กรุณายอมรับเงื่อนไขการใช้งานก่อนสมัครสมาชิก=>Please accept the terms before registering
สมัครสมาชิกสำเร็จ!=>Account created!
กรุณาเข้าสู่ระบบด้วยบัญชีที่คุณเพิ่งสร้าง=>Please sign in with your new account
สมัครสมาชิกล้มเหลว=>Registration failed
เกิดข้อผิดพลาดจากเซิร์ฟเวอร์=>A server error occurred
ข้อผิดพลาดระบบ=>System error
ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้=>Unable to connect to the server
เข้าสู่ระบบสำเร็จ!=>Signed in!
ยินดีต้อนรับกลับมาครับ=>Welcome back
เข้าสู่ระบบล้มเหลว=>Sign-in failed
อีเมล/Username หรือรหัสผ่านไม่ถูกต้อง=>Incorrect email, username or password
ออกจากระบบ?=>Sign out?
คุณต้องการออกจากระบบใช่หรือไม่?=>Would you like to sign out?
ออกจากระบบสำเร็จ=>Signed out
ช่องทางติดต่อและสั่งซื้อ=>Contact & ordering
เลือกช่องทางที่คุณสะดวก เพื่อรับคำปรึกษาหรือสั่งซื้อสินค้าได้ทันที=>Choose a convenient way to contact us for advice or place an order
จ-ศ 09:00 - 18:00 น.=>Mon–Fri, 09:00–18:00
ติดตามเราผ่านช่องทางออนไลน์=>Follow us online
ผลิตภัณฑ์เสริมอาหาร=>Dietary supplements
#ผลิตภัณฑ์เสริมอาหาร=>#DietarySupplements
คัดสรรสารสกัดคุณภาพสูง=>Thoughtfully selected ingredients
ผ่านการรับรองมาตรฐาน=>Quality you can trust
ดูสินค้าทั้งหมด=>Explore all products
เลือกซื้อสินค้าที่ตอบโจทย์ปัญหาสุขภาพของคุณ=>Explore products for your wellness goals
กระดูกและข้อต่อ=>Bones & joints
ฟื้นฟูข้อเข่า กระดูกเสื่อม เพิ่มน้ำเลี้ยงข้อ=>Explore everyday support for bones and joint mobility
หัวใจและหลอดเลือด=>Heart & circulation
ดูแลความดัน ไขมันในเลือด สุขภาพหัวใจ=>Explore ingredients involved in cardiovascular wellness
เบาหวาน=>Blood sugar wellness
คุมระดับน้ำตาล เสริมการทำงานของอินซูลิน=>Learn about nutrition and healthy glucose metabolism
ลดน้ำหนัก=>Weight management
เร่งการเผาผลาญ คุมหิว ปลอดภัยต่อร่างกาย=>Support your nutrition and weight management routine
ผิวหนังและเล็บ=>Skin & nails
บำรุงเซลล์ผิว แข็งแรง ไม่เปราะหักง่าย=>Explore nutrients for healthy skin and nails
ดวงตา=>Eye wellness
ลดตาแห้ง ตาพร่ามัว กรองแสงสีฟ้า=>Discover nutrients involved in normal visual function
การได้ยิน=>Hearing wellness
ฟื้นฟูประสาทหู ลดอาการหูอื้อตามวัย=>Learn about hearing and wellness as you age
ปรับสมดุลจุลินทรีย์ แก้ท้องผูก ท้องอืด=>Explore digestive health and the gut microbiome
ความงาม=>Beauty & wellness
ผิวกระจ่างใส ชะลอวัย ออร่าสุขภาพดี=>Build an everyday routine for skin and healthy aging
สุขภาพเพศชาย=>Men's wellness
เพิ่มฟื้นฟูพละกำลัง สมดุลฮอร์โมนชาย=>Explore nutrition and everyday wellness for men
ยกระดับมาตรฐานสินค้าและบริการ=>Committed to quality products and service
พร้อมก้าวขึ้นสู่การเป็นผู้นำด้านอาหารเสริม=>Moving wellness forward together
สินค้าผ่านการรับรองจาก อย.=>Thai FDA registered products
นวัตกรรมการผลิตที่ได้มาตรฐาน=>Quality manufacturing standards
ปลอดภัยต่อร่างกายขั้นสูงสุด=>Carefully considered product safety
จัดส่งสินค้าทั่วไทยอย่างรวดเร็ว=>Fast delivery across Thailand
เจ้าหน้าที่ให้คำปรึกษาฟรีตลอด 24 ชม.=>Free advice from our support team, 24 hours a day
กระดูกและข้อ=>Bones & joints
สุขภาพสายตา=>Eye wellness
ฟื้นฟูร่างกาย=>Everyday wellness
01 มิ.ย. 2026=>01 Jun 2026
ลุกก็โอย นั่งก็โอย เจ็บหัวเข่าแปล๊บๆ ทุกครั้งที่ก้าวลงบันได สัญญาณข้อเข่าเสื่อมที่คนวัย 40+ ต้องฟื้นฟูอย่างไรก่อนจะสาย?=>Knee pain on the stairs? Understanding joint changes and everyday care after 40
หน้าจอมือถือทำลายดวงตามากกว่าที่คิด: วิธีดูแลตาพร่ามัว-ตาแห้งเรื้อรัง ภัยเงียบจากแสงสีฟ้าที่คนยุคปัจจุบันมองข้ามไม่ได้=>Screen time and tired eyes: everyday habits to care for your vision
หูอื้อ ฟังไม่ชัด คุยไม่รู้เรื่อง... สัญญาณเตือนประสาทหูเสื่อมตามวัย ภัยเงียบที่บั่นทอนความสุขในครอบครัว=>Hearing changes with age: recognising signs and knowing when to seek advice
อ่านบทความทั้งหมด=>Explore the journal
รูปภาพสินค้า=>Product image
สัญญาณข้อเข่าเสื่อม=>Understanding knee health
ดูแลสุขภาพดวงตา=>Caring for your eyes
สัญญาณเตือนประสาทหูเสื่อม=>Understanding hearing changes
ยังไม่มีประวัติคำสั่งซื้อ=>No orders yet
คุณยังไม่ได้ทำรายการสั่งซื้อสินค้ากับทาง Siam-Healthy=>You haven't placed an order with Siam-Healthy yet
ส่วนลดคูปอง=>Coupon discount
ไม่มีสินค้าในตะกร้า=>Your bag is empty
ตะกร้าสินค้าของคุณว่างเปล่า=>Your shopping bag is empty
เลือกซื้อสินค้า=>Shop products
สินค้าหมด=>Out of stock
สินค้าที่เกี่ยวข้อง=>Related products
รายละเอียดสินค้า=>Product details
รายละเอียดคำสั่งซื้อ | Siam-Healthy=>Order details | Siam-Healthy
รายละเอียดคำสั่งซื้อ=>Order details
ตรวจสอบสถานะและดูรายละเอียดคำสั่งซื้อทั้งหมดของคุณ=>Track and review all your orders
ประวัติคำสั่งซื้อ=>Order history
ไม่พบรหัสคำสั่งซื้อ=>Order ID not found
กลับไปหน้าประวัติคำสั่งซื้อ=>Back to order history
หมายเลขคำสั่งซื้อ:=>Order number:
วันที่สั่งซื้อ:=>Order date:
สถานะคำสั่งซื้อ:=>Order status:
ช่องทางชำระเงิน:=>Payment method:
รายการสินค้าที่สั่งซื้อ=>Ordered items
ยอดรวมสินค้า:=>Subtotal:
ส่วนลดคูปอง:=>Coupon discount:
ยอดชำระสุทธิ:=>Order total:
ไม่พบข้อมูลคำสั่งซื้อที่คุณต้องการ=>We couldn't find this order
คุณต้องเข้าสู่ระบบก่อนเพื่อตรวจสอบประวัติคำสั่งซื้อของคุณ=>Sign in to view your order history
เกิดข้อผิดพลาดในการโหลดข้อมูลคำสั่งซื้อ=>Unable to load your orders
ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้=>Unable to load your orders
ไม่พบข้อมูลที่อยู่=>Address not found
คุณลูกค้า=>Customer
ชำระเงินเรียบร้อยแล้ว=>Paid
ชำระเงินเรียบร้อย=>Paid
ชำระเงินแล้ว=>Paid
รอการชำระเงิน=>Awaiting payment
เก็บเงินปลายทาง=>Cash on delivery
เก็บเงินปลายทาง (COD)=>Cash on delivery (COD)
พร้อมเพย์ (PromptPay)=>PromptPay
บัตรเครดิต / เดบิต=>Credit / Debit card
เมื่อเร็วๆ นี้=>Recently
สินค้าสุขภาพ=>Wellness products
หน้าก่อนหน้า=>Previous page
หน้าถัดไป=>Next page
ยังไม่มีสินค้าในตะกร้าของคุณ=>Your shopping bag is empty
เลือกซื้อสินค้าเลย=>Start shopping
เลือกซื้อสินค้าเพิ่มเติม=>Continue shopping
จัดจำหน่ายโดย: Siam-Healthy Official=>Sold by: Siam-Healthy Official
จัดส่งด่วนฟรี รับสินค้าภายใน 1-2 วัน=>Free express delivery within 1–2 days
ยอดรวมสุทธิ:=>Total:
ไปหน้าที่อยู่จัดส่ง=>Continue to delivery address
ตะกร้าว่างเปล่า=>Your bag is empty
กรุณาเลือกสินค้าในตะกร้าอย่างน้อย 1 รายการก่อนดำเนินการต่อ=>Select at least one item to continue
กรุณาเข้าสู่ระบบ=>Please sign in
คุณจำเป็นต้องเข้าสู่ระบบก่อนดำเนินการสั่งซื้อสินค้า=>Please sign in before placing an order
คุณต้องเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้า=>Please sign in before placing an order
ไปหน้าเข้าสู่ระบบ=>Go to sign in
เข้าสู่ระบบทันที=>Sign in now
กลับไปหน้าหลัก=>Back to home
ลบสินค้า?=>Remove item?
คุณต้องการลบสินค้านี้ออกจากตะกร้าใช่หรือไม่=>Remove this item from your bag?
ใช่, ลบออก=>Yes, remove
ลบรายการที่เลือก?=>Remove selected items?
คุณแน่ใจหรือไม่ที่จะลบสินค้าที่เลือกทั้งหมด=>Remove all selected items?
ลบทั้งหมด=>Remove all
แจ้งเตือน=>Notice
กรุณากรอกโค้ดส่วนลด=>Please enter a discount code
ไม่มีสินค้าที่เลือกในตะกร้า=>No items selected in your bag
ใช้คูปองส่วนลดสำเร็จ=>Discount code applied
ข้อผิดพลาด=>Error
เกิดข้อผิดพลาด=>An error occurred
ไม่สามารถใช้คูปองได้=>Unable to apply this code
ไม่สามารถเชื่อมต่อระบบคูปองได้=>Unable to connect to the coupon service
ยกเลิกโค้ด=>Remove code
ยกเลิกคูปองส่วนลดแล้ว=>Discount code removed
แก้ไขที่อยู่=>Edit address
ลบที่อยู่=>Remove address
แก้ไขที่อยู่จัดส่ง=>Edit delivery address
ที่อยู่ในการรับสินค้าใหม่=>New delivery address
ลบที่อยู่นี้?=>Remove this address?
คุณต้องการลบที่อยู่จัดส่งนี้ออกจากระบบใช่หรือไม่=>Remove this delivery address?
กรุณาเลือกหรือเพิ่มที่อยู่สำหรับจัดส่ง=>Choose or add a delivery address
การชำระเงินถูกปฏิเสธหรือไม่สำเร็จ=>Payment was declined or unsuccessful
ชำระเงินสำเร็จ=>Payment successful
กำลังรอการชำระเงิน...=>Awaiting payment…
ระบบได้รับยอดชำระของคุณเรียบร้อยแล้ว=>Your payment has been received
ระบบได้รับยอดชำระของคุณและส่งอีเมลยืนยันเรียบร้อยแล้ว=>Payment received. A confirmation email has been sent
กำลังเตรียมระบบชำระเงิน...=>Preparing payment…
กรุณารอสักครู่ ระบบกำลังเปิดหน้าต่างชำระเงิน=>Please wait while we open the payment window
ไม่สามารถสร้างออเดอร์ในระบบได้=>Unable to create your order
สั่งซื้อสำเร็จ!=>Order placed!
บันทึกคำสั่งซื้อของคุณเรียบร้อยแล้ว=>Your order has been saved
ไม่สามารถเชื่อมต่อระบบชำระเงินได้=>Unable to connect to the payment service
ยังชำระเงินไม่สมบูรณ์=>Payment incomplete
ยืนยันและชำระเงิน=>Confirm and pay
กำลังดำเนินการตัดเงิน...=>Processing payment…
กรุณารอสักครู่ ห้ามปิดหน้าต่างนี้=>Please wait and keep this window open
ชำระเงินไม่สำเร็จ=>Payment unsuccessful
ระบบได้รับยอดชำระผ่านบัตรเครดิตและส่งอีเมลยืนยันเรียบร้อยแล้ว=>Card payment received. A confirmation email has been sent
บัตรเครดิต / Stripe=>Credit card / Stripe
ฟรี (ส่วนลดเต็มจำนวน)=>Free (fully discounted)
ยืนยันการยกเลิก?=>Cancel this order?
คุณต้องการยกเลิกการสั่งซื้อและกลับไปหน้าตะกร้าใช่หรือไม่=>Cancel this order and return to your bag?
ใช่, ยกเลิก=>Yes, cancel
ไม่, ทำรายการต่อ=>Continue order
กรุณากรอกข้อมูล=>Please complete the required fields
กรุณากรอกอีเมลให้ถูกต้องก่อนดำเนินการต่อ=>Enter a valid email address to continue
ส่งรหัส OTP สำเร็จ=>Verification code sent
กรุณาตรวจสอบรหัส 6 หลักในอีเมลของคุณ=>Check your email for a 6-digit verification code
รหัส OTP ไม่ถูกต้อง=>Invalid verification code
กรุณากรอกรหัส OTP ให้ครบ 6 หลัก=>Enter the full 6-digit code
ยืนยันตัวตนสำเร็จ=>Email verified
สามารถตั้งรหัสผ่านใหม่ของคุณได้เลยครับ=>You can now set your new password
ส่งรหัสใหม่อีกครั้ง=>Resend code
ระบบได้ส่งรหัส OTP ไปยังอีเมลของคุณเรียบร้อยแล้ว=>A new verification code has been sent to your email
รหัสผ่านสั้นเกินไป=>Password too short
รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษรขึ้นไป=>Your new password must have at least 8 characters
รหัสผ่านไม่ตรงกัน=>Passwords do not match
กรุณากรอกยืนยันรหัสผ่านใหม่ให้ตรงกันทั้งสองช่อง=>Enter the same new password in both fields
เปลี่ยนรหัสผ่านสำเร็จ!=>Password updated!
กำลังพาคุณกลับไปหน้าเข้าสู่ระบบ...=>Returning to sign in…
กำลังโหลดข้อมูลสินค้า...=>Loading products…
ส่วนประกอบสำคัญ=>Key ingredients
วิธีรับประทาน=>Directions
ข้อควรระวัง=>Precautions
รีวิวจากลูกค้า=>Customer reviews
คำสั่งซื้อของฉัน=>My orders
ประวัติการสั่งซื้อ=>Order history
ข้อมูลส่วนตัว=>Personal information
ที่อยู่ของฉัน=>My addresses
ยังไม่มีคำสั่งซื้อ=>No orders yet
กำลังดำเนินการ=>Processing
สั่งซื้อสินค้า=>Place order
ลบสินค้า=>Remove item
เลือกจังหวัด=>Select province
เลือกอำเภอ / เขต=>Select district
เลือกตำบล / แขวง=>Select subdistrict
สุขภาพดีเริ่มต้นที่นี่ | Siam-Healthy=>Wellness starts here | Siam-Healthy
ผลิตภัณฑ์ทั้งหมด | Siam-Healthy=>Products | Siam-Healthy
ผลิตภัณฑ์เสริมอาหารเพื่อสุขภาพ | Siam-Healthy=>Wellness supplements | Siam-Healthy
ตะกร้าสินค้า | Siam-Healthy=>Shopping bag | Siam-Healthy
เข้าสู่ระบบ / สมัครสมาชิก | Siam-Healthy=>Sign in / Register | Siam-Healthy
ลืมรหัสผ่าน | Siam-Healthy=>Forgot password | Siam-Healthy
เกี่ยวกับเรา | Siam-Healthy=>Our story | Siam-Healthy
บทความสุขภาพ | Siam-Healthy=>Health journal | Siam-Healthy
`;
  const translations = Object.fromEntries(phrases.trim().split("\n").map(line => line.split("=>")));
  const normalize = text => text.replace(/\s+/g, " ").trim();
  function translate(text, locale) {
    const key = normalize(text);
    if (locale !== "en") return text;
    let translated = translations[key];
    if (!translated && /^\d+ ผลิตภัณฑ์$/.test(key)) translated = key.replace(" ผลิตภัณฑ์", " products");
    if (!translated && /^เลือกทั้งหมด \(\d+\/\d+ รายการ\)$/.test(key)) translated = key.replace(/^เลือกทั้งหมด/, "Select all").replace(" รายการ", " items");
    if (!translated && /^จำนวน: \d+ ชิ้น$/.test(key)) translated = key.replace("จำนวน:", "Quantity:").replace(" ชิ้น", " items");
    if (!translated && /^คำสั่งซื้อ #[A-Za-z0-9-]+$/.test(key)) translated = key.replace("คำสั่งซื้อ", "Order");
    if (!translated && /^อ่าน \d+ นาที$/.test(key)) translated = key.replace(/^อ่าน (\d+) นาที$/, "$1 min read");
    if (!translated && /^ดูข้อมูลส่วนผสม: /.test(key)) translated = key.replace(/^ดูข้อมูลส่วนผสม: /, "View ingredient details: ");
    return translated ? text.replace(text.trim(), translated) : text;
  }
  function localizedHref(href, locale, base) {
    const url = new URL(href, base);
    if (url.origin !== new URL(base).origin || href.startsWith("#") || !/^https?:$/.test(url.protocol)) return href;
    if (/^\/(th|en)\/(ingredients|wellness)(\/|$)/.test(url.pathname)) {
      url.pathname = url.pathname.replace(/^\/(th|en)\//, "/" + locale + "/");
    } else if (/^\/(?:$|index\.html$|(?:shop|cart|articles|about|contact)(?:\/|$)|(?:login|forgot-password|orders|profile)\.html$)/.test(url.pathname)) {
      url.searchParams.set("lang", locale);
    } else return href;
    return url.pathname + url.search + url.hash;
  }
  if (typeof module !== "undefined" && module.exports) module.exports = { translate, localizedHref, translations };
  if (!root.document) return;
  const doc = root.document;
  // Pages with the site header get their language from it; standalone pages (legacy shop/*.html)
  // read ?lang= or the saved choice themselves.
  let pageLang = doc.documentElement.lang;
  if (pageLang !== "en" && !doc.querySelector("my-header")) {
    let saved = null;
    try { saved = localStorage.getItem("siam_locale"); } catch (e) {}
    pageLang = new URLSearchParams(location.search).get("lang") || saved || "th";
    if (pageLang === "en") doc.documentElement.lang = "en";
  }
  let locale = pageLang === "en" ? "en" : "th";
  const excluded = "script,style,textarea,[contenteditable],[data-no-translate],my-header";
  // Every text/attribute change made for English is logged so switching back to Thai is instant.
  const undoLog = [];
  const record = entry => undoLog.push(entry);
  function apply(element) {
    if (element.nodeType === 3) {
      const parent = element.parentElement;
      if (!parent || parent.closest(excluded)) return;
      const value = translate(element.nodeValue, locale);
      if (value !== element.nodeValue) {
        // An option without an explicit value must retain its submitted value.
        if (parent.tagName === "OPTION" && !parent.hasAttribute("value")) parent.setAttribute("value", parent.value);
        record({ node: element, kind: "text", old: element.nodeValue });
        element.nodeValue = value;
      }
      return;
    }
    if (element.nodeType !== 1 || element.closest(excluded)) return;
    for (const attr of ["placeholder", "title", "aria-label"]) {
      const value = element.getAttribute(attr);
      if (value !== null) {
        const next = translate(value, locale);
        if (next !== value) {
          record({ node: element, kind: "attr", attr, old: value });
          element.setAttribute(attr, next);
        }
      }
    }
    if (element.matches("a[href]:not([data-locale])")) {
      const href = element.getAttribute("href");
      const next = localizedHref(href, locale, location.href);
      if (href !== next) element.setAttribute("href", next);
    }
    for (const child of element.childNodes) apply(child);
  }
  function localizeHeaderLinks() {
    // Header owns its labels and language links; propagate the chosen language to its navigation.
    doc.querySelectorAll("my-header a[href]:not([data-locale])").forEach(link => {
      link.setAttribute("href", localizedHref(link.getAttribute("href"), locale, location.href));
    });
  }
  localizeHeaderLinks();
  // Full-content English (articles, product copy, page text) from /i18n/en/*.json via js/i18n-content.js.
  // The UI phrase list above stays as the fallback for anything the page dictionaries do not cover.
  let contentDict = null;
  let contentReady = locale !== "en";
  const BLOCK_SCOPE = "p,li,h1,h2,h3,h4,h5,h6,td,th,dt,dd,figcaption,blockquote,label,button,summary,caption,option,a,span,div";
  function applyContent(node) {
    if (locale !== "en" || !contentDict || !root.SiamContentI18n) return;
    const el = node.nodeType === 3 ? node.parentElement : node;
    if (!el || el.nodeType !== 1 || el.closest(excluded)) return;
    // Re-evaluate from the nearest block so a sentence split across inline tags is matched whole.
    const scope = el.parentElement ? el.parentElement.closest(BLOCK_SCOPE) || el : el;
    root.SiamContentI18n.apply(scope, contentDict, text => translate(text, locale), record);
  }
  function loadContent() {
    if (contentDict) return Promise.resolve(contentDict);
    // js/i18n-boot.js (first script in <head>) has usually started these downloads already.
    let boot = root.__cwI18n;
    if (!boot && root.__cwI18nPreload) boot = root.__cwI18n = root.__cwI18nPreload();
    const helper = boot ? boot.helper : root.SiamContentI18n ? Promise.resolve() : new Promise(resolve => {
      const s = doc.createElement("script");
      s.src = "/js/i18n-content.js";
      s.onload = s.onerror = resolve;
      doc.head.append(s);
    });
    const getJson = url => fetch(url).then(r => (r.ok ? r.json() : {})).catch(() => ({}));
    const pageFile = () => root.SiamContentI18n.pageKey(location.pathname).replace(/\//g, "__");
    return helper.then(() => {
      if (!root.SiamContentI18n) return;
      const dicts = boot ? boot.dicts : Promise.all([getJson("/i18n/en/_common.json"), getJson("/i18n/en/" + pageFile() + ".json")]);
      return dicts.then(([common, own]) => (contentDict = Object.assign({}, common, own)));
    });
  }
  function translatePage() {
    if (contentDict && root.SiamContentI18n) root.SiamContentI18n.apply(doc, contentDict, text => translate(text, locale), record);
    apply(doc.documentElement);
  }
  if (locale === "en") {
    // Keep the Thai copy hidden until the English is in place (i18n-boot.js normally hid it before first paint).
    let reveal = root.__cwI18nReveal;
    if (!reveal) {
      const veil = doc.createElement("style");
      veil.textContent = "body{visibility:hidden!important}";
      doc.head.append(veil);
      reveal = () => veil.remove();
      setTimeout(reveal, 2500);
    }
    loadContent().then(translatePage).finally(() => { contentReady = true; flush(); requestAnimationFrame(reveal); });
  } else apply(doc.documentElement);
  const pending = new Set();
  let scheduled = false;
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === "childList") record.addedNodes.forEach(node => pending.add(node));
      else pending.add(record.target);
    }
    if (scheduled || !contentReady) return;
    scheduled = true;
    requestAnimationFrame(flush);
  });
  function flush() {
    scheduled = false;
    const nodes = [...pending]; pending.clear();
    nodes.forEach(node => { if (node.isConnected) { applyContent(node); apply(node); } });
  }
  observer.observe(doc.documentElement, { childList: true, characterData: true, subtree: true });

  /** Switch language in place — no page reload, so nothing flickers. */
  let switching = null;
  function setLocale(next) {
    next = next === "en" ? "en" : "th";
    if (next === locale) return Promise.resolve();
    if (switching) return switching;
    try { localStorage.setItem("siam_locale", next); } catch (e) {}
    const url = new URL(location.href);
    url.searchParams.set("lang", next);
    history.replaceState(history.state, "", url.pathname + url.search + url.hash);
    const ready = next === "en" ? loadContent() : Promise.resolve();
    switching = ready
      .then(() => {
        observer.takeRecords();
        locale = next;
        doc.documentElement.lang = next;
        if (next === "en") translatePage();
        else {
          if (root.SiamContentI18n) root.SiamContentI18n.undo(undoLog);
          else undoLog.length = 0;
          apply(doc.documentElement); // point links back at the Thai pages
        }
        // Re-create the header so its own labels and menus follow the new language.
        const header = doc.querySelector("my-header");
        if (header) {
          const fresh = doc.createElement("my-header");
          for (const a of header.attributes) if (a.name !== "data-ready") fresh.setAttribute(a.name, a.value);
          header.replaceWith(fresh);
        }
        localizeHeaderLinks();
        observer.takeRecords();
        root.SiamI18n.locale = next;
        root.dispatchEvent(new CustomEvent("siam:localechange", { detail: { locale: next } }));
      })
      .finally(() => { switching = null; });
    return switching;
  }
  // Language links in the header switch in place instead of loading the page again.
  doc.addEventListener("click", event => {
    const link = event.target.closest && event.target.closest("my-header [data-locale]");
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    setLocale(link.dataset.locale);
  }, true);
  root.SiamI18n = { locale, t: text => translate(text, locale), setLocale };
})(typeof window !== "undefined" ? window : globalThis);
