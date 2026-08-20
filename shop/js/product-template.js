// 📌 บังคับล้าง Cache รุ่นเก่าทิ้งทั้งหมด (อัปเดตเป็น v14)
if (!localStorage.getItem('cache_cleared_v14')) {
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith('siam_product_detail_')) {
      localStorage.removeItem(k);
    }
  });
  localStorage.setItem('cache_cleared_v14', 'true');
}

// 🔴 ตั้งค่า URL ให้ตรงกับ Backend และ Storage ของคุณ
var SIAM_API_URL = 'http://localhost:3000'; 
var SUPABASE_STORAGE_URL = 'http://192.168.1.199:8000'; 

// 1. ดึง ID หรือชื่อสินค้าจาก URL
var currentSearchParams = new URLSearchParams(window.location.search);
var urlRawId = currentSearchParams.get("id") || "astin";

function normalizeKeyString(str) {
  if (str === null || str === undefined) return "";
  return String(str).toLowerCase().replace(/[\s\-_]/g, "");
}

var activeProductId = urlRawId;
var activeProductData = null;

// 🟢 ฟังก์ชันช่วยเหลือสำหรับแปลงและดึง URL รูปภาพ
function fixImageUrlLocal(url) {
    if (!url || typeof url !== 'string') return '';
    
    // 1. ถ้ามี data: หรือ blob: นำหน้าอยู่แล้ว แปลว่าเป็นรูปที่พร้อมใช้งาน
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;
    
    // 2. ตรวจจับกรณีรูปเป็น Base64 เพียวๆ (ช่วยให้รูปแสดงผลได้)
    if (url.length > 200 && !/\.(png|jpe?g|gif|webp|svg)$/i.test(url)) {
        let mimeType = 'image/jpeg'; 
        if (url.startsWith('iVBORw')) mimeType = 'image/png';
        else if (url.startsWith('R0lGOD')) mimeType = 'image/gif';
        else if (url.startsWith('UklGR')) mimeType = 'image/webp';
        
        return `data:${mimeType};base64,${url}`;
    }

    // 3. กรณีเป็น Path ปกติ
    let cleanUrl = url
        .replace(/https:\/\/qzgfjnjrnenncgxqbrqe\.supabase\.co/g, SUPABASE_STORAGE_URL)
        .replace(/\/product-images\//g, '/products/');
        
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        return cleanUrl;
    }

    if (cleanUrl.startsWith('/storage/v1/')) {
        return `${SUPABASE_STORAGE_URL}${cleanUrl}`;
    }

    if (!cleanUrl.startsWith('/')) {
        return `${SIAM_API_URL}/uploads/${cleanUrl}`; 
    }

    return `${SIAM_API_URL}${cleanUrl}`;
}

