import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

interface CreateUserRequest {
  email: string;
  password: string;
}

const handler: Handler = async (event) => {
  console.log("[create-user-confirmed] Function called");
  console.log("[create-user-confirmed] Method:", event.httpMethod);

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "ok",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    console.log("[create-user-confirmed] Parsing request");
    const body = JSON.parse(event.body || "{}") as CreateUserRequest;
    const { email, password } = body;

    console.log("[create-user-confirmed] Email:", email);
    console.log("[create-user-confirmed] Password provided:", !!password);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Email and password are required" }),
      };
    }

    // Get environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("[create-user-confirmed] Supabase URL:", !!supabaseUrl);
    console.log("[create-user-confirmed] Service role key:", !!serviceRoleKey);

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[create-user-confirmed] Missing environment variables");
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Server configuration error - missing environment variables" }),
      };
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
    console.log("[create-user-confirmed] Creating user via admin API");
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // User is already confirmed - no email needed
    });

    if (error) {
      console.error("[create-user-confirmed] Error creating user:", error);
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: error.message }),
      };
    }

    console.log("[create-user-confirmed] User created:", data?.user?.id);
    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: { user: data?.user } }),
    };
  } catch (error) {
    console.error("[create-user-confirmed] Exception:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};

export { handler };
