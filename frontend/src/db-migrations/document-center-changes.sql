-- Document Center Changes - Migration SQL for Supabase

-- 1. Create user_documents table
CREATE TABLE IF NOT EXISTS user_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  document_type TEXT NOT NULL, -- 'resume', 'cover_letter', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, file_path)
);

-- 2. Modify user_profiles table (we'll add a new column instead of dropping to maintain compatibility)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS primary_resume_id UUID REFERENCES user_documents(id);

-- 3. Create RLS policies for user_documents table
-- Enable RLS on the user_documents table
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own documents
CREATE POLICY "Users can view their own documents" 
ON user_documents 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own documents
CREATE POLICY "Users can insert their own documents" 
ON user_documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own documents
CREATE POLICY "Users can update their own documents" 
ON user_documents 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own documents
CREATE POLICY "Users can delete their own documents" 
ON user_documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Create function to set primary resume
CREATE OR REPLACE FUNCTION set_primary_resume(document_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Update user profile to set primary resume
  UPDATE user_profiles
  SET primary_resume_id = document_id,
      updated_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Storage bucket policies (assumes 'resumes' bucket already exists)
-- We'll continue using the existing resumes bucket with appropriate policies