// 2. ฟังก์ชันหลักสำหรับดึงข้อมูลและประกอบร่างข้อมูล
async function initializeProduct() {
  const cacheKey = `siam_product_detail_${normalizeKeyString(urlRawId)}`;
  let hasRenderedFast = false;
  
  // 🚀 ขั้นตอนที่ 1: โหลดจาก Cache ทันที
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    try {
      activeProductData = JSON.parse(cachedData);
      renderUI(); 
      hasRenderedFast = true;
    } catch (e) {}
  }

  // 💡 ขั้นตอนที่ 2: เตรียมโครงสร้างเปล่ารอรับข้อมูล
  if (!activeProductData) {
    activeProductData = {
      name: isNaN(urlRawId) ? urlRawId.toUpperCase() : "กำลังโหลดข้อมูล...",
      title: "กำลังโหลดข้อมูล...",
      description: "กรุณารอสักครู่...",
      images: [],
      banner1: "",
      banner2: "",
      reviews: [],
      ingredients: [],
      benefits: [],
      impactTexts: [],
      results: [],
      solutionTexts: [],
      warningTexts: [],
      warnings: [],
      warningTable: null,
      newPrice: "0",
      oldPrice: "0",
      rating: "5.0",
      reviewCount: 0
    };

    try {
      const shopCache = localStorage.getItem('siam_healthy_shop_products_cache');
      if (shopCache) {
        const allShopProducts = JSON.parse(shopCache);
        const matchedShop = allShopProducts.find(p => String(p.id) === urlRawId || normalizeKeyString(p.name) === normalizeKeyString(urlRawId));
        if (matchedShop) {
          activeProductData.name = matchedShop.name;
          activeProductData.title = matchedShop.name;
          if (matchedShop.price != null) activeProductData.newPrice = matchedShop.price.toString();
          if (matchedShop.oldPrice != null) activeProductData.oldPrice = matchedShop.oldPrice.toString();
          if (matchedShop.images && matchedShop.images.length > 0) {
             activeProductData.images = matchedShop.images.map(img => fixImageUrlLocal(img));
          }
        }
      }
    } catch (e) {}

    renderUI();
  }

  // --- ⏳ ขั้นตอนที่ 3: ดึงข้อมูลล่าสุดจาก Backend ---
  try {
    const response = await fetch(`${SIAM_API_URL}/products/${encodeURIComponent(urlRawId)}`);
    
    if (response.ok) {
      const dbProduct = await response.json();
      
      activeProductId = dbProduct.id;
      if (dbProduct.name) { 
        activeProductData.name = dbProduct.name; 
        activeProductData.title = `Siam-Healthy - ${dbProduct.name}`; 
      }
      if (dbProduct.description) activeProductData.description = dbProduct.description;
      if (dbProduct.fda) activeProductData.fda = dbProduct.fda;
      if (dbProduct.price != null) activeProductData.newPrice = dbProduct.price.toString();
      if (dbProduct.oldPrice != null) activeProductData.oldPrice = dbProduct.oldPrice.toString();

      if (typeof productsData !== "undefined" && dbProduct.name) {
        const targetStaticKey = normalizeKeyString(dbProduct.name);
        const matchedKey = Object.keys(productsData).find(key => normalizeKeyString(key) === targetStaticKey);
        
        if (matchedKey && productsData[matchedKey]) {
          const staticData = productsData[matchedKey];
          activeProductData.benefits = staticData.benefits || [];
          activeProductData.warningTitle = staticData.warningTitle || "";
          activeProductData.warnings = staticData.warnings || [];
          activeProductData.warningTable = staticData.warningTable || null;
          activeProductData.resultsTitle = staticData.resultsTitle || "";
          activeProductData.results = staticData.results || [];
          activeProductData.solutionTitle = staticData.solutionTitle || "";
          activeProductData.solutionTexts = staticData.solutionTexts || [];
          activeProductData.impactTitle = staticData.impactTitle || "";
          activeProductData.impactTexts = staticData.impactTexts || [];
        }
      }

      if (dbProduct.banner_url) {
        activeProductData.banner1 = fixImageUrlLocal(dbProduct.banner_url);
      }

      let parsedImages = [];
      if (typeof dbProduct.images === 'string') {
         try { parsedImages = JSON.parse(dbProduct.images); } catch(e) { parsedImages = [dbProduct.images]; }
      } else if (Array.isArray(dbProduct.images)) {
         parsedImages = dbProduct.images;
      }

      if (parsedImages.length > 0) {
        activeProductData.images = parsedImages.map(img => fixImageUrlLocal(img)).filter(Boolean);
      }

      if (dbProduct.product_ingredients && dbProduct.product_ingredients.length > 0) {
        activeProductData.ingredients = dbProduct.product_ingredients.map(ing => {
          return { 
            name: ing.name, 
            props: typeof ing.properties === 'string' ? JSON.parse(ing.properties) : (ing.properties || []), 
            img: fixImageUrlLocal(ing.image_url || ing.image_data)
          };
        });
      }

      if (dbProduct.product_reviews && dbProduct.product_reviews.length > 0) {
        activeProductData.reviewCount = dbProduct.product_reviews.length;
        let sumRating = dbProduct.product_reviews.reduce((acc, rev) => acc + (rev.rating || 5), 0);
        activeProductData.rating = (sumRating / activeProductData.reviewCount).toFixed(1);
        
        activeProductData.reviews = dbProduct.product_reviews.map(rev => ({
          name: rev.reviewer_name,
          rating: rev.rating || 5,
          text: rev.review_text || "",
          img: fixImageUrlLocal(rev.image_url || rev.image_data)
        }));
      }

      // พยายามเก็บลง Cache แต่ถ้า Base64 ใหญ่เกินโควต้า 5MB ก็ให้ข้ามไป
      try {
        localStorage.setItem(cacheKey, JSON.stringify(activeProductData));
      } catch (quotaErr) {
        localStorage.removeItem(cacheKey); 
        console.warn("Payload size exceeds localStorage limits (likely due to large Base64). Caching skipped.");
      }

      renderUI();
    }
  } catch (err) {
    console.warn("Backend offline or product not found.", err);
  }
}

