const { supabaseAdmin } = require('../config/supabase');

exports.listByApartment = async (apt_id) => {
  const { data, error } = await supabaseAdmin
    .from('residents')
    .select('*')
    .eq('apt_id', apt_id)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
};

exports.countByApartment = async (apt_id) => {
  const { count, error } = await supabaseAdmin
    .from('residents')
    .select('id', { count: 'exact', head: true })
    .eq('apt_id', apt_id);
  if (error) throw error;
  return count || 0;
};

exports.listAll = async () => {
  const { data, error } = await supabaseAdmin
    .from('residents')
    .select('*')
    .order('apt_id', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
};

exports.getByUserId = async (user_id) => {
  const { data, error } = await supabaseAdmin
    .from('residents')
    .select('*')
    .eq('user_id', user_id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};

exports.createResident = async (resident) => {
  // resident: { apt_id, full_name, phone, id_number, is_owner, user_id }
  if (!resident || !resident.apt_id || !resident.full_name) {
    throw new Error('Invalid resident payload');
  }

  // If user_id provided, check if user already has a resident record
  if (resident.user_id) {
    const { data: existing } = await supabaseAdmin
      .from('residents')
      .select('id')
      .eq('user_id', resident.user_id)
      .single();

    if (existing) {
      throw new Error('This user already has a resident record');
    }
  }

  // If marking as owner, clear existing owner flag for that apartment
  if (resident.is_owner) {
    const { error: clearErr } = await supabaseAdmin
      .from('residents')
      .update({ is_owner: false })
      .eq('apt_id', resident.apt_id);
    if (clearErr) throw clearErr;
  }

  // Map frontend camelCase fields to DB snake_case
  const payload = Object.assign({}, resident, {
    created_at: new Date().toISOString(),
    year_of_birth: resident.yearOfBirth || resident.year_of_birth || null,
    hometown: resident.hometown || null,
    gender: resident.gender || null,
    user_id: resident.user_id || null
  });
  // Remove potential camelCase duplicate to avoid DB column mismatch
  delete payload.yearOfBirth;

  const { data, error } = await supabaseAdmin.from('residents').insert(payload).select().single();
  if (error) throw error;

  // Update apartment counts/status
  const { data: apt, error: aptErr } = await supabaseAdmin
    .from('apartments')
    .select('*')
    .eq('apt_id', resident.apt_id)
    .single();

  try {
    const currentCount = await exports.countByApartment(resident.apt_id);
    const updateObj = { resident_count: currentCount, status: currentCount > 0 ? 'occupied' : 'empty' };
    // If this resident is marked as owner, also update apartments.owner_id and owner_name/email
    if (data && data.is_owner) {
      updateObj.owner_id = data.id;
      updateObj.owner_name = data.full_name || null;
      updateObj.owner_email = data.email || null;
    }
    if (apt) {
      await supabaseAdmin.from('apartments').update(updateObj).eq('apt_id', resident.apt_id);
    }
  } catch (e) {
    // don't fail resident creation if apartment update fails
    console.warn('Failed to update apartment after creating resident', e.message || e);
  }

  return data;
};

// NEW: Update resident
exports.updateResident = async (resident_id, updates) => {
  const { data: resident, error: fetchErr } = await supabaseAdmin
    .from('residents')
    .select('*')
    .eq('id', resident_id)
    .single();
  
  if (fetchErr) throw fetchErr;
  if (!resident) throw new Error('Resident not found');

  // Map camelCase to snake_case
  const payload = {
    updated_at: new Date().toISOString()
  };

  if (updates.full_name !== undefined) payload.full_name = updates.full_name;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.id_number !== undefined) payload.id_number = updates.id_number;
  if (updates.yearOfBirth !== undefined) payload.year_of_birth = updates.yearOfBirth;
  if (updates.hometown !== undefined) payload.hometown = updates.hometown;
  if (updates.gender !== undefined) payload.gender = updates.gender;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  
  // Handle is_owner flag
  if (updates.is_owner !== undefined) {
    if (updates.is_owner && !resident.is_owner) {
      // Clear other owners in same apartment
      await supabaseAdmin
        .from('residents')
        .update({ is_owner: false })
        .eq('apt_id', resident.apt_id)
        .neq('id', resident_id);
    }
    payload.is_owner = updates.is_owner;
  }

  const { data, error } = await supabaseAdmin
    .from('residents')
    .update(payload)
    .eq('id', resident_id)
    .select()
    .single();

  if (error) throw error;

  // Update apartment if is_owner changed
  if (data.is_owner) {
    await supabaseAdmin
      .from('apartments')
      .update({
        owner_id: data.id,
        owner_name: data.full_name,
        owner_email: data.email
      })
      .eq('apt_id', data.apt_id);
  }

  return data;
};

// NEW: Link resident to user
exports.linkResidentToUser = async (resident_id, user_id) => {
  // Validate resident exists
  const { data: resident, error: resErr } = await supabaseAdmin
    .from('residents')
    .select('*')
    .eq('id', resident_id)
    .single();

  if (resErr) throw resErr;
  if (!resident) throw new Error('Resident not found');

  // Validate user exists
  const { data: user, error: userErr } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user_id)
    .single();

  if (userErr) throw userErr;
  if (!user) throw new Error('User not found');

  // Check if user already linked to another resident
  const { data: existing } = await supabaseAdmin
    .from('residents')
    .select('id')
    .eq('user_id', user_id)
    .neq('id', resident_id)
    .single();

  if (existing) {
    throw new Error('This user is already linked to another resident');
  }

  // Link resident to user
  const { data, error } = await supabaseAdmin
    .from('residents')
    .update({ user_id })
    .eq('id', resident_id)
    .select()
    .single();

  if (error) throw error;

  // Update user's apartment_number to match resident's apartment
  await supabaseAdmin
    .from('profiles')
    .update({ apartment_number: resident.apt_id })
    .eq('id', user_id);

  return data;
};

