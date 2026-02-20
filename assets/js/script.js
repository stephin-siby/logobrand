// ==========================
// DOM Elements
// ==========================
const videos = document.querySelectorAll('.common-video');
const track = document.querySelector('.slider-track');
const container = document.querySelector('.slider-container');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

// ==========================
// Functions
// ==========================
const resetVideo = (v) => {
    if (!v.paused) {
        v.pause();
        v.currentTime = 2;
    }
};

window.playVideoOnMouseMove = (videoId) => {
    const video = document.getElementById(videoId);
    if (!video || !video.paused) return;
    videos.forEach(v => v.id !== videoId && resetVideo(v));
    video.play();
};

window.pauseVideo = (videoId) => {
    const video = document.getElementById(videoId);
    if (video) resetVideo(video);
};

// ==========================
// Initialization
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize videos
    videos.forEach(video => {
        video.currentTime = 2;
        video.addEventListener('loadedmetadata', () => video.currentTime = 2);
    });

    // Custom Testimonial Carousel Logic (Infinite Loop)
    let allSlides = document.querySelectorAll('.slide');
    if (!track || !container || allSlides.length < 2) return;

    // Clone 2 slides on each side for infinite loop
    const totalOriginal = allSlides.length;
    track.append(allSlides[0].cloneNode(true), allSlides[1].cloneNode(true));
    track.prepend(allSlides[totalOriginal - 1].cloneNode(true), allSlides[totalOriginal - 2].cloneNode(true));

    allSlides = document.querySelectorAll('.slide'); // Re-query

    let currentIndex = 2; // Real first slide
    let isDragging = false, startX = 0, currentTranslate = 0, prevTranslate = 0;
    let animationID, isTransitioning = false;

    const getPositionX = (e) => e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    const setSliderPosition = () => track.style.transform = `translateX(${currentTranslate}px)`;

    const updateCarousel = (animate = true) => {
        track.style.transition = animate ? 'transform 0.5s ease-out' : 'none';
        if (!animate) void track.offsetHeight; // Force reflow

        const slideWidth = allSlides[0].offsetWidth;
        currentTranslate = prevTranslate = (container.offsetWidth / 2) - (slideWidth / 2) - (slideWidth * currentIndex);
        setSliderPosition();

        allSlides.forEach(s => s.classList.remove('active', 'prev', 'next'));
        if (allSlides[currentIndex]) {
            allSlides[currentIndex].classList.add('active');
            if (allSlides[currentIndex - 1]) allSlides[currentIndex - 1].classList.add('prev');
            if (allSlides[currentIndex + 1]) allSlides[currentIndex + 1].classList.add('next');
        }
    };

    const moveSlide = (direction) => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex += direction;
        updateCarousel();
    };

    // ==========================
    // Event Listeners
    // ==========================
    prevBtn?.addEventListener('click', () => moveSlide(-1));
    nextBtn?.addEventListener('click', () => moveSlide(1));

    track.addEventListener('transitionend', (e) => {
        if (e.target !== track) return;
        isTransitioning = false;

        const total = allSlides.length;
        if (currentIndex === total - 2) currentIndex = 2;
        else if (currentIndex === 1) currentIndex = total - 3;
        else return;

        updateCarousel(false);
    });

    const touchStart = (e) => {
        if (isTransitioning) return;
        isDragging = true;
        startX = getPositionX(e);
        animationID = requestAnimationFrame(function animation() {
            if (isDragging) { setSliderPosition(); requestAnimationFrame(animation); }
        });
        container.style.cursor = 'grabbing';
        track.style.transition = 'none';
    };

    const touchMove = (e) => {
        if (isDragging) currentTranslate = prevTranslate + (getPositionX(e) - startX);
    };

    const touchEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        cancelAnimationFrame(animationID);
        container.style.cursor = 'grab';

        const diff = currentTranslate - prevTranslate;
        if (diff < -50) moveSlide(1);
        else if (diff > 50) moveSlide(-1);
        else updateCarousel();
    };

    container.addEventListener('mousedown', touchStart);
    container.addEventListener('touchstart', touchStart, { passive: true });
    container.addEventListener('mouseup', touchEnd);
    container.addEventListener('mouseleave', () => isDragging && touchEnd());
    container.addEventListener('touchend', touchEnd);
    container.addEventListener('mousemove', touchMove);
    container.addEventListener('touchmove', touchMove, { passive: true });

    allSlides.forEach((slide, index) => {
        slide.addEventListener('click', () => {
            if (!isDragging && index !== currentIndex) {
                const diff = index - currentIndex;
                if (Math.abs(diff) === 1) moveSlide(diff);
            }
        });
    });

    // Debounce resize events
    let resizeTimer;
    new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => updateCarousel(false), 50);
    }).observe(container);

    window.addEventListener('load', () => updateCarousel(false));
    updateCarousel(false);
});
