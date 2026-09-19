import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

type ResetRequest = {
  email?: string;
  code?: string;
  password?: string;
};

type ConsumeResult = {
  user_id: string;
  request_id: string;
};

Deno.serve(async (req: Request) => {
  /* =========================================================
     CORS
  ========================================================= */

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  /* =========================================================
     METHOD
  ========================================================= */

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    /* =======================================================
       REQUEST BODY
    ======================================================= */

    const body =
      (await req.json()) as ResetRequest;

    const email =
      body.email?.trim().toLowerCase();

    const code =
      body.code?.trim();

    const password =
      body.password;

    /* =======================================================
       BASIC VALIDATION
    ======================================================= */

    if (!email || !code || !password) {
      return new Response(
        JSON.stringify({
          error:
            "Email, code and password are required.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    if (!/^[0-9]{6}$/.test(code)) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid recovery code.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({
          error:
            "Password must contain at least 8 characters.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    /* =======================================================
       SUPABASE SERVER CREDENTIALS
    ======================================================= */

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    let secretKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY",
      ) ?? "";

    /*
     * Support for the newer Supabase secret-key
     * environment variable if it exists.
     */

    const secretKeys =
      Deno.env.get(
        "SUPABASE_SECRET_KEYS",
      );

    if (!secretKey && secretKeys) {
      try {
        const parsed =
          JSON.parse(secretKeys);

        secretKey =
          parsed.default ?? "";
      } catch {
        secretKey = "";
      }
    }

    if (!supabaseUrl || !secretKey) {
      console.error(
        "Supabase server credentials are not configured.",
      );

      return new Response(
        JSON.stringify({
          error:
            "Server configuration error.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    /* =======================================================
       ADMIN CLIENT
    ======================================================= */

    const supabaseAdmin =
      createClient(
        supabaseUrl,
        secretKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      );

    /* =======================================================
       VALIDATE RECOVERY CODE
       
       IMPORTANT:
       Do NOT mark the code as used yet.
       First validate it, then change the password.
    ======================================================= */

    const {
      data: validationData,
      error: validationError,
    } =
      await (supabaseAdmin.rpc as any)(
        "validate_password_reset_code",
        {
          p_email: email,
          p_code: code,
        },
      );

    if (validationError) {
      console.error(
        "validate_password_reset_code:",
        validationError,
      );

      return new Response(
        JSON.stringify({
          error:
            "Unable to validate recovery code.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    const validationResult =
      Array.isArray(validationData)
        ? validationData[0]
        : validationData;

    if (
      !validationResult ||
      !validationResult.valid ||
      !validationResult.user_id
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid or expired recovery code.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    const userId =
      validationResult.user_id;

    /* =======================================================
       UPDATE PASSWORD
    ======================================================= */

    const {
      error: passwordError,
    } =
      await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          password,
        },
      );

    if (passwordError) {
      console.error(
        "Password update error:",
        passwordError,
      );

      return new Response(
        JSON.stringify({
          error:
            "Unable to update password.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    /* =======================================================
       MARK CODE AS USED
    ======================================================= */

    const {
      data: consumedData,
      error: consumeError,
    } =
      await (supabaseAdmin.rpc as any)(
        "consume_password_reset_code",
        {
          p_email: email,
          p_code: code,
        },
      );

    if (consumeError) {
      /*
       * A password has already been changed.
       * We log the problem but do not tell the user
       * that the password change failed.
       */
      console.error(
        "consume_password_reset_code:",
        consumeError,
      );
    } else {
      const consumed =
        Array.isArray(consumedData)
          ? consumedData[0]
          : consumedData;

      if (!consumed?.user_id) {
        console.error(
          "Recovery code could not be marked as used.",
        );
      }
    }

    /* =======================================================
       ACTIVITY LOG
    ======================================================= */

    try {
      await supabaseAdmin
        .from("activity_logs")
        .insert({
          user_id: userId,
          action: "UPDATE",
          entity_type:
            "password_reset",
          description:
            "Password changed using administrator-approved recovery code.",
        });
    } catch (logError) {
      /*
       * Logging failure must not invalidate
       * an already successful password change.
       */
      console.error(
        "Activity log error:",
        logError,
      );
    }

    /* =======================================================
       SUCCESS
    ======================================================= */

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      },
    );
  } catch (error) {
    console.error(
      "reset-password-with-code:",
      error,
    );

    return new Response(
      JSON.stringify({
        error:
          "Unexpected error.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      },
    );
  }
});