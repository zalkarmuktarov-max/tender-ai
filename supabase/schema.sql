-- Таблица профилей (расширение auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  company_name TEXT,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица тендеров
CREATE TABLE public.tenders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  number TEXT NOT NULL,
  name TEXT NOT NULL,
  customer TEXT NOT NULL,
  budget TEXT,
  deadline DATE,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'review', 'completed', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица требований ТЗ (парсинг)
CREATE TABLE public.tender_requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID REFERENCES public.tenders(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  text TEXT NOT NULL,
  field_name TEXT,
  constraint_value TEXT,
  unit TEXT
);

-- Таблица результатов Формы 2
CREATE TABLE public.form2_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID REFERENCES public.tenders(id) ON DELETE CASCADE NOT NULL,
  requirement_id UUID REFERENCES public.tender_requirements(id) ON DELETE CASCADE,
  parameter TEXT NOT NULL,
  value TEXT,
  status TEXT DEFAULT 'not_found' CHECK (status IN ('exact_match', 'inferred', 'not_found')),
  constraint_text TEXT,
  source_text TEXT,
  source_file TEXT,
  source_page TEXT,
  user_edited BOOLEAN DEFAULT FALSE,
  final_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица документов базы знаний
CREATE TABLE public.knowledge_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'xlsx', 'docx', 'csv')),
  file_size BIGINT,
  pages_count INTEGER,
  items_count INTEGER,
  status TEXT DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'processed', 'error')),
  category TEXT DEFAULT 'manual' CHECK (category IN ('manual', 'price_list', 'certificate', 'contract', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица извлечённых параметров из документов
CREATE TABLE public.product_parameters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  parameter_name TEXT NOT NULL,
  parameter_value TEXT NOT NULL,
  unit TEXT,
  source_page TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица аудит-логов
CREATE TABLE public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tender_id UUID REFERENCES public.tenders(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  field_name TEXT,
  ai_value TEXT,
  ai_confidence TEXT,
  user_value TEXT,
  source_document TEXT,
  source_page TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Включаем pgvector для семантического поиска
CREATE EXTENSION IF NOT EXISTS vector;

-- Таблица эмбеддингов для RAG
CREATE TABLE public.document_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индекс для векторного поиска
CREATE INDEX ON public.document_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form2_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;

-- Политики
CREATE POLICY "Users see own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users see own tenders" ON public.tenders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own requirements" ON public.tender_requirements FOR ALL USING (
  tender_id IN (SELECT id FROM public.tenders WHERE user_id = auth.uid())
);
CREATE POLICY "Users see own form2" ON public.form2_results FOR ALL USING (
  tender_id IN (SELECT id FROM public.tenders WHERE user_id = auth.uid())
);
CREATE POLICY "Users see own documents" ON public.knowledge_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own parameters" ON public.product_parameters FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own audit" ON public.audit_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own embeddings" ON public.document_embeddings FOR ALL USING (auth.uid() = user_id);

-- Автоматическое создание профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket для файлов
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- RLS для storage
CREATE POLICY "Users upload own docs" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users read own docs" ON storage.objects FOR SELECT USING (
  bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users delete own docs" ON storage.objects FOR DELETE USING (
  bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
);
