-- Add display_name column to user_documents table
ALTER TABLE user_documents 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update existing records to set display_name to filename if null
UPDATE user_documents
SET display_name = filename
WHERE display_name IS NULL;