// 3. โค้ดสร้างหน้าจอ (DOM Manipulation)
function renderUI() {
  if (activeProductData && Object.keys(activeProductData).length > 0) {
    
    if (document.getElementById("page-title")) document.getElementById("page-title").textContent = activeProductData.title || activeProductData.name;
    if (document.getElementById("productName")) document.getElementById("productName").textContent = activeProductData.name;
    if (document.getElementById("productReviewCount")) document.getElementById("productReviewCount").textContent = `${activeProductData.rating || "5.0"} (${activeProductData.reviewCount || 0} Review)`;
    if (document.getElementById("productDescription")) document.getElementById("productDescription").textContent = activeProductData.description || "";
    if (document.getElementById("productFda")) document.getElementById("productFda").innerHTML = activeProductData.fda || "";
    if (document.getElementById("oldPrice")) document.getElementById("oldPrice").textContent = activeProductData.oldPrice && activeProductData.oldPrice !== "0" ? `฿${Number(activeProductData.oldPrice).toLocaleString()}` : "";
    if (document.getElementById("newPrice")) document.getElementById("newPrice").textContent = activeProductData.newPrice && activeProductData.newPrice !== "0" ? `฿${Number(activeProductData.newPrice).toLocaleString()}` : "";

    // แบนเนอร์ 1 (ตั้งค่า Priority สูงสุด)
    const banner = document.getElementById("bannerImage1");
    const bannerContainer = document.querySelector(".warning-left-image");
    const warningRightContent = document.querySelector(".warning-right-content");

    if (activeProductData.banner1) {
      if (banner) { 
          banner.src = activeProductData.banner1; 
          banner.setAttribute("decoding", "async"); // ป้องกันเว็บค้าง
          banner.setAttribute("fetchpriority", "high"); // เร่งโหลดรูปแรก
          banner.style.display = "block"; 
      }
      if (bannerContainer) bannerContainer.style.display = "block";
      if (warningRightContent) warningRightContent.style.width = "";
    } else {
      if (bannerContainer) bannerContainer.style.display = "none";
      if (warningRightContent) warningRightContent.style.width = "100%";
    }

    // แบนเนอร์ 2 (ตั้งค่า Lazy Load)
    const banner2Container = document.getElementById("banner2Container");
    const banner2 = document.getElementById("bannerImage2");
    
    if (activeProductData.banner2 && banner2Container && banner2) {
      banner2.src = activeProductData.banner2;
      banner2.setAttribute("loading", "lazy");
      banner2.setAttribute("decoding", "async");
      banner2Container.style.display = "block";
    } else if (banner2Container) {
      banner2Container.style.display = "none";
    }

    // จัดการรูปภาพแกลลอรี่สินค้า
    const mainProductImg = document.getElementById("mainProduct");
    const thumbList = document.getElementById("thumbList");
    const prevBtn = document.getElementById("prevImgBtn");
    const nextBtn = document.getElementById("nextImgBtn");

    if (mainProductImg && thumbList && activeProductData.images && activeProductData.images.length > 0) {
      thumbList.innerHTML = "";
      let currentImageIndex = 0;

      // เซ็ตความเร็วในการเปลี่ยนรูปหลัก และ ป้องกันการบล็อก Thread
      mainProductImg.setAttribute("decoding", "async");
      mainProductImg.setAttribute("fetchpriority", "high");

      function updateMainImage(index) {
        currentImageIndex = index;
        const targetSrc = activeProductData.images[currentImageIndex];
        mainProductImg.style.opacity = "0.4";
        mainProductImg.style.transform = "scale(0.97)";
        setTimeout(() => {
          mainProductImg.src = targetSrc;
          mainProductImg.style.opacity = "1";
          mainProductImg.style.transform = "scale(1)";
        }, 150);

        const thumbImages = thumbList.querySelectorAll("img");
        thumbImages.forEach((el, idx) => {
          if (idx === currentImageIndex) {
            el.classList.add("active");
            el.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
          } else {
            el.classList.remove("active");
          }
        });
      }

      activeProductData.images.forEach((imgSrc, index) => {
        const imgElement = document.createElement("img");
        imgElement.src = imgSrc;
        imgElement.setAttribute("decoding", "async");
        // รูป Thumbnail อันแรกให้โหลดทันที นอกนั้นให้โหลดแบบ Lazy
        imgElement.setAttribute("loading", index === 0 ? "eager" : "lazy");
        if (index === 0) imgElement.classList.add("active");
        imgElement.onclick = () => updateMainImage(index);
        thumbList.appendChild(imgElement);
      });

      if (activeProductData.images.length > 0) {
         mainProductImg.src = activeProductData.images[0];
      }
      mainProductImg.style.transition = "opacity 0.25s ease, transform 0.25s ease";

      if (prevBtn) {
        prevBtn.onclick = () => {
          let newIndex = currentImageIndex - 1;
          if (newIndex < 0) newIndex = activeProductData.images.length - 1;
          updateMainImage(newIndex);
        };
      }

      if (nextBtn) {
        nextBtn.onclick = () => {
          let newIndex = currentImageIndex + 1;
          if (newIndex >= activeProductData.images.length) newIndex = 0;
          updateMainImage(newIndex);
        };
      }

      thumbList.style.display = "flex";
      thumbList.style.gap = "10px";
      thumbList.style.overflowX = "auto";
      thumbList.style.scrollBehavior = "smooth";
    } else if (mainProductImg) {
       mainProductImg.src = "https://via.placeholder.com/600x600?text=No+Image";
       if(thumbList) thumbList.innerHTML = "";
    }

    // ประโยชน์ (Benefits)
    const benefitList = document.getElementById("benefitList");
    if (benefitList && activeProductData.benefits && activeProductData.benefits.length > 0) {
      benefitList.innerHTML = "";
      activeProductData.benefits.forEach((benefit) => {
        benefitList.innerHTML += `<div class="benefit-item"><div class="check">✓</div><span>${benefit}</span></div>`;
      });
    } else if (benefitList) {
      benefitList.innerHTML = ""; 
    }

    // จำนวนสินค้าที่ต้องการสั่ง
    const decreaseBtn = document.getElementById("decreaseBtn");
    const increaseBtn = document.getElementById("increaseBtn");
    const quantityInput = document.getElementById("quantityInput");
    let currentQuantity = 1;

    if (decreaseBtn && increaseBtn && quantityInput) {
      const updateButtonState = () => {
        if (currentQuantity <= 1) decreaseBtn.classList.add("disabled");
        else decreaseBtn.classList.remove("disabled");
      };
      decreaseBtn.onclick = () => {
        if (currentQuantity > 1) { currentQuantity--; quantityInput.value = currentQuantity; updateButtonState(); }
      };
      increaseBtn.onclick = () => {
        currentQuantity++; quantityInput.value = currentQuantity; updateButtonState();
      };
      updateButtonState();
    }

    // Warnings (ข้อควรระวัง)
    const warningSectionEl = document.querySelector(".warning-layout-section");
    const warningTitleEl = document.getElementById("warningTitle");
    const warningBox = document.getElementById("warningBox");
    const hasWarningData = activeProductData.warningTitle || (activeProductData.warningTable && activeProductData.warningTable.headers) || (activeProductData.warningTexts && activeProductData.warningTexts.length > 0) || (activeProductData.warnings && activeProductData.warnings.length > 0);

    if (hasWarningData && warningBox) {
      if (warningSectionEl) warningSectionEl.style.display = "";
      if (warningTitleEl && activeProductData.warningTitle) warningTitleEl.textContent = activeProductData.warningTitle;
      warningBox.innerHTML = "";

      if (activeProductData.warningTable && activeProductData.warningTable.headers && activeProductData.warningTable.rows) {
        warningBox.className = "warning-table-wrapper reveal-on-scroll";
        let tableHTML = `<div style="overflow-x: auto; width: 100%;"><table class="custom-result-table warning-table"><thead><tr>`;
        activeProductData.warningTable.headers.forEach(h => tableHTML += `<th>${h}</th>`);
        tableHTML += `</tr></thead><tbody>`;
        activeProductData.warningTable.rows.forEach(row => {
          tableHTML += `<tr>`;
          row.forEach(cell => {
            let cellContent = "";
            if (Array.isArray(cell)) {
              let listItems = cell.map(item => `<li style="margin-bottom: 4px; position: relative; padding-left: 14px;"><span style="position: absolute; left: 0; color: #e53e3e;">•</span>${item}</li>`).join("");
              cellContent = `<ul style="list-style: none; padding: 0; margin: 0; color: #4a5568; line-height: 1.6;">${listItems}</ul>`;
            } else {
              let formattedCell = cell;
              const colonIndex = cell.indexOf(":");
              if (colonIndex !== -1) {
                let titlePart = cell.substring(0, colonIndex).trim();
                let descPart = cell.substring(colonIndex + 1).trim();
                formattedCell = `<strong style="color: #c53030; display: block; margin-bottom: 4px; font-size: 14.5px;">${titlePart}:</strong> <span style="color: #4a5568; line-height: 1.6;">${descPart}</span>`;
              } else {
                formattedCell = `<span style="line-height: 1.6; color: #2d3748;">${cell}</span>`;
              }
              cellContent = formattedCell;
            }
            tableHTML += `<td style="vertical-align: top; padding: 12px 14px;">${cellContent}</td>`;
          });
          tableHTML += `</tr>`;
        });
        tableHTML += `</tbody></table></div>`;
        warningBox.innerHTML = tableHTML;
      } else if (activeProductData.warningTexts && activeProductData.warningTexts.length > 0) {
        warningBox.className = "accordion-container reveal-on-scroll";
        let introP = document.getElementById("warningIntro");
        if (!introP) {
          introP = document.createElement("p");
          introP.id = "warningIntro";
          introP.style.cssText = "color: #555; line-height: 1.7; margin-bottom: 20px; font-size: 16px;";
          warningBox.parentNode.insertBefore(introP, warningBox);
        }
        introP.innerHTML = activeProductData.warningTexts[0];
        const accordionTexts = activeProductData.warningTexts.slice(1);
        accordionTexts.forEach((text, index) => {
          const itemEl = document.createElement("div");
          itemEl.className = `accordion-item warning-type`;
          let titleText = `สัญญาณเตือนส่วนที่ ${index + 1}`;
          let bodyText = text;
          const match = text.match(/<b>(.*?)<\/b>/);
          if (match && match[1]) {
            titleText = match[1].replace(":", "").trim();
            bodyText = text.replace(/<b>.*?<\/b>:\s*/, "").replace(/<b>.*?<\/b>/, "").trim();
          }
          itemEl.innerHTML = `<button class="accordion-header"><span>${titleText}</span><i class="fa-solid fa-chevron-down accordion-icon"></i></button><div class="accordion-content" style="max-height: 0; padding-bottom: 0;"><p style="margin: 0; padding-top: 5px;">${bodyText}</p></div>`;
          const header = itemEl.querySelector(".accordion-header");
          header.onclick = () => {
            const content = itemEl.querySelector(".accordion-content");
            itemEl.classList.toggle("active");
            if (itemEl.classList.contains("active")) {
              content.style.maxHeight = content.scrollHeight + "px";
              content.style.paddingBottom = "25px";
            } else {
              content.style.maxHeight = "0";
              content.style.paddingBottom = "0";
            }
          };
          warningBox.appendChild(itemEl);
        });
      } else if (activeProductData.warnings && activeProductData.warnings.length > 0) {
        warningBox.className = "accordion-container reveal-on-scroll";
        activeProductData.warnings.forEach((warning) => {
          const itemEl = document.createElement("div");
          itemEl.className = `accordion-item`;
          itemEl.innerHTML = `
            <button class="accordion-header"><span>${warning.title}</span><i class="fa-solid fa-chevron-down accordion-icon"></i></button>
            <div class="accordion-content" style="max-height: 0; padding-bottom: 0;"><ul>${warning.items.map(i => `<li>${i}</li>`).join('')}</ul></div>`;
          const header = itemEl.querySelector(".accordion-header");
          header.onclick = () => {
            const content = itemEl.querySelector(".accordion-content");
            itemEl.classList.toggle("active");
            if (itemEl.classList.contains("active")) {
              content.style.maxHeight = content.scrollHeight + "px"; content.style.paddingBottom = "25px";
            } else {
              content.style.maxHeight = "0"; content.style.paddingBottom = "0";
            }
          };
          warningBox.appendChild(itemEl);
        });
      }
    } else {
      if (warningSectionEl) warningSectionEl.style.display = "none";
    }

    // Solutions (แนวทางฟื้นฟู)
    const solutionTitleEl = document.getElementById("solutionTitle");
    const solutionBox = document.getElementById("solutionBox");
    
    if (activeProductData.solutionTitle && activeProductData.solutionTexts && activeProductData.solutionTexts.length > 0) {
      if (solutionTitleEl) { solutionTitleEl.textContent = activeProductData.solutionTitle; solutionTitleEl.style.display = "block"; }
      if (solutionBox) {
        solutionBox.style.display = "block";
        solutionBox.innerHTML = "";
        solutionBox.className = "accordion-container reveal-on-scroll";
        
        let introP = document.getElementById("solutionIntro");
        if (!introP && activeProductData.solutionTexts[0]) {
          introP = document.createElement("p");
          introP.id = "solutionIntro";
          introP.style.cssText = "color: #555; line-height: 1.7; margin-bottom: 20px; font-size: 16px;";
          solutionBox.parentNode.insertBefore(introP, solutionBox);
        }
        if(introP) { introP.innerHTML = activeProductData.solutionTexts[0]; introP.style.display = "block"; }

        const accordionTexts = activeProductData.solutionTexts.slice(1);
        accordionTexts.forEach((text, index) => {
          const itemEl = document.createElement("div");
          itemEl.className = `accordion-item solution-type`;
          let titleText = `แนวทางฟื้นฟูส่วนที่ ${index + 1}`;
          let bodyText = text;
          const match = text.match(/<b>(.*?)<\/b>/);
          if (match && match[1]) {
            titleText = match[1].replace(":", "").trim();
            bodyText = text.replace(/<b>.*?<\/b>:\s*/, "").replace(/<b>.*?<\/b>/, "").trim();
          }
          itemEl.innerHTML = `<button class="accordion-header"><span>${titleText}</span><i class="fa-solid fa-chevron-down accordion-icon"></i></button><div class="accordion-content" style="max-height: 0; padding-bottom: 0;"><p style="margin: 0; padding-top: 5px;">${bodyText}</p></div>`;
          const header = itemEl.querySelector(".accordion-header");
          header.onclick = () => {
            const content = itemEl.querySelector(".accordion-content");
            itemEl.classList.toggle("active");
            if (itemEl.classList.contains("active")) {
              content.style.maxHeight = content.scrollHeight + "px"; content.style.paddingBottom = "25px";
            } else {
              content.style.maxHeight = "0"; content.style.paddingBottom = "0";
            }
          };
          solutionBox.appendChild(itemEl);
        });
      }
    } else {
      if (solutionTitleEl) solutionTitleEl.style.display = "none";
      if (solutionBox) solutionBox.style.display = "none";
      const introP = document.getElementById("solutionIntro");
      if (introP) introP.style.display = "none";
    }

    // Results (ผลลัพธ์)
    const resultTitleEl = document.getElementById("resultTitle");
    const resultImageEl = document.getElementById("resultImage");
    const resultListEl = document.getElementById("resultList");
    const resultTableContainer = document.getElementById("resultTableContainer");
    const resultsWrapper = document.querySelector(".results-flex-wrapper");
    const hasResultData = (activeProductData.resultTable && activeProductData.resultTable.headers) || (activeProductData.results && activeProductData.results.length > 0);

    if (resultTitleEl) {
      if (hasResultData && activeProductData.resultsTitle) { resultTitleEl.textContent = activeProductData.resultsTitle; resultTitleEl.style.display = "block"; } 
      else resultTitleEl.style.display = "none";
    }

    if (resultImageEl) {
      if (activeProductData.resultImage) { 
          resultImageEl.src = activeProductData.resultImage; 
          resultImageEl.setAttribute("loading", "lazy");
          resultImageEl.setAttribute("decoding", "async");
          if (resultImageEl.parentElement) resultImageEl.parentElement.style.display = "block"; 
      } 
      else if (resultImageEl.parentElement) resultImageEl.parentElement.style.display = "none";
    }

    if (resultsWrapper) {
      if (!hasResultData) resultsWrapper.style.display = "none";
      else {
        resultsWrapper.style.display = "flex";
        if (activeProductData.resultTable && activeProductData.resultTable.headers && activeProductData.resultTable.rows) {
          if (resultListEl) resultListEl.style.display = "none";
          if (resultTableContainer) {
            resultTableContainer.style.display = "block";
            let tableHTML = `<table class="custom-result-table"><thead><tr>`;
            activeProductData.resultTable.headers.forEach((header) => { tableHTML += `<th>${header}</th>`; });
            tableHTML += `</tr></thead><tbody>`;
            activeProductData.resultTable.rows.forEach((row) => {
              tableHTML += `<tr>`;
              row.forEach((cell) => {
                let formattedCell = cell;
                const colonIndex = cell.indexOf(":");
                if (colonIndex !== -1) {
                  let titlePart = cell.substring(0, colonIndex).trim();
                  let descPart = cell.substring(colonIndex + 1).trim();
                  formattedCell = `<strong style="color: #111; display: block; margin-bottom: 6px; font-size: 14.5px;">${titlePart}:</strong> <span style="color: #555; line-height: 1.6;">${descPart}</span>`;
                }
                tableHTML += `<td>${formattedCell}</td>`;
              });
              tableHTML += `</tr>`;
            });
            tableHTML += `</tbody></table>`;
            resultTableContainer.innerHTML = tableHTML;
          }
        } else if (activeProductData.results && activeProductData.results.length > 0) {
          if (resultTableContainer) resultTableContainer.style.display = "none";
          if (resultListEl) {
            resultListEl.style.display = "flex";
            resultListEl.innerHTML = "";
            activeProductData.results.forEach((item, index) => {
              if (typeof item === "object" && item !== null) {
                let propsItems = item.props ? item.props.map((p) => `<li><span class="step-dot"></span><span>${p}</span></li>`).join("") : "";
                resultListEl.innerHTML += `<li class="result-timeline-card"><div class="result-card-header"><span class="phase-badge"><i class="fa-solid fa-calendar-check"></i> ${item.title.split(":")[0] || "ระยะที่ " + (index + 1)}</span><h3 class="result-card-title">${item.title.includes(":") ? item.title.split(":")[1].trim() : item.title}</h3></div><ul class="result-card-props">${propsItems}</ul></li>`;
              } else if (typeof item === "string") {
                let boldPart = "";
                let textPart = item;
                const match = item.match(/<b>(.*?)<\/b>/);
                if (match && match[1]) {
                  boldPart = `<b>${match[1]}</b>`;
                  textPart = item.replace(/<b>.*?<\/b>:\s*/, "").replace(/<b>.*?<\/b>/, "").trim();
                }
                resultListEl.innerHTML += `<li>${boldPart}<div class="card-detail-text">${textPart}</div></li>`;
              }
            });
          }
        }
      }
    }

    // Ingredients (ส่วนผสม)
    const ingredientTitleEl = document.getElementById("ingredientTitle");
    if (ingredientTitleEl && activeProductData.ingredientTitle) ingredientTitleEl.textContent = activeProductData.ingredientTitle;

    const ingredientGrid = document.getElementById("ingredientGrid");
    if (ingredientGrid && activeProductData.ingredients && activeProductData.ingredients.length > 0) {
      ingredientGrid.className = "ingredient-grid reveal-on-scroll";
      ingredientGrid.innerHTML = "";
      activeProductData.ingredients.forEach((ing) => {
        let propsItems = (ing.props || []).map((prop) => `<li>${prop}</li>`).join("");
        
        // 🟢 เพิ่ม loading="lazy" และ decoding="async" ให้ส่วนผสม (แก้ความช้า)
        let imgHtml = ing.img 
          ? `<img src="${ing.img}" alt="${ing.name}" loading="lazy" decoding="async" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" onerror="this.onerror=null; this.parentNode.innerHTML='<div style=\\'width:100%; height:100%; background-color:#e2e8f0; border-radius:50%;\\'></div>';" />` 
          : `<div style="width:100%; height:100%; background-color:#e2e8f0; border-radius:50%;"></div>`;
          
        ingredientGrid.innerHTML += `<div class="ingredient-card"><div class="ingredient-image">${imgHtml}</div><h3>${ing.name}</h3><ul>${propsItems}</ul></div>`;
      });
      ingredientGrid.style.display = "grid";
    } else if (ingredientGrid) {
      ingredientGrid.style.display = "none";
    }

    // Observer 
    const observerOptions = { threshold: 0.15 };
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
      });
    }, observerOptions);
    document.querySelectorAll(".reveal-on-scroll").forEach((el) => { observer.observe(el); });

    // Review Summary
    const bigRatingEl = document.getElementById("summaryBigRating");
    const sumReviewCountEl = document.getElementById("summaryReviewCount");
    if (bigRatingEl && activeProductData.rating) bigRatingEl.textContent = activeProductData.rating;
    if (sumReviewCountEl && activeProductData.reviewCount) {
      let formattedCount = activeProductData.reviewCount > 1000 ? (activeProductData.reviewCount / 1000).toFixed(1) + "k" : activeProductData.reviewCount;
      sumReviewCountEl.textContent = formattedCount;
    }

    // Review List
    const reviewList = document.getElementById("reviewList");
    if (reviewList && activeProductData.reviews && activeProductData.reviews.length > 0) {
      reviewList.innerHTML = "";
      activeProductData.reviews.forEach((review) => {
        // 🟢 เพิ่ม loading="lazy" และ decoding="async" ให้รีวิว (แก้ความช้า)
        let imgHTML = review.img ? `<img class="review-image" src="${review.img}" alt="Review Image" loading="lazy" decoding="async" style="margin-top: 10px;" onerror="this.style.display='none'" />` : "";
        let starCount = review.rating || 5;
        let starsHTML = `<div class="stars-orange" style="font-size: 18px; margin-top: -2px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">`;
        let starsIcon = "";
        for (let i = 1; i <= 5; i++) { starsIcon += (i <= starCount) ? "★" : "☆"; }
        starsHTML += `<span style="letter-spacing: 2px;">${starsIcon}</span><span style="font-size: 14px; color: #555; font-weight: 500;">(${starCount} ดาว)</span></div>`;
        reviewList.innerHTML += `<div class="review-comment"><div class="user-name" style="margin-bottom: 4px;">${review.name}</div>${starsHTML}<div class="review-text">${review.text}</div>${imgHTML}</div>`;
      });
      document.querySelector(".review-container").style.display = "block";
    } else if (reviewList) {
      const reviewContainer = document.querySelector(".review-container");
      if (reviewContainer) reviewContainer.style.display = "none";
      const reviewHeading = document.querySelector("h2:contains('ยืนยันประสิทธิภาพจากผู้ใช้จริง')");
      if (reviewHeading) reviewHeading.style.display = "none";
    }

    // Impact Section
    const impactSectionEl = document.querySelector(".impact-section");
    const impactTitleEl = document.getElementById("impactTitle");
    const impactGridEl = document.getElementById("impactGrid");
    const hasImpactData = activeProductData.impactTitle && activeProductData.impactTexts && activeProductData.impactTexts.length > 0;

    if (hasImpactData) {
      if (impactSectionEl) impactSectionEl.style.display = "block";
      if (impactTitleEl) impactTitleEl.textContent = activeProductData.impactTitle;
      if (impactGridEl) {
        impactGridEl.innerHTML = "";
        let introP = document.getElementById("impactIntro");
        if (introP) introP.innerHTML = activeProductData.impactTexts[0];
        const cardsData = activeProductData.impactTexts.slice(1);
        cardsData.forEach((text, index) => {
          let cardTitle = `ผลกระทบที่ ${index + 1}`;
          let cardBody = text;
          const match = text.match(/<b>(.*?)<\/b>/);
          if (match && match[1]) { cardTitle = match[1].replace(":", "").trim(); cardBody = text.replace(/<b>.*?<\/b>:\s*/, "").replace(/<b>.*?<\/b>/, "").trim(); }
          const cardEl = document.createElement("div");
          cardEl.className = "impact-card";
          cardEl.innerHTML = `<div class="impact-card-header"><div class="impact-icon-box"><i class="fa-solid fa-triangle-exclamation"></i></div><h3 class="impact-card-title">${cardTitle}</h3></div><div class="impact-card-body">${cardBody}</div>`;
          impactGridEl.appendChild(cardEl);
        });
      }
    } else {
      if (impactSectionEl) impactSectionEl.style.display = "none";
    }

    // Related Products 
    const relatedContainer = document.getElementById("relatedProductsContainer");
    if (relatedContainer) {
      try {
        const shopCache = localStorage.getItem('siam_healthy_shop_products_cache');
        if (shopCache) {
          const allShopProducts = JSON.parse(shopCache);
          const otherProducts = allShopProducts.filter(p => String(p.id) !== activeProductId && normalizeKeyString(p.name) !== normalizeKeyString(activeProductData.name));
          const shuffled = otherProducts.sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 4);

          if (selected.length > 0) {
            let relatedHTML = `<div class="related-products-section reveal-on-scroll visible"><div class="related-header"><h2>สินค้าที่คุณอาจสนใจ</h2><a href="../shop/" class="view-all-link">ดูสินค้าทั้งหมด <i class="fa-solid fa-arrow-right"></i></a></div><div class="products related-products-grid">`;
            selected.forEach((item) => {
              const imgCover = (item.images && item.images.length > 0) ? fixImageUrlLocal(item.images[0]) : "https://via.placeholder.com/300?text=No+Image";
              relatedHTML += `<div class="product-card animate-in" onclick="window.location.href='product.html?id=${item.id}';"><div class="product-image"><img src="${imgCover}" alt="${item.name}" loading="lazy" decoding="async"></div><h3 class="product-title">${item.name}</h3><p class="product-tag">#ผลิตภัณฑ์เสริมอาหาร</p><p class="product-price"><span class="new-price">฿${Number(item.price).toLocaleString()}</span></p></div>`;
            });
            relatedHTML += `</div></div>`;
            relatedContainer.innerHTML = relatedHTML;
          }
        }
      } catch(e){}
    }
  } else {
    const pageContainer = document.querySelector(".product-page");
    if (pageContainer) pageContainer.innerHTML = "<div style='text-align:center; padding: 100px 20px;'><h1>ขออภัย ไม่พบสินค้านี้</h1><a href='../shop/' style='color:#f15a24; text-decoration:underline;'>กลับไปหน้าร้านค้า</a></div>";
  }

  updateCartBadge();
}

