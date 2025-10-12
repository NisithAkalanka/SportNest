// Backend/middleware/adminMiddleware.js 

const jwt = require('jsonwebtoken');


const Admin = require('../models/Admin');
require('dotenv').config();

const protectAdmin = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Header eken token eka extract karagnnawa
            token = req.headers.authorization.split(' ')[1];

            // 2. Token eka verify karagnnawa
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Token eka valid nam, user details gannawa database eken
            //    Decode karapu token eke id eka use karala
            //    Admin kenekuth password eka hariyanne nathuwa gannawa
            req.admin = await Admin.findById(decoded.id).select('-password');
            
            // Admin kenekuth nathnam
            if (!req.admin) {
                return res.status(401).json({ msg: 'Not authorized, admin not found' });
            }
            
            
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