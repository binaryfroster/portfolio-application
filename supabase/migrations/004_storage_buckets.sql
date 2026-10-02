-- Create storage buckets using Supabase Storage API SQL helpers

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
('project-files', 'project-files', FALSE, 104857600, '{"application/pdf", "image/png", "image/jpeg", "image/webp", "video/mp4", "application/zip"}'),
('avatars', 'avatars', TRUE, 5242880, '{"image/png", "image/jpeg", "image/webp"}'),
('company-logos', 'company-logos', TRUE, 5242880, '{"image/png", "image/jpeg", "image/webp"}'),
('contracts', 'contracts', FALSE, 20971520, '{"application/pdf"}'),
('message-attachments', 'message-attachments', FALSE, 20971520, '{"application/pdf", "image/png", "image/jpeg", "image/webp", "application/zip"}')
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage objects (enforcing secure accesses per project folder)

CREATE POLICY "Allow public select on avatar files"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Allow users to upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
);

CREATE POLICY "Allow users to edit/delete their own avatar"
ON storage.objects FOR ALL
USING (
  bucket_id = 'avatars' 
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
);

-- Policies for project files (private folders named by project_id)
CREATE POLICY "Allow authenticated users to read project files if they belong to project"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-files'
  AND (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id::text = (storage.foldername(name))[1] 
      AND projects.client_id = auth.uid()
    )
  )
);

CREATE POLICY "Allow authenticated users to upload files if they belong to project"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-files'
  AND (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id::text = (storage.foldername(name))[1] 
      AND projects.client_id = auth.uid()
    )
  )
);
