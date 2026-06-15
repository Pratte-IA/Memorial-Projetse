import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Briefcase,
  FileText,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  UserCircle2,
} from "lucide-react";
import { fmtNum, formatEstadoUf } from "@/lib/format";
import { matriculaPorExtenso } from "@/lib/numero-extenso";

import { REPRESENTANTE_VAZIO } from "../constants/detail-mocks";
import type { EmpreendimentoView } from "../types";
import type { IncorporadoraForm, Representante } from "../types/detail-types";
import {
  DadosGeraisModal,
  dadosGeraisFromEmp,
  dadosGeraisToDisplay,
  type DadosGeraisForm,
} from "./dados-gerais-modal";
import { CondominioDadosSection } from "./condominio-dados-section";
import { Grid, Info, Pendencia, SectionTitle } from "./detail-ui";
import { ProntidaoExportacaoPanel } from "./prontidao-exportacao-panel";
import { RepresentanteModal } from "./representante-modal";

export function VisaoGeralTab({ emp }: { emp: EmpreendimentoView }) {
  const [dadosGerais, setDadosGerais] = useState<DadosGeraisForm>(dadosGeraisFromEmp(emp));
  const dados = dadosGeraisToDisplay(dadosGerais);
  const empreendimentoId = Number(emp.id);

  const [incorporadora, setIncorporadora] = useState<IncorporadoraForm>(emp.incorporadoraEndereco);
  const [representantes, setRepresentantes] = useState<Representante[]>(emp.representantes);
  const imovel = emp.imovel;

  const [editando, setEditando] = useState<Representante | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [dadosGeraisModalAberto, setDadosGeraisModalAberto] = useState(false);

  useEffect(() => {
    setDadosGerais(dadosGeraisFromEmp(emp));
    setIncorporadora(emp.incorporadoraEndereco);
    setRepresentantes(emp.representantes);
  }, [emp]);

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

  const pendenciasVisao = [...emp.pendenciasAbertas, ...pendenciasJuridicas];

  const matriculaNumeroDisplay =
    imovel.matriculaNumero !== "—" ? imovel.matriculaNumero : dados.matricula;
  const matriculaExtensoDisplay =
    imovel.matriculaExtenso !== "—"
      ? imovel.matriculaExtenso
      : matriculaPorExtenso(dados.matricula) || "—";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Card className="p-6 border-border shadow-none space-y-5">
          <div className="flex items-center justify-between">
            <SectionTitle icon={MapPin}>Dados gerais</SectionTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDadosGeraisModalAberto(true)}
              disabled={!empreendimentoId}
            >
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Button>
          </div>
          <Grid>
            <Info label="Nome" value={dados.nome} />
            <div className="md:col-span-2">
              <Info label="Endereço" value={dados.endereco} />
            </div>
            <Info label="Loteamento" value={imovel.loteamento} />
            <Info label="Lote (nº)" value={imovel.loteNumero !== "—" ? imovel.loteNumero : dados.lote} />
            <Info
              label="Lote (por extenso)"
              value={imovel.loteExtenso !== "—" ? imovel.loteExtenso : "—"}
            />
            <Info
              label="Quadra (nº)"
              value={imovel.quadraNumero !== "—" ? imovel.quadraNumero : dados.quadra}
            />
            <Info
              label="Quadra (por extenso)"
              value={imovel.quadraExtenso !== "—" ? imovel.quadraExtenso : "—"}
            />
            <Info
              label="Cidade / Comarca"
              value={
                imovel.cidade !== "—" || imovel.comarca !== "—"
                  ? `${imovel.cidade !== "—" ? imovel.cidade : dados.cidade} / ${imovel.comarca !== "—" ? imovel.comarca : "—"}`
                  : `${dados.cidade}/${dados.uf}`
              }
            />
            <Info
              label="Estado"
              value={formatEstadoUf(
                imovel.estado !== "—" ? imovel.estado : dados.uf !== "—" ? dados.uf : "",
                imovel.estadoExtenso !== "—" ? imovel.estadoExtenso : "",
              )}
            />
            <Info
              label="Área do terreno"
              value={
                imovel.areaNumero !== "—"
                  ? `${imovel.areaNumero} m²`
                  : emp.areaTerreno > 0
                    ? `${fmtNum(emp.areaTerreno, 2)} m²`
                    : "—"
              }
            />
            <Info label="Área (por extenso)" value={imovel.areaExtenso} />
            <Info label="Benfeitorias" value={imovel.benfeitorias} />
            <Info label="Matrícula (nº)" value={matriculaNumeroDisplay} />
            <Info label="Matrícula (por extenso)" value={matriculaExtensoDisplay} />
            <Info label="Cartório de registro" value={imovel.cartorio} />
          </Grid>
        </Card>

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
            <div className="md:col-span-2">
              <Info label="Endereço" value={incorporadora.endereco || "—"} />
            </div>
          </Grid>

          <div className="h-px bg-border" />

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

        <CondominioDadosSection emp={emp} />

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
        </Card>
      </div>

      <div className="space-y-5 h-fit">
        {empreendimentoId > 0 && (
          <ProntidaoExportacaoPanel empreendimentoId={empreendimentoId} compact />
        )}

        <Card className="p-6 border-border shadow-none space-y-4">
          <SectionTitle icon={AlertTriangle}>Pendências</SectionTitle>
          {pendenciasVisao.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma pendência aberta.</p>
          ) : (
            <ul className="space-y-2.5">
              {pendenciasVisao.map((p, i) => (
                <Pendencia key={`p-${i}`} tone={p.tone} texto={p.texto} />
              ))}
            </ul>
          )}
        </Card>
      </div>

      <RepresentanteModal
        open={modalAberto}
        onOpenChange={(o) => {
          setModalAberto(o);
          if (!o) setEditando(null);
        }}
        representante={editando}
        onSalvar={salvar}
      />

      {empreendimentoId > 0 && (
        <DadosGeraisModal
          open={dadosGeraisModalAberto}
          onOpenChange={setDadosGeraisModalAberto}
          empreendimentoId={empreendimentoId}
          initial={dadosGerais}
          onSalvo={setDadosGerais}
        />
      )}
    </div>
  );
}