function showToast(productName, quantity) {
  let toast = document.getElementById("cartToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cartToast";
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i><div class="toast-content"><h4 id="toastTitle">เพิ่มลงตะกร้าแล้ว</h4><p id="toastDesc"></p></div>`;
    document.body.appendChild(toast);
  }
  document.getElementById("toastTitle").textContent = "เพิ่มลงตะกร้าสำเร็จ";
  document.getElementById("toastDesc").textContent = `${productName} (x${quantity})`;
  setTimeout(() => toast.classList.add("show"), 10);
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => { toast.classList.remove("show"); }, 3000);
}

function addToCart(isBuyNow = false) {
  if (!activeProductData) return;
  const quantityInput = document.getElementById("quantityInput");
  const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
  let cart = JSON.parse(localStorage.getItem("siam_healthy_cart")) || [];
  const existingItemIndex = cart.findIndex((item) => item.id === activeProductId);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      id: activeProductId,
      name: activeProductData.name,
      price: parseFloat(activeProductData.newPrice ? activeProductData.newPrice.replace(/[^0-9.]/g, "") : 0),
      oldPrice: activeProductData.oldPrice ? parseFloat(activeProductData.oldPrice.replace(/[^0-9.]/g, "")) : null,
      image: activeProductData.images && activeProductData.images.length > 0 ? activeProductData.images[0] : "",
      tag: (activeProductData.benefits && activeProductData.benefits[0]) || "#ผลิตภัณฑ์เสริมอาหาร",
      quantity: quantity,
      selected: true,
    });
  }
  localStorage.setItem("siam_healthy_cart", JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("cartUpdated"));
  if (isBuyNow) window.location.href = "../cart/";
  else { showToast(activeProductData.name, quantity); updateCartBadge(); }
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("siam_healthy_cart")) || [];
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll(".cart-badge").forEach((badge) => {
    if (totalCount > 0) { badge.innerText = totalCount; badge.style.display = "flex"; } 
    else { badge.innerText = ""; badge.style.display = "none"; }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeProduct();
  const cartBtn = document.querySelector(".cart-btn-minimal");
  const buyBtn = document.querySelector(".buy-btn-black");
  if (cartBtn) cartBtn.onclick = () => addToCart(false);
  if (buyBtn) buyBtn.onclick = () => addToCart(true);
});
