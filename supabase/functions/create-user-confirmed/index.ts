import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.0";

// CORS headers - must be sent with every response
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

/**
 * Main handler for the Edge Function
 */
export default async (req: Request) => {
  // Log incoming request
  console.log(`[create-user-confirmed] ${req.method} request received`);

  // Handle CORS preflight immediately
  if (req.method === "OPTIONS") {
    console.log("[create-user-confirmed] Handling CORS preflight request");
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only accept POST
  if (req.method !== "POST") {
    console.log(`[create-user-confirmed] Invalid method: ${req.method}`);
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Parse and validate input
    console.log("[create-user-confirmed] Parsing request body");
    let email: string;
    let password: string;

    try {
      const body = await req.json();
      email = body.email;
      password = body.password;
      console.log(`[create-user-confirmed] Received email: ${email}`);
    } catch (parseError) {
      console.error("[create-user-confirmed] JSON parse error:", parseError);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate required fields
    if (!email || !password) {
      console.error("[create-user-confirmed] Missing required fields");
      return new Response(
        JSON.stringify({
          error: "Missing required fields: email and password",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get environment variables
    console.log("[create-user-confirmed] Getting environment variables");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl) {
      console.error("[create-user-confirmed] SUPABASE_URL not configured");
      return new Response(
        JSON.stringify({
          error: "Server configuration error: SUPABASE_URL not set",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!supabaseServiceKey) {
      console.error(
        "[create-user-confirmed] SUPABASE_SERVICE_ROLE_KEY not configured"
      );
      return new Response(
        JSON.stringify({
          error: "Server configuration error: SUPABASE_SERVICE_ROLE_KEY not set",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    console.log("[create-user-confirmed] Initializing Supabase client");
    let supabase;
    try {
      supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      console.log("[create-user-confirmed] Supabase client initialized");
    } catch (initError) {
      console.error("[create-user-confirmed] Failed to initialize Supabase:", initError);
      return new Response(
        JSON.stringify({
          error: "Failed to initialize Supabase client",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create user
    console.log(`[create-user-confirmed] Creating user: ${email}`);
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
      console.error(`[create-user-confirmed] Auth creation error:`, error);
      return new Response(
        JSON.stringify({
          error: `Failed to create user: ${error.message}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `[create-user-confirmed] User created successfully: ${data?.user?.id}`
    );

    return new Response(
      JSON.stringify({
        user: {
          id: data.user.id,
          email: data.user.email,
          created_at: data.user.created_at,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Catch-all for unexpected errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[create-user-confirmed] Unhandled error:", errorMessage);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};
