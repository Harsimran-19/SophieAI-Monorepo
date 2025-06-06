'use server'
import { cache } from 'react'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { UserProfile, UserProfileResponse } from "@/types/user-profile"

// Cache the user profile fetch
export const getUserProfile = cache(async (): Promise<UserProfileResponse> => {
  try {
    const supabase = createServerClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Authentication required');
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) {
      throw error;
    }

    return { success: true, data };
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
})