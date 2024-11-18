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


export const processPayment = async (req, res) => {
    const { token, email } = req.body;

    const amount = 100000; // Amount in kobo (e.g., 1000 NGN = 100000 kobo)

    try {
        // Send the token to 
        const response = await fetch('https://qa.interswitchng.com/quicktellerservice/api/v5/Transactions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer YZMqZezsltpSPNb4+49PGeP7lYkzKn1a5SaVSyzKOiI=`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                authorization_code: token, // Use the token here
                email: email,
                amount: amount
            })
        });

        console.log(response)
        res.json({ success: response })

        
    } catch (err) {
        res.json({ success: false, error: err.message });
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