exports.deleteResident = async (resident_id, options = {}) => {
  // options: { new_owner_id }
  const { data: resident, error: fetchErr } = await supabaseAdmin.from('residents').select('*').eq('id', resident_id).single();
  if (fetchErr) throw fetchErr;
  if (!resident) throw new Error('Resident not found');

  const apt_id = resident.apt_id;

  // If resident is owner, require new_owner_id to transfer ownership
  if (resident.is_owner) {
    if (!options.new_owner_id) {
      throw new Error('Cannot delete household owner without assigning a new owner. Provide new_owner_id in request body.');
    }
    // verify new owner belongs to same apartment
    const { data: newOwner, error: noErr } = await supabaseAdmin.from('residents').select('*').eq('id', options.new_owner_id).single();
    if (noErr) throw noErr;
    if (!newOwner || newOwner.apt_id !== apt_id) {
      throw new Error('New owner must be an existing resident of the same apartment');
    }

    // set new owner
    const { error: setErr } = await supabaseAdmin.from('residents').update({ is_owner: true }).eq('id', options.new_owner_id);
    if (setErr) throw setErr;
  }

  // delete resident
  const { error: delErr } = await supabaseAdmin.from('residents').delete().eq('id', resident_id);
  if (delErr) throw delErr;

  // update apartment resident_count and status
  try {
    const currentCount = await exports.countByApartment(apt_id);
    const updateObj = { resident_count: currentCount, status: currentCount > 0 ? 'occupied' : 'empty' };
    // If we deleted the owner, update apartments.owner_id/name/email to new owner (if provided)
    if (resident.is_owner && options.new_owner_id) {
      const { data: newOwner } = await supabaseAdmin.from('residents').select('*').eq('id', options.new_owner_id).single();
      if (newOwner) {
        updateObj.owner_id = newOwner.id;
        updateObj.owner_name = newOwner.full_name || null;
        updateObj.owner_email = newOwner.email || null;
      }
    } else {
      // if deleted resident was owner but no new owner provided (shouldn't happen), clear owner fields
      if (resident.is_owner && !options.new_owner_id) {
        updateObj.owner_id = null;
        updateObj.owner_name = null;
        updateObj.owner_email = null;
      }
      // also handle case where apartments.owner_id still points to deleted resident (safety)
      const { data: aptCurrent } = await supabaseAdmin.from('apartments').select('owner_id').eq('apt_id', apt_id).single();
      if (aptCurrent && aptCurrent.owner_id === resident_id && !updateObj.owner_id) {
        updateObj.owner_id = null;
        updateObj.owner_name = null;
        updateObj.owner_email = null;
      }
    }

    await supabaseAdmin.from('apartments').update(updateObj).eq('apt_id', apt_id);
  } catch (e) {
    console.warn('Failed to update apartment after deleting resident', e.message || e);
  }

  return true;
};
