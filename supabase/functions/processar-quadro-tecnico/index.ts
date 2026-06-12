// EPIC-06: stub — extração real será implementada na EPIC-07.
// Invocação: POST { quadro_tecnico_id, empreendimento_id, organization_id }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, {
      db: { schema: "projetse" },
    });

    const body = await req.json();
    const quadroId = Number(body.quadro_tecnico_id);
    const empreendimentoId = Number(body.empreendimento_id);

    if (!quadroId || !empreendimentoId) {
      return new Response(JSON.stringify({ error: "Parâmetros inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("quadros_tecnicos").update({ status: "processando" }).eq("id", quadroId);

    // Placeholder: EPIC-07 substitui por pipeline de extração do PDF.
    await new Promise((r) => setTimeout(r, 2000));

    await supabase
      .from("quadros_tecnicos")
      .update({ status: "processado", processed_at: new Date().toISOString() })
      .eq("id", quadroId);

    return new Response(JSON.stringify({ ok: true, quadro_tecnico_id: quadroId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
