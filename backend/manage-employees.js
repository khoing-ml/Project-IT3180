#!/usr/bin/env node
/**
 * Script to manage employees and their user accounts
 * Usage:
 *   node manage-employees.js list                    - List all employees
 *   node manage-employees.js create-sample           - Create sample employees
 *   node manage-employees.js create <email> <name> <role> <phone>
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

// Valid employee roles
const VALID_EMPLOYEE_ROLES = ['accountant', 'cashier', 'administrative'];

// Valid user roles for employees
const USER_ROLE_MAP = {
  accountant: 'accounting',      // Kế toán -> accounting user role
  cashier: 'accounting',         // Thu ngân -> accounting user role
  administrative: 'manager',     // Hành chính -> manager user role
};

/**
 * Generate next employee code
 */
async function generateEmployeeCode() {
  try {
    const { data, error } = await supabase
      .rpc('generate_employee_code');
    
    if (error) {
      // Fallback: generate manually if function doesn't exist
      const year = new Date().getFullYear();
      const { data: employees } = await supabase
        .from('employees')
        .select('employee_code')
        .like('employee_code', `NV-${year}-%`)
        .order('employee_code', { ascending: false })
        .limit(1);
      
      if (employees && employees.length > 0) {
        const lastCode = employees[0].employee_code;
        const lastNumber = parseInt(lastCode.split('-')[2]);
        return `NV-${year}-${String(lastNumber + 1).padStart(4, '0')}`;
      }
      return `NV-${year}-0001`;
    }
    
    return data;
  } catch (error) {
    // Fallback
    const year = new Date().getFullYear();
    return `NV-${year}-0001`;
  }
}

/**
 * List all employees
 */
async function listEmployees() {
  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select(`
        id,
        user_id,
        employee_code,
        full_name,
        email,
        phone,
        role,
        status,
        created_at,
        notes
      `)
      .order('employee_code', { ascending: true });

    if (error) {
      console.error('Error fetching employees:', error);
      return;
    }

    console.log('\n=== Danh sách Nhân viên ===\n');
    console.log('Mã NV\t\t\tRole\t\t\tHọ tên\t\t\t\tEmail\t\t\t\t\tĐiện thoại\t\tTrạng thái');
    console.log('-'.repeat(160));

    const roleLabels = {
      accountant: 'Kế toán',
      cashier: 'Thu ngân',
      administrative: 'Hành chính',
    };

    employees.forEach(emp => {
      const code = (emp.employee_code || '-').padEnd(15);
      const role = (roleLabels[emp.role] || emp.role).padEnd(20);
      const name = emp.full_name.padEnd(30);
      const email = emp.email.padEnd(35);
      const phone = (emp.phone || '-').padEnd(15);
      const status = emp.status === 'active' ? '✓ Hoạt động' : '✗ Không hoạt động';
      console.log(`${code}\t${role}\t${name}\t${email}\t${phone}\t${status}`);
    });

    console.log('\n=== Tổng hợp theo vai trò ===\n');
    const roleCounts = employees.reduce((acc, emp) => {
      const label = roleLabels[emp.role] || emp.role;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`${role}: ${count} nhân viên`);
    });

    console.log(`\nTổng: ${employees.length} nhân viên`);
    console.log(`Đang hoạt động: ${employees.filter(e => e.status === 'active').length}`);
    console.log(`Không hoạt động: ${employees.filter(e => e.status === 'inactive').length}\n`);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Create an employee with user account
 */
