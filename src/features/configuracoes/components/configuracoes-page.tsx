import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS } from "@/features/auth/constants";
import { canManageMembers } from "@/features/auth/permissions";
import type { OrgRole } from "@/features/auth/types";
import { useAuth } from "@/features/auth/use-auth";

import { DEFAULT_ORGANIZATION_SETTINGS } from "../mappers";
import {
  useOrganizationMembers,
  useOrganizationSettings,
  useSaveOrganizationSettings,
  useUpdateMemberRole,
} from "../hooks";
import type { OrganizationSettings } from "../types";

const ROLES: OrgRole[] = ["admin", "gestora", "responsavel_tecnica", "revisora"];

export function ConfiguracoesPage() {
  const { profile, role, organization, membership } = useAuth();
  const orgId = membership?.organization_id ?? null;

  const { data: settings, isLoading: loadingSettings } = useOrganizationSettings(orgId);
  const { data: members, isLoading: loadingMembers } = useOrganizationMembers(orgId);
  const saveMutation = useSaveOrganizationSettings(orgId);
  const roleMutation = useUpdateMemberRole(orgId);

  const [form, setForm] = useState<OrganizationSettings>(DEFAULT_ORGANIZATION_SETTINGS);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const salvar = async () => {
    if (!orgId) return;
    try {
      await saveMutation.mutateAsync({ organizationId: orgId, settings: form });
      toast.success("Configurações salvas.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    }
  };

  const alterarPapel = async (memberId: number, novoRole: OrgRole) => {
    if (!orgId) return;
    try {
      await roleMutation.mutateAsync({ memberId, organizationId: orgId, role: novoRole });
      toast.success("Papel atualizado.");
    } catch {
      toast.error("Não foi possível alterar o papel.");
    }
  };

  const isAdmin = canManageMembers(role);

  return (
    <>
      <PageHeader
        title="Configurações"
        subtitle="Ajustes gerais do sistema, identidade, permissões e exportação."
        breadcrumb={[{ label: "Configurações" }]}
      />

      <div className="p-8 max-w-5xl space-y-5">
        <Card className="p-6 border-border shadow-none">
          <h3 className="font-semibold text-sm mb-4">Meu perfil</h3>
          <div className="grid grid-cols-2 gap-4">
            <Box label="Nome">
              <Input value={profile?.full_name ?? ""} readOnly />
            </Box>
            <Box label="E-mail">
              <Input value={profile?.email ?? ""} readOnly />
            </Box>
            <Box label="Papel">
              <Input value={role ? ROLE_LABELS[role] : "Sem papel atribuído"} readOnly />
            </Box>
            <Box label="Organização">
              <Input value={organization?.name ?? "Sem organização vinculada"} readOnly />
            </Box>
          </div>
        </Card>

        <Card className="p-6 border-border shadow-none">
          <h3 className="font-semibold text-sm mb-4">Dados da Projetse</h3>
          {loadingSettings ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Box label="Razão social">
                <Input
                  value={form.razaoSocial}
                  onChange={(e) => setForm((f) => ({ ...f, razaoSocial: e.target.value }))}
                />
              </Box>
              <Box label="CNPJ">
                <Input
                  value={form.cnpj}
                  onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))}
                />
              </Box>
              <Box label="Endereço">
                <Input
                  value={form.endereco}
                  onChange={(e) => setForm((f) => ({ ...f, endereco: e.target.value }))}
                />
              </Box>
              <Box label="Responsável técnica">
                <Input
                  value={form.responsavelTecnico}
                  onChange={(e) => setForm((f) => ({ ...f, responsavelTecnico: e.target.value }))}
                />
              </Box>
            </div>
          )}
        </Card>

        <Card className="p-6 border-border shadow-none">
          <h3 className="font-semibold text-sm mb-4">Identidade visual</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { n: "Verde Escuro", c: "var(--color-verde-escuro)" },
              { n: "Verde", c: "var(--color-verde)" },
              { n: "Verde Claro", c: "var(--color-verde-claro)" },
              { n: "Brita", c: "var(--color-brita)" },
              { n: "Concreto", c: "var(--color-concreto)" },
            ].map((s) => (
              <div key={s.n} className="border border-border rounded-md overflow-hidden">
                <div className="h-16" style={{ background: s.c }} />
                <div className="px-3 py-2 text-xs">
                  <div className="font-medium">{s.n}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-border shadow-none">
          <h3 className="font-semibold text-sm mb-4">Usuários e permissões</h3>
          {loadingMembers ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div className="divide-y divide-border">
              {(members ?? []).map((u) => (
                <div key={u.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-[var(--color-verde-escuro)] text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                      {u.fullName
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{u.fullName}</div>
                      <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                    </div>
                  </div>
                  {isAdmin ? (
                    <Select
                      value={u.role}
                      onValueChange={(v) => void alterarPapel(u.id, v as OrgRole)}
                      disabled={roleMutation.isPending}
                    >
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-xs text-muted-foreground">{ROLE_LABELS[u.role]}</span>
                  )}
                </div>
              ))}
              {(members ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground py-4">Nenhum membro ativo.</p>
              )}
            </div>
          )}
        </Card>

        <Card className="p-6 border-border shadow-none">
          <h3 className="font-semibold text-sm mb-4">Preferências de exportação</h3>
          <div className="space-y-4">
            <Toggle
              label="Incluir cabeçalho com logo Projetse"
              checked={form.exportPrefs.incluirLogo}
              onCheckedChange={(v) =>
                setForm((f) => ({ ...f, exportPrefs: { ...f.exportPrefs, incluirLogo: v } }))
              }
            />
            <Toggle
              label="Numerar páginas automaticamente"
              checked={form.exportPrefs.numerarPaginas}
              onCheckedChange={(v) =>
                setForm((f) => ({ ...f, exportPrefs: { ...f.exportPrefs, numerarPaginas: v } }))
              }
            />
            <Toggle
              label="Inserir marca d'água em versões de revisão"
              checked={form.exportPrefs.marcaDaguaRevisao}
              onCheckedChange={(v) =>
                setForm((f) => ({ ...f, exportPrefs: { ...f.exportPrefs, marcaDaguaRevisao: v } }))
              }
            />
            <Toggle
              label="Anexar quadros NBR 12.721 ao final do documento"
              checked={form.exportPrefs.anexarQuadros}
              onCheckedChange={(v) =>
                setForm((f) => ({ ...f, exportPrefs: { ...f.exportPrefs, anexarQuadros: v } }))
              }
            />
          </div>
        </Card>

        <Card className="p-6 border-border shadow-none">
          <h3 className="font-semibold text-sm mb-4">Status do sistema</h3>
          <div className="space-y-2 text-sm">
            <StatusItem label="Esteira de extração" />
            <StatusItem label="Geração de memorial" />
            <StatusItem label="Exportações DOCX/PDF" />
            <StatusItem label="Histórico e versionamento" />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            disabled={saveMutation.isPending || loadingSettings}
            onClick={() => void salvar()}
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Salvar configurações
          </Button>
        </div>
      </div>
    </>
  );
}

function Box({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

function StatusItem({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span>{label}</span>
      <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-verde-escuro)]">
        <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-verde-claro)]" /> Operacional
      </span>
    </div>
  );
}
