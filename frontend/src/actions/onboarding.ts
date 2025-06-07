"use server"
import { createClient as createServerClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { uploadDocument } from './documents';

export async function submitOnboardingForm(formData: FormData) {
  try {
    const supabase = createServerClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Authentication required');
    }

    const userId = user.id;

    // Extract form values
    const name = formData.get('name') as string;
    const industry = formData.get('industry') as string;
    const jobTitles = JSON.parse(formData.get('jobTitles') as string);
    const resumeDisplayName = formData.get('resumeDisplayName') as string;

    // Note: We no longer need to handle the resume file upload here
    // as it's already uploaded through the DocumentUploadModal component

    // Get the most recently uploaded resume for this user (if any)
    let resumeFileName = null;
    let documentId = null;

    if (resumeDisplayName) {
      // Find the user's resume with the matching display name
      const supabase = createServerClient();
      const { data: documents, error: docsError } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', userId)
        .eq('document_type', 'resume')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!docsError && documents && documents.length > 0) {
        // Use the most recent resume
        resumeFileName = documents[0].file_path;
        documentId = documents[0].id;
      }
    }

    // Update user profile in database
    const { error: dbError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        email: user.email,
        name,
        industry,
        job_titles: jobTitles,
        resume_id: resumeFileName, // Keep for backward compatibility
        primary_resume_id: documentId, // New field for document management
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (dbError) {
      throw new Error(`Failed to update profile: ${dbError.message}`);
    }

    console.log('Onboarding form submitted successfully');
    return { success: true };

  } catch (error) {
    console.error('Onboarding submission error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
