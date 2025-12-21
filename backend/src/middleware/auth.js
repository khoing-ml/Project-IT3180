const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * Middleware to verify JWT token from Supabase
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('Auth header received:', authHeader ? 'Bearer token present' : 'No auth header');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Returning 401: No token provided');
      return res.status(401).json({ error: 'No token provided', message: 'Authorization header missing or invalid' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log('Token verification failed:', error?.message);
      return res.status(401).json({ error: 'Invalid or expired token', message: error?.message || 'Token validation failed' });
    }

    console.log('User authenticated:', user.email);

    // Fetch user profile with role information using admin client to bypass RLS
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.log('Profile not found, using metadata for user:', user.email);
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
      
      console.log('User role from metadata:', minimalProfile.role);
      next();
      return;
    }

    // Attach user and profile to request
    req.user = { ...user, ...profile, role: profile.role };
    req.profile = profile;
    
    console.log('User role from profile:', profile.role);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
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
