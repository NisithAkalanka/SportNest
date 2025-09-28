// Backend/middleware/adminMiddleware.js 

const jwt = require('jsonwebtoken');


const Admin = require('../models/Admin');
require('dotenv').config();

const protectAdmin = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Header එකෙන් Token එක විතරක් වෙන්කරගන්නවා
            token = req.headers.authorization.split(' ')[1];

            // 2. Token එක verify කරලා, payload එක decode කරගන්නවා
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. ★★★ නිවැරදි කරන ලද වැදගත්ම කොටස ★★★
            //    Decode කරගත් payload එකෙන්, 'id' කියන key එකේ අගය කෙලින්ම ලබාගෙන
            //    Admin කෙනෙක්ව database එකෙන් හොයනවා
            req.admin = await Admin.findById(decoded.id).select('-password');
            
            // Admin කෙනෙක් හම්බවුනේ නැත්නම්, error එකක් යවනවා
            if (!req.admin) {
                return res.status(401).json({ msg: 'Not authorized, admin not found' });
            }
            
            // හැමදේම හරි, ඊළඟට controller එකට යන්න දෙනවා
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