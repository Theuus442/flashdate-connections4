import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

console.log("[edge-init] Function initialized at", new Date().toISOString());

export default async (req: Request) => {
  const requestId = Math.random().toString(36).substring(7);
  const timestamp = new Date().toISOString();
  
  console.log(`[${requestId}] [${timestamp}] ===== REQUEST START =====`);
  console.log(`[${requestId}] Method: ${req.method}`);
  console.log(`[${requestId}] URL: ${req.url}`);
  console.log(`[${requestId}] Headers:`, Object.fromEntries(req.headers));

  // CORS preflight
  if (req.method === "OPTIONS") {
    console.log(`[${requestId}] Handling CORS preflight`);
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== "POST") {
    console.log(`[${requestId}] ERROR: Invalid method ${req.method}`);
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    console.log(`[${requestId}] Parsing request body...`);
    const bodyText = await req.text();
    console.log(`[${requestId}] Body text: ${bodyText}`);
    
    const body = JSON.parse(bodyText);
    console.log(`[${requestId}] Parsed body:`, body);
    
    const { email, password } = body;
    console.log(`[${requestId}] Email: ${email}`);
    console.log(`[${requestId}] Password length: ${password?.length || 0}`);

    // Validate
    if (!email || !password) {
      console.log(`[${requestId}] ERROR: Missing email or password`);
      return new Response(
        JSON.stringify({ error: "Email and password required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[${requestId}] Validation passed`);

    // Get env vars
    console.log(`[${requestId}] Getting environment variables...`);
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log(`[${requestId}] SUPABASE_URL: ${supabaseUrl}`);
    console.log(`[${requestId}] SUPABASE_SERVICE_ROLE_KEY exists: ${!!serviceRoleKey}`);
    console.log(`[${requestId}] SUPABASE_SERVICE_ROLE_KEY length: ${serviceRoleKey?.length || 0}`);

    if (!supabaseUrl || !serviceRoleKey) {
      console.log(`[${requestId}] ERROR: Missing environment variables`);
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[${requestId}] Creating Supabase client...`);
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    console.log(`[${requestId}] Supabase client created`);

    console.log(`[${requestId}] Calling auth.admin.createUser...`);
    console.log(`[${requestId}] Parameters:`, {
      email,
      password: "***",
      email_confirm: true,
    });

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    console.log(`[${requestId}] createUser response received`);
    console.log(`[${requestId}] Error: ${error ? JSON.stringify(error) : "null"}`);
    console.log(`[${requestId}] Data: ${data ? JSON.stringify(data) : "null"}`);

    if (error) {
      console.log(`[${requestId}] ERROR creating user: ${error.message}`);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[${requestId}] User created successfully with ID: ${data?.user?.id}`);

    const response = JSON.stringify({ data: { user: data?.user } });
    console.log(`[${requestId}] Sending response: ${response}`);
    console.log(`[${requestId}] ===== REQUEST SUCCESS =====`);

    return new Response(response, {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log(`[${requestId}] EXCEPTION caught`);
    console.log(`[${requestId}] Error type: ${err?.constructor?.name}`);
    console.log(`[${requestId}] Error message: ${err instanceof Error ? err.message : String(err)}`);
    console.log(`[${requestId}] Error stack: ${err instanceof Error ? err.stack : "N/A"}`);
    console.log(`[${requestId}] Full error: ${JSON.stringify(err)}`);
    
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.log(`[${requestId}] ===== REQUEST FAILED =====`);
    
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};
