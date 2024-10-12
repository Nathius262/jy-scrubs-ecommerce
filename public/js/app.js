try {
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

    const items = [
        {
            title: 'Product Title 1',
            price: '$40.00',
            img: 'https://www.wearfigs.com/i/shopify/s/files/1/0139/8942/files/Q2_2024_6_BONSAI_LEON_COREY_936.jpg?v=1720027298&width=360'
        },
        {
            title: 'Product Title 2',
            price: '$45.00',
            img: 'https://www.wearfigs.com/i/shopify/s/files/1/0139/8942/products/Mens-Chisec-Moss-M-1.jpg?v=1664920818&width=360'
        },
        {
            title: 'Product Title 3',
            price: '$50.00',
            img: 'https://www.wearfigs.com/i/shopify/s/files/1/0139/8942/files/Q3_2023_08_NAVY_CAIRO_M_DAVEY_21669.jpg?v=1695923228&width=360'
        },
        {
            title: 'Product Title 4',
            price: '$55.00',
            img: 'https://www.wearfigs.com/i/shopify/s/files/1/0139/8942/files/Q2_2024_6_BONSAI_LEON_COREY_936.jpg?v=1720027298&width=360'
        },
        {
            title: 'Product Title 5',
            price: '$60.00',
            img: 'https://www.wearfigs.com/i/shopify/s/files/1/0139/8942/files/Q2_2024_6_BONSAI_LEON_COREY_936.jpg?v=1720027298&width=360'
        },
        {
            title: 'Product Title 6',
            price: '$65.00',
            img: 'https://www.wearfigs.com/i/shopify/s/files/1/0139/8942/files/Q2_2024_6_BONSAI_LEON_COREY_936.jpg?v=1720027298&width=360'
        },
        {
            title: 'Product Title 1',
            price: '$40.00',
            img: 'https://www.wearfigs.com/i/shopify/s/files/1/0139/8942/files/Q2_2024_6_BONSAI_LEON_COREY_936.jpg?v=1720027298&width=360'
        },
        {
            title: 'Product Title 2',
            price: '$45.00',
            img: 'https://www.wearfigs.com/i/shopify/s/files/1/0139/8942/products/Mens-Chisec-Moss-M-1.jpg?v=1664920818&width=360'
        },
        {
            title: 'Product Title 3',
            price: '$50.00',
            img: 'https://www.wearfigs.com/i/shopify/s/files/1/0139/8942/files/Q3_2023_08_NAVY_CAIRO_M_DAVEY_21669.jpg?v=1695923228&width=360'
        },
        {
            title: 'Product Title 4',
            price: '$55.00',
            img: 'https://www.wearfigs.com/i/shopify/s/files/1/0139/8942/files/Q2_2024_6_BONSAI_LEON_COREY_936.jpg?v=1720027298&width=360'
        },
        {
            title: 'Product Title 5',
            price: '$60.00',
            img: 'https://www.wearfigs.com/i/shopify/s/files/1/0139/8942/files/Q2_2024_6_BONSAI_LEON_COREY_936.jpg?v=1720027298&width=360'
        },
        {
            title: 'Product Title 6',
            price: '$65.00',
            img: 'https://www.wearfigs.com/i/shopify/s/files/1/0139/8942/files/Q2_2024_6_BONSAI_LEON_COREY_936.jpg?v=1720027298&width=360'
        },
        {
            title: 'Product Title 1',
            price: '$40.00',
            img: 'https://www.wearfigs.com/i/shopify/s/files/1/0139/8942/files/Q2_2024_6_BONSAI_LEON_COREY_936.jpg?v=1720027298&width=360'
        },
        {
            title: 'Product Title 2',
            price: '$45.00',
            img: 'https://www.wearfigs.com/i/shopify/s/files/1/0139/8942/products/Mens-Chisec-Moss-M-1.jpg?v=1664920818&width=360'
        },
        {
            title: 'Product Title 3',
            price: '$50.00',
            img: 'https://www.wearfigs.com/i/shopify/s/files/1/0139/8942/files/Q3_2023_08_NAVY_CAIRO_M_DAVEY_21669.jpg?v=1695923228&width=360'
        },
        {
            title: 'Product Title 4',
            price: '$55.00',
            img: 'https://www.wearfigs.com/i/shopify/s/files/1/0139/8942/files/Q2_2024_6_BONSAI_LEON_COREY_936.jpg?v=1720027298&width=360'
        },
        {
            title: 'Product Title 5',
            price: '$60.00',
            img: 'https://www.wearfigs.com/i/shopify/s/files/1/0139/8942/files/Q2_2024_6_BONSAI_LEON_COREY_936.jpg?v=1720027298&width=360'
        },
        {
            title: 'Product Title 6',
            price: '$65.00',
            img: 'https://www.wearfigs.com/i/shopify/s/files/1/0139/8942/files/Q2_2024_6_BONSAI_LEON_COREY_936.jpg?v=1720027298&width=360'
        },
        
    ];


    let visibleItems = 3;
    const itemsPerLoad = 3;
    const productRow = document.getElementById('productRow');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadPreviousBtn = document.getElementById('loadPreviousBtn');

    function renderItems(startIndex, endIndex) {
        productRow.innerHTML = ''; // Clear current items
        const slicedItems = items.slice(startIndex, endIndex);

        slicedItems.forEach(item => {
            const productHtml = `
                <div class="product-item">
                    <div class="product-img-wrapper position-relative">
                        <img src="${item.img}" alt="${item.title}" class="product-img img-fluid">
                    </div>
                    <h6 class="mt-2 fs-6 fw-light">${item.title}</h6>
                    <p class="price">${item.price}</p>
                </div>
            `;
            productRow.innerHTML += productHtml;
        });
    }

    function updateButtons() {
        // Hide the '>' button if there are no more items to load
        if (visibleItems >= items.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }

        // Hide the '<' button if we are showing the first set of items
        if (visibleItems > itemsPerLoad) {
            loadPreviousBtn.style.display = 'block';
        } else {
            loadPreviousBtn.style.display = 'none';
        }
    }

    // Initial load
    renderItems(0, visibleItems);
    updateButtons();

    // Load more items when ">" is clicked
    loadMoreBtn.addEventListener('click', function () {
        if (visibleItems < items.length) {
            const startIndex = visibleItems;
            visibleItems += itemsPerLoad;
            renderItems(startIndex, visibleItems);
            updateButtons();
        }
    });

    // Load previous items when "<" is clicked
    loadPreviousBtn.addEventListener('click', function () {
        if (visibleItems > itemsPerLoad) {
            visibleItems -= itemsPerLoad;
            renderItems(visibleItems - itemsPerLoad, visibleItems);
            updateButtons();
        }
    });
    } catch (error) {
        
}