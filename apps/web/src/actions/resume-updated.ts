// app/actions/analyzeResume.ts
'use server'

import api from '@/services/apiService';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { downloadPrimaryResume, downloadResume, getResumeFilePath } from '@/lib/resumeUtils';
import { API_ROUTES } from '@/config/apiEndpoints';
import { v4 as uuidv4 } from 'uuid';
import { UserProfile } from '@/types/user-profile';

export async function analyzeResume(profile: UserProfile) {
  try {
    const supabase = createServerClient();

    // Check if user already has a current analysis
    if (profile.resume_analysis_id) {
      const { data: existingAnalysis } = await supabase
        .from('resume_analyses')
        .select('*')
        .eq('id', profile.resume_analysis_id)
        .single();
      console.log(existingAnalysis);
      if (existingAnalysis) {
        return { success: true, data: existingAnalysis };
      }
    }

    // Download the resume using our utility
    const { success: downloadSuccess, data: fileData, error: downloadError } = 
      await downloadPrimaryResume(profile);

    if (!downloadSuccess || !fileData) {
      throw new Error(downloadError || 'Failed to download resume');
    }

    // Create form data for API request
    const formData = new FormData();
    formData.append('file', fileData, 'resume.pdf');
    formData.append('target_roles', JSON.stringify(profile.job_titles));

    // Call the FastAPI endpoint
    const { data: apiResponse } = await api.post(API_ROUTES.ANALYZE_RESUME, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });
    console.log(apiResponse);
    
    // Get the actual resume path for recording
    const { success: pathSuccess, data: resumePath } = await getResumeFilePath(profile);
    const resumeId = pathSuccess ? resumePath : null;
    
    // Store the analysis in the database
    const { data: analysisData, error: insertError } = await supabase
      .from('resume_analysis')
      .insert({
        user_id: profile.id,
        resume_id: resumeId,
        overall_score: apiResponse.overall_score,
        general_review: apiResponse.general_review,
        section_scores: apiResponse.general_section_scores,
        job_analyses: apiResponse.job_analyses,
        strengths: apiResponse.strengths,
        weaknesses: apiResponse.weaknesses
      })
      .select()
      .single();
    console.log(analysisData, insertError);
    if (insertError || !analysisData) {
      throw insertError || new Error('Failed to insert analysis data');
    }

    // Update user_profiles with the new analysis ID
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ resume_analysis_id: analysisData.id })
      .eq('id', profile.id);

    if (updateError) {
      throw updateError;
    }

    return { success: true, data: analysisData };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export async function getResumeAnalysis(profile: UserProfile) {
  try {
    const supabase = createServerClient();
    const { data: currentAnalysis } = await supabase
      .from('resume_analysis')
      .select('*')
      .eq('id', profile.resume_analysis_id)
      .single();
    return { success: true, data: currentAnalysis };
  } catch (error) {
    console.error('Error fetching resume analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

interface MatchResponse {
  overall_score: number;
  review: string;
  skill_scores: {
    [key: string]: number;
  };
  strengths: string[];
  weaknesses: string[];
}

export async function matchJobDescription(profile: UserProfile, jobDescription: string) {
  const supabase = createServerClient();
  try {
    // Download the primary resume
    const { success: downloadSuccess, data: fileData, error: downloadError } = 
      await downloadPrimaryResume(profile);
    
    if (!downloadSuccess || !fileData) {
      throw new Error(downloadError || 'Failed to download resume');
    }
    
    // Create form data for API request
    const formData = new FormData();
    formData.append('resume_file', fileData, 'resume.pdf');
    formData.append('job_description', jobDescription);
    
    // Call the FastAPI endpoint
    const { data: matchResponse } = await api.post<MatchResponse>(
      API_ROUTES.MATCH_RESUME_JOB,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      }
    );
    
    // Store the results in Supabase
    const { error: insertError, data: insertData } = await supabase
      .from('job_description_analysis')
      .insert({
        user_id: profile.id,
        job_description: jobDescription,
        overall_score: matchResponse.overall_score,
        review: matchResponse.review,
        skill_scores: matchResponse.skill_scores,
        strengths: matchResponse.strengths,
        weaknesses: matchResponse.weaknesses,
        status: 'success'
      });
    console.log(insertData, insertError);
    // if (insertError) {
    //   throw new Error(`Failed to store match results: ${insertError.message}`);
    // }
    
    return {
      success: true,
      data: matchResponse
    };
    
  } catch (error) {
    // Store the error in Supabase
    await supabase
      .from('job_description_analysis')
      .insert({
        user_id: profile.id,
        job_description: jobDescription,
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'An unknown error occurred'
      });

    console.error('Error matching job description:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

interface ResumeOptimizationResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export async function optimizeResume(
  profile: UserProfile,
  jobDescription: string
): Promise<ResumeOptimizationResponse> {
  try {
    // Get resume path
    const { success: pathSuccess, data: resumePath, error: pathError } = await getResumeFilePath(profile);
    
    if (!pathSuccess || !resumePath) {
      throw new Error(pathError || 'Failed to get resume path');
    }

    // Download resume file
    const { success: downloadSuccess, data: resumeFile } = await downloadResume(resumePath);
    if (!downloadSuccess || !resumeFile) {
      throw new Error('Failed to download resume');
    }

    // Prepare form data for API
    const formData = new FormData();
    formData.append('resume_file', resumeFile, 'resume.pdf');
    formData.append('job_text', jobDescription);
    formData.append('return_latex', 'true');

    // Call API
    const { data: apiResponse } = await api.post(
      API_ROUTES.OPTIMIZE_RESUME,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return {
      success: true,
      data: apiResponse.latex_content
    };
  } catch (error) {
    console.error('Error optimizing resume:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

interface CompileLatexResponse {
  success: boolean;
  pdfBase64?: string;
  contentType?: string;
  filename?: string;
  error?: string;
}

export async function compileLatex(jsonContent: object): Promise<CompileLatexResponse> {
  try {
    // Call API to compile LaTeX to PDF
    const { data: compiledPdf } = await api.post(
      API_ROUTES.OPTIMIZE_RESUME, // Using the optimize resume endpoint as fallback for compilation
      jsonContent,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'json'
      }
    );

    return {
      success: true,
      pdfBase64: compiledPdf.pdf_base64,
      contentType: 'application/pdf',
      filename: 'optimized_resume.pdf'
    };
  } catch (error) {
    console.error('Error compiling LaTeX:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to compile LaTeX'
    };
  }
}

export async function reuploadResume(formData: FormData) {
  try {
    const supabase = createServerClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Authentication required');
    }
    
    const userId = user.id;
    
    // Get the current user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      throw new Error('Failed to get user profile');
    }
    
    // Extract file from form data
    const resumeFile = formData.get('resume') as File;
    
    if (!resumeFile || resumeFile.size === 0) {
      throw new Error('No file provided');
    }
    
    // Get file extension
    const fileExt = resumeFile.name.split('.').pop();
    // Include userId in the path for RLS
    const newFilePath = `${userId}/${uuidv4()}.${fileExt}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(newFilePath, resumeFile, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }
    
    // Insert into user_documents
    const { data: document, error: docError } = await supabase
      .from('user_documents')
      .insert({
        user_id: userId,
        filename: resumeFile.name,
        file_path: newFilePath,
        file_type: resumeFile.type,
        document_type: 'resume',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      })
      .select()
      .single();
    
    if (docError) {
      // Clean up the storage if insert fails
      await supabase.storage
        .from('resumes')
        .remove([newFilePath]);
      throw new Error(`Failed to create document record: ${docError.message}`);
    }
    
    // Set as primary resume
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        primary_resume_id: document.id,
        resume_id: newFilePath, // For backward compatibility
        resume_analysis_id: null, // Reset analysis since we have a new resume
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error reuploading resume:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
