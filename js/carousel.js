const track = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const container = document.querySelector('.carousel-container');
const viewport = document.querySelector('.carousel-viewport');
let items = document.querySelectorAll('.carousel-item');

let currentIndex = 1;
let isDragging = false;
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationId = 0;

// ตัวแปรสำหรับระบบ Autoplay
let autoplayTimer = null;
const autoplayInterval = 5000;

// 1. ตั้งค่าระบบ Infinite (Clone elements)
const firstClone = items[0].cloneNode(true);
const lastClone = items[items.length - 1].cloneNode(true);
track.appendChild(firstClone);
track.insertBefore(lastClone, items[0]);
items = document.querySelectorAll('.carousel-item');

function getPositionX(event) {
  return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
}

function setSliderPosition() {
  track.style.transform = `translateX(${currentTranslate}px)`;
}

// คำนวณระยะสไลด์ตามความกว้างของกรอบ viewport (ไม่มี gap)
function updateCarouselPosition() {
  if (items.length === 0 || !viewport) return;
  const slideWidth = viewport.offsetWidth;
  currentTranslate = -currentIndex * slideWidth;
  prevTranslate = currentTranslate;
  setSliderPosition();
}

function moveWithTransition() {
  track.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
  updateCarouselPosition();
}

// ฟังก์ชันเลื่อนไปข้างหน้า
function moveToNext() {
  if (currentIndex >= items.length - 1) return;
  currentIndex++;
  moveWithTransition();
}

// 2. ระบบ Autoplay & Controls

function startAutoplay() {
  stopAutoplay(); 
  autoplayTimer = setInterval(moveToNext, autoplayInterval);
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
  }
}

// หยุดลูปเมื่อเอาเมาส์มาวางเหนือ Carousel และเล่นต่อเมื่อเอาเมาส์ออก
if (container) {
  container.addEventListener('mouseenter', stopAutoplay);
  container.addEventListener('mouseleave', startAutoplay);
}

// วนลูปไร้รอยต่อตอนสิ้นสุด Transition
track.addEventListener('transitionend', () => {
  const totalItems = items.length;
  if (currentIndex === totalItems - 1) {
    track.style.transition = 'none';
    currentIndex = 1;
    updateCarouselPosition();
  }
  if (currentIndex === 0) {
    track.style.transition = 'none';
    currentIndex = totalItems - 2;
    updateCarouselPosition();
  }
});

// Event ปุ่มกด
if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    moveToNext();
    startAutoplay();
  });
}

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    if (currentIndex <= 0) return;
    currentIndex--;
    moveWithTransition();
    startAutoplay();
  });
}

// Event ลากเมาส์ / Touch screen
track.addEventListener('mousedown', dragStart);
track.addEventListener('touchstart', dragStart);
track.addEventListener('mousemove', dragAction);
track.addEventListener('touchmove', dragAction);
window.addEventListener('mouseup', dragEnd);
window.addEventListener('touchend', dragEnd);
window.addEventListener('mouseleave', dragEnd);

function dragStart(e) {
  isDragging = true;
  startX = getPositionX(e);
  track.style.transition = 'none';
  stopAutoplay();
  if (e.type === 'mousedown') e.preventDefault(); 
}

function dragAction(e) {
  if (!isDragging) return;
  const currentX = getPositionX(e);
  const dragDistance = currentX - startX;
  currentTranslate = prevTranslate + dragDistance;
  animationId = requestAnimationFrame(setSliderPosition);
}

// คำนวณระยะการดึง/ลากเมาส์ตามขนาดกรอบ viewport
function dragEnd() {
  if (!isDragging) return;
  isDragging = false;
  cancelAnimationFrame(animationId);
  
  const movedBy = currentTranslate - prevTranslate;
  const slideWidth = viewport.offsetWidth;

  // เลื่อนภาพถ้าลากเกิน 20% ของความกว้างกรอบ
  if (movedBy < -slideWidth * 0.2) {
    currentIndex++;
  } else if (movedBy > slideWidth * 0.2) {
    currentIndex--;
  }

  moveWithTransition();
  startAutoplay();
}

// สั่งทำงานครั้งแรก
updateCarouselPosition();
startAutoplay();

// ปรับตำแหน่งตาม Responsive เมื่อมีการย่อ/ขยายหน้าจอ
window.addEventListener('resize', () => {
  track.style.transition = 'none';
  updateCarouselPosition();
});