import db from '../../models/index.js';

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await db.Order.findAll({
      include: { model: db.Product, as: 'products', through: { attributes: [] } }, // Include associated products
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get an order by ID
export const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await db.Order.findByPk(id, {
      include: { model: db.Product, as: 'products', through: { attributes: [] } },
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order);
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
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await db.Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status || order.status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error('Error updating order:', error);
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
