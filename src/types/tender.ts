export type TenderStatus = 'review' | 'done' | 'processing';

export type FieldStatus = 'exact' | 'inferred' | 'not_found';

export interface TenderRow {
  id: number;
  number: string;
  customer: string;
  date: string;
  status: TenderStatus;
}

export interface FormField {
  id: number;
  param: string;
  value: string;
  status: FieldStatus;
  constraint: string;
  tz: string;
  source: string;
  sourceFile: string;
  highlight?: string;
}

export interface KnowledgeFile {
  id: number;
  name: string;
  type: 'pdf' | 'xlsx';
  meta: string;
  status: 'processed';
}
