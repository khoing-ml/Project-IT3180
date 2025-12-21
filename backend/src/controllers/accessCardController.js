const { supabase, supabaseAdmin } = require('../config/supabase');

// Get all access cards (admin/manager) or own cards (resident)
exports.getAllCards = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Admin/Manager can see all cards
    if (userRole === 'admin' || userRole === 'manager') {
      const { data, error } = await supabaseAdmin
        .from('access_cards')
        .select(`
          *,
          resident:resident_id(id, username, full_name, apartment_number, email),
          issuer:issued_by(id, username, full_name)
        `)
        .order('issued_date', { ascending: false });

      if (error) throw error;
      return res.json(data);
    }

    // Regular users see only their own cards
    const { data, error } = await supabaseAdmin
      .from('access_cards')
      .select(`
        *,
        resident:resident_id(id, username, full_name, apartment_number, email),
        issuer:issued_by(id, username, full_name)
      `)
      .eq('resident_id', userId)
      .order('issued_date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get card by ID
exports.getCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const { data, error } = await supabaseAdmin
      .from('access_cards')
      .select(`
        *,
        resident:resident_id(id, username, full_name, apartment_number, email),
        issuer:issued_by(id, username, full_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Check permissions
    if (userRole !== 'admin' && userRole !== 'manager' && data.resident_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create new card (admin/manager only)
exports.createCard = async (req, res) => {
  try {
    const { resident_id, card_number, card_type, expiry_date, notes } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Only admin/manager can create cards
    if (userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Validate required fields
    if (!resident_id || !card_number) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabaseAdmin
      .from('access_cards')
      .insert([
        {
          resident_id,
          card_number,
          card_type: card_type || 'resident',
          status: 'active',
          issued_by: userId,
          expiry_date,
          notes
        }
      ])
      .select(`
        *,
        resident:resident_id(id, username, full_name, apartment_number, email),
        issuer:issued_by(id, username, full_name)
      `);

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update card status (admin/manager only)
exports.updateCardStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason_for_status } = req.body;
    const userRole = req.user?.role;

    // Only admin/manager can update status
    if (userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Validate status
    const validStatuses = ['active', 'inactive', 'lost', 'blocked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data, error } = await supabaseAdmin
      .from('access_cards')
      .update({ status, reason_for_status })
      .eq('id', id)
      .select(`
        *,
        resident:resident_id(id, username, full_name, apartment_number, email),
        issuer:issued_by(id, username, full_name)
      `);

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: error.message });
  }
};

// Report card as lost (resident or admin)
exports.reportCardLost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Get card to check permissions
    const { data: card, error: fetchError } = await supabaseAdmin
      .from('access_cards')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Only card owner, admin, or manager can report lost
    if (userRole !== 'admin' && userRole !== 'manager' && card.resident_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { data, error } = await supabaseAdmin
      .from('access_cards')
      .update({ 
        status: 'lost',
        reason_for_status: 'Card reported as lost'
      })
      .eq('id', id)
      .select(`
        *,
        resident:resident_id(id, username, full_name, apartment_number, email),
        issuer:issued_by(id, username, full_name)
      `);

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error('Error reporting card lost:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete card record (admin only)
exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    // Only admin can delete
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { error } = await supabaseAdmin
      .from('access_cards')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get cards by resident (admin/manager only - for issuing to new residents)
exports.getResidentCards = async (req, res) => {
  try {
    const { residentId } = req.params;
    const userRole = req.user?.role;

    // Only admin/manager can view resident cards
    if (userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { data, error } = await supabaseAdmin
      .from('access_cards')
      .select(`
        *,
        issuer:issued_by(id, username, full_name)
      `)
      .eq('resident_id', residentId)
      .order('issued_date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching resident cards:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get cards by status (admin/manager only)
exports.getCardsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const userRole = req.user?.role;

    // Only admin/manager can view
    if (userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const validStatuses = ['active', 'inactive', 'lost', 'blocked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data, error } = await supabaseAdmin
      .from('access_cards')
      .select(`
        *,
        resident:resident_id(id, username, full_name, apartment_number, email),
        issuer:issued_by(id, username, full_name)
      `)
      .eq('status', status)
      .order('issued_date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching cards by status:', error);
    res.status(500).json({ error: error.message });
  }
};
