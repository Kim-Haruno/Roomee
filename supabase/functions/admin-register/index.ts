import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, email, password, fullName, phone } = await req.json();

    console.log('Admin registration attempt for email:', email);

    // Validate required fields
    if (!token || !email || !password || !fullName || !phone) {
      console.log('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate token server-side
    const validToken = Deno.env.get('ADMIN_REGISTRATION_TOKEN');
    if (!validToken || token !== validToken) {
      console.log('Invalid admin registration token');
      return new Response(
        JSON.stringify({ error: 'Invalid or missing admin registration token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create the admin user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'landlord',
        phone: phone,
      },
    });

    if (authError) {
      console.error('Error creating admin user:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (authData.user) {
      // Add admin role to user_roles table
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'admin',
        });

      if (roleError) {
        console.error('Error adding admin role:', roleError);
        // Don't fail - user is created, just log the role error
      } else {
        console.log('Admin role added successfully for user:', authData.user.id);
      }
    }

    console.log('Admin account created successfully for:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin account created successfully',
        userId: authData.user?.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in admin-register function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
