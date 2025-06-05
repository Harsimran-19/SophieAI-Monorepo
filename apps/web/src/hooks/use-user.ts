'use client'
import { useEffect, useState } from 'react'
import { getUserProfile } from '@/actions/user'
import type { UserProfile } from '@/types/user-profile'

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await getUserProfile()
        if(response.success){
            const{data}=response
            setUser(data);
        }else{
            // const {error}=response
            setError('Failed to load User');
            setUser(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  return { user, loading, error }
}