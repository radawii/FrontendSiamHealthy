document.addEventListener('DOMContentLoaded', () => {
    // 1. CAROUSEL SLIDER SCRIPT
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const container = document.querySelector('.carousel-container');
    const viewport = document.querySelector('.carousel-viewport');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (track && viewport) {
        let originalItems = Array.from(track.children);
        const totalOriginals = originalItems.length;

        if (totalOriginals > 0) {
            let currentIndex = 1;
            let isTransitioning = false;
            let autoplayTimer = null;
            const autoplayInterval = 5000;

            // 1.1 สร้างจุดบอกตำแหน่ง (Dots)
            if (dotsContainer) {
                dotsContainer.innerHTML = '';
                for (let i = 0; i < totalOriginals; i++) {
                    const dot = document.createElement('div');
                    dot.classList.add('dot');
                    if (i === 0) dot.classList.add('active');
                    dot.addEventListener('click', () => {
                        if (isTransitioning) return;
                        currentIndex = i + 1;
                        moveToSlide();
                        startAutoplay();
                    });
                    dotsContainer.appendChild(dot);
                }
            }
            const dots = dotsContainer ? Array.from(dotsContainer.children) : [];

            // 1.2 Clone หัว/ท้าย สำหรับ Infinite Loop
            const firstClone = originalItems[0].cloneNode(true);
            const lastClone = originalItems[totalOriginals - 1].cloneNode(true);
            
            track.appendChild(firstClone);
            track.insertBefore(lastClone, track.firstChild);

            let allItems = Array.from(track.children);

            // 1.3 ฟังก์ชันคำนวณตำแหน่ง
            function getSlideWidth() {
                return viewport.offsetWidth;
            }

            function setTrackPosition(index, animated = true) {
                const slideWidth = getSlideWidth();
                if (animated) {
                    track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
                } else {
                    track.style.transition = 'none';
                }
                track.style.transform = `translateX(${-index * slideWidth}px)`;
            }

            function updateDots() {
                if (dots.length === 0) return;
                let realIndex = currentIndex - 1;
                if (currentIndex === 0) realIndex = totalOriginals - 1;
                if (currentIndex === allItems.length - 1) realIndex = 0;

                dots.forEach((dot, idx) => {
                    if (idx === realIndex) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }

            function moveToSlide() {
                isTransitioning = true;
                setTrackPosition(currentIndex, true);
                updateDots();
            }

            function nextSlide() {
                if (isTransitioning) return;
                currentIndex++;
                moveToSlide();
            }

            function prevSlide() {
                if (isTransitioning) return;
                currentIndex--;
                moveToSlide();
            }

            // 1.4 วนลูปไร้รอยต่อ
            track.addEventListener('transitionend', () => {
                isTransitioning = false;
                if (currentIndex === allItems.length - 1) {
                    currentIndex = 1;
                    setTrackPosition(currentIndex, false);
                }
                if (currentIndex === 0) {
                    currentIndex = allItems.length - 2;
                    setTrackPosition(currentIndex, false);
                }
            });

            // 1.5 Autoplay
            function startAutoplay() {
                stopAutoplay();
                autoplayTimer = setInterval(nextSlide, autoplayInterval);
            }

            function stopAutoplay() {
                if (autoplayTimer) clearInterval(autoplayTimer);
            }

            if (container) {
                container.addEventListener('mouseenter', stopAutoplay);
                container.addEventListener('mouseleave', startAutoplay);
            }

            // 1.6 Event Buttons
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    nextSlide();
                    startAutoplay();
                });
            }

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    prevSlide();
                    startAutoplay();
                });
            }

            // 1.7 Touch & Drag Events
            let startX = 0;
            let currentX = 0;
            let isDragging = false;

            track.addEventListener('mousedown', dragStart);
            track.addEventListener('touchstart', dragStart, { passive: true });

            function dragStart(e) {
                if (isTransitioning) return;
                isDragging = true;
                startX = getPositionX(e);
                stopAutoplay();
                track.style.transition = 'none';
            }

            function dragMove(e) {
                if (!isDragging) return;
                currentX = getPositionX(e);
                const diff = currentX - startX;
                const slideWidth = getSlideWidth();
                track.style.transform = `translateX(${-currentIndex * slideWidth + diff}px)`;
            }

            function dragEnd() {
                if (!isDragging) return;
                isDragging = false;
                const diff = currentX - startX;
                const slideWidth = getSlideWidth();

                if (diff < -slideWidth * 0.15) {
                    currentIndex++;
                } else if (diff > slideWidth * 0.15) {
                    currentIndex--;
                }

                moveToSlide();
                startAutoplay();
            }

            function getPositionX(e) {
                return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            }

            window.addEventListener('mousemove', dragMove);
            window.addEventListener('touchmove', dragMove, { passive: true });
            window.addEventListener('mouseup', dragEnd);
            window.addEventListener('touchend', dragEnd);

            window.addEventListener('resize', () => {
                setTrackPosition(currentIndex, false);
            });

            setTrackPosition(currentIndex, false);
            startAutoplay();
        }
    }

    // 2. SCROLL REVEAL ANIMATION SCRIPT
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(element => revealObserver.observe(element));
    } else {
        revealElements.forEach(element => element.classList.add('is-revealed'));
    }
});