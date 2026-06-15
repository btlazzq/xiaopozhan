const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'xiaopozhan-local-dev-secret';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }
  try {
    const token = header.slice(7);
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: '登录已过期' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.admin) return res.status(401).json({ error: '未登录' });
    if (roles.includes(req.admin.role) || req.admin.role === 'super_admin') {
      return next();
    }
    return res.status(403).json({ error: '权限不足' });
  };
}

module.exports = { authMiddleware, requireRole, JWT_SECRET };
