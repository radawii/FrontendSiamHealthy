# English translation guide (Siam-Healthy / CHIWITCHIWA)

Translate the existing Thai faithfully into natural, clear English for an international audience.
Translate EVERYTHING that is Thai. Do not summarise, shorten, add or drop information.

## Health & compliance wording (important)
- Keep the exact strength of every claim. "อาจช่วย" = "may help", "มีส่วนช่วย" = "helps support / contributes to",
  "มีการศึกษา" = "has been studied". Never turn a cautious claim into a stronger one ("cures", "treats", "prevents") unless the Thai says so.
- Keep disclaimers, warnings, study details, numbers, doses, units, years, sample sizes and citations exactly.
- Thai FDA = "Thai FDA"; "อย." = "Thai FDA"; "เลขที่ อย." = "Thai FDA No.".

## Names & terms
- Brand: Siam-Healthy, CHIWITCHIWA. Product names stay as they are (Andicellix, Astin, Onix, Back Pro, Black Rhino ...).
  Thai transliterations of a product name (e.g. แอนไดเซลลิกซ์) -> the English product name.
- Prices "฿1,980" unchanged. "บาท" -> "THB" (or keep ฿ if the Thai uses ฿).
- Navigation terms: หน้าแรก=Home, ผลิตภัณฑ์ทั้งหมด=Products, คลังความรู้ส่วนผสม=Ingredients, หัวข้อสุขภาพ=Wellness,
  บทความ=Journal, เกี่ยวกับเรา=Our story, ติดต่อเรา=Contact, ตะกร้าสินค้า=Shopping bag, เพิ่มลงตะกร้า=Add to bag, ซื้อเลย=Buy now.
- Wellness topics: หัวใจและหลอดเลือด=Heart & Circulation, กระดูกและข้อต่อ=Bones & Joints, ผิวพรรณและความงาม=Skin & Beauty,
  ลำไส้และการขับถ่าย=Digestive Health, ลดน้ำหนักและการเผาผลาญ=Weight & Metabolism, ดวงตาและการมองเห็น=Eye Health & Vision,
  การได้ยิน=Hearing Health, สุขภาพผู้ชาย=Men's Wellness, ระบบภูมิคุ้มกัน=Immune Health, สมองและระบบประสาท=Brain & Nervous System.
- Use the standard English/INN name for ingredients (ซิงค์=Zinc, แปะก๊วย=Ginkgo biloba, ถั่งเช่า=Cordyceps, หลินจือ/เห็ดหลินจือ=Reishi mushroom ...).
- Customer names in reviews: romanise (e.g. คุณสมชาย = "Khun Somchai" / "Somchai"). Keep review tone.

## Format rules
- Website dictionaries (`source/<name>.json` -> `en/<name>.json`): output is ONE JSON object mapping every source key
  (the Thai text, copied exactly, character for character) to an English HTML string.
  The English must contain the same HTML tags as the source "th" HTML (same tags, same count, same attributes/href/class),
  only the text between tags changes. Plain-text sources -> plain-text English. Keep emoji, symbols, numbers.
- Knowledge-base parts (`source/kb-partN.json` -> `en/kb-partN.json`): same JSON structure, every Thai string replaced by English.
  Keep line breaks: the English must have exactly the same number of lines as the Thai.
  Keep line markers: "• " bullets, "1. " numbered sub-headings, and table rows "| cell | cell |" (translate the cells, keep the pipes).
  Copy nameTh / nameEn unchanged.
- Never leave Thai characters in the output. Write UTF-8 JSON (no BOM).
- Validate: `node Backend/scripts/i18n-validate.js <name>` (run from the project root) until it prints ✓.