async function createEmployee(email, fullName, employeeRole, phone, password) {
  if (!VALID_EMPLOYEE_ROLES.includes(employeeRole)) {
    console.error(`Error: Invalid role "${employeeRole}". Must be one of: ${VALID_EMPLOYEE_ROLES.join(', ')}`);
    return false;
  }

  try {
    // Check if employee already exists
    const { data: existing } = await supabase
      .from('employees')
      .select('email')
      .eq('email', email)
      .single();

    if (existing) {
      console.log(`⚠ Employee ${email} already exists`);
      return false;
    }

    // Check if user with this email already exists in auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    const existingAuthUser = users?.find(u => u.email === email);

    let userId;

    if (existingAuthUser) {
      console.log(`ℹ Using existing auth user for ${email}`);
      userId = existingAuthUser.id;

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!existingProfile) {
        // Create profile
        const userRole = USER_ROLE_MAP[employeeRole];
        const username = email.split('@')[0];

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            username: username,
            full_name: fullName,
            role: userRole,
          });

        if (profileError) {
          console.error(`✗ Error creating profile for ${email}:`, profileError.message);
          return false;
        }
      }
    } else {
      // Create new user account
      const userRole = USER_ROLE_MAP[employeeRole];
      const username = email.split('@')[0];

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          username: username,
          full_name: fullName,
          role: userRole,
        },
      });

      if (authError) {
        console.error(`✗ Error creating auth user for ${email}:`, authError.message);
        return false;
      }

      userId = authData.user.id;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          username: username,
          full_name: fullName,
          role: userRole,
        });

      if (profileError) {
        console.error(`✗ Error creating profile for ${email}:`, profileError.message);
        // Clean up auth user
        await supabase.auth.admin.deleteUser(userId);
        return false;
      }
    }

    // Generate employee code
    const employeeCode = await generateEmployeeCode();

    // Create employee record
    const { error: employeeError } = await supabase
      .from('employees')
      .insert({
        user_id: userId,
        employee_code: employeeCode,
        full_name: fullName,
        email: email,
        phone: phone,
        role: employeeRole,
        status: 'active',
      });

    if (employeeError) {
      console.error(`✗ Error creating employee record for ${email}:`, employeeError.message);
      return false;
    }

    console.log(`✓ Created ${employeeRole}: ${fullName} (${email}) - Mã NV: ${employeeCode}`);
    return true;
  } catch (error) {
    console.error(`Error creating employee ${email}:`, error);
    return false;
  }
}

/**
 * Create sample employees
 */
async function createSampleEmployees() {
  const sampleEmployees = [
    {
      email: 'nv.ketoan01@bluemoon-staff.com',
      fullName: 'Nguyễn Văn An',
      role: 'accountant',
      phone: '0901234567',
      password: 'Accountant@123',
    },
    {
      email: 'nv.ketoan02@bluemoon-staff.com',
      fullName: 'Trần Thị Bình',
      role: 'accountant',
      phone: '0901234568',
      password: 'Accountant@123',
    },
    {
      email: 'nv.thungan01@bluemoon-staff.com',
      fullName: 'Lê Văn Cường',
      role: 'cashier',
      phone: '0901234569',
      password: 'Cashier@123',
    },
    {
      email: 'nv.thungan02@bluemoon-staff.com',
      fullName: 'Phạm Thị Dung',
      role: 'cashier',
      phone: '0901234570',
      password: 'Cashier@123',
    },
    {
      email: 'nv.hanhchinh01@bluemoon-staff.com',
      fullName: 'Hoàng Văn Em',
      role: 'administrative',
      phone: '0901234571',
      password: 'Admin@123',
    },
    {
      email: 'nv.hanhchinh02@bluemoon-staff.com',
      fullName: 'Vũ Thị Hoa',
      role: 'administrative',
      phone: '0901234572',
      password: 'Admin@123',
    },
  ];

  console.log('\n=== Tạo nhân viên mẫu ===\n');
  console.log('Đang tạo 6 nhân viên mẫu:\n');
  console.log('- 2 Kế toán viên');
  console.log('- 2 Thu ngân');
  console.log('- 2 Nhân viên hành chính\n');

  let created = 0;
  for (const emp of sampleEmployees) {
    const success = await createEmployee(
      emp.email,
      emp.fullName,
      emp.role,
      emp.phone,
      emp.password
    );
    if (success) created++;
  }

  console.log(`\n=== Hoàn thành ===`);
  console.log(`Đã tạo ${created}/${sampleEmployees.length} nhân viên\n`);

  if (created > 0) {
    console.log('=== Thông tin đăng nhập ===\n');
    console.log('Kế toán viên:');
    console.log('  - nv.ketoan01@bluemoon-staff.com / Accountant@123');
    console.log('  - nv.ketoan02@bluemoon-staff.com / Accountant@123');
    console.log('\nThu ngân:');
    console.log('  - nv.thungan01@bluemoon-staff.com / Cashier@123');
    console.log('  - nv.thungan02@bluemoon-staff.com / Cashier@123');
    console.log('\nNhân viên hành chính:');
    console.log('  - nv.hanhchinh01@bluemoon-staff.com / Admin@123');
    console.log('  - nv.hanhchinh02@bluemoon-staff.com / Admin@123');
    console.log('\n⚠️  Lưu ý: Đổi mật khẩu trong môi trường production!\n');

    console.log('=== Mapping User Roles ===\n');
    console.log('Employee Role → User Role trong profiles:');
    console.log('  • accountant → accounting (Kế toán)');
    console.log('  • cashier → accounting (Kế toán)');
    console.log('  • administrative → manager (Quản lý)\n');
  }
}

