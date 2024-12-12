import { getProductCart } from '../helpers/productHelper.js'; // Adjust the import based on your project structure
import dotenv from 'dotenv';

import https from 'https';



dotenv.config();

const getQuickTellerToken = async () => {
    // Define your client ID and secret key
    const clientId = process.env.CLIENT_ID;
    const secretKey = process.env.SECRETE_KEY;

    // Concatenate with a colon
    const concatenatedString = `${clientId}:${secretKey}`;

    // Encode to Base64
    const encodedString = btoa(concatenatedString);

    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            Authorization: `Basic ${encodedString}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
        
    try {
        const token_response = await fetch('https://passport.k8.isw.la/passport/oauth/token?grant_type=client_credentials', options);
        
        if (!token_response.ok) {
            const errorText = await token_response.text();
            console.error('Token Error:', errorText); // Log the error
            throw new Error(`Failed to fetch token: ${errorText}`);
        }
    
        const data = await token_response.json();
    
        // Use or return the data as needed
        return data;
    
    } catch (error) {
        console.error('An error occurred while fetching the token:', error.message);
        throw error; // Re-throw the error for further handling if required
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


export const processPayment = async (req, res) => {
    const { token, email } = req.body;
    const amount = 100000; // Amount in kobo (e.g., 1000 NGN)

    try {
        // Fetch the token for authentication
        const token_data = await getQuickTellerToken();

        if (!token_data || !token_data.access_token) {
            throw new Error('Failed to retrieve authentication token.');
        }

        // Prepare request parameters
        const params = JSON.stringify({
            paymentCode: '10801',
            customerId: '0000000001',
            customerMobile: '2348056731576',
            customerEmail: email,
            amount: amount,
            requestReference: '1453' + '' + (Date.now() / 1000 | 0),
        });

        // Configure HTTPS options
        const options = {
            hostname: 'qa.interswitchng.com', // Replace with actual hostname
            port: 443,
            path: '/quicktellerservice/api/v5/Transactions',
            method: 'POST',
            headers: {
                Authentication: `Bearer ${token_data.access_token}`,
                'Content-Type': 'application/json',
                TerminalID: '3pbl0001',
            },
        };

        // Send HTTPS request
        const request = https.request(options, (response) => {
            let data = '';

            // Listen for response chunks
            response.on('data', (chunk) => {
                data += chunk;
            });

            // Handle end of response
            response.on('end', () => {
                try {
                    const responseBody = JSON.parse(data);

                    if (response.statusCode >= 200 && response.statusCode < 300) {
                        console.log('Payment Successful:', responseBody);
                        res.json({ success: true, data: responseBody });
                    } else {
                        console.error('Payment API Error:', responseBody);
                        res.status(response.statusCode).json({ success: false, error: responseBody });
                    }
                } catch (err) {
                    console.error('Failed to parse response:', err.message);
                    res.status(500).json({ success: false, error: 'Invalid JSON response from API.' });
                }
            });
        });

        // Handle request errors
        request.on('error', (error) => {
            console.error('Request Error:', error.message);
            res.status(500).json({ success: false, error: 'Payment request failed.' });
        });

        // Write request body and end the request
        request.write(params);
        request.end();

    } catch (error) {
        // Handle any additional errors
        console.error('Payment Processing Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};



async function makePayment() {
    const token = "your_token_here"; // Replace with your token
    const email = "example@example.com"; // Replace with user's email
    const amount = 100000; // Amount in kobo (e.g., 1000 NGN = 100000 kobo)
    
    try {
        const response = await fetch('https://qa.interswitchng.com/quicktellerservice/api/v5/Transactions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer DDD33A0F54A383792A3837D1B60BFDF17974D585`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                authorization_code: token, // Use the token here
                email: email,
                amount: amount
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error('Error making payment:', error);
    }
}

