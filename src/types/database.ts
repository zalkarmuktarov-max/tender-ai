export interface Profile {
  id: string
  company_name: string | null
  email: string | null
  full_name: string | null
  created_at: string
}

export interface Tender {
  id: string
  user_id: string
  number: string
  name: string
  customer: string
  budget: string | null
  deadline: string | null
  status: 'processing' | 'review' | 'completed' | 'rejected'
  created_at: string
  updated_at: string
}

export interface KnowledgeDocument {
  id: string
  user_id: string
  file_name: string
  file_path: string
  file_type: 'pdf' | 'xlsx' | 'docx' | 'csv'
  file_size: number | null
  pages_count: number | null
  items_count: number | null
  status: 'uploading' | 'processing' | 'processed' | 'error'
  category: 'manual' | 'price_list' | 'certificate' | 'contract' | 'other'
  created_at: string
}

export interface Form2Result {
  id: string
  tender_id: string
  requirement_id: string | null
  parameter: string
  value: string | null
  status: 'exact_match' | 'inferred' | 'not_found'
  constraint_text: string | null
  source_text: string | null
  source_file: string | null
  source_page: string | null
  user_edited: boolean
  final_value: string | null
  created_at: string
}