/**
 * Show employee info with user account details
 */
async function showEmployeeInfo(email) {
  try {
    const { data: employee, error } = await supabase
      .from('employees')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          email,
          role,
          created_at
        )
      `)
      .eq('email', email)
      .single();

    if (error || !employee) {
      console.error(`Employee ${email} not found`);
      return;
    }

    console.log('\n=== Thông tin nhân viên ===\n');
    console.log(`Mã nhân viên: ${employee.employee_code || 'Chưa có'}`);
    console.log(`Họ tên: ${employee.full_name}`);
    console.log(`Email: ${employee.email}`);
    console.log(`Điện thoại: ${employee.phone || 'Chưa có'}`);
    console.log(`Vai trò nhân viên: ${employee.role}`);
    console.log(`Trạng thái: ${employee.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}`);
    console.log(`Ghi chú: ${employee.notes || 'Không có'}`);
    
    if (employee.profiles) {
      console.log('\n=== Tài khoản người dùng ===\n');
      console.log(`Username: ${employee.profiles.username}`);
      console.log(`User Role: ${employee.profiles.role}`);
      console.log(`User ID: ${employee.profiles.id}`);
    }
    console.log('');
  } catch (error) {
    console.error('Error:', error);
  }
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
  node manage-employees.js list                                - List all employees
  node manage-employees.js create-sample                       - Create sample employees
  node manage-employees.js create <email> <name> <role> <phone> <password>
  node manage-employees.js info <email>                        - Show employee info

Employee roles: ${VALID_EMPLOYEE_ROLES.join(', ')}

User role mapping:
  - accountant → accounting (in profiles table)
  - cashier → accounting (in profiles table)
  - administrative → manager (in profiles table)

Examples:
  node manage-employees.js list
  node manage-employees.js create-sample
  node manage-employees.js create ketoan@test.com "Nguyen Van A" accountant 0901234567 Password123
  node manage-employees.js info ketoan@test.com
    `);
    return;
  }

  switch (command) {
    case 'list':
      await listEmployees();
      break;
    
    case 'create-sample':
      await createSampleEmployees();
      break;
    
    case 'create':
      if (args.length < 6) {
        console.error('Error: Missing arguments');
        console.error('Usage: node manage-employees.js create <email> <name> <role> <phone> <password>');
        return;
      }
      await createEmployee(args[1], args[2], args[3], args[4], args[5]);
      break;
    
    case 'info':
      if (args.length < 2) {
        console.error('Error: Missing email argument');
        console.error('Usage: node manage-employees.js info <email>');
        return;
      }
      await showEmployeeInfo(args[1]);
      break;
    
    default:
      console.error(`Error: Unknown command "${command}". Use "help" to see available commands.`);
  }
}

main().catch(console.error);
