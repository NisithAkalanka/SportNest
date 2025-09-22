const jwt = require('jsonwebtoken');
const Member = require('../models/memberModel');

// Try verify with one or two secrets
function verifyWithSecrets(token) {
  const secrets = [
    process.env.JWT_SECRET,           // member
    process.env.ADMIN_JWT_SECRET,     // admin (if your admin uses a different secret)
  ].filter(Boolean);

  let decoded = null, lastErr = null;
  for (const sec of secrets) {
    try { decoded = jwt.verify(token, sec); return decoded; }
    catch (e) { lastErr = e; }
  }
  if (!decoded) throw lastErr || new Error('JWT verify failed');
}

async function protectAny(req, res, next) {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = verifyWithSecrets(token);

      // 1) Try member
      const member = await Member.findById(decoded.id).select('-password');
      if (member) {
        if (!member.role) member.role = 'member';
        req.user = member;
        return next();
      }

      // 2) Fallback: treat as admin using claims in token
      req.user = {
        _id: decoded.id,
        role: decoded.role || (decoded.isAdmin ? 'admin' : 'member'),
        isAdmin: decoded.isAdmin === true || decoded.role === 'admin',
      };
      return next();

    } catch (e) {
      // Helpful for debugging
      console.error('auth error:', e.name, e.message);
      return res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  }
  return res.status(401).json({ msg: 'Not authorized, no token' });
}

function adminOnly(req, res, next) {
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin === true)) return next();
  return res.status(403).json({ msg: 'Admin only' });
}

/* Back-compat exports: default is function, also provides .protectAny / .adminOnly */
module.exports = protectAny;
module.exports.protectAny = protectAny;
module.exports.adminOnly = adminOnly;
