import { getProductCart } from '../helpers/productHelper.js'; // Adjust the import based on your project structure
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import axios from 'axios';
import {createOrder} from '../helpers/orderHelper.js'
import db from '../models/index.cjs';



dotenv.config();

const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Endpoint for getting conversion rates
export const exchangeRate = async (req, res) => {
    const { toCurrency, amount } = req.query;

    try {
        const response = await axios.get(
            `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/pair/NGN/${toCurrency}/${amount}`
        );
        const rate = response.data;
        console.log(rate)
        res.json({ success: true, rate});
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
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }, // Replace with your secret key
        });

        const paymentData = response.data.data;

        // Create Order
        const result = await createOrder(paymentData, cartItems);

        if (result.success) {
            // Clear cart cookies
            res.clearCookie('cart');

            // Dynamically generate base URL from the request
            const baseUrl = `${req.protocol}://${req.get('host')}`;

            // Send tracking email
            await sendTrackingEmail(paymentData.customer.email, result.trackingId, baseUrl);

            res.status(200).json(result);
        } else {
            res.status(400).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('Error verifying transaction:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};


async function sendTrackingEmail(userEmail, trackingId, baseUrl) {
    try {
        // Configure Nodemailer transport for Zoho Mail
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.com',
            port: 465, // Use 587 for TLS, or 465 for SSL
            secure: true, // Set true for SSL, false for TLS
            auth: {
                user: process.env.ZOHO_EMAIL,
                pass: process.env.ZOHO_PASSWORD,
            },
            
        });

        // Generate tracking link dynamically
        const trackingLink = `${baseUrl}/checkout/track-order?trackingId=${trackingId}`;

        // Email content
        const mailOptions = {
            from: `"Jy-Scurbs Store" ${process.env.ZOHO_EMAIL}`, // Sender's email
            to: userEmail, // Recipient's email
            subject: 'Your Order Tracking Information',
            html: `
                <h1>Thank you for your order!</h1>
                <p>Your order has been successfully processed. You can track your order using the information below:</p>
                <p><strong>Tracking ID:</strong> ${trackingId}</p>
                <p>Track your order here: <a href="${trackingLink}">${trackingLink}</a></p>
                <p>If you have any questions, feel free to contact our support team.</p>
            `,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Tracking email sent successfully:', info.messageId);
    } catch (error) {
        console.error('Error sending tracking email:', error.message);
    }
}


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


export const trackOrder = async (req, res) => {
    const { trackingId } = req.query;

    if (!trackingId) {
        return res.status(400).json({ success: false, message: 'Tracking ID is required.' });
    }

    try {
        // Fetch order details
        const order = await db.Order.findOne({
            where: { trackingId },
            include: [
                { model: db.OrderItem, as: 'items', include: [{ model: db.Product, as: 'product' }] },
                { model: db.DeliveryStatus, as: 'deliveryStatus' },
            ],
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        // Format order details
        const orderDetails = {
            status: order.status,
            items: order.items.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
            })),
            deliveryStatus: order.deliveryStatus.map(status => ({
                status: status.status,
                notes: status.notes,
                updatedAt: status.updatedAt,
            })),
        };

        res.status(200).json({ success: true, order: orderDetails });
    } catch (error) {
        console.error('Error tracking order:', error);
        res.status(500).json({ success: false, message: 'An error occurred while tracking the order.' });
    }
};

export const trackOrderPage = async (req, res) => {


    try {
        // Render the checkout page with the retrieved products
        return res.render('./layouts/track_order', {pageTitle: "Track Your Order"});
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

