import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    
    if (code) {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) throw error
      
      if (user) {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select()
          .eq('email', user.email)
          .single()

        // If no profile exists, create one
        if (!profile && user.email) {
          const { error: createError } = await supabase
            .from('user_profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
              }
            ])
          if (createError) {
            console.error('Error creating profile:', createError)
            throw createError
          }
          return NextResponse.redirect(new URL("/onboarding", process.env.NEXT_PUBLIC_APP_URL))
        }
      }
    }

    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL))
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL("/signin", process.env.NEXT_PUBLIC_APP_URL))
  }
}