import { getProductCart } from '../helpers/productHelper.js'; // Adjust the import based on your project structure



export const checkout = async (req, res) => {
    // Retrieve the cart from the cookies
    const cartData = req.cookies.cart;

    if (!cartData) {
        return res.status(400).send('No items in the cart');
    }

    try {
        // Parse the cart data assuming it is in JSON format
        const parsedCartData = JSON.parse(cartData);
        
        // Fetch the products based on the cart data
        const products = await getProductCart(parsedCartData);
        
        // Render the checkout page with the retrieved products
        return res.render('./layouts/checkout', { products });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

