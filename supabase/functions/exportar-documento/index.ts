/**
 * Stub EPIC-10 — exportação implementada no client (upload direto ao Storage).
 * Esta Edge Function pode assumir geração server-side (DOCX/PDF) em produção.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      message: "Use a exportação via client até esta função ser implementada.",
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
