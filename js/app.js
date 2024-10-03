let scrollPosition = 0; // Tracks the current scroll position

document.getElementById('next-btn').addEventListener('click', function () {
    const colorRow = document.querySelector('.color-row');
    const cardWidth = document.querySelector('.color-card').offsetWidth + 20; // 20px is the gap
    const totalScrollWidth = colorRow.scrollWidth - colorRow.offsetWidth; // Total scrollable width

    if (scrollPosition > -totalScrollWidth) { // Ensure we don't scroll past the last item
        scrollPosition -= cardWidth;
        colorRow.style.transform = `translateX(${scrollPosition}px)`;
    }
});

document.getElementById('prev-btn').addEventListener('click', function () {
    const colorRow = document.querySelector('.color-row');
    const cardWidth = document.querySelector('.color-card').offsetWidth + 20; // 20px is the gap

    if (scrollPosition < 0) { // Ensure we don't scroll past the first item
        scrollPosition += cardWidth;
        colorRow.style.transform = `translateX(${scrollPosition}px)`;
    }
});


let coreScrollPosition = 0;

document.getElementById('next-core-btn').addEventListener('click', function () {
    const coreRow = document.querySelector('.core-row');
    const coreItemWidth = document.querySelector('.core-item').offsetWidth + 20; // 20px is the gap
    const totalCoreScrollWidth = coreRow.scrollWidth - coreRow.offsetWidth;

    if (coreScrollPosition > -totalCoreScrollWidth) {
        coreScrollPosition -= coreItemWidth;
        coreRow.style.transform = `translateX(${coreScrollPosition}px)`;
    }
});

document.getElementById('prev-core-btn').addEventListener('click', function () {
    const coreRow = document.querySelector('.core-row');
    const coreItemWidth = document.querySelector('.core-item').offsetWidth + 20;

    if (coreScrollPosition < 0) {
        coreScrollPosition += coreItemWidth;
        coreRow.style.transform = `translateX(${coreScrollPosition}px)`;
    }
});
