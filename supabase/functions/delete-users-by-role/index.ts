import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

export default async (req: Request) => {
  console.log(`[delete-users-by-role] ${req.method} request received`);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only accept POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Parse request
    let body: any;
    try {
      body = await req.json();
    } catch (parseErr) {
      console.error("[delete-users-by-role] JSON parse error:", parseErr);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { role } = body;

    // Validate role
    if (!role || (role !== "admin" && role !== "client")) {
      console.error("[delete-users-by-role] Invalid role:", role);
      return new Response(
        JSON.stringify({
          error: "Invalid role. Must be 'admin' or 'client'",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[delete-users-by-role] Deleting all users with role:", role);

    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[delete-users-by-role] Missing environment variables");
      return new Response(
        JSON.stringify({
          error: "Server configuration error",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with SERVICE ROLE (has full permissions)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Count users to delete
    console.log("[delete-users-by-role] Fetching users to count...");
    const { data: usersToDelete, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("role", role);

    if (fetchError) {
      console.error("[delete-users-by-role] Error fetching users:", fetchError);
      throw fetchError;
    }

    const count = usersToDelete?.length || 0;
    console.log("[delete-users-by-role] Found", count, "users to delete");

    if (count === 0) {
      console.log("[delete-users-by-role] No users to delete");
      return new Response(
        JSON.stringify({
          count: 0,
          message: "No users found with that role",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Step 2: Delete users (using SERVICE ROLE)
    console.log("[delete-users-by-role] Deleting", count, "users...");
    const { error: deleteError, count: deletedCount } = await supabase
      .from("users")
      .delete()
      .eq("role", role);

    if (deleteError) {
      console.error("[delete-users-by-role] Delete error:", deleteError);
      throw deleteError;
    }

    // Step 3: Verify deletion
    console.log("[delete-users-by-role] Verifying deletion...");
    const { data: remainingUsers, error: verifyError } = await supabase
      .from("users")
      .select("id")
      .eq("role", role);

    if (verifyError) {
      console.error("[delete-users-by-role] Verify error:", verifyError);
      throw verifyError;
    }

    const remaining = remainingUsers?.length || 0;
    console.log(
      "[delete-users-by-role] Deletion verified. Remaining users with role '",
      role,
      "':",
      remaining
    );

    if (remaining > 0) {
      console.warn(
        "[delete-users-by-role] WARNING: Deletion may have failed. Still",
        remaining,
        "users remaining"
      );
    }

    return new Response(
      JSON.stringify({
        count: count - remaining, // Actual deleted count
        message: `Deleted ${count - remaining} users with role '${role}'`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error("[delete-users-by-role] Unhandled error:", msg);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: msg,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};
