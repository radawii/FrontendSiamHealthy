const viewAllBtn = document.getElementById('viewAllBtn');
// ค้นหาสินค้าทั้งหมดที่มีคลาส hidden ตั้งแต่แรก (ชิ้นที่ 5 ถึง 16 ของคุณ)
const hiddenProducts = document.querySelectorAll('.product-card.hidden');

// ตั้งสถานะเริ่มต้น (false = ยังไม่กางออก)
let isExpanded = false;

viewAllBtn.addEventListener('click', function() {
  isExpanded = !isExpanded; // สลับสถานะจริง/เท็จ

  hiddenProducts.forEach(product => {
    if (isExpanded) {
      // ถ้าสถานะเป็นจริง ให้ยอมให้แสดงผลโดยการลบคลาส hidden ออกชั่วคราว
      product.style.display = 'block'; 
    } else {
      // ถ้าสถานะเป็นเท็จ ให้กลับไปใช้ค่าเริ่มต้น (โดน CSS ซ่อนเหมือนเดิม)
      product.style.display = ''; 
    }
  });

  // เปลี่ยนข้อความที่แสดงบนปุ่ม
  if (isExpanded) {
    this.textContent = 'ซ่อนบางส่วน';
  } else {
    this.textContent = 'ดูทั้งหมด';
    
    // ช่วเลื่อนหน้าจอกลับขึ้นมาโฟกัสที่ปุ่มหลังจากที่หดหน้าเว็บสั้นลง
    viewAllBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

const articleBtn = document.getElementById('viewAllArticlesBtn');
const hiddenArticles = document.querySelectorAll('.article-card.hidden');
let isArticleExpanded = false;

articleBtn.addEventListener('click', function() {
  isArticleExpanded = !isArticleExpanded;
  
  hiddenArticles.forEach((article, index) => {
    if (isArticleExpanded) {
      // ค่อยๆ ทยอยโผล่มาทีละตัวตามลำดับ (Stagger Effect)
      setTimeout(() => {
        article.classList.add('show-fade');
      }, index * 100); 
    } else {
      article.classList.remove('show-fade');
    }
  });

  this.textContent = isArticleExpanded ? 'ซ่อนบางส่วน' : 'ดูทั้งหมด';
});