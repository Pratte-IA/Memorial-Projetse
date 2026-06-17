import { useState } from "react";
import { KeyRound, MoreHorizontal, Pencil, Power, PowerOff, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROLE_LABELS } from "@/features/auth/constants";
import { canManageMembers } from "@/features/auth/permissions";
import { useAuth } from "@/features/auth/use-auth";

import { MEMBER_STATUS_LABELS } from "../constants";
import {
  useActivateOrganizationUser,
  useDeactivateOrganizationUser,
  useDeleteOrganizationUser,
  useOrganizationMembers,
  useUpdateMemberStatus,
} from "../hooks";
import type { MemberStatus, OrgMemberRecord } from "../types";
import { ExcluirUsuarioDialog } from "./excluir-usuario-dialog";
import { UsuarioFormDialog } from "./usuario-form-dialog";
import { UsuarioSenhaDialog } from "./usuario-senha-dialog";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function statusBadgeVariant(status: MemberStatus): "default" | "secondary" | "destructive" {
  if (status === "active") return "default";
  if (status === "invited") return "secondary";
  return "destructive";
}

export function ConfiguracoesPage() {
  const { profile, role, organization, membership, user } = useAuth();
  const orgId = membership?.organization_id ?? null;
  const isAdmin = canManageMembers(role);

  const { data: members, isLoading } = useOrganizationMembers(orgId);
  const inactivateMutation = useUpdateMemberStatus(orgId);
  const deactivateMutation = useDeactivateOrganizationUser(orgId);
  const activateMutation = useActivateOrganizationUser(orgId);
  const deleteMutation = useDeleteOrganizationUser(orgId);

  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<OrgMemberRecord | null>(null);
  const [passwordMember, setPasswordMember] = useState<OrgMemberRecord | null>(null);
  const [deleteMember, setDeleteMember] = useState<OrgMemberRecord | null>(null);

  const openCreate = () => {
    setEditingMember(null);
    setFormOpen(true);
  };

  const openEdit = (member: OrgMemberRecord) => {
    setEditingMember(member);
    setFormOpen(true);
  };

  const inativar = async (member: OrgMemberRecord) => {
    if (!orgId) return;

    try {
      await inactivateMutation.mutateAsync({
        memberId: member.id,
        organizationId: orgId,
        status: "disabled",
      });
      toast.success(`Usuário "${member.fullName}" inativado.`);
    } catch {
      toast.error("Não foi possível inativar o usuário.");
    }
  };

  const desativar = async (member: OrgMemberRecord) => {
    if (!orgId) return;

    try {
      await deactivateMutation.mutateAsync({
        organizationId: orgId,
        userId: member.userId,
      });
      toast.success(`Usuário "${member.fullName}" desativado.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível desativar o usuário.");
    }
  };

  const reativar = async (member: OrgMemberRecord) => {
    if (!orgId) return;

    try {
      await activateMutation.mutateAsync({
        organizationId: orgId,
        userId: member.userId,
      });
      toast.success(`Usuário "${member.fullName}" reativado.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível reativar o usuário.");
    }
  };

  const isSelf = (member: OrgMemberRecord) => member.userId === user?.id;

  return (
    <>
      <PageHeader
        title="Usuários"
        subtitle="Crie e gerencie os usuários da organização, perfis, senhas e permissões de acesso."
        breadcrumb={[{ label: "Configurações" }, { label: "Usuários" }]}
      />

      <div className="p-8 max-w-5xl space-y-5">
        <Card className="p-6 border-border shadow-none">
          <h3 className="font-semibold text-sm mb-4">Meu perfil</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-sm">Usuários da organização</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Gerencie contas, papéis e status de acesso dos membros.
              </p>
            </div>
            {isAdmin ? (
              <Button onClick={openCreate} size="sm">
                <UserPlus className="h-4 w-4 mr-1.5" />
                Novo usuário
              </Button>
            ) : null}
          </div>

          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin ? <TableHead className="text-right">Ações</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(members ?? []).map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-[var(--color-verde-escuro)] text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                          {getInitials(member.fullName)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{member.fullName}</div>
                          <div className="text-xs text-muted-foreground truncate">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{ROLE_LABELS[member.role]}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(member.status)}>
                        {MEMBER_STATUS_LABELS[member.status]}
                      </Badge>
                    </TableCell>
                    {isAdmin ? (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Editar"
                            onClick={() => openEdit(member)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Definir senha"
                            onClick={() => setPasswordMember(member)}
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {member.status === "active" ? (
                                <>
                                  <DropdownMenuItem
                                    disabled={isSelf(member) || inactivateMutation.isPending}
                                    onClick={() => void inativar(member)}
                                  >
                                    <PowerOff className="h-4 w-4 mr-2" />
                                    Inativar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    disabled={isSelf(member) || deactivateMutation.isPending}
                                    onClick={() => void desativar(member)}
                                  >
                                    <Power className="h-4 w-4 mr-2" />
                                    Desativar
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem
                                  disabled={activateMutation.isPending}
                                  onClick={() => void reativar(member)}
                                >
                                  <Power className="h-4 w-4 mr-2" />
                                  Reativar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                disabled={isSelf(member) || deleteMutation.isPending}
                                onClick={() => setDeleteMember(member)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
                {(members ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 4 : 3} className="text-center text-muted-foreground py-8">
                      Nenhum usuário cadastrado.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      <UsuarioFormDialog open={formOpen} onOpenChange={setFormOpen} member={editingMember} />
      <UsuarioSenhaDialog
        open={passwordMember !== null}
        onOpenChange={(open) => !open && setPasswordMember(null)}
        member={passwordMember}
      />
      <ExcluirUsuarioDialog
        member={deleteMember}
        open={deleteMember !== null}
        onOpenChange={(open) => !open && setDeleteMember(null)}
      />
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
