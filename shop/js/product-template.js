// 1. ดึง ID สินค้าจาก URL (เช่น product.html?id=astin)
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id") || "astin"; // ถ้าไม่มี id ให้ default เป็น astin

// 2. ดึงข้อมูลสินค้าจาก Object
const product = productsData[productId];

if (product) {
  // --- อัปเดตข้อมูลทั่วไป ---
  document.getElementById("page-title").textContent = product.title;
  document.getElementById("productName").textContent = product.name;
  document.getElementById("productReviewCount").textContent =
    `${product.rating} (${product.reviewCount} Review)`;
  document.getElementById("productDescription").textContent =
    product.description;
  document.getElementById("productFda").innerHTML = product.fda;
  document.getElementById("oldPrice").textContent = product.oldPrice;
  document.getElementById("newPrice").textContent = product.newPrice;

  // --- แบนเนอร์ & ปรับเลย์เอาต์ Warning (barner1) ---
  const banner = document.getElementById("bannerImage1");
  const bannerContainer = document.querySelector(".warning-left-image");
  const warningRightContent = document.querySelector(".warning-right-content");

  if (product.banner1) {
    if (banner) {
      banner.src = product.banner1;
      banner.style.display = "block";
    }
    if (bannerContainer) bannerContainer.style.display = "block";
    if (warningRightContent) warningRightContent.style.width = ""; // คืนค่าความกว้างแบ่งซ้าย-ขวาตาม CSS
  } else {
    // ถ้าไม่มีข้อมูล banner1 ให้ซ่อนฝั่งซ้าย และขยายฝั่งขวาเต็ม 100%
    if (bannerContainer) bannerContainer.style.display = "none";
    if (warningRightContent) warningRightContent.style.width = "100%";
  }

  // --- แบนเนอร์ 2 (แสดงผลตรงกลาง ขนาดพอดี barner2) ---
  const banner2Container = document.getElementById("banner2Container");
  const banner2 = document.getElementById("bannerImage2");

  if (product.banner2 && banner2Container && banner2) {
    banner2.src = product.banner2;
    banner2Container.style.display = "block";
  } else if (banner2Container) {
    banner2Container.style.display = "none";
  }

  // --- รูปภาพและแกลลอรี่ (รองรับปุ่มกดลูกศรซ้าย-ขวา และ Transition สมูทๆ) ---
  const mainProductImg = document.getElementById("mainProduct");
  const thumbList = document.getElementById("thumbList");
  const prevBtn = document.getElementById("prevImgBtn");
  const nextBtn = document.getElementById("nextImgBtn");

  if (
    mainProductImg &&
    thumbList &&
    product.images &&
    product.images.length > 0
  ) {
    thumbList.innerHTML = ""; // เคลียร์ของเก่า
    let currentImageIndex = 0; // เก็บสถานะว่าตอนนี้อยู่ที่รูปไหน

    // ฟังก์ชันสำหรับเปลี่ยนรูปภาพพร้อมเอฟเฟกต์เฟด
    function updateMainImage(index) {
      currentImageIndex = index;
      const targetSrc = product.images[currentImageIndex];

      // เอฟเฟกต์เฟดรูปให้จางลงเล็กน้อยก่อนเปลี่ยน
      mainProductImg.style.opacity = "0.4";
      mainProductImg.style.transform = "scale(0.97)";

      setTimeout(() => {
        mainProductImg.src = targetSrc;
        mainProductImg.style.opacity = "1";
        mainProductImg.style.transform = "scale(1)";
      }, 200);

      // อัปเดตสถานะ Active ที่รูปย่อยและเลื่อนแถบ Thumbnails ให้อัตโนมัติ
      const thumbImages = thumbList.querySelectorAll("img");
      thumbImages.forEach((el, idx) => {
        if (idx === currentImageIndex) {
          el.classList.add("active");
          el.scrollIntoView({
            behavior: "smooth",
            inline: "nearest",
            block: "nearest",
          });
        } else {
          el.classList.remove("active");
        }
      });
    }

    // สร้างรายการรูปย่อย (Thumbnails)
    product.images.forEach((imgSrc, index) => {
      const imgElement = document.createElement("img");
      imgElement.src = imgSrc;
      if (index === 0) imgElement.classList.add("active");

      imgElement.onclick = () => {
        updateMainImage(index);
      };

      thumbList.appendChild(imgElement);
    });

    // ตั้งค่ารูปเริ่มต้น
    mainProductImg.src = product.images[0];
    mainProductImg.style.transition =
      "opacity 0.35s ease, transform 0.35s ease";

    // Event ปุ่มลูกศรซ้าย (ย้อนกลับรูปก่อนหน้า)
    if (prevBtn) {
      prevBtn.onclick = () => {
        let newIndex = currentImageIndex - 1;
        if (newIndex < 0) {
          newIndex = product.images.length - 1; // วนกลับไปรูปสุดท้ายถ้าอยู่ที่รูปแรก
        }
        updateMainImage(newIndex);
      };
    }

    // Event ปุ่มลูกศรขวา (เลื่อนไปรูปถัดไป)
    if (nextBtn) {
      nextBtn.onclick = () => {
        let newIndex = currentImageIndex + 1;
        if (newIndex >= product.images.length) {
          newIndex = 0; // วนกลับมารูปแรกถ้าอยู่ที่รูปสุดท้าย
        }
        updateMainImage(newIndex);
      };
    }

    // ตกแต่งเพิ่มเติมให้แถบ Thumbnails เลื่อนดูง่าย
    thumbList.style.display = "flex";
    thumbList.style.gap = "10px";
    thumbList.style.overflowX = "auto";
    thumbList.style.scrollBehavior = "smooth";
  }

  // --- ประโยชน์ (Benefits) ---
  const benefitList = document.getElementById("benefitList");
  if (benefitList && product.benefits) {
    benefitList.innerHTML = "";
    product.benefits.forEach((benefit) => {
      benefitList.innerHTML += `
        <div class="benefit-item">
          <div class="check">✓</div>
          <span>${benefit}</span>
        </div>`;
    });
  }

  // --- ระบบจัดการจำนวนสินค้า (Quantity Selector) ---
  const decreaseBtn = document.getElementById("decreaseBtn");
  const increaseBtn = document.getElementById("increaseBtn");
  const quantityInput = document.getElementById("quantityInput");

  let currentQuantity = 1;

  if (decreaseBtn && increaseBtn && quantityInput) {
    // ฟังก์ชันเช็คสถานะปุ่มลบ (ถ้าเป็น 1 ให้ปุ่มดูจางลง)
    const updateButtonState = () => {
      if (currentQuantity <= 1) {
        decreaseBtn.classList.add("disabled");
      } else {
        decreaseBtn.classList.remove("disabled");
      }
    };

    decreaseBtn.onclick = () => {
      if (currentQuantity > 1) {
        currentQuantity--;
        quantityInput.value = currentQuantity;
        updateButtonState();
      }
    };

    increaseBtn.onclick = () => {
      currentQuantity++;
      quantityInput.value = currentQuantity;
      updateButtonState();
    };

    // เรียกรันครั้งแรกเพื่อให้เช็คสถานะปุ่มตอนโหลดหน้าเว็บ
    updateButtonState();
  }

  // --- คำเตือน / สัญญาณเตือน (ปรับปรุงใหม่: รองรับ Table, Accordion Text และ Accordion List) ---
  const warningSectionEl = document.querySelector(".warning-layout-section");
  const warningTitleEl = document.getElementById("warningTitle");
  const warningBox = document.getElementById("warningBox");

  // เช็กว่าสินค้าชิ้นนี้มีข้อมูล Warning หรือไม่
  const hasWarningData =
    product.warningTitle ||
    (product.warningTable && product.warningTable.headers) ||
    (product.warningTexts && product.warningTexts.length > 0) ||
    (product.warnings && product.warnings.length > 0);

  if (hasWarningData && warningBox) {
    if (warningSectionEl) warningSectionEl.style.display = ""; // แสดงผลเมื่อมีข้อมูล

    if (warningTitleEl && product.warningTitle) {
      warningTitleEl.textContent = product.warningTitle;
    }

    warningBox.innerHTML = ""; // เคลียร์ของเก่า

    // -------------------------------------------------------------
    // กรณีที่ 1: ข้อมูลเป็นตาราง (warningTable)
    // -------------------------------------------------------------
    if (
      product.warningTable &&
      product.warningTable.headers &&
      product.warningTable.rows
    ) {
      warningBox.className = "warning-table-wrapper reveal-on-scroll";

      let tableHTML = `<div style="overflow-x: auto; width: 100%;">`;
      tableHTML += `<table class="custom-result-table warning-table"><thead><tr>`;

      product.warningTable.headers.forEach((header) => {
        tableHTML += `<th>${header}</th>`;
      });
      tableHTML += `</tr></thead><tbody>`;

      product.warningTable.rows.forEach((row) => {
        tableHTML += `<tr>`;
        row.forEach((cell) => {
          let cellContent = "";

          // ถ้าช่องนั้นเป็น Array (เช่น รายการผลกระทบย่อย) ให้สร้างเป็น <ul><li>
          if (Array.isArray(cell)) {
            let listItems = cell
              .map(
                (item) =>
                  `<li style="margin-bottom: 4px; position: relative; padding-left: 14px;">
                     <span style="position: absolute; left: 0; color: #e53e3e;">•</span>${item}
                   </li>`
              )
              .join("");
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
    }
    // -------------------------------------------------------------
    // กรณีที่ 2: ข้อมูลเป็น warningTexts (Array ข้อความที่มี <b>)
    // -------------------------------------------------------------
    else if (product.warningTexts && product.warningTexts.length > 0) {
      warningBox.className = "accordion-container reveal-on-scroll";

      let introP = document.getElementById("warningIntro");
      if (!introP) {
        introP = document.createElement("p");
        introP.id = "warningIntro";
        introP.style.cssText =
          "color: #555; line-height: 1.7; margin-bottom: 20px; font-size: 16px;";
        warningBox.parentNode.insertBefore(introP, warningBox);
      }
      introP.innerHTML = product.warningTexts[0];

      const accordionTexts = product.warningTexts.slice(1);

      accordionTexts.forEach((text, index) => {
        const itemEl = document.createElement("div");
        itemEl.className = `accordion-item warning-type`;

        let titleText = `สัญญาณเตือนส่วนที่ ${index + 1}`;
        let bodyText = text;

        const match = text.match(/<b>(.*?)<\/b>/);
        if (match && match[1]) {
          titleText = match[1].replace(":", "").trim();
          bodyText = text
            .replace(/<b>.*?<\/b>:\s*/, "")
            .replace(/<b>.*?<\/b>/, "")
            .trim();
        }

        itemEl.innerHTML = `
          <button class="accordion-header">
            <span>${titleText}</span>
            <i class="fa-solid fa-chevron-down accordion-icon"></i>
          </button>
          <div class="accordion-content" style="max-height: 0; padding-bottom: 0;">
            <p style="margin: 0; padding-top: 5px;">${bodyText}</p>
          </div>
        `;

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
    }
    // -------------------------------------------------------------
    // กรณีที่ 3: ข้อมูลโครงสร้างเดิม (warningText + warnings)
    // -------------------------------------------------------------
    else if (product.warnings && product.warnings.length > 0) {
      warningBox.className = "accordion-container reveal-on-scroll";

      if (product.warningText && product.warningText.length > 0) {
        let introP = document.getElementById("warningIntro");
        if (!introP) {
          introP = document.createElement("p");
          introP.id = "warningIntro";
          introP.style.cssText =
            "color: #555; line-height: 1.7; margin-bottom: 20px; font-size: 16px;";
          warningBox.parentNode.insertBefore(introP, warningBox);
        }
        introP.innerHTML = product.warningText[0];
      }

      product.warnings.forEach((warning) => {
        let listItems = warning.items
          .map((item) => `<li>${item}</li>`)
          .join("");
        const itemEl = document.createElement("div");
        itemEl.className = `accordion-item`;

        itemEl.innerHTML = `
          <button class="accordion-header">
            <span>${warning.title}</span>
            <i class="fa-solid fa-chevron-down accordion-icon"></i>
          </button>
          <div class="accordion-content" style="max-height: 0; padding-bottom: 0;">
            <ul>${listItems}</ul>
          </div>
        `;

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
    }
  } else {
    // ถ้าไม่มีข้อมูล Warning ให้ซ่อนทั้ง Section ทันที
    if (warningSectionEl) {
      warningSectionEl.style.display = "none";
    }
  }

  // --- ส่วนการแก้ปัญหา / Solution ---
  const solutionTitleEl = document.getElementById("solutionTitle");
  if (solutionTitleEl && product.solutionTitle) {
    solutionTitleEl.textContent = product.solutionTitle;
  }

  const solutionBox = document.getElementById("solutionBox");
  if (solutionBox) {
    solutionBox.innerHTML = "";
    solutionBox.className = "accordion-container reveal-on-scroll";

    if (product.solutionTexts && product.solutionTexts.length > 0) {
      let introP = document.getElementById("solutionIntro");
      if (!introP) {
        introP = document.createElement("p");
        introP.id = "solutionIntro";
        introP.style.cssText =
          "color: #555; line-height: 1.7; margin-bottom: 20px; font-size: 16px;";
        solutionBox.parentNode.insertBefore(introP, solutionBox);
      }
      introP.innerHTML = product.solutionTexts[0];

      const accordionTexts = product.solutionTexts.slice(1);

      accordionTexts.forEach((text, index) => {
        const itemEl = document.createElement("div");
        itemEl.className = `accordion-item solution-type`;

        let titleText = `แนวทางฟื้นฟูส่วนที่ ${index + 1}`;
        let bodyText = text;

        const match = text.match(/<b>(.*?)<\/b>/);
        if (match && match[1]) {
          titleText = match[1].replace(":", "").trim();
          bodyText = text
            .replace(/<b>.*?<\/b>:\s*/, "")
            .replace(/<b>.*?<\/b>/, "")
            .trim();
        }

        itemEl.innerHTML = `
          <button class="accordion-header">
            <span>${titleText}</span>
            <i class="fa-solid fa-chevron-down accordion-icon"></i>
          </button>
          <div class="accordion-content" style="max-height: 0; padding-bottom: 0;">
            <p style="margin: 0; padding-top: 5px;">${bodyText}</p>
          </div>
        `;

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
        solutionBox.appendChild(itemEl);
      });
    }
  }

  // --- ส่วนผลลัพธ์ที่คุณสัมผัสได้ (รองรับทั้ง Object, List การ์ด และ Table ตาราง) ---
  const resultTitleEl = document.getElementById("resultTitle");
  const resultImageEl = document.getElementById("resultImage");
  const resultListEl = document.getElementById("resultList");
  const resultTableContainer = document.getElementById("resultTableContainer");
  const resultsWrapper = document.querySelector(".results-flex-wrapper");

  if (resultTitleEl) {
    if (product.resultsTitle) {
      resultTitleEl.textContent = product.resultsTitle;
      resultTitleEl.style.display = "block";
    } else {
      resultTitleEl.style.display = "none";
    }
  }

  if (resultImageEl) {
    if (product.resultImage) {
      resultImageEl.src = product.resultImage;
      if (resultImageEl.parentElement)
        resultImageEl.parentElement.style.display = "block";
    } else {
      if (resultImageEl.parentElement)
        resultImageEl.parentElement.style.display = "none";
    }
  }

  if (resultsWrapper) {
    // กรณีมีข้อมูลแบบตาราง (resultTable)
    if (
      product.resultTable &&
      product.resultTable.headers &&
      product.resultTable.rows
    ) {
      if (resultListEl) resultListEl.style.display = "none";
      if (resultTableContainer) {
        resultTableContainer.style.display = "block";

        let tableHTML = `<table class="custom-result-table"><thead><tr>`;
        product.resultTable.headers.forEach((header) => {
          tableHTML += `<th>${header}</th>`;
        });
        tableHTML += `</tr></thead><tbody>`;

        product.resultTable.rows.forEach((row) => {
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
    }
    // กรณีมีข้อมูลแบบการ์ด/รายการ (results)
    else if (product.results && product.results.length > 0) {
      if (resultTableContainer) resultTableContainer.style.display = "none";
      if (resultListEl) {
        resultListEl.style.display = "flex";
        resultListEl.innerHTML = "";

        product.results.forEach((item, index) => {
          // กรณีที่ 1: ข้อมูลเป็น Object แบบใหม่ { title: "...", props: [...] }
          if (typeof item === "object" && item !== null) {
            let propsItems = item.props
              ? item.props.map((p) => `
                  <li>
                    <span class="step-dot"></span>
                    <span>${p}</span>
                  </li>
                `).join("")
              : "";

            resultListEl.innerHTML += `
              <li class="result-timeline-card">
                <div class="result-card-header">
                  <span class="phase-badge"><i class="fa-solid fa-calendar-check"></i> ${item.title.split(":")[0] || "ระยะที่ " + (index + 1)}</span>
                  <h3 class="result-card-title">${item.title.includes(":") ? item.title.split(":")[1].trim() : item.title}</h3>
                </div>
                <ul class="result-card-props">
                  ${propsItems}
                </ul>
              </li>
            `;
          }
          // กรณีที่ 2: ข้อมูลเป็น String แบบเดิม
          else if (typeof item === "string") {
            let boldPart = "";
            let textPart = item;

            const match = item.match(/<b>(.*?)<\/b>/);
            if (match && match[1]) {
              boldPart = `<b>${match[1]}</b>`;
              textPart = item
                .replace(/<b>.*?<\/b>:\s*/, "")
                .replace(/<b>.*?<\/b>/, "")
                .trim();
            }

            resultListEl.innerHTML += `
              <li>
                ${boldPart}
                <div class="card-detail-text">${textPart}</div>
              </li>
            `;
          }
        });
      }
    } else {
      resultsWrapper.style.display = "none";
      if (resultTitleEl) resultTitleEl.style.display = "none";
    }
  }

  // --- ส่วนผสมของผลิตภัณฑ์ ---
  const ingredientTitleEl = document.getElementById("ingredientTitle");
  if (ingredientTitleEl && product.ingredientTitle) {
    ingredientTitleEl.textContent = product.ingredientTitle;
  }

  const ingredientGrid = document.getElementById("ingredientGrid");
  if (ingredientGrid && product.ingredients) {
    ingredientGrid.className = "ingredient-grid reveal-on-scroll";
    ingredientGrid.innerHTML = "";
    product.ingredients.forEach((ing) => {
      let propsItems = ing.props.map((prop) => `<li>${prop}</li>`).join("");
      ingredientGrid.innerHTML += `
        <div class="ingredient-card">
          <div class="ingredient-image"><img src="${ing.img}" alt="${ing.name}" /></div>
          <h3>${ing.name}</h3>
          <ul>${propsItems}</ul>
        </div>`;
    });
  }

  // --- Scroll Reveal Animation ---
  const observerOptions = { threshold: 0.15 };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
    observer.observe(el);
  });

  // --- อัปเดตสรุปคะแนนรีวิว ---
  const bigRatingEl = document.getElementById("summaryBigRating");
  const sumReviewCountEl = document.getElementById("summaryReviewCount");
  if (bigRatingEl && product.rating) {
    bigRatingEl.textContent = product.rating;
  }
  if (sumReviewCountEl && product.reviewCount) {
    let formattedCount =
      product.reviewCount > 1000
        ? (product.reviewCount / 1000).toFixed(1) + "k"
        : product.reviewCount;
    sumReviewCountEl.textContent = formattedCount;
  }

  // --- รีวิว ---
  const reviewList = document.getElementById("reviewList");
  if (reviewList && product.reviews) {
    reviewList.innerHTML = "";
    product.reviews.forEach((review) => {
      let imgHTML = review.img
        ? `<img class="review-image" src="${review.img}" alt="Review Image" style="margin-top: 10px;" />`
        : "";

      // ดึงค่าดาว (ถ้าไม่ได้ใส่ไว้ใน data ให้ default เป็น 5 ดาว)
      let starCount = review.rating || 5;

      // สร้างดวงดาวตามจำนวน rating
      let starsHTML = `<div class="stars-orange" style="font-size: 18px; margin-top: -2px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">`;

      let starsIcon = "";
      for (let i = 1; i <= 5; i++) {
        if (i <= starCount) {
          starsIcon += "★"; // ดาวเต็ม
        } else {
          starsIcon += "☆"; // ดาวว่างเปล่า
        }
      }

      starsHTML += `<span style="letter-spacing: 2px;">${starsIcon}</span>`;
      starsHTML += `<span style="font-size: 14px; color: #555; font-weight: 500;">(${starCount} ดาว)</span>`;
      starsHTML += "</div>";

      reviewList.innerHTML += `
        <div class="review-comment">
          <div class="user-name" style="margin-bottom: 4px;">${review.name}</div>
          ${starsHTML}
          <div class="review-text">${review.text}</div>
          ${imgHTML}
        </div>`;
    });
  }

  // --- ส่วนผลกระทบ (Impact Section) ---
  const impactSectionEl = document.querySelector(".impact-section");
  const impactTitleEl = document.getElementById("impactTitle");
  const impactGridEl = document.getElementById("impactGrid");

  // เช็กว่าสินค้าชิ้นนี้มีข้อมูลส่วน Impact หรือไม่
  const hasImpactData =
    product.impactTitle &&
    product.impactTexts &&
    product.impactTexts.length > 0;

  if (hasImpactData) {
    // 1. ถ้ามีข้อมูล สั่งให้ส่วน Impact แสดงผล
    if (impactSectionEl) impactSectionEl.style.display = "block";

    if (impactTitleEl) {
      impactTitleEl.textContent = product.impactTitle;
    }

    if (impactGridEl) {
      impactGridEl.innerHTML = "";

      // ข้อความแรกนำมาเป็น Intro
      let introP = document.getElementById("impactIntro");
      if (introP) {
        introP.innerHTML = product.impactTexts[0];
      }

      // รายการข้อความที่เหลือ นำมาแปลงเป็น Impact Cards
      const cardsData = product.impactTexts.slice(1);

      cardsData.forEach((text, index) => {
        let cardTitle = `ผลกระทบที่ ${index + 1}`;
        let cardBody = text;

        // สกัดแท็ก <b>...</b> ออกมาทำเป็นชื่อการ์ด
        const match = text.match(/<b>(.*?)<\/b>/);
        if (match && match[1]) {
          cardTitle = match[1].replace(":", "").trim();
          cardBody = text
            .replace(/<b>.*?<\/b>:\s*/, "")
            .replace(/<b>.*?<\/b>/, "")
            .trim();
        }

        const cardEl = document.createElement("div");
        cardEl.className = "impact-card";
        cardEl.innerHTML = `
        <div class="impact-card-header">
          <div class="impact-icon-box">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h3 class="impact-card-title">${cardTitle}</h3>
        </div>
        <div class="impact-card-body">${cardBody}</div>
      `;

        impactGridEl.appendChild(cardEl);
      });
    }
  } else {
    // 2. ถ้าไม่มีข้อมูล ให้ซ่อนทั้ง Section ทันที ไม่ให้เกิดกรอบหรือพื้นที่ว่างค้างไว้
    if (impactSectionEl) {
      impactSectionEl.style.display = "none";
    }
  }

// ส่วนแสดงผลสินค้าอื่นๆ ที่น่าสนใจ (พร้อมปุ่มดูสินค้าทั้งหมด)
  const relatedContainer = document.getElementById("relatedProductsContainer");

  if (relatedContainer && typeof productsData !== "undefined") {
    // 1. กรองเอาสินค้าตัวปัจจุบันออก
    const otherProductKeys = Object.keys(productsData).filter(
      (key) => key !== productId
    );

    // 2. สุ่มเลือกสินค้ามา 4 รายการ
    const shuffledKeys = otherProductKeys.sort(() => 0.5 - Math.random());
    const selectedKeys = shuffledKeys.slice(0, 4);

    if (selectedKeys.length > 0) {
      let relatedHTML = `
        <div class="related-products-section reveal-on-scroll visible">
          <div class="related-header">
            <h2>สินค้าที่คุณอาจสนใจ</h2>
            <a href="index.html" class="view-all-link">
              ดูสินค้าทั้งหมด <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
          
          <div class="products related-products-grid">
      `;

      selectedKeys.forEach((key) => {
        const item = productsData[key];
        const imgCover = (item.images && item.images.length > 0) 
          ? item.images[0] 
          : (item.banner1 || "");

        relatedHTML += `
          <div class="product-card animate-in" onclick="window.location.href='product.html?id=${key}';">
            <div class="product-image">
              <img src="${imgCover}" alt="${item.name}">
            </div>
            <h3 class="product-title">${item.name}</h3>
            <p class="product-tag">#ผลิตภัณฑ์เสริมอาหาร</p>
            <p class="product-price">
              <span class="new-price">${item.newPrice}.00</span>
              <span class="old-price">${item.oldPrice}.00</span>
            </p>
          </div>
        `;
      });
      relatedContainer.innerHTML = relatedHTML;
    }
  }

} else {
  // กรณีหาไม่พบสินค้า
  document.querySelector(".product-page").innerHTML =
    "<h1>ขออภัย ไม่พบสินค้านี้</h1>";
}

// ฟังก์ชันเพิ่มสินค้าลงตะกร้า
function addToCart(isBuyNow = false) {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id") || "astin";

  const product = productsData[productId];
  const quantityInput = document.getElementById("quantityInput");
  const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

  if (!product) return;

  let cart = JSON.parse(localStorage.getItem("siam_healthy_cart")) || [];

  // เช็กว่ามีสินค้านี้ในตะกร้าหรือยัง
  const existingItemIndex = cart.findIndex((item) => item.id === productId);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      id: productId,
      name: product.name,
      price: parseFloat(product.newPrice.replace(/[^0-9.]/g, "")),
      oldPrice: product.oldPrice
        ? parseFloat(product.oldPrice.replace(/[^0-9.]/g, ""))
        : null,
      image: product.images && product.images.length > 0 ? product.images[0] : "",
      tag: (product.benefits && product.benefits[0]) || "#ผลิตภัณฑ์เสริมอาหาร",
      quantity: quantity,
      selected: true,
    });
  }

  // 1. เซฟลง localStorage
  localStorage.setItem("siam_healthy_cart", JSON.stringify(cart));

  // 2. ยิง Custom Event บอกให้ Header อัปเดตตัวเลขสีแดงทันที!
  window.dispatchEvent(new CustomEvent("cartUpdated"));

  if (isBuyNow) {
    window.location.href = "../cart/";
  } else {
    alert(`เพิ่ม ${product.name} จำนวน ${quantity} ชิ้นลงในตะกร้าเรียบร้อยแล้ว!`);
  }
}

// อัปเดตตัวเลขแจ้งเตือนบนไอคอนตะกร้า
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("siam_healthy_cart")) || [];
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  document.querySelectorAll(".cart-badge").forEach((badge) => {
    if (totalCount > 0) {
      badge.innerText = totalCount;
      badge.style.display = "flex";
    } else {
      badge.innerText = "";
      badge.style.display = "none";
    }
  });
}

// ผูกอีเวนต์ปุ่มสั่งซื้อ
document.addEventListener("DOMContentLoaded", () => {
  const cartBtn = document.querySelector(".cart-btn-minimal");
  const buyBtn = document.querySelector(".buy-btn-black");

  if (cartBtn) cartBtn.onclick = () => addToCart(false);
  if (buyBtn) buyBtn.onclick = () => addToCart(true);

  updateCartBadge();
});