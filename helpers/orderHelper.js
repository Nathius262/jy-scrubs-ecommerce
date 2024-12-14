import db from '../models/index.cjs';
import { v4 as uuidv4 } from 'uuid';

export async function createOrder(paymentData, cartItems) {
    const transaction = await db.sequelize.transaction();
    try {
        // Validate cartItems
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            throw new Error('Invalid or empty cart items.');
        }

        // Create the Order
        const order = await db.Order.create({
            trackingId: uuidv4(),
            customerEmail: paymentData.customer.email,
            customerPhone: paymentData.phone || paymentData.metadata?.phone || null,
            totalAmount: paymentData.amount / 100, // Convert kobo to NGN
            currency: paymentData.currency,
            status: 'confirmed',
            paidAt: paymentData.paid_at,
            paymentChannel: paymentData.channel,
            gatewayResponse: paymentData.gateway_response,
            deliveryEligible: paymentData.amount / 100 > 1000
        }, { transaction });

        // Validate and create OrderItems
        const orderItems = cartItems.map(item => {
            // Validate each field
            if (
                typeof item.productId !== 'number' ||
                typeof item.quantity !== 'number' ||
                typeof item.price !== 'number'
            ) {
                throw new Error(`Invalid cart item data: ${JSON.stringify(item)}`);
            }
        
            return {
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                totalPrice: item.quantity * item.price,
            };
        });
        

        await db.OrderItem.bulkCreate(orderItems, { transaction });

        // Commit the transaction
        await transaction.commit();
        return { success: true, orderId: order.id, trackingId: order.trackingId };
    } catch (error) {
        // Rollback on error
        await transaction.rollback();
        console.error('Error creating order:', error);
        return { success: false, error: error.message };
    }
}
