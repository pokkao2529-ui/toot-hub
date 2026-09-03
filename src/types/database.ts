/**
 * Database Models & Collections Schema for TOOL HUB (Firestore / Relational ready)
 */

export interface PdfToolModel {
  id: string;
  slug: string;
  name: string;
  name_th: string;
  description: string;
  category: 'organize' | 'optimize' | 'convert' | 'edit' | 'security' | 'ai';
  status: 'active' | 'development' | 'planned';
  processing_mode: 'client' | 'server' | 'ai';
  max_file_size: number;
  max_files: number;
  is_premium: boolean;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
}

export interface PdfJobModel {
  id: string;
  user_id?: string | null;
  tool_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input_files: {
    name: string;
    size: number;
    mime_type: string;
    storage_path?: string;
  }[];
  output_file?: {
    name: string;
    size: number;
    download_url?: string;
    storage_path?: string;
  } | null;
  file_size: number;
  processing_time_ms: number;
  error_message?: string | null;
  created_at: string;
  completed_at?: string | null;
  expires_at: string;
}

export interface PdfUsageModel {
  id: string;
  user_id?: string | null;
  tool_id: string;
  file_size: number;
  processing_time_ms: number;
  created_at: string;
}
