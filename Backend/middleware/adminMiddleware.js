// Backend/middleware/adminMiddleware.js 

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
require('dotenv').config();

const protectAdmin = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Header eken Token eka visthara karanawa
            token = req.headers.authorization.split(' ')[1];

            // 2. Token eka verify karala, payload eka decode karanawa
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

           
            //    Decode karagath payload eken, 'id' kiyana key eke agaya kelinma labagena
            //    Admin kenekwa database eken hoyanawa
            req.admin = await Admin.findById(decoded.id).select('-password');
            
            // Admin kenek hambun nethm, error ekak ywnawa.
            if (!req.admin) {
                return res.status(401).json({ msg: 'Not authorized, admin not found' });
            }
            
            //  controller ekata ywnawa
            next();

        } catch (error) {
            console.error('TOKEN VERIFICATION FAILED:', error.message);
            return res.status(401).json({ msg: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ msg: 'Not authorized, no token provided' });
    }
};

module.exports = protectAdmin;