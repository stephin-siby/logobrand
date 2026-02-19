function playVideoOnMouseMove(videoId) {
    var video = document.getElementById(videoId);
    var allVideos = document.querySelectorAll('.common-video'); // Use .common-video as selector

    if (video.paused) {
        // Pause all other videos
        allVideos.forEach(function (v) {
            if (v.id !== videoId && !v.paused) {
                v.pause();
                v.currentTime = 2;
            }
        });
        video.play();
    }
}

function pauseVideo(videoId) {
    var video = document.getElementById(videoId);
    if (video && !video.paused) {
        video.pause();
        video.currentTime = 2;
    }
}

// Initialize videos to start at 2 seconds
document.addEventListener('DOMContentLoaded', function () {
    var videos = document.querySelectorAll('.common-video');
    videos.forEach(function (video) {
        // Set initial time
        video.currentTime = 2;

        // Ensure it stays at 2 if metadata loads later
        video.addEventListener('loadedmetadata', function () {
            this.currentTime = 2;
        });
    });
});

// Explicitly expose to window in case of scoping issues
window.playVideoOnMouseMove = playVideoOnMouseMove;

// ==========================================
// Custom Testimonial Carousel Logic (Infinite Loop)
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
    const track = document.querySelector('.slider-track');
    const container = document.querySelector('.slider-container');
    const slidesNodeList = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (!track || !container || slidesNodeList.length === 0) return;

    // Clone first and last slide for infinite loop effect
    // Verify we have enough slides for double-cloning (need at least 2)
    const totalOriginal = slidesNodeList.length;
    if (totalOriginal < 2) return;

    // Clone 2 slides on each side
    const firstSlide = slidesNodeList[0];
    const cloneFirst = slidesNodeList[0].cloneNode(true);
    const cloneSecond = slidesNodeList[1].cloneNode(true);

    const cloneLast = slidesNodeList[totalOriginal - 1].cloneNode(true);
    const cloneSecondLast = slidesNodeList[totalOriginal - 2].cloneNode(true);

    // Append Clones (First & Second -> End)
    track.appendChild(cloneFirst);
    track.appendChild(cloneSecond);

    // Prepend Clones (Last & SecondLast -> Start)
    track.insertBefore(cloneLast, firstSlide);
    track.insertBefore(cloneSecondLast, cloneLast);

    // Re-query all slides including clones
    let allSlides = document.querySelectorAll('.slide');

    let currentIndex = 2; // Start at the real first slide (index 2)
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;
    let isTransitioning = false;

    // Initial positioning without transition
    updateCarousel(false);

    // Recalculate on window load to ensure images are loaded
    window.addEventListener('load', () => {
        updateCarousel(false);
    });

    // Navigation Buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            moveSlide(-1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            moveSlide(1);
        });
    }

    // Handle Infinite Loop Reset
    track.addEventListener('transitionend', (e) => {
        // Ignore transitions from children (like slide opacity/transform)
        if (e.target !== track) return;

        isTransitioning = false;

        const totalSlides = allSlides.length;

        // If we are at the first clone of First Slide (Index: Total - 2), jump to Real First (Index: 2)
        if (currentIndex === totalSlides - 2) {
            track.style.transition = 'none';
            currentIndex = 2;
            void track.offsetHeight; // Force reflow
            updateCarousel(false);
        }

        // If we are at the first clone of Last Slide (Index: 1), jump to Real Last (Index: Total - 3)
        if (currentIndex === 1) {
            track.style.transition = 'none';
            currentIndex = totalSlides - 3;
            void track.offsetHeight; // Force reflow
            updateCarousel(false);
        }
    });

    // Touch/Drag Events
    container.addEventListener('mousedown', touchStart);
    container.addEventListener('touchstart', touchStart);

    container.addEventListener('mouseup', touchEnd);
    container.addEventListener('mouseleave', () => { if (isDragging) touchEnd() });
    container.addEventListener('touchend', touchEnd);

    container.addEventListener('mousemove', touchMove);
    container.addEventListener('touchmove', touchMove);

    // Click on slide to center
    allSlides.forEach((slide, index) => {
        slide.addEventListener('click', () => {
            if (!isDragging) {
                // Check if it's a valid next/prev index or same
                if (index === currentIndex) return;
                // Allow clicking adjacent slides
                const diff = index - currentIndex;
                if (Math.abs(diff) === 1) moveSlide(diff);
            }
        });
    });

    // Resize
    window.addEventListener('resize', () => {
        // Recalculate without animation
        track.style.transition = 'none';
        updateCarousel(false);
    });

    function moveSlide(direction) {
        if (isTransitioning) return;
        isTransitioning = true;
        track.style.transition = 'transform 0.5s ease-out';
        currentIndex += direction;
        updateCarousel();
    }

    function touchStart(event) {
        if (isTransitioning) return;
        isDragging = true;
        startX = getPositionX(event);
        animationID = requestAnimationFrame(animation);
        container.style.cursor = 'grabbing';
        track.style.transition = 'none';
    }

    function touchMove(event) {
        if (isDragging) {
            const currentX = getPositionX(event);
            const diff = currentX - startX;
            currentTranslate = prevTranslate + diff;
        }
    }

    function touchEnd() {
        isDragging = false;
        cancelAnimationFrame(animationID);
        container.style.cursor = 'grab';

        // Re-enable transition for the snap back/forward
        track.style.transition = 'transform 0.5s ease-out';

        const movedBy = currentTranslate - prevTranslate;

        // Threshold for swipe
        if (movedBy < -50) {
            moveSlide(1);
        } else if (movedBy > 50) {
            moveSlide(-1);
        } else {
            // Snap back
            updateCarousel(true);
        }
    }

    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    function animation() {
        if (isDragging) {
            setSliderPosition();
            requestAnimationFrame(animation);
        }
    }

    function setSliderPosition() {
        track.style.transform = `translateX(${currentTranslate}px)`;
    }

    function updateCarousel(animate = true) {
        if (!animate) {
            track.style.transition = 'none';
            // Force reflow
            void track.offsetHeight;
        } else {
            track.style.transition = 'transform 0.5s ease-out';
        }

        const containerWidth = container.offsetWidth;
        // recalculate slide width as it might change on resize
        const slideWidth = allSlides[0].offsetWidth;

        const centerPosition = (containerWidth / 2) - (slideWidth / 2) - (slideWidth * currentIndex);

        currentTranslate = centerPosition;
        prevTranslate = currentTranslate;

        track.style.transform = `translateX(${currentTranslate}px)`;

        // Update active, prev, and next classes
        allSlides.forEach((slide) => {
            slide.classList.remove('active');
            slide.classList.remove('prev');
            slide.classList.remove('next');
        });

        // Logic to highlight center active slide
        if (allSlides[currentIndex]) {
            allSlides[currentIndex].classList.add('active');

            // Highlight previous slide
            const prevIndex = currentIndex - 1;
            if (prevIndex >= 0 && allSlides[prevIndex]) {
                allSlides[prevIndex].classList.add('prev');
            }

            // Highlight next slide
            const nextIndex = currentIndex + 1;
            if (nextIndex < allSlides.length && allSlides[nextIndex]) {
                allSlides[nextIndex].classList.add('next');
            }
        }
    }
});
