import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useAuth } from "@/features/auth/use-auth";
import { useCreateEmpreendimento } from "@/features/empreendimentos/hooks";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/_app/empreendimentos/novo")({
  component: NovoEmpreendimento,
});

// Mock de dados que viriam extraídos do quadro
const mockExtraido = {
  identificacao: {
    nome: "Residencial Madrid",
    incorporadora: "Pitangueiras SPE LTDA",
    cnpj: "00.000.000/0000-00",
    representante: "João da Silva",
  },
  localizacao: {
    endereco: "Rua Ilhas Canárias, 359",
    matricula: "75.412",
    cidade: "Cascavel",
    uf: "PR",
    lote: "11",
    quadra: "07",
    bairro: "Brasília",
  },
  torres: [
    { nome: "Torre 01", pavimentos: 4, unidadesPorPavimento: 4, totalUnidades: 16 },
    { nome: "Torre 02", pavimentos: 4, unidadesPorPavimento: 4, totalUnidades: 16 },
    { nome: "Torre 03", pavimentos: 4, unidadesPorPavimento: 4, totalUnidades: 16 },
  ],
  unidades: {
    total: 48,
    tipos: ["Garden", "Padrão", "Cobertura"],
    vagas: 48,
  },
  areas: {
    terreno: "2.450,00 m²",
    construida: "5.880,00 m²",
    privativa: "3.640,00 m²",
    comum: "2.240,00 m²",
  },
  equipe: {
    responsavel: "Francieli Lima",
    creaCau: "158.605 D/PR",
    observacoes: "",
  },
};

type Dados = typeof mockExtraido;

const steps = [
  { id: "upload", titulo: "Upload do quadro" },
  { id: "identificacao", titulo: "Identificação" },
  { id: "localizacao", titulo: "Localização" },
  { id: "torres", titulo: "Torres" },
  { id: "unidades", titulo: "Unidades" },
  { id: "areas", titulo: "Áreas" },
  { id: "equipe", titulo: "Equipe" },
  { id: "revisao", titulo: "Revisão" },
];

