const track = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const container = document.querySelector('.carousel-container'); // เพิ่มตัวแปรสำหรับจับ Hover
let items = document.querySelectorAll('.carousel-item');

let currentIndex = 1;
let isDragging = false;
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationId = 0;
const gap = 20;

// ตัวแปรสำหรับระบบ Autoplay
let autoplayTimer = null;
const autoplayInterval = 5000; // 10000 ms = 10 วินาที

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

function updateCarouselPosition() {
  if (items.length === 0) return;
  const itemWidth = items[0].getBoundingClientRect().width;
  currentTranslate = -currentIndex * (itemWidth + gap);
  prevTranslate = currentTranslate;
  setSliderPosition();
}

function moveWithTransition() {
  track.style.transition = 'transform 0.3s ease-out';
  updateCarouselPosition();
}

// ฟังก์ชันเลื่อนไปข้างหน้า (ใช้สำหรับปุ่ม Next และ Autoplay)
function moveToNext() {
  if (currentIndex >= items.length - 1) return;
  currentIndex++;
  moveWithTransition();
}

// ----------------------------------------------------
// 🤖 2. ระบบ Autoplay & Controls
// ----------------------------------------------------

function startAutoplay() {
  // เคลียร์อันเก่าก่อนเพื่อป้องกันบั๊กจับเวลาซ้อนกัน
  stopAutoplay(); 
  autoplayTimer = setInterval(moveToNext, autoplayInterval);
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
  }
}

// หยุดลูปเมื่อเอาเมาส์มาวางเหนือ Carousel และเล่นต่อเมื่อเอาเมาส์ออก
container.addEventListener('mouseenter', stopAutoplay);
container.addEventListener('mouseleave', startAutoplay);

// ----------------------------------------------------

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

// Event ปุ่มกด (มีการรีเซ็ตเวลา Autoplay ใหม่เมื่อกด)
nextBtn.addEventListener('click', () => {
  moveToNext();
  startAutoplay(); // รีเซ็ตตัวนับเวลา 5 วิใหม่
});

prevBtn.addEventListener('click', () => {
  if (currentIndex <= 0) return;
  currentIndex--;
  moveWithTransition();
  startAutoplay(); // รีเซ็ตตัวนับเวลา 5 วิใหม่
});

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
  stopAutoplay(); // หยุดวิ่งอัตโนมัติขณะที่กำลังลากเมาส์
  if (e.type === 'mousedown') e.preventDefault(); 
}

function dragAction(e) {
  if (!isDragging) return;
  const currentX = getPositionX(e);
  const dragDistance = currentX - startX;
  currentTranslate = prevTranslate + dragDistance;
  animationId = requestAnimationFrame(setSliderPosition);
}

function dragEnd() {
  if (!isDragging) return;
  isDragging = false;
  cancelAnimationFrame(animationId);
  
  const movedBy = currentTranslate - prevTranslate;
  const itemWidth = items[0].getBoundingClientRect().width + gap;

  if (movedBy < -itemWidth * 0.2) {
    currentIndex++;
  } else if (movedBy > itemWidth * 0.2) {
    currentIndex--;
  }

  moveWithTransition();
  startAutoplay(); // ลากเสร็จแล้ว ปล่อยเมาส์ -> เริ่มนับเวลา 10 วิใหม่
}

// สั่งทำงานครั้งแรก
updateCarouselPosition();
startAutoplay(); // เปิดใช้งาน Autoplay ทันทีที่โหลดหน้าเว็บ

window.addEventListener('resize', () => {
  track.style.transition = 'none';
  updateCarouselPosition();
});