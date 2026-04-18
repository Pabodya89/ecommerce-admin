const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

router.get('/login', (req, res) => {
    res.status(405).json({
        message: 'Use POST /api/login with email and password in JSON body.',
        example: { email: 'admin@example.com', password: 'admin123' },
    });
});

router.post('/login', async (req, res) => {
    try {
        const { password } = req.body;
        const email = normalizeEmail(req.body?.email);
        if (!email || !password) 
            return res.status(400).json({ message: 'Email and password are required.' });

        const user = await User.findOne({ where: { email } });
        if(!user) return res.status(401).json({ message: 'Invalid credentials.' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }  
        );

        await user.update({ lastLoginAt: new Date() });
        res.json({ token, role: user.role, name: user.name });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

router.get('/me', authenticateToken, async (req,res) => {
    const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
    });
    res.json(user);
});

module.exports = router; 