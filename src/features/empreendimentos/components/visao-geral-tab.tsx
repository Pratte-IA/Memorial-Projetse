import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Briefcase,
  Building2,
  ChevronRight,
  FileText,
  MapPin,
  Pencil,
  Plus,
  Ruler,
  Trash2,
  UserCircle2,
} from "lucide-react";
import type { Empreendimento } from "@/lib/mock-data";
import { fmtArea, fmtNum } from "@/lib/format";
import { IMOVEL_MOCK } from "../constants/detail-mocks";
import type { IncorporadoraForm, Representante } from "../types/detail-types";
import { REPRESENTANTE_VAZIO } from "../constants/detail-mocks";
import { Grid, Info, Pendencia, SectionTitle } from "./detail-ui";
import { RepresentanteModal } from "./representante-modal";

export function VisaoGeralTab({ emp }: { emp: Empreendimento }) {
  const [incorporadora, setIncorporadora] = useState<IncorporadoraForm>({
    razaoSocial: emp.incorporadora,
    cnpj: emp.cnpj,
    rua: "Rua Rio de Janeiro",
    numero: "1101",
    cep: "85.801-030",
    bairro: "Centro",
    cidade: emp.cidade,
    estado: emp.uf,
  });

  const [representantes, setRepresentantes] = useState<Representante[]>([
    {
      id: "rep-1",
      nome: "Ivan Carlos Riedi",
      cpf: "040.810.579-82",
      rg: "6.473.421-0 SSP/PR",
      estadoCivil: "Casado(a)",
      regimeComunhao: "Separação total de bens",
      rua: "Rua Rio de Janeiro",
      numero: "1101",
      cep: "85.801-030",
      bairro: "Centro",
      cidade: "Cascavel",
      estado: "PR",
    },
  ]);

  const [editando, setEditando] = useState<Representante | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const abrirNovo = () => {
    setEditando({ ...REPRESENTANTE_VAZIO, id: `rep-${Date.now()}` });
    setModalAberto(true);
  };
  const abrirEdicao = (r: Representante) => {
    setEditando({ ...r });
    setModalAberto(true);
  };
  const remover = (id: string) => {
    setRepresentantes((arr) => arr.filter((r) => r.id !== id));
    toast.success("Representante removido.");
  };
  const salvar = (r: Representante) => {
    setRepresentantes((arr) => {
      const idx = arr.findIndex((x) => x.id === r.id);
      if (idx >= 0) {
        const novo = [...arr];
        novo[idx] = r;
        return novo;
      }
      return [...arr, r];
    });
    setModalAberto(false);
    setEditando(null);
    toast.success("Representante salvo.");
  };

  const pendenciasJuridicas: { tone: "alerta" | "atencao" | "ceu"; texto: string }[] = [];
  if (!incorporadora.cnpj)
    pendenciasJuridicas.push({ tone: "alerta", texto: "CNPJ da incorporadora não informado" });
  representantes.forEach((r) => {
    if (!r.cpf)
      pendenciasJuridicas.push({ tone: "alerta", texto: `${r.nome || "Representante"} sem CPF` });
    if (r.estadoCivil === "Casado(a)" && !r.regimeComunhao)
      pendenciasJuridicas.push({
        tone: "atencao",
        texto: `${r.nome || "Representante"} sem regime de bens`,
      });
    if (!r.rua || !r.numero || !r.cep || !r.bairro || !r.cidade || !r.estado)
      pendenciasJuridicas.push({
        tone: "atencao",
        texto: `Endereço incompleto de ${r.nome || "representante"}`,
      });
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Card className="p-6 border-border shadow-none space-y-5">
          <SectionTitle icon={MapPin}>Dados gerais</SectionTitle>
          <Grid>
            <Info label="Nome" value={emp.nome} />
            <Info label="Endereço" value={emp.endereco} />
            <Info label="Cidade / UF" value={`${emp.cidade}/${emp.uf}`} />
            <Info label="Lote / Quadra" value={`${emp.lote} / ${emp.quadra}`} />
            <Info label="Matrícula" value={emp.matricula} />
            <Info label="Área do terreno" value={`${fmtNum(emp.areaTerreno, 2)} m²`} />
          </Grid>
        </Card>

        {/* Incorporadora */}
        <Card className="p-6 border-border shadow-none space-y-5">
          <div className="flex items-center justify-between">
            <SectionTitle icon={Briefcase}>Incorporadora</SectionTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast("Edição da incorporadora — simulada.")}
            >
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Button>
          </div>
          <Grid>
            <Info label="Razão social" value={incorporadora.razaoSocial} />
            <Info label="CNPJ" value={incorporadora.cnpj || "—"} />
            <Info
              label="Cidade / UF"
              value={`${incorporadora.cidade || "—"}${incorporadora.estado ? "/" + incorporadora.estado : ""}`}
            />
            <Info label="Rua" value={incorporadora.rua || "—"} />
            <Info label="Número" value={incorporadora.numero || "—"} />
            <Info label="CEP" value={incorporadora.cep || "—"} />
            <Info label="Bairro" value={incorporadora.bairro || "—"} />
          </Grid>

          <div className="h-px bg-border" />

          {/* Representantes legais */}
          <div className="flex items-center justify-between">
            <SectionTitle icon={UserCircle2}>Representantes legais</SectionTitle>
            <Button size="sm" onClick={abrirNovo}>
              <Plus className="h-3.5 w-3.5" /> Adicionar representante
            </Button>
          </div>

          {representantes.length === 0 ? (
            <div className="border border-dashed border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
              Nenhum representante cadastrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {representantes.map((r) => (
                <div
                  key={r.id}
                  className="border border-border rounded-lg p-4 bg-muted/20 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{r.nome || "Sem nome"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        CPF {r.cpf || "—"} · RG {r.rg || "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => abrirEdicao(r)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {representantes.length > 1 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => remover(r.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-[var(--color-alerta)]" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Estado civil
                      </div>
                      <div className="text-foreground/90">{r.estadoCivil}</div>
                    </div>
                    {r.estadoCivil === "Casado(a)" && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Regime
                        </div>
                        <div className="text-foreground/90">{r.regimeComunhao || "—"}</div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground border-t border-border pt-2">
                    {[
                      r.rua && `${r.rua}, ${r.numero}`,
                      r.bairro,
                      r.cidade && `${r.cidade}/${r.estado}`,
                      r.cep,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Endereço não informado"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Propriedade e Localização do Imóvel */}
        <Card className="p-6 border-border shadow-none space-y-5">
          <div className="flex items-center justify-between">
            <SectionTitle icon={MapPin}>Propriedade e localização do imóvel</SectionTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast("Edição do imóvel — simulada.")}
            >
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Button>
          </div>
          <Grid>
            <Info label="Lote (nº)" value={IMOVEL_MOCK.loteNumero} />
            <Info label="Lote (por extenso)" value={IMOVEL_MOCK.loteExtenso} />
            <Info label="Quadra (nº)" value={IMOVEL_MOCK.quadraNumero} />
            <Info label="Quadra (por extenso)" value={IMOVEL_MOCK.quadraExtenso} />
            <Info label="Loteamento" value={IMOVEL_MOCK.loteamento} />
            <Info
              label="Cidade / Comarca"
              value={`${IMOVEL_MOCK.cidade} / ${IMOVEL_MOCK.comarca}`}
            />
            <Info label="Estado" value={`${IMOVEL_MOCK.estado} — ${IMOVEL_MOCK.estadoExtenso}`} />
            <Info label="Área do terreno" value={`${IMOVEL_MOCK.areaNumero} m²`} />
            <Info label="Área (por extenso)" value={IMOVEL_MOCK.areaExtenso} />
            <Info label="Benfeitorias" value={IMOVEL_MOCK.benfeitorias} />
            <Info label="Matrícula (nº)" value={IMOVEL_MOCK.matriculaNumero} />
            <Info label="Matrícula (por extenso)" value={IMOVEL_MOCK.matriculaExtenso} />
            <Info label="Cartório de registro" value={IMOVEL_MOCK.cartorio} />
          </Grid>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <SectionTitle icon={Ruler}>Confrontações</SectionTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast("Edição das confrontações — simulada.")}
            >
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Button>
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Direção</th>
                  <th className="text-left px-3 py-2 font-medium">Confrontante</th>
                  <th className="text-left px-3 py-2 font-medium text-mono-tabular">Medida</th>
                  <th className="text-left px-3 py-2 font-medium text-mono-tabular">Azimute</th>
                </tr>
              </thead>
              <tbody>
                {IMOVEL_MOCK.confrontacoes.map((c) => (
                  <tr key={c.direcao} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{c.direcao}</td>
                    <td className="px-3 py-2 text-foreground/90">{c.confrontante}</td>
                    <td className="px-3 py-2 text-mono-tabular">{c.medida}</td>
                    <td className="px-3 py-2 text-mono-tabular">{c.azimute}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6 border-border shadow-none space-y-5">
          <SectionTitle icon={FileText}>Dados técnicos</SectionTitle>
          <Grid>
            <Info label="Alvará" value={emp.alvara} />
            <Info label="Data de aprovação" value={emp.dataAprovacao} />
            <Info label="Responsável técnico" value={emp.responsavel} />
            <Info label="CREA / CAU" value={emp.crea} />
            <Info label="ART / RRT" value={emp.art} />
            <Info label="Status" value={emp.status} />
          </Grid>

          <div className="h-px bg-border" />

          <SectionTitle icon={Building2}>Resumo do condomínio</SectionTitle>
          <Grid>
            <Info label="Torres" value={`${emp.torres}`} />
            <Info label="Pavimentos" value={`${emp.pavimentos}`} />
            <Info label="Unidades" value={`${emp.unidades}`} />
            <Info label="Vagas" value={`${emp.vagas}`} />
            <Info label="Área privativa total" value={fmtArea(emp.areaTerreno * 0.65)} />
            <Info label="Área comum total" value={fmtArea(emp.areaTerreno * 0.35)} />
          </Grid>
        </Card>
      </div>

      <Card className="p-6 border-border shadow-none space-y-4 h-fit">
        <SectionTitle icon={AlertTriangle}>Pendências</SectionTitle>
        <ul className="space-y-2.5">
          <Pendencia tone="alerta" texto="Confrontações faltantes em 4 unidades da Torre 02" />
          <Pendencia tone="atencao" texto="Baixa confiança na extração da área do alvará" />
          <Pendencia tone="atencao" texto="Seção 'Convenção Condominial' ainda não gerada" />
          <Pendencia tone="ceu" texto="Revisar fração ideal — divergência de 0,001%" />
          {pendenciasJuridicas.map((p, i) => (
            <Pendencia key={`j-${i}`} tone={p.tone} texto={p.texto} />
          ))}
        </ul>
        <div className="h-px bg-border" />
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Próxima ação
          </div>
          <Button className="w-full" variant="outline">
            Revisar unidades pendentes <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <RepresentanteModal
        open={modalAberto}
        onOpenChange={(o) => {
          setModalAberto(o);
          if (!o) setEditando(null);
        }}
        representante={editando}
        onSalvar={salvar}
      />
    </div>
  );
}
