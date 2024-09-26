import db from '../../models/index.cjs'; // Adjust the path as necessary

// Get all products with their categories
export const getAllProducts = async (req, res) => {
    try {
        const products = await db.Product.findAll({
            include: {
                model: db.Category,
                as: 'categories',  // Alias used in the model
                through: { attributes: [] },  // Exclude the join table attributes
            },
        });
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get a single product with categories
export const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await db.Product.findByPk(id, {
            include: {
                model: db.Category,
                as: 'categories',
                through: { attributes: [] },  // Exclude the join table attributes
            },
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a new product and associate categories
export const createProduct = async (req, res) => {
    const { name, description, price, stock, categoryIds } = req.body;

    try {
        // Create the product
        const newProduct = await db.Product.create({ name, description, price, stock });

        // Associate the product with the categories
        if (categoryIds && categoryIds.length > 0) {
            const categories = await db.Category.findAll({
                where: { id: categoryIds }
            });
            await newProduct.addCategories(categories);
        }

        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update a product and its categories
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, categoryIds } = req.body;

    try {
        const product = await db.Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.stock = stock || product.stock;
        await product.save();

        // Update the categories associated with the product
        if (categoryIds && categoryIds.length > 0) {
            const categories = await db.Category.findAll({
                where: { id: categoryIds }
            });
            await product.setCategories(categories); // Replaces existing associations
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await db.Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        await product.destroy();  // This will also remove the association from ProductCategory
        res.status(204).send();  // No content
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
