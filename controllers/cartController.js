import { getProductCart } from '../helpers/productHelper.js'; // Adjust the import based on your project structure
import dotenv from 'dotenv';
import axios from 'axios';
import {createOrder} from '../helpers/orderHelper.js'



dotenv.config();

const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Endpoint for getting conversion rates
export const exchangeRate = async (req, res) => {
    const { toCurrency } = req.query;

    try {
        const response = await axios.get(
            `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/NGN`
        );
        const rate = response.data.conversion_rates[toCurrency];
        res.json({ success: true, rate });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const verifyPaystackTransaction = async (req, res) => {
    const { reference } = req.query;

    try {

        // Parse cart data from cookies
        const cartCookies = req.cookies?.cart;
        if (!cartCookies) {
            return res.status(400).json({ success: false, error: 'Cart is empty or missing.' });
        }

        let cartItems;
        try {
            cartItems = JSON.parse(cartCookies); // Parse the cookie data
        } catch (error) {
            return res.status(400).json({ success: false, error: 'Invalid cart data format.' });
        }

        // Verify Payment with Paystack
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } // Replace with your secret key
        });

        const paymentData = response.data.data;


        // Create Order
        const result = await createOrder(paymentData, cartItems);

        if (result.success) {
            res.clearCookie('cart');
            res.status(200).json(result);
        } else {
            res.status(400).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, error: error.message });
    }
};

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

