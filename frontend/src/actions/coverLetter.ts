// actions/coverletter.ts
'use server'

import api from '@/services/apiService';
import { getUserProfile } from '@/actions/user';
import { downloadResume } from '@/lib/resumeUtils';

interface CoverLetterRequest {
  job_description: string;
  user_name: string;
  company: string;
  manager?: string;
  role: string;
  referral?: string;
}

export async function generateCoverLetter(data: CoverLetterRequest) {
  try {
    // Use the cached getUserProfile directly instead of the useUser hook
    const response = await getUserProfile();
    if (response.success) {
      const profile = response.data
      if (!profile.resume_id) {
        throw new Error("Failed to get Resume");
      }
      const { success: downloadSuccess, data: resumeFile } = await downloadResume(profile.resume_id);
      if (!downloadSuccess || !resumeFile) {
        throw new Error('Failed to download resume');
      }

      const formData = new FormData();
      formData.append('file', resumeFile, 'resume.pdf');
      formData.append('job_description', data.job_description);
      formData.append('user_name', data.user_name);
      formData.append('company', data.company);
      formData.append('manager', data.manager || '');
      formData.append('role', data.role);
      if (data.referral) {
        formData.append('referral', data.referral);
      }

      const { data: apiResponse } = await api.post('/generate-cover-letter', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: apiResponse.variations[0].content
      };


    } else {
      // Type assertion to tell TypeScript we're dealing with the error response
      const errorResponse = response as { success: false; error: string };
      throw new Error(errorResponse.error || 'Failed to get User Profile');
    }



  } catch (error) {
    console.error('Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

// Cover letter page remains the same as it's already correctly set up as a client component