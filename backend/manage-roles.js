#!/usr/bin/env node
/**
 * Script to manage user roles
 * Usage:
 *   node manage-roles.js list                    - List all users with their roles
 *   node manage-roles.js set <email> <role>      - Set role for a user
 *   node manage-roles.js create-test             - Create test users for each role
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '.env.local') });
// Fallback to .env if .env.local doesn't exist
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
}
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env or .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Valid roles
const VALID_ROLES = ['admin', 'manager', 'user', 'accounting'];

/**
 * List all users with their roles
 */
async function listUsers() {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, username, full_name, role, apartment_number, created_at')
      .order('role', { ascending: true })
      .order('email', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    console.log('\n=== Danh sách người dùng ===\n');
    console.log('Role\t\tEmail\t\t\t\tUsername\t\tFull Name');
    console.log('-'.repeat(100));

    profiles.forEach(profile => {
      const role = profile.role.padEnd(12);
      const email = profile.email.padEnd(30);
      const username = profile.username.padEnd(20);
      console.log(`${role}\t${email}\t${username}\t${profile.full_name}`);
    });

    console.log('\n=== Tổng hợp theo role ===\n');
    const roleCounts = profiles.reduce((acc, p) => {
      acc[p.role] = (acc[p.role] || 0) + 1;
      return acc;
    }, {});

    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`${role}: ${count} người dùng`);
    });

    console.log(`\nTổng: ${profiles.length} người dùng\n`);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Set role for a user
 */
async function setUserRole(email, newRole) {
  if (!VALID_ROLES.includes(newRole)) {
    console.error(`Error: Invalid role "${newRole}". Must be one of: ${VALID_ROLES.join(', ')}`);
    return;
  }

  try {
    // Find user by email
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (findError || !profile) {
      console.error(`Error: User with email "${email}" not found`);
      return;
    }

    console.log(`\nFound user: ${profile.full_name} (${profile.email})`);
    console.log(`Current role: ${profile.role}`);
    console.log(`New role: ${newRole}`);

    // Update role
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profile.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating role:', updateError);
      return;
    }

    console.log(`✓ Successfully updated role to "${newRole}" for ${email}\n`);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Create test users for each role
 */
async function createTestUsers() {
  const testUsers = [
    {
      email: 'admin.test@bluemoon.com',
      password: 'Admin@123456',
      username: 'admin_test',
      full_name: 'Admin Test Account',
      role: 'admin',
    },
    {
      email: 'manager.test@bluemoon.com',
      password: 'Manager@123456',
      username: 'manager_test',
      full_name: 'Manager Test Account',
      role: 'manager',
    },
    {
      email: 'accounting.test@bluemoon.com',
      password: 'Accounting@123456',
      username: 'accounting_test',
      full_name: 'Accounting Test Account',
      role: 'accounting',
    },
    {
      email: 'resident.test@bluemoon.com',
      password: 'User@123456',
      username: 'resident_test',
      full_name: 'Resident Test Account',
      role: 'user',
      apartment_number: 'A101',
    },
  ];

  console.log('\n=== Creating test users ===\n');

  for (const user of testUsers) {
    try {
      // Check if user already exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', user.email)
        .single();

      if (existing) {
        console.log(`⚠ User ${user.email} already exists, skipping...`);
        continue;
      }

      // Create user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          username: user.username,
          full_name: user.full_name,
          role: user.role,
          apartment_number: user.apartment_number,
        },
      });

      if (authError) {
        console.error(`✗ Error creating ${user.email}:`, authError.message);
        continue;
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: user.email,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
          apartment_number: user.apartment_number,
        });

      if (profileError) {
        console.error(`✗ Error creating profile for ${user.email}:`, profileError.message);
        // Clean up auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        continue;
      }

      console.log(`✓ Created ${user.role}: ${user.email} (password: ${user.password})`);
    } catch (error) {
      console.error(`Error creating ${user.email}:`, error);
    }
  }

  console.log('\n=== Test user creation completed ===\n');
  console.log('You can now log in with any of these test accounts.');
  console.log('Make sure to change the passwords in production!\n');
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help') {
    console.log(`
Usage:
  node manage-roles.js list                    - List all users with their roles
  node manage-roles.js set <email> <role>      - Set role for a user
  node manage-roles.js create-test             - Create test users for each role

Valid roles: ${VALID_ROLES.join(', ')}

Examples:
  node manage-roles.js list
  node manage-roles.js set user@example.com accounting
  node manage-roles.js create-test
    `);
    return;
  }

  switch (command) {
    case 'list':
      await listUsers();
      break;
    
    case 'set':
      if (args.length < 3) {
        console.error('Error: Missing arguments. Usage: node manage-roles.js set <email> <role>');
        return;
      }
      await setUserRole(args[1], args[2]);
      break;
    
    case 'create-test':
      await createTestUsers();
      break;
    
    default:
      console.error(`Error: Unknown command "${command}". Use "help" to see available commands.`);
  }
}

main().catch(console.error);
