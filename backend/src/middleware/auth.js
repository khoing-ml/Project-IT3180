const { supabase } = require('../config/supabase');

/**
 * Middleware to verify JWT token from Supabase
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch user profile with role information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // If profile not found, create a minimal profile from user metadata
      const minimalProfile = {
        id: user.id,
        email: user.email,
        username: user.email?.split('@')[0] || 'user',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        role: user.user_metadata?.role || 'user',
        apartment_number: user.user_metadata?.apartment_number || null,
        created_at: user.created_at
      };
      
      // Attach user and profile to request
      req.user = { ...user, ...minimalProfile, role: minimalProfile.role };
      req.profile = minimalProfile;
      
      console.warn(`Profile not found for user ${user.id}, using auth metadata`);
      next();
      return;
    }

    // Attach user and profile to request
    req.user = { ...user, ...profile, role: profile.role };
    req.profile = profile;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.profile || req.profile.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

/**
 * Middleware to check if user has admin or manager role
 */
const requireAdminOrManager = (req, res, next) => {
  if (!req.profile || !['admin', 'manager'].includes(req.profile.role)) {
    return res.status(403).json({ 
      error: 'Access denied. Admin or Manager privileges required.' 
    });
  }
  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireAdminOrManager
};
