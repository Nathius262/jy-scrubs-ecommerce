import db from '../models/index.cjs'
import { comparePassword, generateToken } from '../helpers/authHelper.js';

export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const admin = await db.User.findOne({
            where: { email },
            attributes: ['id', 'name', 'email', 'password', 'createdAt', 'updatedAt'], // Include password in the result
            include: {
                model: db.Role,
                as: 'roles',
                where: { role_name: 'admin' }, // Ensure the user has the admin role
            }
        });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }


        // Check if the password is undefined
        if (!admin.password) {
            return res.status(500).json({ message: 'Error: Admin has no password set' });
        }

        // Compare password
        const isPasswordValid = await comparePassword(password, admin.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = generateToken(admin)

        // Set token as HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,   // Prevents client-side JavaScript from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Ensures the cookie is sent over HTTPS only in production
            sameSite: 'Strict', // Helps prevent CSRF attacks
            maxAge: 86400000, // 1 day in milliseconds (24 hours)
        });
        

        // Create and send JWT token here after successful login...
        res.status(200).json({ message: 'Login successful'});

    } catch (error) {
        console.error("Error logging in admin:", error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Admin Login Controller render
export const renderloginAdmin = async (req, res) => {
    return res.render('./auth/adminLogin')
}
