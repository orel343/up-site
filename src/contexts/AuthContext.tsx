'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GithubAuthProvider,
  linkWithPopup
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../lib/firebase';
import { storeGithubToken } from '../lib/github';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  linkGoogle: () => Promise<void>;
  linkGithub: () => Promise<void>;
  unlinkGoogle: () => Promise<void>;
  unlinkGithub: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const credential = GithubAuthProvider.credentialFromResult(result);
      
      if (credential?.accessToken && result.user) {
        await storeGithubToken(result.user.uid, credential.accessToken);
      }
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      throw error;
    }
  };

  const linkGoogle = async () => {
    if (!user) throw new Error('No user logged in');
    try {
      await linkWithPopup(user, googleProvider);
    } catch (error) {
      console.error('Error linking Google account:', error);
      throw error;
    }
  };

  const linkGithub = async () => {
    if (!user) throw new Error('No user logged in');
    try {
      const result = await linkWithPopup(user, githubProvider);
      const credential = GithubAuthProvider.credentialFromResult(result);
      
      if (credential?.accessToken) {
        await storeGithubToken(user.uid, credential.accessToken);
      }
    } catch (error) {
      console.error('Error linking GitHub account:', error);
      throw error;
    }
  };

  const unlinkGoogle = async () => {
    if (!user) throw new Error('No user logged in');
    try {
      await user.unlink('google.com');
    } catch (error) {
      console.error('Error unlinking Google account:', error);
      throw error;
    }
  };

  const unlinkGithub = async () => {
    if (!user) throw new Error('No user logged in');
    try {
      await user.unlink('github.com');
    } catch (error) {
      console.error('Error unlinking GitHub account:', error);
      throw error;
    }
  };

  const signOut = () => firebaseSignOut(auth);

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithGithub,
    linkGoogle,
    linkGithub,
    unlinkGoogle,
    unlinkGithub,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
