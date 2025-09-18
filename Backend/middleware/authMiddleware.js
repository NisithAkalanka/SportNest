// Backend/middleware/authMiddleware.js (සම්පූර්ණ අලුත් කේතය)

const jwt = require('jsonwebtoken');
const Member = require('../models/memberModel'); // User model එක import කරගන්නවා

const protect = async (req, res, next) => {
    let token;

    // 1. Frontend එකෙන් එන 'Authorization' header එකෙන් 'Bearer' token එක බලාපොරොත්තු වෙනවා
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Header එකෙන් 'Bearer ' කියන කෑල්ල අයින් කරලා, Token එක විතරක් වෙන්කරගන්නවා
            token = req.headers.authorization.split(' ')[1];

            // 3. Token එක verify කරලා, user ගේ id එක decode කරගන්නවා
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. ඒ ID එකෙන්, password එක හැර, user ගේ අනිත් විස්තර database එකෙන් හොයාගන්නවා
            req.user = await Member.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ msg: 'Not authorized, user not found' });
            }
            // 5. ඊළඟට එන controller function එකට යන්න අවසර දෙනවා
            return next();

        } catch (error) {
            console.error(error);
            return res.status(401).json({ msg: 'Not authorized, token failed' });
        }
    }

    // Header එකේ token එකක් කොහෙත්ම නැත්නම්...
    if (!token) {
        return res.status(401).json({ msg: 'Not authorized, no token' });
    }
};

module.exports = protect;