function Field({
  label,
  children,
  span,
}: {
  label: string;
  children: React.ReactNode;
  span?: number;
}) {
  return (
    <div className={`col-span-${span ?? 1}`}>
      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

function NovoEmpreendimento() {
  const navigate = useNavigate();
  const { membership, profile } = useAuth();
  const createMutation = useCreateEmpreendimento();
  const fileRef = useRef<HTMLInputElement>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [processando, setProcessando] = useState(false);
  const [dados, setDados] = useState<Dados | null>(null);

  const step = steps[stepIdx];

  const handleArquivo = (file: File) => {
    setArquivo(file);
    setProcessando(true);
    // Mock de extração
    setTimeout(() => {
      setDados(mockExtraido);
      setProcessando(false);
      toast.success("Quadro processado", {
        description: "Dados extraídos com sucesso. Valide cada etapa.",
      });
      setStepIdx(1);
    }, 1200);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleArquivo(file);
  };

  const updateDados = <K extends keyof Dados>(key: K, patch: Partial<Dados[K]>) => {
    setDados((prev) => (prev ? { ...prev, [key]: { ...prev[key], ...patch } } : prev));
  };

  const finalizar = async () => {
    if (!dados || !membership || !profile) {
      toast.error("Sessão inválida", { description: "Faça login novamente para continuar." });
      return;
    }

    try {
      const id = await createMutation.mutateAsync({
        organizationId: membership.organization_id,
        profileId: profile.id,
        ...dados,
      });
      toast.success("Empreendimento criado", {
        description: "Dados validados e gravados no banco.",
      });
      navigate({ to: "/empreendimentos/$id", params: { id: String(id) } });
    } catch {
      toast.error("Erro ao criar empreendimento", {
        description: "Não foi possível salvar os dados. Tente novamente.",
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Novo empreendimento"
        subtitle="Faça o upload do quadro e valide as informações etapa por etapa."
        breadcrumb={[{ label: "Empreendimentos" }, { label: "Novo" }]}
      />

      <div className="p-8 max-w-5xl space-y-6">
        {/* Stepper */}
        <div className="flex items-center gap-2 flex-wrap">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <Badge
                variant={i === stepIdx ? "default" : i < stepIdx ? "secondary" : "outline"}
                className="rounded-full"
              >
                {i < stepIdx && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {i + 1}. {s.titulo}
              </Badge>
              {i < steps.length - 1 && <span className="text-muted-foreground text-xs">›</span>}
            </div>
          ))}
        </div>

        {/* Upload */}
        {step.id === "upload" && (
          <Card className="p-8 border-border shadow-none">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:bg-muted/30 transition"
            >
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv,.pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleArquivo(e.target.files[0])}
              />
              {processando ? (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <p className="text-sm">Processando quadro...</p>
                </div>
              ) : arquivo ? (
                <div className="flex flex-col items-center gap-2">
                  <FileSpreadsheet className="h-10 w-10 text-primary" />
                  <p className="text-sm font-medium">{arquivo.name}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Arraste o quadro aqui ou clique para selecionar
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Aceita .xlsx, .xls, .csv ou .pdf
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Identificação */}
        {step.id === "identificacao" && dados && (
          <Card className="p-6 border-border shadow-none space-y-5">
            <SectionHeader
              titulo="Identificação"
              descricao="Valide os dados principais extraídos do quadro."
            />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nome do empreendimento" span={2}>
                <Input
                  value={dados.identificacao.nome}
                  onChange={(e) => updateDados("identificacao", { nome: e.target.value })}
                />
              </Field>
              <Field label="Incorporadora">
                <Input
                  value={dados.identificacao.incorporadora}
                  onChange={(e) => updateDados("identificacao", { incorporadora: e.target.value })}
                />
              </Field>
              <Field label="CNPJ">
                <Input
                  value={dados.identificacao.cnpj}
                  onChange={(e) => updateDados("identificacao", { cnpj: e.target.value })}
                />
              </Field>
              <Field label="Representante legal" span={2}>
                <Input
                  value={dados.identificacao.representante}
                  onChange={(e) => updateDados("identificacao", { representante: e.target.value })}
                />
              </Field>
            </div>
          </Card>
        )}

        {/* Localização */}
        {step.id === "localizacao" && dados && (
          <Card className="p-6 border-border shadow-none space-y-5">
            <SectionHeader
              titulo="Localização"
              descricao="Endereço e dados cartoriais extraídos do quadro."
            />
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-4">
                <Field label="Endereço">
                  <Input
                    value={dados.localizacao.endereco}
                    onChange={(e) => updateDados("localizacao", { endereco: e.target.value })}
                  />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Matrícula">
                  <Input
                    value={dados.localizacao.matricula}
                    onChange={(e) => updateDados("localizacao", { matricula: e.target.value })}
                  />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Bairro">
                  <Input
                    value={dados.localizacao.bairro}
                    onChange={(e) => updateDados("localizacao", { bairro: e.target.value })}
                  />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Cidade">
                  <Input
                    value={dados.localizacao.cidade}
                    onChange={(e) => updateDados("localizacao", { cidade: e.target.value })}
                  />
                </Field>
              </div>
              <div className="col-span-1">
                <Field label="UF">
                  <Input
                    value={dados.localizacao.uf}
                    maxLength={2}
                    onChange={(e) => updateDados("localizacao", { uf: e.target.value })}
                  />
                </Field>
              </div>
              <div className="col-span-1">
                <Field label="Lote">
                  <Input
                    value={dados.localizacao.lote}
                    onChange={(e) => updateDados("localizacao", { lote: e.target.value })}
                  />
                </Field>
              </div>
              <div className="col-span-1">
                <Field label="Quadra">
                  <Input
                    value={dados.localizacao.quadra}
                    onChange={(e) => updateDados("localizacao", { quadra: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          </Card>
        )}

        {/* Torres */}
        {step.id === "torres" && dados && (
          <Card className="p-6 border-border shadow-none space-y-5">
            <SectionHeader
              titulo="Torres"
              descricao="Estrutura de torres identificada no quadro."
            />
            <div className="space-y-3">
              {dados.torres.map((t, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 p-4 rounded-md border border-border">
                  <Field label="Torre">
                    <Input
                      value={t.nome}
                      onChange={(e) => {
                        const torres = [...dados.torres];
                        torres[i] = { ...torres[i], nome: e.target.value };
                        setDados({ ...dados, torres });
                      }}
                    />
                  </Field>
                  <Field label="Pavimentos">
                    <Input
                      type="number"
                      value={t.pavimentos}
                      onChange={(e) => {
                        const torres = [...dados.torres];
                        torres[i] = { ...torres[i], pavimentos: +e.target.value };
                        setDados({ ...dados, torres });
                      }}
                    />
                  </Field>
                  <Field label="Unidades / pavimento">
                    <Input
                      type="number"
                      value={t.unidadesPorPavimento}
                      onChange={(e) => {
                        const torres = [...dados.torres];
                        torres[i] = { ...torres[i], unidadesPorPavimento: +e.target.value };
                        setDados({ ...dados, torres });
                      }}
                    />
                  </Field>
                  <Field label="Total unidades">
                    <Input
                      type="number"
                      value={t.totalUnidades}
                      onChange={(e) => {
                        const torres = [...dados.torres];
                        torres[i] = { ...torres[i], totalUnidades: +e.target.value };
                        setDados({ ...dados, torres });
                      }}
                    />
                  </Field>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Unidades */}
        {step.id === "unidades" && dados && (
          <Card className="p-6 border-border shadow-none space-y-5">
            <SectionHeader titulo="Unidades" descricao="Resumo das unidades autônomas extraídas." />
            <div className="grid grid-cols-3 gap-4">
              <Field label="Total de unidades">
                <Input
                  type="number"
                  value={dados.unidades.total}
                  onChange={(e) => updateDados("unidades", { total: +e.target.value })}
                />
              </Field>
              <Field label="Total de vagas">
                <Input
                  type="number"
                  value={dados.unidades.vagas}
                  onChange={(e) => updateDados("unidades", { vagas: +e.target.value })}
                />
              </Field>
              <Field label="Tipos">
                <Input
                  value={dados.unidades.tipos.join(", ")}
                  onChange={(e) =>
                    updateDados("unidades", {
                      tipos: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                />
              </Field>
            </div>
          </Card>
        )}

        {/* Áreas */}
        {step.id === "areas" && dados && (
          <Card className="p-6 border-border shadow-none space-y-5">
            <SectionHeader titulo="Áreas" descricao="Quadro de áreas extraído." />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Área do terreno">
                <Input
                  value={dados.areas.terreno}
                  onChange={(e) => updateDados("areas", { terreno: e.target.value })}
                />
              </Field>
              <Field label="Área construída">
                <Input
                  value={dados.areas.construida}
                  onChange={(e) => updateDados("areas", { construida: e.target.value })}
                />
              </Field>
              <Field label="Área privativa">
                <Input
                  value={dados.areas.privativa}
                  onChange={(e) => updateDados("areas", { privativa: e.target.value })}
                />
              </Field>
              <Field label="Área comum">
                <Input
                  value={dados.areas.comum}
                  onChange={(e) => updateDados("areas", { comum: e.target.value })}
                />
              </Field>
            </div>
          </Card>
        )}

        {/* Equipe */}
        {step.id === "equipe" && dados && (
          <Card className="p-6 border-border shadow-none space-y-5">
            <SectionHeader titulo="Equipe e observações" descricao="Responsável técnico e notas." />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Responsável interno">
                <Input
                  value={dados.equipe.responsavel}
                  onChange={(e) => updateDados("equipe", { responsavel: e.target.value })}
                />
              </Field>
              <Field label="CREA / CAU">
                <Input
                  value={dados.equipe.creaCau}
                  onChange={(e) => updateDados("equipe", { creaCau: e.target.value })}
                />
              </Field>
              <Field label="Observações" span={2}>
                <Textarea
                  rows={4}
                  value={dados.equipe.observacoes}
                  onChange={(e) => updateDados("equipe", { observacoes: e.target.value })}
                />
              </Field>
            </div>
          </Card>
        )}

        {/* Revisão */}
        {step.id === "revisao" && dados && (
          <Card className="p-6 border-border shadow-none space-y-4">
            <SectionHeader
              titulo="Revisão final"
              descricao="Confira todos os dados antes de criar o empreendimento."
            />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <ResumoBloco titulo="Identificação" itens={Object.entries(dados.identificacao)} />
              <ResumoBloco titulo="Localização" itens={Object.entries(dados.localizacao)} />
              <ResumoBloco
                titulo="Unidades"
                itens={Object.entries(dados.unidades).map(([k, v]) => [
                  k,
                  Array.isArray(v) ? v.join(", ") : String(v),
                ])}
              />
              <ResumoBloco titulo="Áreas" itens={Object.entries(dados.areas)} />
              <ResumoBloco titulo="Equipe" itens={Object.entries(dados.equipe)} />
              <ResumoBloco
                titulo="Torres"
                itens={dados.torres.map((t) => [
                  t.nome,
                  `${t.pavimentos} pav · ${t.totalUnidades} un`,
                ])}
              />
            </div>
          </Card>
        )}

        {/* Navegação */}
        {step.id !== "upload" && (
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/empreendimentos" })}
            >
              Cancelar
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
              {stepIdx < steps.length - 1 ? (
                <Button type="button" onClick={() => setStepIdx((i) => i + 1)}>
                  Validar e continuar <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="button" onClick={finalizar} disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Salvando...
                    </>
                  ) : (
                    "Criar empreendimento"
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function SectionHeader({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{titulo}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">{descricao}</p>
    </div>
  );
}

function ResumoBloco({ titulo, itens }: { titulo: string; itens: [string, string | number][] }) {
  return (
    <div className="p-4 rounded-md border border-border">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        {titulo}
      </p>
      <dl className="space-y-1">
        {itens.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-muted-foreground capitalize">{k}</dt>
            <dd className="font-medium text-right">{String(v)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
