import { submitOnboardingForm } from '@/actions/onboarding';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Here you can call your server action or handle the form submission directly
    const result = await submitOnboardingForm(formData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing onboarding:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process onboarding' },
      { status: 500 }
    );
  }
}