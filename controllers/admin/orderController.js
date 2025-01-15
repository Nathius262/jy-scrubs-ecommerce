import db from '../../models/index.cjs';
import * as orderHelper from '../../helpers/orderHelper.js'

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const limit = req.query.limit || 12;
    const page = req.query.page || 1;
    
    const {orders, totalOrderPages, totalOrderItems, currentOrderPage} = await orderHelper.getOrders(page, limit);

    res.render('./admin/order/list', {orders, totalOrderPages, totalOrderItems, currentOrderPage, admin:true});
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get an order by ID
export const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await orderHelper.getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.render('./admin/order/update', {order, admin:true});
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new order
export const createOrder = async (req, res) => {
  const { userId, productIds, status = 'pending' } = req.body;
  try {
    const newOrder = await db.Order.create({ userId, status });

    // Add products to the order
    if (productIds && productIds.length > 0) {
      const products = await db.Product.findAll({ where: { id: productIds } });
      await newOrder.addProducts(products); // Associate products
    }

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update an order (status update)
export const updateOrder = async (req, res) => {
  const { id } = req.params; // Order ID
  const { status } = req.body; // New delivery status


  try {
    // Fetch the order along with its delivery status
    const order = await db.Order.findByPk(id, {
      include: [{ model: db.DeliveryStatus, as: 'deliveryStatus' }],
    });

    if (!order) {
      console.log(`Order with ID ${id} not found.`);
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if delivery status exists
    const deliveryStatus = order.deliveryStatus;
    if (deliveryStatus && deliveryStatus.length > 0) {
      console.log(`Updating delivery status for ID: ${deliveryStatus[0].id}, New Status: ${status}`);
      
      // Update the delivery status
      const [updatedRows] = await db.DeliveryStatus.update(
        { status },
        { where: { id: deliveryStatus[0].id } }
      );

      if (updatedRows === 0) {
        console.error('DeliveryStatus update failed.');
        return res.status(500).json({ error: 'Failed to update delivery status.' });
      }
    } else {
      console.log(`No delivery status found for Order ID: ${id}`);
      return res.status(404).json({ error: 'Delivery status not found for this order.' });
    }

    // Re-fetch the order with updated delivery status for response
    const updatedOrder = await db.Order.findByPk(id, {
      include: [{ model: db.DeliveryStatus, as: 'deliveryStatus' }],
    });

    res.status(200).json({message:"Status updated successfully"});
  } catch (error) {
    console.error('Error updating order:', error.message || error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// Delete an order
export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await db.Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.destroy();
    res.status(204).send();  // No content
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
