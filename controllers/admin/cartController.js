import db from '../../models/index.cjs';

// Get all carts
export const getAllCarts = async (req, res) => {
  try {
    const carts = await db.Cart.findAll({
      include: { model: db.Product, as: 'products', through: { attributes: [] } }, // Include associated products
    });
    res.status(200).json(carts);
  } catch (error) {
    console.error('Error fetching carts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a cart by ID
export const getCartById = async (req, res) => {
  const { id } = req.params;
  try {
    const cart = await db.Cart.findByPk(id, {
      include: { model: db.Product, as: 'products', through: { attributes: [] } },
    });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new cart
export const createCart = async (req, res) => {
  const { userId, productIds } = req.body;
  try {
    const newCart = await db.Cart.create({ userId });

    // Add products to the cart
    if (productIds && productIds.length > 0) {
      const products = await db.Product.findAll({ where: { id: productIds } });
      await newCart.addProducts(products); // Associate products
    }

    res.status(201).json(newCart);
  } catch (error) {
    console.error('Error creating cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update cart items (add/remove products)
export const updateCart = async (req, res) => {
  const { id } = req.params;
  const { productIds } = req.body;

  try {
    const cart = await db.Cart.findByPk(id);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Replace cart items with new ones
    if (productIds && productIds.length > 0) {
      const products = await db.Product.findAll({ where: { id: productIds } });
      await cart.setProducts(products); // Replace existing products
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a cart
export const deleteCart = async (req, res) => {
  const { id } = req.params;

  try {
    const cart = await db.Cart.findByPk(id);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    await cart.destroy();
    res.status(204).send();  // No content
  } catch (error) {
    console.error('Error deleting cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
