'use client'

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Mail } from 'lucide-react'

export default function Login() {
  const { signInWithGoogle, signInWithGithub } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (provider: 'google' | 'github') => {
    setError(null);
    setIsLoading(true);
    
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithGithub();
      }
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Authentication error:', error);
      if (error instanceof Error) {
        if (error.name === 'PopupClosedByUserError') {
          setError('Sign-in was cancelled. Please try again.');
        } else if (error.message.includes('account-exists-with-different-credential')) {
          setError('An account already exists with the same email address but different sign-in credentials.');
        } else {
          setError(`Failed to sign in. Error: ${error.message}`);
        }
      } else {
        setError('An unexpected error occurred during sign in.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Choose a method to sign in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSignIn('google')}
              disabled={isLoading}
            >
              <Mail className="mr-2 h-4 w-4" />
              Sign in with Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSignIn('github')}
              disabled={isLoading}
            >
              <Github className="mr-2 h-4 w-4" />
              Sign in with GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

