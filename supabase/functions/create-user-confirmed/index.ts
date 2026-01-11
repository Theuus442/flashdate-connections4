import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

interface CreateUserRequest {
  email: string;
  password: string;
}

export default async (req: Request) => {
  console.log("[create-user-confirmed] Function called");
  console.log("[create-user-confirmed] Request method:", req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("[create-user-confirmed] Handling CORS preflight");
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log("[create-user-confirmed] Invalid method:", req.method);
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    console.log("[create-user-confirmed] Parsing request body");
    const body = await req.json() as CreateUserRequest;
    const { email, password } = body;

    console.log("[create-user-confirmed] Received email:", email);
    console.log("[create-user-confirmed] Password provided:", !!password);

    if (!email || !password) {
      console.log("[create-user-confirmed] Missing required fields");
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("[create-user-confirmed] Supabase URL exists:", !!supabaseUrl);
    console.log("[create-user-confirmed] Service role key exists:", !!serviceRoleKey);

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[create-user-confirmed] Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase admin client
    console.log("[create-user-confirmed] Creating Supabase client");
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create user via admin API
    console.log("[create-user-confirmed] Calling auth.admin.createUser");
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error("[create-user-confirmed] createUser error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[create-user-confirmed] User created successfully:", data?.user?.id);
    return new Response(
      JSON.stringify({ data: { user: data?.user } }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[create-user-confirmed] Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};
