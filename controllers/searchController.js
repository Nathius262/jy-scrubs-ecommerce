import { searchAll } from '../helpers/searchHelper.js';

export const searchProducts = async (req, res) => {
    try {
        const { searchTerm = '', page = 1, limit = 10 } = req.query;

        const result = await searchAll({ searchTerm, page: parseInt(page), limit: parseInt(limit) });

        return res.render('./layouts/search', result);
    } catch (error) {
        console.error('Error searching for products:', error);
        res.status(500).json({ error: 'An error occurred while searching for products.' });
    }
};
