import { supabase } from "@/lib/supabase/client";

import { mapRowToClausula, mapRowToModelo } from "./mappers";
import type { ClausulaRecord, ModeloRecord } from "./types";

export async function fetchModelos(organizationId: number): Promise<ModeloRecord[]> {
  const { data, error } = await supabase
    .from("modelos_documento")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRowToModelo);
}

export async function fetchClausulas(organizationId: number): Promise<ClausulaRecord[]> {
  const { data, error } = await supabase
    .from("clausulas")
    .select("*")
    .eq("organization_id", organizationId)
    .order("ordem");

  if (error) throw error;
  return (data ?? []).map(mapRowToClausula);
}

export async function fetchClausulaById(id: number): Promise<ClausulaRecord | null> {
  const { data, error } = await supabase.from("clausulas").select("*").eq("id", id).maybeSingle();

  if (error) throw error;
  return data ? mapRowToClausula(data) : null;
}
