// Import from stable CDN with fallback
let createClient: any;
let initError: string | null = null;

try {
  const module = await import("https://esm.sh/@supabase/supabase-js@2.90.0");
  createClient = module.createClient;
  console.log("[create-user-confirmed] ✅ Supabase module loaded successfully");
} catch (importErr) {
  initError = `Failed to import Supabase: ${
    importErr instanceof Error ? importErr.message : String(importErr)
  }`;
  console.error("[create-user-confirmed]", initError);
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

/**
 * Main handler for the Edge Function
 */
export default async (req: Request) => {
  console.log(`[create-user-confirmed] ${req.method} request received`);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("[create-user-confirmed] Responding to CORS preflight");
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Check if module loaded
  if (initError || !createClient) {
    console.error("[create-user-confirmed] Module initialization failed");
    return new Response(
      JSON.stringify({
        error: "Service initialization failed",
        details: initError || "Module not loaded",
      }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Only POST allowed
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
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
      console.error("[create-user-confirmed] JSON parse error:", parseErr);
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { email, password } = body;

    // Validate inputs
    if (!email || !password) {
      console.error("[create-user-confirmed] Missing email or password");
      return new Response(
        JSON.stringify({ error: "Email and password required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[create-user-confirmed] Processing: ${email}`);

    // Get env vars
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      console.error("[create-user-confirmed] Missing env variables");
      return new Response(
        JSON.stringify({
          error: "Server configuration incomplete",
          details: `Missing: ${!supabaseUrl ? "SUPABASE_URL " : ""}${
            !serviceKey ? "SUPABASE_SERVICE_ROLE_KEY" : ""
          }`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client
    console.log("[create-user-confirmed] Initializing Supabase client");
    const supabase = createClient(supabaseUrl, serviceKey);

    // Create user
    console.log(`[create-user-confirmed] Creating auth user: ${email}`);
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: {
        role: "client",
        created_via: "admin_panel",
        created_at: new Date().toISOString(),
      },
    });

    if (error) {
      console.error(
        "[create-user-confirmed] Auth error:",
        JSON.stringify(error)
      );
      return new Response(
        JSON.stringify({
          error: error.message || "Failed to create user",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[create-user-confirmed] ✅ User created: ${data?.user?.id}`);

    return new Response(
      JSON.stringify({
        user: {
          id: data?.user?.id,
          email: data?.user?.email,
          created_at: data?.user?.created_at,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error("[create-user-confirmed] Unhandled error:", msg);

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
