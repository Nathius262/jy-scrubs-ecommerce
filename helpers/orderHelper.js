import db from '../models/index.cjs';
import { v4 as uuidv4 } from 'uuid';

export async function createOrder(paymentData, cartItems) {
    const transaction = await db.sequelize.transaction();
    try {
        // Validate cartItems
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            throw new Error('Invalid or empty cart items.');
        }

        // Extract address from metadata
        const addressData = {
            streetAddress: paymentData.metadata?.address || null,
            city: paymentData.metadata?.city || null,
            state: paymentData.metadata?.state || null,
            country: paymentData.metadata?.country || null,
        };

        // Validate extracted addressData
        if (!addressData.streetAddress || !addressData.city || !addressData.state || !addressData.country) {
            throw new Error('Invalid or incomplete address in metadata.');
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
            deliveryEligible: paymentData.amount / 100 > 1000,
        }, { transaction });

        // Create the Address
        await db.Address.create({
            orderId: order.id,
            customerEmail: paymentData.customer.email, // Optional if tied to a user
            streetAddress: addressData.streetAddress,
            city: addressData.city,
            state: addressData.state,
            country: addressData.country,
        }, { transaction });

        // Validate and create OrderItems
        const orderItems = cartItems.map(item => {
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
                sizeId: item.sizeId,
                colorId: item.colorId,
                quantity: item.quantity,
                price: item.price,
                totalPrice: item.quantity * item.price,
            };
        });
        await db.OrderItem.bulkCreate(orderItems, { transaction });

        // Reduce Product Stock
        for (const item of cartItems) {
            const product = await db.Product.findByPk(item.productId, { transaction });

            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found.`);
            }

            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product ID ${item.productId}.`);
            }

            // Update stock
            product.stock -= item.quantity;
            await product.save({ transaction });
        }

        // Create initial DeliveryStatus
        await db.DeliveryStatus.create({
            orderId: order.id,
            status: 'pending', // Initial delivery status
            notes: 'Order has been created and is pending processing.',
        }, { transaction });

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