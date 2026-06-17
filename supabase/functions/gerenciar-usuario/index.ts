import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_ROLES = ["admin", "gestora", "responsavel_tecnica", "revisora"] as const;

type Action =
  | "create"
  | "update_profile"
  | "update_password"
  | "deactivate"
  | "activate"
  | "delete";

interface RequestBody {
  action: Action;
  organizationId: number;
  email?: string;
  password?: string;
  fullName?: string;
  role?: string;
  userId?: string;
}

async function assertAdmin(
  req: Request,
  organizationId: number,
): Promise<{ callerUserId: string } | Response> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Não autenticado." }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Sessão inválida." }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    db: { schema: "projetse" },
  });

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return new Response(JSON.stringify({ error: "Perfil não encontrado." }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: membership, error: memberError } = await adminClient
    .from("organization_members")
    .select("role, status")
    .eq("organization_id", organizationId)
    .eq("profile_id", profile.id)
    .eq("status", "active")
    .maybeSingle();

  if (memberError || membership?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Apenas administradores podem gerenciar usuários." }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return { callerUserId: user.id };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await req.json()) as RequestBody;
    const organizationId = Number(body.organizationId);

    if (!organizationId || !body.action) {
      return jsonResponse({ error: "Parâmetros inválidos." }, 400);
    }

    const authResult = await assertAdmin(req, organizationId);
    if (authResult instanceof Response) return authResult;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey, {
      db: { schema: "projetse" },
    });
    const authAdmin = createClient(supabaseUrl, serviceKey).auth.admin;

    if (body.action === "create") {
      const email = body.email?.trim().toLowerCase();
      const password = body.password;
      const fullName = body.fullName?.trim();
      const role = body.role;

      if (!email || !password || !fullName || !role) {
        return jsonResponse({ error: "Nome, e-mail, senha e papel são obrigatórios." }, 400);
      }

      if (password.length < 6) {
        return jsonResponse({ error: "A senha deve ter pelo menos 6 caracteres." }, 400);
      }

      if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
        return jsonResponse({ error: "Papel inválido." }, 400);
      }

      const { data: created, error: createError } = await authAdmin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

      if (createError) {
        return jsonResponse({ error: createError.message }, 400);
      }

      const userId = created.user.id;

      let profileId: number | null = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data: profile } = await adminClient
          .from("profiles")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (profile) {
          profileId = profile.id;
          break;
        }
        await new Promise((r) => setTimeout(r, 200));
      }

      if (!profileId) {
        await authAdmin.deleteUser(userId);
        return jsonResponse({ error: "Não foi possível criar o perfil do usuário." }, 500);
      }

      await adminClient.from("profiles").update({ full_name: fullName, email }).eq("id", profileId);

      const { error: memberError } = await adminClient.from("organization_members").insert({
        organization_id: organizationId,
        profile_id: profileId,
        role,
        status: "active",
      });

      if (memberError) {
        await authAdmin.deleteUser(userId);
        return jsonResponse({ error: memberError.message }, 400);
      }

      return jsonResponse({ ok: true, userId, profileId });
    }

    const targetUserId = body.userId;
    if (!targetUserId) {
      return jsonResponse({ error: "Usuário alvo não informado." }, 400);
    }

    if (targetUserId === authResult.callerUserId && (body.action === "delete" || body.action === "deactivate")) {
      return jsonResponse({ error: "Você não pode desativar ou excluir sua própria conta." }, 400);
    }

    if (body.action === "update_profile") {
      const fullName = body.fullName?.trim();
      const email = body.email?.trim().toLowerCase();

      if (!fullName || !email) {
        return jsonResponse({ error: "Nome e e-mail são obrigatórios." }, 400);
      }

      const { error: authError } = await authAdmin.updateUserById(targetUserId, {
        email,
        user_metadata: { full_name: fullName },
      });

      if (authError) {
        return jsonResponse({ error: authError.message }, 400);
      }

      const { error: profileError } = await adminClient
        .from("profiles")
        .update({ full_name: fullName, email })
        .eq("user_id", targetUserId);

      if (profileError) {
        return jsonResponse({ error: profileError.message }, 400);
      }

      return jsonResponse({ ok: true });
    }

    if (body.action === "update_password") {
      const password = body.password;

      if (!password || password.length < 6) {
        return jsonResponse({ error: "A senha deve ter pelo menos 6 caracteres." }, 400);
      }

      const { error } = await authAdmin.updateUserById(targetUserId, { password });
      if (error) {
        return jsonResponse({ error: error.message }, 400);
      }

      return jsonResponse({ ok: true });
    }

    if (body.action === "deactivate") {
      const { error } = await authAdmin.updateUserById(targetUserId, {
        ban_duration: "876000h",
      });

      if (error) {
        return jsonResponse({ error: error.message }, 400);
      }

      const { data: profile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (profile) {
        await adminClient
          .from("organization_members")
          .update({ status: "disabled" })
          .eq("organization_id", organizationId)
          .eq("profile_id", profile.id);
      }

      return jsonResponse({ ok: true });
    }

    if (body.action === "activate") {
      const { error } = await authAdmin.updateUserById(targetUserId, {
        ban_duration: "none",
      });

      if (error) {
        return jsonResponse({ error: error.message }, 400);
      }

      const { data: profile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (profile) {
        await adminClient
          .from("organization_members")
          .update({ status: "active" })
          .eq("organization_id", organizationId)
          .eq("profile_id", profile.id);
      }

      return jsonResponse({ ok: true });
    }

    if (body.action === "delete") {
      const { error } = await authAdmin.deleteUser(targetUserId);
      if (error) {
        return jsonResponse({ error: error.message }, 400);
      }

      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: "Ação inválida." }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return jsonResponse({ error: message }, 500);
  }
});
