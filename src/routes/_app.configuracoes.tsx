import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_app/configuracoes")({
  component: Configuracoes,
});

function Configuracoes() {
  return (
    <>
      <PageHeader
        title="Configurações"
        subtitle="Ajustes gerais do sistema, identidade, permissões e exportação."
        breadcrumb={[{ label: "Configurações" }]}
      />

      <div className="p-8 max-w-5xl space-y-5">
        <Card className="p-6 border-border shadow-none">
          <h3 className="font-semibold text-sm mb-4">Dados da Projetse</h3>
          <div className="grid grid-cols-2 gap-4">
            <Box label="Razão social"><Input defaultValue="Projetse Engenharia e Arquitetura LTDA" /></Box>
            <Box label="CNPJ"><Input defaultValue="12.345.678/0001-90" /></Box>
            <Box label="Endereço"><Input defaultValue="Rua das Palmeiras, 1.020 — Cascavel/PR" /></Box>
            <Box label="Responsável técnica"><Input defaultValue="Francieli Luize Wagner Lima" /></Box>
          </div>
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
          <div className="divide-y divide-border">
            {[
              { n: "Francieli Lima", e: "francieli@projetse.com.br", p: "Responsável Técnica" },
              { n: "Ana Técnica", e: "ana@projetse.com.br", p: "Revisora" },
              { n: "Marcos Souza", e: "marcos@projetse.com.br", p: "Gestão" },
            ].map((u) => (
              <div key={u.e} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[var(--color-verde-escuro)] text-primary-foreground flex items-center justify-center text-xs font-semibold">
                    {u.n.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{u.n}</div>
                    <div className="text-xs text-muted-foreground">{u.e}</div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{u.p}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-border shadow-none">
          <h3 className="font-semibold text-sm mb-4">Preferências de exportação</h3>
          <div className="space-y-4">
            <Toggle label="Incluir cabeçalho com logo Projetse" defaultChecked />
            <Toggle label="Numerar páginas automaticamente" defaultChecked />
            <Toggle label="Inserir marca d'água em versões de revisão" />
            <Toggle label="Anexar quadros NBR 12.721 ao final do documento" defaultChecked />
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
          <Button>Salvar configurações</Button>
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
function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm">{label}</span>
      <Switch defaultChecked={defaultChecked} />
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
