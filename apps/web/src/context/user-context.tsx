"use client"
import { createContext, useContext } from 'react';
import type { UserProfile } from '@/types/user-profile';

interface UserContextType {
  profile: UserProfile;
}

export const UserContext = createContext<UserContextType | null>(null);

export function  useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}