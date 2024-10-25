// cart.js

// Initialize cart module
document.addEventListener('DOMContentLoaded', initializeCart);

let selectedColorId = null;
let selectedSizeId = null;
let quantity = 1;
let maxStock = 0; // Set this dynamically from each product page

/**
 * Initialize cart on page load and setup event listeners
 */
function initializeCart() {
    const cart = getCart();
    updateMinicart(cart);

    // Event listeners for Add to Bag, quantity, color, and size buttons
    document.body.addEventListener('click', (event) => {
        if (event.target.matches('.add-to-bag-btn')) {
            handleAddToBag(event);
        } else if (event.target.matches('.increaseQty')) {
            increaseQuantity();
        } else if (event.target.matches('.decreaseQty')) {
            decreaseQuantity();
        } else if (event.target.matches('.color-select')) {
            selectColor(event);
        } else if (event.target.matches('.size-select')) {
            selectSize(event);
        }
    });
}

/**
 * Handle adding item to cart
 */
function handleAddToBag(event) {
    if (!selectedColorId || !selectedSizeId) {
        alert('Please select both a color and a size.');
        return;
    }

    const productId = event.target.dataset.productId; // Assume product ID is data attribute
    addToCart(productId, quantity, selectedSizeId, selectedColorId);
    updateMinicart(getCart());
}

/**
 * Update minicart display with total items
 */
function updateMinicart(cart) {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const minicartItems = document.querySelector('.minicart-items');
    if (minicartItems) {
        minicartItems.textContent = `${totalItems} Item${totalItems !== 1 ? 's' : ''}`;
    }
}

/**
 * Add item to cart cookie
 */
function addToCart(productId, quantity, sizeId, colorId) {
    let cart = getCart();
    const existingItemIndex = cart.findIndex(item => item.productId === productId && item.sizeId === sizeId && item.colorId === colorId);

    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity = Math.min(maxStock, cart[existingItemIndex].quantity + quantity);
    } else {
        cart.push({ productId, quantity, sizeId, colorId });
    }

    setCart(cart);
    alert('Item added to your bag!');
}

/**
 * Retrieve cart from cookies
 */
function getCart() {
    let cart = getCookie('cart');
    return cart ? JSON.parse(cart) : [];
}

/**
 * Set cart in cookies
 */
function setCart(cart) {
    setCookie('cart', JSON.stringify(cart), 7);
}

/**
 * Increase quantity
 */
function increaseQuantity() {
    if (quantity < maxStock) {
        quantity++;
        document.getElementById('quantityInput').value = quantity;
    }
}

/**
 * Decrease quantity
 */
function decreaseQuantity() {
    if (quantity > 1) {
        quantity--;
        document.getElementById('quantityInput').value = quantity;
    }
}

/**
 * Color selection logic
 */
function selectColor(event) {
    document.querySelectorAll('.color-select').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
    selectedColorId = event.target.dataset.colorId;
}

/**
 * Size selection logic
 */
function selectSize(event) {
    document.querySelectorAll('.size-select').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
    selectedSizeId = event.target.dataset.sizeId;
}

/**
 * Set a cookie
 */
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value || ""}; expires=${date.toUTCString()}; path=/`;
}

/**
 * Get a cookie by name
 */
function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) == ' ') cookie = cookie.substring(1, cookie.length);
        if (cookie.indexOf(nameEQ) == 0) return cookie.substring(nameEQ.length, cookie.length);
    }
    return null;
}
