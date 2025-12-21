const { supabaseAdmin } = require("../src/config/supabase");

async function createAdmin() {
  const email = "doandat@bluemoon.com";
  const password = "Dat@2005";
  const username = "cptdat9";
  const full_name = "Doan Dat";

  console.log("Creating admin account...");

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

  if (authError) {
    console.error("Auth error:", authError.message);
    return;
  }

  const userId = authData.user.id;
  console.log("Auth user created:", userId);

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: userId,
      username,
      full_name,
      email,
      role: "admin",
      apartment_number: null
    });

  if (profileError) {
    console.error("Profile error:", profileError.message);
    return;
  }

  console.log("ADMIN ACCOUNT CREATED SUCCESSFULLY");
  console.log({
    email,
    password,
    role: "admin"
  });
}

createAdmin();
