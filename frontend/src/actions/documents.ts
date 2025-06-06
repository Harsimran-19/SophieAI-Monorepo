"use server"

import { createClient as createServerClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import type { UserDocument } from '@/types/user-profile';

/**
 * Upload a document to Supabase Storage and record in user_documents table
 */
export async function uploadDocument(
  file: File,
  documentType: 'resume' | 'cover_letter' | 'other',
  displayName?: string
) {
  try {
    const supabase = createServerClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Authentication required');
    }

    const userId = user.id;

    // Handle file upload
    let filePath = null;
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      // Include userId in the path to enforce RLS
      filePath = `${userId}/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Failed to upload document: ${uploadError.message}`);
      }
    } else {
      throw new Error('No file provided or file is empty');
    }

    // Insert document record in database
    const { data: document, error: dbError } = await supabase
      .from('user_documents')
      .insert({
        user_id: userId,
        filename: file.name,
        file_path: filePath,
        file_type: file.type,
        document_type: documentType,
        display_name: displayName || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (dbError) {
      // If there was an error saving to DB, clean up the uploaded file
      if (filePath) {
        await supabase.storage
          .from('resumes')
          .remove([filePath]);
      }
      throw new Error(`Failed to record document: ${dbError.message}`);
    }

    return {
      success: true,
      data: document
    };

  } catch (error) {
    console.error('Document upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Get the URL for a document from Supabase Storage
 */
export async function getDocumentUrl(filePath: string) {
  try {
    const supabase = createServerClient();

    const { data } = await supabase.storage
      .from('resumes')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    return {
      success: true,
      url: data?.signedUrl
    };
  } catch (error) {
    console.error('Error getting document URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get document URL'
    };
  }
}

/**
 * Set a document as the primary resume
 */
export async function setPrimaryResume(documentId: string) {
  try {
    const supabase = createServerClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Authentication required');
    }

    // Call the function to set primary resume
    const { error } = await supabase
      .rpc('set_primary_resume', { document_id: documentId });

    if (error) {
      throw new Error(`Failed to set primary resume: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error setting primary resume:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set primary resume'
    };
  }
}

/**
 * Get all documents for the current user
 */
export async function getUserDocuments() {
  try {
    const supabase = createServerClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Authentication required');
    }

    const { data: documents, error: docsError } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (docsError) {
      throw new Error(`Failed to fetch documents: ${docsError.message}`);
    }

    return {
      success: true,
      data: documents as UserDocument[]
    };
  } catch (error) {
    console.error('Error fetching user documents:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch documents'
    };
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string) {
  try {
    const supabase = createServerClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Authentication required');
    }

    // Get the document to find the file path
    const { data: document, error: docError } = await supabase
      .from('user_documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (docError || !document) {
      throw new Error('Document not found or access denied');
    }

    // Check if this is the primary resume
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('primary_resume_id')
      .eq('id', user.id)
      .single();

    // If this is the primary resume, unset it
    if (profile && profile.primary_resume_id === documentId) {
      await supabase
        .from('user_profiles')
        .update({ primary_resume_id: null })
        .eq('id', user.id);
    }

    // Delete from database first (soft delete by setting is_active to false)
    const { error: deleteError } = await supabase
      .from('user_documents')
      .update({ is_active: false })
      .eq('id', documentId)
      .eq('user_id', user.id);

    if (deleteError) {
      throw new Error(`Failed to delete document record: ${deleteError.message}`);
    }

    // Delete the file from storage (optional, we're keeping it for now)
    // const { error: storageError } = await supabase.storage
    //   .from('resumes')
    //   .remove([document.file_path]);

    // if (storageError) {
    //   console.warn(`Failed to delete file from storage: ${storageError.message}`);
    // }

    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete document'
    };
  }
}
