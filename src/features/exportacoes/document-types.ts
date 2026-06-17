export type TextAlign = "left" | "justify" | "center";

export interface TextRun {
  text: string;
  bold?: boolean;
}

export interface DocumentBlock {
  runs: TextRun[];
  align: TextAlign;
}

export interface MemorialDocument {
  blocks: DocumentBlock[];
}

export interface LayoutLine {
  runs: TextRun[];
  align: TextAlign;
  /** Última linha do parágrafo — não justificar (padrão tipográfico). */
  isLastLineOfParagraph: boolean;
}
