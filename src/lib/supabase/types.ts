export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  projetse: {
    Tables: {
      audit_events: {
        Row: {
          created_at: string;
          description: string;
          empreendimento_id: number | null;
          event_type: string;
          id: number;
          metadata: Json | null;
          organization_id: number;
          profile_id: number | null;
        };
        Insert: {
          created_at?: string;
          description: string;
          empreendimento_id?: number | null;
          event_type: string;
          id?: number;
          metadata?: Json | null;
          organization_id: number;
          profile_id?: number | null;
        };
        Update: {
          created_at?: string;
          description?: string;
          empreendimento_id?: number | null;
          event_type?: string;
          id?: number;
          metadata?: Json | null;
          organization_id?: number;
          profile_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_events_empreendimento_id_fkey";
            columns: ["empreendimento_id"];
            isOneToOne: false;
            referencedRelation: "empreendimentos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_events_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_events_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      clausulas: {
        Row: {
          categoria: string | null;
          id: number;
          modelo_id: number | null;
          ordem: number;
          organization_id: number;
          resumo: string | null;
          status: string;
          template: string;
          titulo: string;
          updated_at: string;
          variaveis: string[] | null;
        };
        Insert: {
          categoria?: string | null;
          id?: number;
          modelo_id?: number | null;
          ordem?: number;
          organization_id: number;
          resumo?: string | null;
          status?: string;
          template: string;
          titulo: string;
          updated_at?: string;
          variaveis?: string[] | null;
        };
        Update: {
          categoria?: string | null;
          id?: number;
          modelo_id?: number | null;
          ordem?: number;
          organization_id?: number;
          resumo?: string | null;
          status?: string;
          template?: string;
          titulo?: string;
          updated_at?: string;
          variaveis?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "clausulas_modelo_id_fkey";
            columns: ["modelo_id"];
            isOneToOne: false;
            referencedRelation: "modelos_documento";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clausulas_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      dados_extraidos: {
        Row: {
          bloco: string;
          campo: string;
          confianca: number | null;
          empreendimento_id: number;
          id: number;
          quadro_tecnico_id: number | null;
          reviewed_at: string | null;
          reviewed_by_profile_id: number | null;
          status: string;
          valor: string | null;
          valor_normalizado: Json | null;
        };
        Insert: {
          bloco: string;
          campo: string;
          confianca?: number | null;
          empreendimento_id: number;
          id?: number;
          quadro_tecnico_id?: number | null;
          reviewed_at?: string | null;
          reviewed_by_profile_id?: number | null;
          status?: string;
          valor?: string | null;
          valor_normalizado?: Json | null;
        };
        Update: {
          bloco?: string;
          campo?: string;
          confianca?: number | null;
          empreendimento_id?: number;
          id?: number;
          quadro_tecnico_id?: number | null;
          reviewed_at?: string | null;
          reviewed_by_profile_id?: number | null;
          status?: string;
          valor?: string | null;
          valor_normalizado?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "dados_extraidos_empreendimento_id_fkey";
            columns: ["empreendimento_id"];
            isOneToOne: false;
            referencedRelation: "empreendimentos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dados_extraidos_quadro_tecnico_id_fkey";
            columns: ["quadro_tecnico_id"];
            isOneToOne: false;
            referencedRelation: "quadros_tecnicos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dados_extraidos_reviewed_by_profile_id_fkey";
            columns: ["reviewed_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      dados_tecnicos: {
        Row: {
          alvara: string | null;
          area_comum_total: number | null;
          area_global: number | null;
          area_privativa_total: number | null;
          area_terreno: number | null;
          art_rrt: string | null;
          crea_cau: string | null;
          data_aprovacao: string | null;
          empreendimento_id: number;
          id: number;
          pavimentos: number | null;
          responsavel_tecnico: string | null;
          torres: number | null;
          unidades: number | null;
          vagas: number | null;
        };
        Insert: {
          alvara?: string | null;
          area_comum_total?: number | null;
          area_global?: number | null;
          area_privativa_total?: number | null;
          area_terreno?: number | null;
          art_rrt?: string | null;
          crea_cau?: string | null;
          data_aprovacao?: string | null;
          empreendimento_id: number;
          id?: number;
          pavimentos?: number | null;
          responsavel_tecnico?: string | null;
          torres?: number | null;
          unidades?: number | null;
          vagas?: number | null;
        };
        Update: {
          alvara?: string | null;
          area_comum_total?: number | null;
          area_global?: number | null;
          area_privativa_total?: number | null;
          area_terreno?: number | null;
          art_rrt?: string | null;
          crea_cau?: string | null;
          data_aprovacao?: string | null;
          empreendimento_id?: number;
          id?: number;
          pavimentos?: number | null;
          responsavel_tecnico?: string | null;
          torres?: number | null;
          unidades?: number | null;
          vagas?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "dados_tecnicos_empreendimento_id_fkey";
            columns: ["empreendimento_id"];
            isOneToOne: true;
            referencedRelation: "empreendimentos";
            referencedColumns: ["id"];
          },
        ];
      };
      document_exports: {
        Row: {
          created_at: string;
          created_by_profile_id: number | null;
          empreendimento_id: number;
          formato: string;
          id: number;
          memorial_id: number;
          status: string;
          storage_path: string | null;
          tipo: string;
        };
        Insert: {
          created_at?: string;
          created_by_profile_id?: number | null;
          empreendimento_id: number;
          formato: string;
          id?: number;
          memorial_id: number;
          status?: string;
          storage_path?: string | null;
          tipo: string;
        };
        Update: {
          created_at?: string;
          created_by_profile_id?: number | null;
          empreendimento_id?: number;
          formato?: string;
          id?: number;
          memorial_id?: number;
          status?: string;
          storage_path?: string | null;
          tipo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "document_exports_created_by_profile_id_fkey";
            columns: ["created_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "document_exports_empreendimento_id_fkey";
            columns: ["empreendimento_id"];
            isOneToOne: false;
            referencedRelation: "empreendimentos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "document_exports_memorial_id_fkey";
            columns: ["memorial_id"];
            isOneToOne: false;
            referencedRelation: "memoriais";
            referencedColumns: ["id"];
          },
        ];
      };
      empreendimentos: {
        Row: {
          cidade: string | null;
          created_at: string;
          endereco: string | null;
          id: number;
          incorporadora_id: number | null;
          lote: string | null;
          matricula: string | null;
          nome: string;
          organization_id: number;
          pendencias_count: number;
          progresso: number;
          quadra: string | null;
          responsavel_profile_id: number | null;
          status: string;
          uf: string | null;
          updated_at: string;
        };
        Insert: {
          cidade?: string | null;
          created_at?: string;
          endereco?: string | null;
          id?: number;
          incorporadora_id?: number | null;
          lote?: string | null;
          matricula?: string | null;
          nome: string;
          organization_id: number;
          pendencias_count?: number;
          progresso?: number;
          quadra?: string | null;
          responsavel_profile_id?: number | null;
          status?: string;
          uf?: string | null;
          updated_at?: string;
        };
        Update: {
          cidade?: string | null;
          created_at?: string;
          endereco?: string | null;
          id?: number;
          incorporadora_id?: number | null;
          lote?: string | null;
          matricula?: string | null;
          nome?: string;
          organization_id?: number;
          pendencias_count?: number;
          progresso?: number;
          quadra?: string | null;
          responsavel_profile_id?: number | null;
          status?: string;
          uf?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "empreendimentos_incorporadora_id_fkey";
            columns: ["incorporadora_id"];
            isOneToOne: false;
            referencedRelation: "incorporadoras";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "empreendimentos_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "empreendimentos_responsavel_profile_id_fkey";
            columns: ["responsavel_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      imoveis: {
        Row: {
          area_extenso: string | null;
          area_numero: number | null;
          benfeitorias: string | null;
          cartorio: string | null;
          cidade: string | null;
          comarca: string | null;
          empreendimento_id: number;
          estado_extenso: string | null;
          id: number;
          lote_extenso: string | null;
          lote_numero: string | null;
          loteamento: string | null;
          matricula_extenso: string | null;
          matricula_numero: string | null;
          quadra_extenso: string | null;
          quadra_numero: string | null;
          uf: string | null;
        };
        Insert: {
          area_extenso?: string | null;
          area_numero?: number | null;
          benfeitorias?: string | null;
          cartorio?: string | null;
          cidade?: string | null;
          comarca?: string | null;
          empreendimento_id: number;
          estado_extenso?: string | null;
          id?: number;
          lote_extenso?: string | null;
          lote_numero?: string | null;
          loteamento?: string | null;
          matricula_extenso?: string | null;
          matricula_numero?: string | null;
          quadra_extenso?: string | null;
          quadra_numero?: string | null;
          uf?: string | null;
        };
        Update: {
          area_extenso?: string | null;
          area_numero?: number | null;
          benfeitorias?: string | null;
          cartorio?: string | null;
          cidade?: string | null;
          comarca?: string | null;
          empreendimento_id?: number;
          estado_extenso?: string | null;
          id?: number;
          lote_extenso?: string | null;
          lote_numero?: string | null;
          loteamento?: string | null;
          matricula_extenso?: string | null;
          matricula_numero?: string | null;
          quadra_extenso?: string | null;
          quadra_numero?: string | null;
          uf?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "imoveis_empreendimento_id_fkey";
            columns: ["empreendimento_id"];
            isOneToOne: true;
            referencedRelation: "empreendimentos";
            referencedColumns: ["id"];
          },
        ];
      };
      imovel_confrontacoes: {
        Row: {
          azimute: string | null;
          confrontante: string | null;
          direcao: string;
          id: number;
          imovel_id: number;
          medida: string | null;
          ordem: number;
        };
        Insert: {
          azimute?: string | null;
          confrontante?: string | null;
          direcao: string;
          id?: number;
          imovel_id: number;
          medida?: string | null;
          ordem?: number;
        };
        Update: {
          azimute?: string | null;
          confrontante?: string | null;
          direcao?: string;
          id?: number;
          imovel_id?: number;
          medida?: string | null;
          ordem?: number;
        };
        Relationships: [
          {
            foreignKeyName: "imovel_confrontacoes_imovel_id_fkey";
            columns: ["imovel_id"];
            isOneToOne: false;
            referencedRelation: "imoveis";
            referencedColumns: ["id"];
          },
        ];
      };
      incorporadoras: {
        Row: {
          cnpj: string | null;
          created_at: string;
          endereco: Json | null;
          id: number;
          organization_id: number;
          razao_social: string;
          updated_at: string;
        };
        Insert: {
          cnpj?: string | null;
          created_at?: string;
          endereco?: Json | null;
          id?: number;
          organization_id: number;
          razao_social: string;
          updated_at?: string;
        };
        Update: {
          cnpj?: string | null;
          created_at?: string;
          endereco?: Json | null;
          id?: number;
          organization_id?: number;
          razao_social?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "incorporadoras_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      memoriais: {
        Row: {
          created_at: string;
          created_by_profile_id: number | null;
          empreendimento_id: number;
          id: number;
          status: string;
          versao: number;
        };
        Insert: {
          created_at?: string;
          created_by_profile_id?: number | null;
          empreendimento_id: number;
          id?: number;
          status?: string;
          versao?: number;
        };
        Update: {
          created_at?: string;
          created_by_profile_id?: number | null;
          empreendimento_id?: number;
          id?: number;
          status?: string;
          versao?: number;
        };
        Relationships: [
          {
            foreignKeyName: "memoriais_created_by_profile_id_fkey";
            columns: ["created_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "memoriais_empreendimento_id_fkey";
            columns: ["empreendimento_id"];
            isOneToOne: false;
            referencedRelation: "empreendimentos";
            referencedColumns: ["id"];
          },
        ];
      };
      memorial_secoes: {
        Row: {
          approved_at: string | null;
          approved_by_profile_id: number | null;
          clausula_id: number | null;
          conteudo: string | null;
          id: number;
          memorial_id: number;
          ordem: number;
          status: string;
          titulo: string;
          updated_at: string;
        };
        Insert: {
          approved_at?: string | null;
          approved_by_profile_id?: number | null;
          clausula_id?: number | null;
          conteudo?: string | null;
          id?: number;
          memorial_id: number;
          ordem?: number;
          status?: string;
          titulo: string;
          updated_at?: string;
        };
        Update: {
          approved_at?: string | null;
          approved_by_profile_id?: number | null;
          clausula_id?: number | null;
          conteudo?: string | null;
          id?: number;
          memorial_id?: number;
          ordem?: number;
          status?: string;
          titulo?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memorial_secoes_approved_by_profile_id_fkey";
            columns: ["approved_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "memorial_secoes_clausula_id_fkey";
            columns: ["clausula_id"];
            isOneToOne: false;
            referencedRelation: "clausulas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "memorial_secoes_memorial_id_fkey";
            columns: ["memorial_id"];
            isOneToOne: false;
            referencedRelation: "memoriais";
            referencedColumns: ["id"];
          },
        ];
      };
      modelos_documento: {
        Row: {
          created_at: string;
          id: number;
          nome: string;
          organization_id: number;
          status: string;
          tipo: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          nome: string;
          organization_id: number;
          status?: string;
          tipo?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          nome?: string;
          organization_id?: number;
          status?: string;
          tipo?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "modelos_documento_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_members: {
        Row: {
          created_at: string;
          id: number;
          organization_id: number;
          profile_id: number;
          role: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          organization_id: number;
          profile_id: number;
          role: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          organization_id?: number;
          profile_id?: number;
          role?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organization_members_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          settings: Json;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          settings?: Json;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          settings?: Json;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pendencias: {
        Row: {
          created_at: string;
          created_by_profile_id: number | null;
          empreendimento_id: number;
          entidade_id: number | null;
          entidade_tipo: string | null;
          id: number;
          mensagem: string;
          resolved_at: string | null;
          resolved_by_profile_id: number | null;
          severidade: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          created_by_profile_id?: number | null;
          empreendimento_id: number;
          entidade_id?: number | null;
          entidade_tipo?: string | null;
          id?: number;
          mensagem: string;
          resolved_at?: string | null;
          resolved_by_profile_id?: number | null;
          severidade?: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          created_by_profile_id?: number | null;
          empreendimento_id?: number;
          entidade_id?: number | null;
          entidade_tipo?: string | null;
          id?: number;
          mensagem?: string;
          resolved_at?: string | null;
          resolved_by_profile_id?: number | null;
          severidade?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pendencias_created_by_profile_id_fkey";
            columns: ["created_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pendencias_empreendimento_id_fkey";
            columns: ["empreendimento_id"];
            isOneToOne: false;
            referencedRelation: "empreendimentos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pendencias_resolved_by_profile_id_fkey";
            columns: ["resolved_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      quadros_tecnicos: {
        Row: {
          created_at: string;
          empreendimento_id: number;
          file_name: string;
          id: number;
          mime_type: string | null;
          processed_at: string | null;
          size_bytes: number | null;
          status: string;
          storage_path: string;
          uploaded_by_profile_id: number | null;
        };
        Insert: {
          created_at?: string;
          empreendimento_id: number;
          file_name: string;
          id?: number;
          mime_type?: string | null;
          processed_at?: string | null;
          size_bytes?: number | null;
          status?: string;
          storage_path: string;
          uploaded_by_profile_id?: number | null;
        };
        Update: {
          created_at?: string;
          empreendimento_id?: number;
          file_name?: string;
          id?: number;
          mime_type?: string | null;
          processed_at?: string | null;
          size_bytes?: number | null;
          status?: string;
          storage_path?: string;
          uploaded_by_profile_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "quadros_tecnicos_empreendimento_id_fkey";
            columns: ["empreendimento_id"];
            isOneToOne: false;
            referencedRelation: "empreendimentos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quadros_tecnicos_uploaded_by_profile_id_fkey";
            columns: ["uploaded_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      representantes_legais: {
        Row: {
          cpf: string | null;
          created_at: string;
          endereco: Json | null;
          estado_civil: string | null;
          id: number;
          incorporadora_id: number;
          nome: string;
          regime_comunhao: string | null;
          rg: string | null;
          updated_at: string;
        };
        Insert: {
          cpf?: string | null;
          created_at?: string;
          endereco?: Json | null;
          estado_civil?: string | null;
          id?: number;
          incorporadora_id: number;
          nome: string;
          regime_comunhao?: string | null;
          rg?: string | null;
          updated_at?: string;
        };
        Update: {
          cpf?: string | null;
          created_at?: string;
          endereco?: Json | null;
          estado_civil?: string | null;
          id?: number;
          incorporadora_id?: number;
          nome?: string;
          regime_comunhao?: string | null;
          rg?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "representantes_legais_incorporadora_id_fkey";
            columns: ["incorporadora_id"];
            isOneToOne: false;
            referencedRelation: "incorporadoras";
            referencedColumns: ["id"];
          },
        ];
      };
      unidades_autonomas: {
        Row: {
          area_comum: number | null;
          area_garagem: number | null;
          area_garden: number | null;
          area_privativa: number | null;
          area_total: number | null;
          confrontacoes: string | null;
          empreendimento_id: number;
          fracao: string | null;
          id: number;
          nome: string;
          observacoes: string | null;
          pavimento: string | null;
          posicao: string | null;
          status: string;
          tipo: string | null;
          torre: string | null;
          updated_at: string;
          vaga: string | null;
        };
        Insert: {
          area_comum?: number | null;
          area_garagem?: number | null;
          area_garden?: number | null;
          area_privativa?: number | null;
          area_total?: number | null;
          confrontacoes?: string | null;
          empreendimento_id: number;
          fracao?: string | null;
          id?: number;
          nome: string;
          observacoes?: string | null;
          pavimento?: string | null;
          posicao?: string | null;
          status?: string;
          tipo?: string | null;
          torre?: string | null;
          updated_at?: string;
          vaga?: string | null;
        };
        Update: {
          area_comum?: number | null;
          area_garagem?: number | null;
          area_garden?: number | null;
          area_privativa?: number | null;
          area_total?: number | null;
          confrontacoes?: string | null;
          empreendimento_id?: number;
          fracao?: string | null;
          id?: number;
          nome?: string;
          observacoes?: string | null;
          pavimento?: string | null;
          posicao?: string | null;
          status?: string;
          tipo?: string | null;
          torre?: string | null;
          updated_at?: string;
          vaga?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "unidades_autonomas_empreendimento_id_fkey";
            columns: ["empreendimento_id"];
            isOneToOne: false;
            referencedRelation: "empreendimentos";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_access_empreendimento: {
        Args: { p_empreendimento_id: number };
        Returns: boolean;
      };
      can_access_storage_documento: {
        Args: { object_path: string };
        Returns: boolean;
      };
      can_access_storage_quadro: {
        Args: { object_path: string };
        Returns: boolean;
      };
      can_edit_technical: { Args: { p_org_id: number }; Returns: boolean };
      can_manage_org: { Args: { p_org_id: number }; Returns: boolean };
      can_review: { Args: { p_org_id: number }; Returns: boolean };
      can_write_storage_documento: {
        Args: { object_path: string };
        Returns: boolean;
      };
      can_write_storage_quadro: {
        Args: { object_path: string };
        Returns: boolean;
      };
      current_profile_id: { Args: never; Returns: number };
      empreendimento_org_id: {
        Args: { p_empreendimento_id: number };
        Returns: number;
      };
      has_org_role: {
        Args: { p_org_id: number; p_roles: string[] };
        Returns: boolean;
      };
      is_org_member: { Args: { p_org_id: number }; Returns: boolean };
      log_audit_event: {
        Args: {
          p_description: string;
          p_empreendimento_id: number;
          p_event_type: string;
          p_metadata?: Json;
          p_organization_id: number;
        };
        Returns: number;
      };
      member_role: { Args: { p_org_id: number }; Returns: string };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  projetse: {
    Enums: {},
  },
} as const;
